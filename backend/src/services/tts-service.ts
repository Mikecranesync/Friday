import textToSpeech from '@google-cloud/text-to-speech';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

interface SynthesizeOptions {
  text: string;
  voice?: string;
  languageCode?: string;
  speakingRate?: number;
  pitch?: number;
}

interface SynthesizeResult {
  audioContent: Buffer;
  voice: string;
  cached: boolean;
}

interface CacheEntry {
  audioContent: Buffer;
  voice: string;
  createdAt: number;
}

interface CacheStats {
  enabled: boolean;
  size: number;
  maxSize: number;
  hits: number;
  misses: number;
  hitRate: string;
}

class TTSService {
  private client: textToSpeech.TextToSpeechClient;
  private cache: Map<string, CacheEntry> = new Map();
  private cacheHits = 0;
  private cacheMisses = 0;

  // Configuration with defaults
  private readonly config = {
    defaultLanguageCode: process.env.TTS_LANGUAGE_CODE || 'en-US',
    defaultVoiceName: process.env.TTS_VOICE_NAME || 'en-US-Neural2-F',
    defaultSpeakingRate: parseFloat(process.env.TTS_SPEAKING_RATE || '1.0'),
    defaultPitch: parseFloat(process.env.TTS_PITCH || '0.0'),
    cacheEnabled: process.env.CACHE_ENABLED !== 'false',
    cacheMaxSize: parseInt(process.env.CACHE_MAX_SIZE || '100', 10),
    cacheTTLMs: parseInt(process.env.CACHE_TTL_HOURS || '24', 10) * 60 * 60 * 1000,
  };

  constructor() {
    // Initialize Google Cloud TTS client
    // Credentials are loaded automatically from:
    // 1. GOOGLE_APPLICATION_CREDENTIALS env var pointing to JSON file
    // 2. Default application credentials
    // 3. Compute Engine/Cloud Run metadata server
    this.client = new textToSpeech.TextToSpeechClient();

    console.log('TTS Service initialized');
    console.log(`  Default voice: ${this.config.defaultVoiceName}`);
    console.log(`  Cache enabled: ${this.config.cacheEnabled}`);
    console.log(`  Cache max size: ${this.config.cacheMaxSize}`);
  }

  /**
   * Generate a cache key from synthesis options
   */
  private getCacheKey(options: SynthesizeOptions): string {
    const normalized = {
      text: options.text.trim().toLowerCase(),
      voice: options.voice || this.config.defaultVoiceName,
      languageCode: options.languageCode || this.config.defaultLanguageCode,
      speakingRate: options.speakingRate || this.config.defaultSpeakingRate,
      pitch: options.pitch || this.config.defaultPitch,
    };

    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(normalized))
      .digest('hex')
      .substring(0, 16);

    return hash;
  }

  /**
   * Check if cache entry is still valid
   */
  private isCacheEntryValid(entry: CacheEntry): boolean {
    return Date.now() - entry.createdAt < this.config.cacheTTLMs;
  }

  /**
   * Evict oldest entries if cache is full
   */
  private evictOldestEntries(): void {
    if (this.cache.size < this.config.cacheMaxSize) return;

    // Sort by creation time and remove oldest
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].createdAt - b[1].createdAt);

    const toRemove = entries.slice(0, Math.ceil(this.config.cacheMaxSize * 0.2));
    toRemove.forEach(([key]) => this.cache.delete(key));

    console.log(`Evicted ${toRemove.length} cache entries`);
  }

  /**
   * Synthesize text to speech
   */
  async synthesize(options: SynthesizeOptions): Promise<SynthesizeResult> {
    const voice = options.voice || this.config.defaultVoiceName;
    const languageCode = options.languageCode || this.config.defaultLanguageCode;
    const speakingRate = options.speakingRate || this.config.defaultSpeakingRate;
    const pitch = options.pitch || this.config.defaultPitch;

    // Check cache first
    if (this.config.cacheEnabled) {
      const cacheKey = this.getCacheKey(options);
      const cached = this.cache.get(cacheKey);

      if (cached && this.isCacheEntryValid(cached)) {
        this.cacheHits++;
        console.log(`Cache HIT for: "${options.text.substring(0, 50)}..."`);
        return {
          audioContent: cached.audioContent,
          voice: cached.voice,
          cached: true,
        };
      }
      this.cacheMisses++;
    }

    console.log(`Synthesizing: "${options.text.substring(0, 50)}..." with voice ${voice}`);

    // Build the synthesis request
    const request: textToSpeech.protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
      input: { text: options.text },
      voice: {
        languageCode,
        name: voice,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate,
        pitch,
        // Higher quality settings
        effectsProfileId: ['small-bluetooth-speaker-class-device'],
      },
    };

    // Call Google Cloud TTS API
    const [response] = await this.client.synthesizeSpeech(request);

    if (!response.audioContent) {
      throw new Error('No audio content received from TTS API');
    }

    const audioContent = Buffer.from(response.audioContent as Uint8Array);

    // Store in cache
    if (this.config.cacheEnabled) {
      this.evictOldestEntries();
      const cacheKey = this.getCacheKey(options);
      this.cache.set(cacheKey, {
        audioContent,
        voice,
        createdAt: Date.now(),
      });
    }

    return {
      audioContent,
      voice,
      cached: false,
    };
  }

  /**
   * List available voices
   */
  async listVoices(languageCode?: string): Promise<Array<{
    name: string;
    languageCode: string;
    ssmlGender: string;
    naturalSampleRateHertz: number;
  }>> {
    const [response] = await this.client.listVoices({
      languageCode: languageCode || '',
    });

    if (!response.voices) {
      return [];
    }

    return response.voices
      .filter(voice => voice.name && voice.languageCodes?.[0])
      .map(voice => ({
        name: voice.name!,
        languageCode: voice.languageCodes![0],
        ssmlGender: voice.ssmlGender?.toString() || 'NEUTRAL',
        naturalSampleRateHertz: voice.naturalSampleRateHertz || 24000,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): CacheStats {
    const total = this.cacheHits + this.cacheMisses;
    return {
      enabled: this.config.cacheEnabled,
      size: this.cache.size,
      maxSize: this.config.cacheMaxSize,
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: total > 0 ? `${((this.cacheHits / total) * 100).toFixed(1)}%` : 'N/A',
    };
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
    console.log('TTS cache cleared');
  }
}

// Export singleton instance
export const ttsService = new TTSService();

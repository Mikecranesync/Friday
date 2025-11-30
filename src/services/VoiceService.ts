import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

// Backend API URL - update this for your network
// Android emulator: 10.0.2.2 maps to host localhost
// Physical device: use your computer's local IP (e.g., 192.168.1.100)
// Your computer IP: 192.168.4.71
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.4.71:8888';
const USE_BACKEND_TTS = process.env.EXPO_PUBLIC_USE_BACKEND_TTS !== 'false';

// Custom recording options optimized for speech recognition
const SPEECH_RECORDING_OPTIONS = {
  isMeteringEnabled: true,
  android: {
    extension: '.m4a',
    outputFormat: 4, // MPEG_4
    audioEncoder: 3, // AAC
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    extension: '.m4a',
    outputFormat: 'aac',
    audioQuality: 127, // MAX
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 128000,
  },
};

class VoiceService {
  private recording: Audio.Recording | null = null;
  private isRecording = false;
  private lastError: string = '';
  private soundObject: Audio.Sound | null = null;
  private isSpeaking = false;

  async initialize(): Promise<boolean> {
    try {
      console.log('VoiceService: Requesting permissions...');
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        this.lastError = 'Microphone permission denied';
        console.error(this.lastError);
        return false;
      }
      console.log('VoiceService: Permission granted');

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      console.log('VoiceService: Audio mode set');

      // Test backend connectivity if using backend TTS
      if (USE_BACKEND_TTS) {
        this.testBackendConnection();
      }

      return true;
    } catch (error) {
      this.lastError = `Init failed: ${error}`;
      console.error('Failed to initialize voice service:', error);
      return false;
    }
  }

  private async testBackendConnection(): Promise<void> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      if (response.ok) {
        console.log('VoiceService: Backend TTS connected at', BACKEND_URL);
      } else {
        console.warn('VoiceService: Backend TTS health check failed, will fallback to device TTS');
      }
    } catch (error) {
      console.warn('VoiceService: Backend TTS not reachable, will fallback to device TTS');
    }
  }

  async startRecording(): Promise<boolean> {
    try {
      if (this.isRecording) {
        console.log('VoiceService: Already recording');
        return false;
      }

      // Stop any existing recording
      if (this.recording) {
        console.log('VoiceService: Cleaning up previous recording');
        try {
          await this.recording.stopAndUnloadAsync();
        } catch (e) {
          console.log('VoiceService: Previous recording cleanup error (ignored):', e);
        }
        this.recording = null;
      }

      // Re-enable recording mode (Android sometimes loses it)
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      console.log('VoiceService: Creating recording with custom options...');
      const { recording } = await Audio.Recording.createAsync(
        SPEECH_RECORDING_OPTIONS as any
      );

      this.recording = recording;
      this.isRecording = true;
      console.log('VoiceService: Recording started successfully');
      return true;
    } catch (error) {
      this.lastError = `Start recording failed: ${error}`;
      console.error('Failed to start recording:', error);
      return false;
    }
  }

  async stopRecording(): Promise<string | null> {
    try {
      if (!this.recording || !this.isRecording) {
        this.lastError = 'No active recording to stop';
        console.log('VoiceService:', this.lastError);
        return null;
      }

      console.log('VoiceService: Stopping recording...');
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.isRecording = false;
      this.recording = null;

      if (!uri) {
        this.lastError = 'Recording stopped but no URI returned';
        console.error('VoiceService:', this.lastError);
        return null;
      }

      // Verify file exists and has content
      try {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        console.log('VoiceService: Recording file info:', JSON.stringify(fileInfo));
        if (!fileInfo.exists) {
          this.lastError = 'Recording file does not exist';
          console.error('VoiceService:', this.lastError);
          return null;
        }
        if (fileInfo.size && fileInfo.size < 1000) {
          this.lastError = `Recording too short (${fileInfo.size} bytes)`;
          console.warn('VoiceService:', this.lastError);
        }
      } catch (e) {
        console.warn('VoiceService: Could not verify file:', e);
      }

      console.log('VoiceService: Recording stopped, URI:', uri);
      return uri;
    } catch (error) {
      this.lastError = `Stop recording failed: ${error}`;
      console.error('Failed to stop recording:', error);
      this.isRecording = false;
      return null;
    }
  }

  async getAudioBase64(uri: string): Promise<{ base64: string; mimeType: string } | null> {
    try {
      console.log('VoiceService: Reading audio from:', uri);
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!base64 || base64.length < 100) {
        this.lastError = `Audio data too small: ${base64?.length || 0} chars`;
        console.error('VoiceService:', this.lastError);
        return null;
      }

      // Determine MIME type from URI extension
      const extension = uri.split('.').pop()?.toLowerCase();
      let mimeType = 'audio/mp4'; // Default for m4a
      if (extension === 'wav') mimeType = 'audio/wav';
      else if (extension === 'mp3') mimeType = 'audio/mp3';
      else if (extension === 'webm') mimeType = 'audio/webm';
      else if (extension === 'm4a') mimeType = 'audio/mp4';
      else if (extension === 'aac') mimeType = 'audio/aac';
      else if (extension === '3gp') mimeType = 'audio/3gpp';

      console.log('VoiceService: Audio format:', extension, 'MIME:', mimeType, 'Size:', base64.length);
      return { base64, mimeType };
    } catch (error) {
      this.lastError = `Failed to read audio: ${error}`;
      console.error('Failed to read audio file:', error);
      return null;
    }
  }

  getLastError(): string {
    return this.lastError;
  }

  /**
   * Speak text using backend TTS (Google Cloud) with fallback to device TTS
   */
  async speak(text: string): Promise<void> {
    if (USE_BACKEND_TTS) {
      try {
        await this.speakWithBackend(text);
        return;
      } catch (error) {
        console.warn('VoiceService: Backend TTS failed, falling back to device TTS:', error);
      }
    }

    // Fallback to device TTS
    return this.speakWithDevice(text);
  }

  /**
   * Speak using backend Google Cloud TTS
   */
  private async speakWithBackend(text: string): Promise<void> {
    console.log('VoiceService: Using backend TTS for:', text.substring(0, 50) + '...');

    // Set audio mode for playback
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    // Fetch audio from backend
    const response = await fetch(`${BACKEND_URL}/api/tts/base64`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice: 'en-US-Neural2-F', // High quality female voice
        speakingRate: 1.0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend TTS failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.audio) {
      throw new Error('No audio data received from backend');
    }

    // Save base64 audio to temp file
    const tempUri = `${FileSystem.cacheDirectory}tts_${Date.now()}.mp3`;
    await FileSystem.writeAsStringAsync(tempUri, data.audio, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Play the audio
    return new Promise(async (resolve, reject) => {
      try {
        // Unload previous sound if exists
        if (this.soundObject) {
          try {
            await this.soundObject.unloadAsync();
          } catch (e) {
            // Ignore cleanup errors
          }
        }

        const { sound } = await Audio.Sound.createAsync(
          { uri: tempUri },
          { shouldPlay: true },
          (status) => {
            if (status.isLoaded && status.didJustFinish) {
              this.isSpeaking = false;
              // Cleanup
              sound.unloadAsync().catch(() => {});
              FileSystem.deleteAsync(tempUri, { idempotent: true }).catch(() => {});
              resolve();
            }
          }
        );

        this.soundObject = sound;
        this.isSpeaking = true;
      } catch (error) {
        this.isSpeaking = false;
        reject(error);
      }
    });
  }

  /**
   * Fallback: Speak using device's built-in TTS
   */
  private async speakWithDevice(text: string): Promise<void> {
    console.log('VoiceService: Using device TTS');
    return new Promise((resolve) => {
      this.isSpeaking = true;
      Speech.speak(text, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
        onDone: () => {
          this.isSpeaking = false;
          resolve();
        },
        onError: () => {
          this.isSpeaking = false;
          resolve();
        },
      });
    });
  }

  stopSpeaking(): void {
    this.isSpeaking = false;

    // Stop device TTS
    Speech.stop();

    // Stop backend TTS audio playback
    if (this.soundObject) {
      this.soundObject.stopAsync().catch(() => {});
      this.soundObject.unloadAsync().catch(() => {});
      this.soundObject = null;
    }
  }

  getIsRecording(): boolean {
    return this.isRecording;
  }

  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const voiceService = new VoiceService();

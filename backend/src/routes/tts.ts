import { Router, Request, Response } from 'express';
import { ttsService } from '../services/tts-service';

export const ttsRouter = Router();

interface TTSRequest {
  text: string;
  voice?: string;
  languageCode?: string;
  speakingRate?: number;
  pitch?: number;
}

/**
 * POST /api/tts
 * Convert text to speech and return audio
 */
ttsRouter.post('/', async (req: Request<{}, {}, TTSRequest>, res: Response) => {
  try {
    const { text, voice, languageCode, speakingRate, pitch } = req.body;

    // Validate input
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Text is required and must be a string',
      });
    }

    if (text.length > 5000) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Text must be 5000 characters or less',
      });
    }

    // Generate speech
    const result = await ttsService.synthesize({
      text,
      voice,
      languageCode,
      speakingRate,
      pitch,
    });

    // Set headers for audio response
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': result.audioContent.length,
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      'X-TTS-Voice': result.voice,
      'X-TTS-Cached': result.cached ? 'true' : 'false',
    });

    // Send audio buffer
    res.send(result.audioContent);
  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).json({
      error: 'TTS synthesis failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/tts/base64
 * Convert text to speech and return base64 encoded audio
 * (Alternative endpoint for mobile apps that prefer JSON)
 */
ttsRouter.post('/base64', async (req: Request<{}, {}, TTSRequest>, res: Response) => {
  try {
    const { text, voice, languageCode, speakingRate, pitch } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Text is required and must be a string',
      });
    }

    if (text.length > 5000) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Text must be 5000 characters or less',
      });
    }

    const result = await ttsService.synthesize({
      text,
      voice,
      languageCode,
      speakingRate,
      pitch,
    });

    res.json({
      audio: result.audioContent.toString('base64'),
      mimeType: 'audio/mpeg',
      voice: result.voice,
      cached: result.cached,
      characterCount: text.length,
    });
  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).json({
      error: 'TTS synthesis failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/tts/voices
 * List available voices
 */
ttsRouter.get('/voices', async (req: Request, res: Response) => {
  try {
    const languageCode = req.query.language as string | undefined;
    const voices = await ttsService.listVoices(languageCode);
    res.json({ voices });
  } catch (error) {
    console.error('List voices error:', error);
    res.status(500).json({
      error: 'Failed to list voices',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/tts/stats
 * Get cache statistics
 */
ttsRouter.get('/stats', (req: Request, res: Response) => {
  const stats = ttsService.getCacheStats();
  res.json(stats);
});

/**
 * DELETE /api/tts/cache
 * Clear the TTS cache
 */
ttsRouter.delete('/cache', (req: Request, res: Response) => {
  ttsService.clearCache();
  res.json({ message: 'Cache cleared' });
});

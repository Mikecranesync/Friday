import { GoogleGenerativeAI } from '@google/generative-ai';

// API key - falls back to hardcoded value for production builds
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyBOEFzA3fWyS_s92h4Sd7ZaWIctiVXZjlA';

class AIService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private chat: any = null;

  initialize(): boolean {
    try {
      if (!API_KEY || API_KEY === 'your_api_key_here') {
        console.error('Gemini API key not configured. Key value:', API_KEY ? 'exists' : 'empty');
        return false;
      }

      console.log('Initializing AI with key:', API_KEY.substring(0, 10) + '...');
      this.genAI = new GoogleGenerativeAI(API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      // Start a chat session with Friday's personality
      this.chat = this.model.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: 'You are Friday, a helpful AI voice assistant. Keep responses concise and conversational - under 2 sentences when possible. Be friendly and helpful.' }],
          },
          {
            role: 'model',
            parts: [{ text: 'Got it! I\'m Friday, your voice assistant. How can I help you today?' }],
          },
        ],
      });

      console.log('AI Service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
      return false;
    }
  }

  async chat_message(message: string): Promise<string> {
    try {
      if (!this.chat) {
        this.initialize();
      }

      if (!this.chat) {
        return "I'm having trouble connecting. Please check your API key.";
      }

      const result = await this.chat.sendMessage(message);
      const response = result.response.text();
      
      console.log('AI Response:', response);
      return response;
    } catch (error) {
      console.error('AI chat error:', error);
      return "Sorry, I couldn't process that. Please try again.";
    }
  }

  async transcribeAudio(base64Audio: string, mimeType: string = 'audio/mp4'): Promise<string> {
    try {
      if (!this.model) {
        console.log('AIService: Model not initialized, initializing now...');
        this.initialize();
      }

      if (!this.model) {
        console.error('AIService: Failed to initialize model');
        return '';
      }

      console.log('AIService: Transcribing audio...');
      console.log('AIService: MIME type:', mimeType);
      console.log('AIService: Audio data length:', base64Audio.length);

      // Use Gemini to transcribe audio
      const result = await this.model.generateContent([
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Audio,
          },
        },
        { text: 'Transcribe this audio. Only output the transcription, nothing else. If you cannot hear any speech, respond with "[no speech detected]".' },
      ]);

      const transcription = result.response.text().trim();
      console.log('AIService: Transcription result:', transcription);

      // Handle no speech case
      if (transcription.toLowerCase().includes('no speech') ||
          transcription.toLowerCase().includes('cannot hear') ||
          transcription.toLowerCase().includes('no audio') ||
          transcription.length === 0) {
        console.log('AIService: No speech detected');
        return '';
      }

      return transcription;
    } catch (error: any) {
      console.error('AIService: Transcription error:', error);
      console.error('AIService: Error details:', error?.message || 'No message');
      return '';
    }
  }
}

export const aiService = new AIService();

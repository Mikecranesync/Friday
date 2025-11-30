import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

class AIService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private chat: any = null;

  initialize(): boolean {
    try {
      if (!API_KEY || API_KEY === 'your_api_key_here') {
        console.error('Gemini API key not configured');
        return false;
      }

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

      console.log('AI Service initialized');
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

  async transcribeAudio(base64Audio: string): Promise<string> {
    try {
      if (!this.model) {
        this.initialize();
      }

      if (!this.model) {
        return '';
      }

      // Use Gemini to transcribe audio
      const result = await this.model.generateContent([
        {
          inlineData: {
            mimeType: 'audio/m4a',
            data: base64Audio,
          },
        },
        { text: 'Transcribe this audio. Only output the transcription, nothing else.' },
      ]);

      const transcription = result.response.text().trim();
      console.log('Transcription:', transcription);
      return transcription;
    } catch (error) {
      console.error('Transcription error:', error);
      return '';
    }
  }
}

export const aiService = new AIService();

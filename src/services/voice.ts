import * as Speech from 'expo-speech';

export class VoiceService {
  private isSpeaking = false;

  async speak(text: string, rate: number = 1.0): Promise<void> {
    if (this.isSpeaking) {
      Speech.stop();
    }

    this.isSpeaking = true;

    return new Promise((resolve, reject) => {
      Speech.speak(text, {
        rate,
        pitch: 1.0,
        language: 'en-US',
        onDone: () => {
          this.isSpeaking = false;
          resolve();
        },
        onError: (error) => {
          this.isSpeaking = false;
          reject(error);
        },
      });
    });
  }

  stop(): void {
    if (this.isSpeaking) {
      Speech.stop();
      this.isSpeaking = false;
    }
  }

  async readEmail(from: string, subject: string, body: string): Promise<void> {
    const text = `Email from ${from}. Subject: ${subject}. ${body}`;
    await this.speak(text, 0.9);
  }

  async readEmailList(count: number): Promise<void> {
    const text = `You have ${count} unread email${count !== 1 ? 's' : ''}`;
    await this.speak(text);
  }

  async confirmAction(action: string): Promise<void> {
    await this.speak(`${action} completed`);
  }
}

export const voiceService = new VoiceService();

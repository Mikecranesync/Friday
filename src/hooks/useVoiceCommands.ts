import { useState, useCallback } from 'react';
import { voiceService } from '../services/voice';

export function useVoiceCommands() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback(async (text: string) => {
    try {
      setIsSpeaking(true);
      await voiceService.speak(text);
    } catch (error) {
      console.error('Speech error:', error);
    } finally {
      setIsSpeaking(false);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    voiceService.stop();
    setIsSpeaking(false);
  }, []);

  const readEmail = useCallback(async (from: string, subject: string, body: string) => {
    try {
      setIsSpeaking(true);
      await voiceService.readEmail(from, subject, body);
    } catch (error) {
      console.error('Email reading error:', error);
    } finally {
      setIsSpeaking(false);
    }
  }, []);

  return {
    isListening,
    isSpeaking,
    speak,
    stopSpeaking,
    readEmail,
  };
}

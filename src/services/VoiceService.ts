import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

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

      return true;
    } catch (error) {
      this.lastError = `Init failed: ${error}`;
      console.error('Failed to initialize voice service:', error);
      return false;
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

  async speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      Speech.speak(text, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
        onDone: () => resolve(),
        onError: () => resolve(),
      });
    });
  }

  stopSpeaking(): void {
    Speech.stop();
  }

  getIsRecording(): boolean {
    return this.isRecording;
  }
}

export const voiceService = new VoiceService();

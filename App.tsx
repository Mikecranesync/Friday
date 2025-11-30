import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { voiceService } from './src/services/VoiceService';
import { aiService } from './src/services/AIService';

type AppState = 'idle' | 'listening' | 'processing' | 'speaking';

export default function App() {
  const [state, setState] = useState<AppState>('idle');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('Tap to speak');
  const [error, setError] = useState('');
  const [initialized, setInitialized] = useState(false);

  // Animation values for each bar
  const barAnimations = useRef(
    [...Array(13)].map(() => new Animated.Value(40))
  ).current;

  // Initialize services on mount
  useEffect(() => {
    const init = async () => {
      const voiceOk = await voiceService.initialize();
      const aiOk = aiService.initialize();
      
      if (!voiceOk) {
        setError('Microphone permission required');
      } else if (!aiOk) {
        setError('API key not configured');
      } else {
        setInitialized(true);
        setResponse('Tap to speak');
      }
    };
    init();
  }, []);

  // Animate bars based on state
  useEffect(() => {
    if (state === 'listening') {
      // Animate bars randomly while listening
      const interval = setInterval(() => {
        barAnimations.forEach((anim) => {
          Animated.timing(anim, {
            toValue: 40 + Math.random() * 100,
            duration: 150,
            useNativeDriver: false,
          }).start();
        });
      }, 150);
      return () => clearInterval(interval);
    } else if (state === 'processing') {
      // Pulse animation while processing
      const pulse = () => {
        barAnimations.forEach((anim, i) => {
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 80,
              duration: 300,
              delay: i * 30,
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: 40,
              duration: 300,
              useNativeDriver: false,
            }),
          ]).start();
        });
      };
      pulse();
      const interval = setInterval(pulse, 800);
      return () => clearInterval(interval);
    } else if (state === 'speaking') {
      // Wave animation while speaking
      const wave = () => {
        barAnimations.forEach((anim, i) => {
          const delay = Math.abs(i - 6) * 50;
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 100,
              duration: 200,
              delay,
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: 50,
              duration: 200,
              useNativeDriver: false,
            }),
          ]).start();
        });
      };
      wave();
      const interval = setInterval(wave, 500);
      return () => clearInterval(interval);
    } else {
      // Reset to idle
      barAnimations.forEach((anim) => {
        Animated.timing(anim, {
          toValue: 40,
          duration: 300,
          useNativeDriver: false,
        }).start();
      });
    }
  }, [state]);

  const handleTap = async () => {
    if (!initialized) {
      setError('Still initializing...');
      return;
    }

    setError('');

    if (state === 'idle') {
      // Start listening
      setState('listening');
      setResponse('Listening...');
      setTranscript('');
      
      const started = await voiceService.startRecording();
      if (!started) {
        setState('idle');
        setError('Failed to start recording');
        setResponse('Tap to speak');
      }
    } else if (state === 'listening') {
      // Stop listening and process
      setState('processing');
      setResponse('Processing...');

      const audioUri = await voiceService.stopRecording();
      
      if (!audioUri) {
        setState('idle');
        setError('No audio recorded');
        setResponse('Tap to speak');
        return;
      }

      // Get audio as base64
      const base64Audio = await voiceService.getAudioBase64(audioUri);
      
      if (!base64Audio) {
        setState('idle');
        setError('Failed to read audio');
        setResponse('Tap to speak');
        return;
      }

      // Transcribe
      const transcription = await aiService.transcribeAudio(base64Audio);
      
      if (!transcription) {
        setState('idle');
        setError('Could not understand audio');
        setResponse('Tap to speak');
        return;
      }

      setTranscript(transcription);

      // Get AI response
      const aiResponse = await aiService.chat_message(transcription);
      setResponse(aiResponse);

      // Speak response
      setState('speaking');
      await voiceService.speak(aiResponse);
      
      setState('idle');
    } else if (state === 'speaking') {
      // Stop speaking
      voiceService.stopSpeaking();
      setState('idle');
    }
  };

  const getStatusText = () => {
    switch (state) {
      case 'listening':
        return '🎤 Listening... (tap to stop)';
      case 'processing':
        return '🧠 Processing...';
      case 'speaking':
        return '🔊 Speaking... (tap to stop)';
      default:
        return '👆 Tap to speak';
    }
  };

  const getBarColor = () => {
    switch (state) {
      case 'listening':
        return '#FF6B6B';
      case 'processing':
        return '#4ECDC4';
      case 'speaking':
        return '#45B7D1';
      default:
        return '#D96BFF';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>FRIDAY</Text>
        <Text style={styles.subtitle}>Voice Assistant</Text>

        {/* Status */}
        <Text style={styles.status}>{getStatusText()}</Text>

        {/* Error */}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Waveform */}
        <TouchableOpacity
          onPress={handleTap}
          style={styles.waveform}
          activeOpacity={0.8}
          disabled={state === 'processing'}
        >
          {state === 'processing' ? (
            <ActivityIndicator size="large" color="#D96BFF" />
          ) : (
            barAnimations.map((anim, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.bar,
                  {
                    height: anim,
                    backgroundColor: getBarColor(),
                  },
                ]}
              />
            ))
          )}
        </TouchableOpacity>

        {/* Transcript */}
        {transcript ? (
          <View style={styles.transcriptBox}>
            <Text style={styles.transcriptLabel}>You said:</Text>
            <Text style={styles.transcript}>{transcript}</Text>
          </View>
        ) : null}

        {/* Response */}
        <View style={styles.responseBox}>
          <Text style={styles.response}>{response}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0118',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#D96BFF',
    marginBottom: 4,
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9F7AEA',
    marginBottom: 30,
    letterSpacing: 2,
  },
  status: {
    fontSize: 16,
    color: '#D4BBFF',
    marginBottom: 10,
  },
  error: {
    fontSize: 14,
    color: '#FF6B6B',
    marginBottom: 10,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 160,
    width: '100%',
    marginVertical: 20,
  },
  bar: {
    width: 8,
    borderRadius: 4,
  },
  transcriptBox: {
    backgroundColor: 'rgba(217, 107, 255, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
  },
  transcriptLabel: {
    fontSize: 12,
    color: '#9F7AEA',
    marginBottom: 4,
  },
  transcript: {
    fontSize: 14,
    color: '#E9D5FF',
  },
  responseBox: {
    backgroundColor: 'rgba(159, 122, 234, 0.1)',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    minHeight: 60,
  },
  response: {
    fontSize: 16,
    color: '#F3E8FF',
    textAlign: 'center',
    lineHeight: 24,
  },
});

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  ActivityIndicator,
  Image,
} from 'react-native';
import { voiceService } from '../services/VoiceService';
import { aiService } from '../services/AIService';
import { useAuth } from '../contexts/AuthContext';

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

export default function VoiceScreen() {
  const { user, signOut } = useAuth();
  const [state, setState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('Tap to speak');
  const [error, setError] = useState('');
  const [initialized, setInitialized] = useState(false);

  const barAnimations = useRef(
    [...Array(13)].map(() => new Animated.Value(40))
  ).current;

  useEffect(() => {
    const init = async () => {
      console.log('Initializing services...');
      const voiceOk = await voiceService.initialize();
      console.log('Voice service:', voiceOk ? 'OK' : 'FAILED');

      const aiOk = aiService.initialize();
      console.log('AI service:', aiOk ? 'OK' : 'FAILED');

      if (!voiceOk) {
        setError('Microphone permission required');
      } else if (!aiOk) {
        setError('API key not configured');
      } else {
        setInitialized(true);
        setResponse(`Hi ${user?.name?.split(' ')[0] || 'there'}! Tap to speak.`);
      }
    };
    init();
  }, [user]);

  useEffect(() => {
    if (state === 'listening') {
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
      setState('listening');
      setResponse('Listening...');
      setTranscript('');

      console.log('Starting recording...');
      const started = await voiceService.startRecording();
      if (!started) {
        setState('idle');
        const voiceError = voiceService.getLastError();
        setError(`Recording failed: ${voiceError || 'Unknown error'}`);
        setResponse('Tap to speak');
      }
    } else if (state === 'listening') {
      setState('processing');
      setResponse('Stopping recording...');

      console.log('Stopping recording...');
      const audioUri = await voiceService.stopRecording();

      if (!audioUri) {
        setState('idle');
        const voiceError = voiceService.getLastError();
        setError(`No audio: ${voiceError || 'Recording failed'}`);
        setResponse('Tap to speak');
        return;
      }

      setResponse('Reading audio...');
      console.log('Reading audio from:', audioUri);
      const audioData = await voiceService.getAudioBase64(audioUri);

      if (!audioData) {
        setState('idle');
        const voiceError = voiceService.getLastError();
        setError(`Audio read failed: ${voiceError || 'Unknown'}`);
        setResponse('Tap to speak');
        return;
      }

      setResponse('Transcribing...');
      console.log('Transcribing audio, size:', audioData.base64.length, 'type:', audioData.mimeType);
      const transcription = await aiService.transcribeAudio(audioData.base64, audioData.mimeType);

      if (!transcription) {
        setState('idle');
        setError('Transcription failed - check API key');
        setResponse('Tap to speak');
        return;
      }

      setTranscript(transcription);
      setResponse('Getting AI response...');

      console.log('Getting AI response for:', transcription);
      const aiResponse = await aiService.chat_message(transcription);
      setResponse(aiResponse);

      setState('speaking');
      console.log('Speaking response...');
      await voiceService.speak(aiResponse);

      setState('idle');
    } else if (state === 'speaking') {
      voiceService.stopSpeaking();
      setState('idle');
    }
  };

  const getStatusText = () => {
    switch (state) {
      case 'listening':
        return 'Listening... (tap to stop)';
      case 'processing':
        return 'Processing...';
      case 'speaking':
        return 'Speaking... (tap to stop)';
      default:
        return 'Tap to speak';
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
      {/* Header with user info */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {user?.picture ? (
            <Image source={{ uri: user.picture }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{user?.name?.[0] || '?'}</Text>
            </View>
          )}
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
        </View>
        <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>FRIDAY</Text>
        <Text style={styles.subtitle}>Voice Assistant</Text>

        <Text style={styles.status}>{getStatusText()}</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

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

        {transcript ? (
          <View style={styles.transcriptBox}>
            <Text style={styles.transcriptLabel}>You said:</Text>
            <Text style={styles.transcript}>{transcript}</Text>
          </View>
        ) : null}

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(217, 107, 255, 0.2)',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D96BFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userName: {
    color: '#D4BBFF',
    fontSize: 14,
  },
  signOutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
  },
  signOutText: {
    color: '#FF6B6B',
    fontSize: 12,
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

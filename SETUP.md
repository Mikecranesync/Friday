# Friday Voice Assistant Setup Guide

## Prerequisites

- Node.js 18+ installed
- Expo CLI (`npm install -g expo-cli`)
- Physical device or emulator (voice features work best on physical devices)

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure Gemini API Key**

   a. Get your free API key:
   - Visit https://aistudio.google.com/apikey
   - Sign in with Google account
   - Click "Create API Key"
   - Copy the generated key

   b. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

   c. Add your API key to `.env`:
   ```
   EXPO_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
   ```

## Running the App

### On Physical Device (Recommended)

Voice features work best on real devices:

```bash
# Start Expo dev server
npm start

# Scan QR code with:
# - Expo Go app (iOS/Android)
# - Camera app (iOS only)
```

### On iOS Simulator

```bash
npm run ios
```

### On Android Emulator

```bash
npm run android
```

## Features

### Voice Assistant

- **Tap waveform** to start listening
- **Speak your question** (recording auto-stops after 30s)
- **Friday processes** your request with Gemini AI
- **Friday responds** via text-to-speech
- **Tap during response** to interrupt

### Waveform States

- **Idle**: Purple breathing animation
- **Listening**: Audio-reactive bars (responds to your voice)
- **Thinking**: Purple shimmer sweep
- **Responding**: Speech pattern pulses
- **Error**: Red shake animation

### Design

- **Purple/Magenta theme** (futuristic AI aesthetic)
- **13-bar waveform** (vs Jarvis 11 bars)
- **60 FPS animations** using react-native-reanimated
- **WCAG 2.1 AA compliant** colors
- **Dark mode optimized**

## Troubleshooting

### Microphone Permission

If you get permission errors:
- **iOS**: Settings > Friday > Microphone (enable)
- **Android**: App permissions > Friday > Microphone (enable)

### Gemini API Issues

- **"Invalid API key"**: Check your `.env` file has correct key
- **"Quota exceeded"**: Free tier limit reached (1,500 requests/day)
- **Network errors**: Check internet connection

### Audio Issues

- **No sound on iOS**: Check silent mode switch
- **Recording not working**: Restart app and grant permissions
- **Low audio quality**: Speak closer to microphone

## Development

### File Structure

```
friday/
├── src/
│   ├── components/
│   │   ├── FridayWaveform.tsx    # 13-bar animated waveform
│   │   └── StatusBar.tsx         # Top status bar
│   ├── screens/
│   │   └── FridayVoiceScreen.tsx # Main voice interface
│   ├── services/
│   │   ├── VoiceService.ts       # Voice recording + TTS
│   │   └── GeminiService.ts      # AI conversation
│   ├── constants/
│   │   ├── theme.ts              # Purple design system
│   │   └── config.ts             # App configuration
│   └── types/
│       └── index.ts              # TypeScript interfaces
├── App.tsx                       # Root component
└── package.json
```

### Key Technologies

- **Expo** - React Native framework
- **react-native-reanimated** - 60 FPS animations
- **expo-av** - Audio recording
- **expo-speech** - Text-to-speech
- **@google/generative-ai** - Gemini AI SDK
- **TypeScript** - Type safety

## API Limits (Free Tier)

- **Requests**: 1,500 per day
- **Tokens**: 1 million per minute
- **Audio transcription**: Included
- **Cost**: Free forever

Perfect for personal use!

## Next Steps

- Add email command integration
- Implement conversation history UI
- Add custom wake word ("Hey Friday")
- Connect to calendar/tasks
- Add voice command shortcuts

## Support

For issues or questions:
- Check console logs (enable in `config.ts`)
- Review Gemini API docs: https://ai.google.dev/docs
- Expo docs: https://docs.expo.dev

# Friday Voice Assistant

AI-powered voice assistant built with React Native and Expo.

## Features

- 🎤 **Voice Recording** - Tap to record your voice
- 🧠 **AI Transcription** - Gemini transcribes your speech
- 💬 **Smart Responses** - AI chat responds conversationally  
- 🔊 **Text-to-Speech** - Friday speaks responses aloud
- 🎨 **Animated Waveform** - Visual feedback for app state

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API Key
Edit `.env` and add your Gemini API key:
```
EXPO_PUBLIC_GEMINI_API_KEY=your_key_here
```
Get a free key at: https://aistudio.google.com/apikey

### 3. Build APK
```bash
eas build --platform android --profile preview
```

### 4. Install on Phone
Download the APK from the build URL and install on your Android device.

## Project Structure

```
friday/
├── App.tsx                 # Main app component
├── src/
│   └── services/
│       ├── VoiceService.ts # Recording & TTS
│       └── AIService.ts    # Gemini integration
├── app.json               # Expo config
├── eas.json               # EAS Build config
└── package.json           # Dependencies
```

## How It Works

1. **Tap waveform** → Start recording
2. **Tap again** → Stop recording, process audio
3. **Gemini transcribes** → Shows what you said
4. **AI responds** → Generates conversational reply
5. **TTS speaks** → Friday reads response aloud

## Tech Stack

- **Expo SDK 51** - React Native framework
- **Gemini 1.5 Flash** - AI transcription & chat
- **expo-av** - Audio recording
- **expo-speech** - Text-to-speech

## Build Profiles

- `preview` - APK for testing (no signing)
- `production` - AAB for Play Store

---

**Version:** 1.0.0  
**Last Updated:** 2025-11-29

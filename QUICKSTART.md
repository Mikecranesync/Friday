# Friday Voice Assistant - Quick Start 🚀

## 3-Step Setup

### 1. Get Gemini API Key (2 minutes)
```
1. Visit: https://aistudio.google.com/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key
```

### 2. Configure Environment (30 seconds)
```bash
# Copy the template
cp .env.example .env

# Edit .env and paste your API key:
EXPO_PUBLIC_GEMINI_API_KEY=your_key_here
```

### 3. Run Friday (1 minute)
```bash
# Install dependencies (first time only)
npm install

# Start the app
npm start

# Scan QR code with Expo Go app on your phone
```

---

## First Use

1. **Grant Permissions**: Allow microphone access when prompted
2. **Tap Waveform**: Purple breathing animation = ready
3. **Speak**: "What's the weather?" or "Tell me a joke"
4. **Friday Responds**: Green waveform = speaking
5. **Tap to Interrupt**: Tap again to stop Friday

---

## Troubleshooting

**No sound?**
- iOS: Turn off silent mode
- Android: Check volume

**"API key" error?**
- Check `.env` file has correct key
- Restart Expo server: `npm start`

**Microphone not working?**
- Grant permission in phone settings
- Restart app

---

## What You Built

- 🎤 Voice assistant with Gemini AI
- 🟣 13-bar purple waveform (60 FPS)
- 🎨 Futuristic JARVIS-style HUD
- 💬 Natural conversation capability
- 🔊 Text-to-speech responses
- 🎯 Production-ready code

---

## File Overview

**User Interface:**
- `src/screens/FridayVoiceScreen.tsx` - Main screen
- `src/components/FridayWaveform.tsx` - Animated waveform
- `src/components/StatusBar.tsx` - Top status bar

**AI & Voice:**
- `src/services/GeminiService.ts` - Google Gemini AI
- `src/services/VoiceService.ts` - Recording + TTS

**Design:**
- `src/constants/theme.ts` - Purple color scheme
- `src/constants/config.ts` - App settings

**Types:**
- `src/types/index.ts` - TypeScript interfaces

---

## Next Steps

✅ **You're done!** Friday is ready to use.

**Optional enhancements:**
- Add email integration (see Jarvis reference)
- Connect to calendar APIs
- Implement wake word detection
- Add conversation history UI

---

## Full Documentation

See **SETUP.md** for detailed instructions.
See **FRIDAY_BUILD_SUMMARY.md** for complete technical details.

---

**Built with:** React Native + Expo + Google Gemini AI
**Theme:** Purple/Magenta Futuristic
**Free Tier:** 1,500 requests/day

# Friday Voice Assistant - Memory

## Current Version: 1.1.1 (Build 3)
**Last Updated:** 2025-11-30
**Latest APK:** https://expo.dev/accounts/mikecranesync/projects/friday/builds/c6b6007d-fa8a-4d23-b9d1-c2d19fe45ac9

---

## Milestone 1: Working APK ✅ (2025-11-29)

### What Was Built
A functional Android voice assistant that:
- Records voice via microphone
- Transcribes speech using Gemini AI
- Generates conversational responses
- Speaks responses via text-to-speech
- Shows animated waveform feedback

### Key Decisions
1. **Abandoned Expo Go** - Java.io errors on multiple phones, unreliable
2. **Native APK via EAS Build** - Works reliably, no Expo Go limitations
3. **Gemini 1.5 Flash** - Handles both transcription and chat
4. **Minimal dependencies** - Only essential packages

---

## Milestone 1.5: Google Auth + Backend TTS ✅ (2025-11-30)

### What Was Added
1. **Google OAuth Authentication**
   - Sign in with Google (Expo auth proxy)
   - "Continue as Guest" option
   - User session persistence with AsyncStorage
   - User avatar and name in header

2. **Backend TTS Service** (Node.js + Express + Google Cloud TTS)
   - High-quality Neural2 voices
   - Audio caching to reduce API costs
   - Automatic fallback to device TTS if backend unreachable

### Architecture
```
friday/
├── App.tsx                         # Auth routing
├── src/
│   ├── contexts/
│   │   └── AuthContext.tsx         # Google OAuth + guest mode
│   ├── screens/
│   │   ├── LoginScreen.tsx         # Sign in UI
│   │   └── VoiceScreen.tsx         # Voice UI with waveform
│   └── services/
│       ├── VoiceService.ts         # Recording + Backend TTS
│       └── AIService.ts            # Gemini transcription + chat
├── backend/                        # Node.js TTS backend
│   ├── src/
│   │   ├── index.ts                # Express server
│   │   ├── routes/
│   │   │   ├── health.ts           # Health check
│   │   │   └── tts.ts              # TTS endpoints
│   │   └── services/
│   │       └── tts-service.ts      # Google Cloud TTS + caching
│   ├── package.json
│   └── README.md
├── app.json                        # Expo config (v1.1.1)
└── package.json
```

### What's Working
- ✅ APK installs and runs on Android
- ✅ Google OAuth sign-in (Expo proxy)
- ✅ Guest mode (skip login)
- ✅ User avatar and name display
- ✅ Sign out functionality
- ✅ Microphone permission request
- ✅ Voice recording (m4a format)
- ✅ Gemini API connection
- ✅ Audio transcription
- ✅ AI chat responses (Friday personality)
- ✅ Backend TTS (Google Cloud Neural2)
- ✅ Fallback to device TTS
- ✅ Animated waveform (4 states: idle/listening/processing/speaking)
- ✅ State-based color changes

---

## Milestone 1.6: Crash Fix (v1.1.1) ✅ (2025-11-30)

### Problem
APK v1.1.0 crashed immediately on launch - app would not open.

### Root Causes Identified
1. **metro.config.js** - Complex configuration using `__DEV__` variable (not available at Metro config time), plus problematic resolver settings that broke the bundle
2. **AuthContext.tsx** - Used deprecated `useProxy: true` option in `makeRedirectUri()` which caused crashes in newer Expo SDK builds

### Fixes Applied
1. **Simplified metro.config.js** - Reduced to minimal config that just adds 'cjs' extension support
2. **Updated OAuth redirect** - Replaced `useProxy: true` with proper `scheme` + `path` configuration
3. **Added deep link scheme** - Added `scheme: "friday"` to app.json for OAuth redirects

### Files Changed
- `metro.config.js` - Simplified from 70 lines to 9 lines
- `src/contexts/AuthContext.tsx` - Fixed `makeRedirectUri()` call
- `app.json` - Added `scheme: "friday"`, bumped to v1.1.1 (versionCode 3)

---

## Git Worktrees

| Directory | Branch | Purpose |
|-----------|--------|---------|
| `friday/` | `main` | Stable release |
| `friday-oauth/` | `feature/oauth-direct` | Issue #1: Direct OAuth (no proxy) |
| `friday-tts/` | `feature/tts-backend` | TTS improvements |
| `friday-history/` | `feature/conversation-history` | Issue #3: Chat history |

### Worktree Commands
```bash
# List worktrees
cd C:\Users\hharp\PAI\friday
git worktree list

# Work on a feature
cd ../friday-oauth
# make changes...
git add -A && git commit -m "Description"
git push origin feature/oauth-direct
```

---

## GitHub Issues

| Issue | Title | Status |
|-------|-------|--------|
| #1 | OAuth without Expo Proxy + Multi-Account | Open |
| #2 | Voice Recording Enhancements | Open |
| #3 | Gemini Integration (conversation history) | Open |
| #4 | TTS Backend | ✅ Resolved |

---

## Build Commands

### Build APK
```bash
cd C:\Users\hharp\PAI\friday
eas build --platform android --profile preview
```

### Start Backend (for TTS)
```bash
cd C:\Users\hharp\PAI\friday\backend
npm install
cp .env.example .env
# Add google-credentials.json
npm run dev
```

### Development
```bash
cd C:\Users\hharp\PAI\friday
npm start
# Press 'a' for Android (requires dev build)
```

---

## Environment Variables

### Mobile App (.env)
```env
EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-key
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id
EXPO_PUBLIC_BACKEND_URL=http://10.0.2.2:3001
EXPO_PUBLIC_USE_BACKEND_TTS=true
```

### Backend (.env)
```env
PORT=3001
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
TTS_VOICE_NAME=en-US-Neural2-F
```

---

## Tech Stack

- **Mobile:** React Native 0.74.5, Expo SDK 51
- **AI:** Gemini 1.5 Flash (@google/generative-ai)
- **Auth:** expo-auth-session, Google OAuth
- **Audio:** expo-av (recording), expo-speech (fallback TTS)
- **Backend:** Node.js 18+, Express, Google Cloud TTS
- **Build:** EAS Build (cloud)

---

## Next Milestones

### Milestone 2: Enhanced UX
- [ ] Custom app icon/splash
- [ ] Conversation history display
- [ ] Settings screen
- [ ] Better error handling
- [x] Backend TTS service

### Milestone 3: Integrations
- [ ] Gmail integration
- [ ] Calendar integration
- [ ] Wake word ("Hey Friday")
- [ ] Background listening

### Milestone 4: Production
- [ ] Play Store release
- [ ] iOS build
- [ ] Analytics
- [ ] Crash reporting

---

## Build History

| Version | Date | Build ID | Features |
|---------|------|----------|----------|
| 1.1.1 | 2025-11-30 | c6b6007d | Crash fix: metro.config + OAuth |
| 1.1.0 | 2025-11-30 | 96f485db | Backend TTS, Google OAuth (crashed) |
| 1.0.0 | 2025-11-29 | 1989801d | Initial release with voice |

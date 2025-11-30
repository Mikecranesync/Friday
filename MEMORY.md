# Friday Voice Assistant - Memory

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

2. **Backend TTS Service** (Node.js + Express + Google Cloud TTS)
   - High-quality Neural2 voices
   - Audio caching to reduce API costs
   - Automatic fallback to device TTS

### Architecture (Updated)
```
App.tsx (Auth routing)
├── src/contexts/AuthContext.tsx (Google OAuth)
├── src/screens/LoginScreen.tsx (Login UI)
├── src/screens/VoiceScreen.tsx (Voice UI with waveform)
├── src/services/VoiceService.ts (Recording + Backend TTS)
├── src/services/AIService.ts (Gemini transcription + chat)
└── backend/
    ├── src/index.ts (Express server)
    ├── src/routes/tts.ts (TTS endpoints)
    └── src/services/tts-service.ts (Google Cloud TTS)
```

### Core Files
- `App.tsx` - Auth routing (login vs voice screen)
- `src/contexts/AuthContext.tsx` - Google OAuth + guest mode
- `src/screens/LoginScreen.tsx` - Sign in UI
- `src/screens/VoiceScreen.tsx` - Main voice UI with waveform
- `src/services/VoiceService.ts` - Recording + Backend/device TTS
- `src/services/AIService.ts` - Gemini API integration
- `backend/` - Node.js TTS backend

### Build Command
```bash
eas build --platform android --profile preview
```

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Add Google Cloud credentials
npm run dev
```

### What's Working
- ✅ APK installs and runs on Android
- ✅ Google OAuth sign-in
- ✅ Guest mode (skip login)
- ✅ Microphone permission request
- ✅ Voice recording
- ✅ Gemini API connection
- ✅ Audio transcription
- ✅ AI chat responses
- ✅ Backend TTS (Google Cloud Neural2)
- ✅ Fallback to device TTS
- ✅ Animated waveform states

---

## Milestone 1.6: Subscription System + EAS Build Fixes ✅ (2025-11-30)

### What Was Added
1. **RevenueCat Subscription System**
   - PaywallScreen with subscription tiers
   - SubscriptionContext for managing user subscriptions
   - Guest mode bypasses paywall
   - AuthContext integration

2. **EAS Build Configuration Fixes**
   - Added `expo-build-properties` plugin
   - Fixed `expo-linear-gradient` version (15.0.7 → 13.0.2)
   - Configured Android build properties in app.json
   - Added ErrorBoundary for startup crash protection
   - Made RevenueCat initialization non-blocking

### Architecture (Updated)
```
App.tsx (ErrorBoundary + Auth + Subscription routing)
├── src/components/ErrorBoundary.tsx (Crash protection)
├── src/contexts/AuthContext.tsx (Google OAuth)
├── src/contexts/SubscriptionContext.tsx (RevenueCat)
├── src/screens/LoginScreen.tsx (Login UI)
├── src/screens/PaywallScreen.tsx (Subscription UI)
├── src/screens/VoiceScreen.tsx (Voice UI with waveform)
├── src/services/VoiceService.ts (Recording + Backend TTS)
└── src/services/AIService.ts (Gemini transcription + chat)
```

### Build Issues Fixed
1. **Gradle Build Failure #1:** Missing `expo-build-properties`
   - **Solution:** `npx expo install expo-build-properties`
   - **Configured:** Android SDK 34, Kotlin 1.9.23

2. **Gradle Build Failure #2:** Version mismatch
   - **Error:** `expo-linear-gradient@15.0.7` incompatible with Expo SDK 51
   - **Solution:** Downgraded to `expo-linear-gradient@13.0.2`
   - **Root Cause:** expo-module-gradle-plugin not found

3. **App Startup Crashes:** RevenueCat initialization blocking
   - **Solution:** Made subscription checks non-blocking with try-catch
   - **Added:** ErrorBoundary component for graceful error recovery

### Build Command (Working)
```bash
# Development build (recommended)
eas build --profile development --platform android --clear-cache

# Preview build
eas build --profile preview --platform android --clear-cache
```

### EAS Configuration
```json
// eas.json
{
  "preview": {
    "developmentClient": true,  // Fixed: was missing
    "distribution": "internal",
    "android": {
      "buildType": "apk"
    }
  }
}

// app.json
{
  "plugins": [
    [
      "expo-build-properties",
      {
        "android": {
          "compileSdkVersion": 34,
          "targetSdkVersion": 34,
          "buildToolsVersion": "34.0.0",
          "kotlinVersion": "1.9.23"
        }
      }
    ]
  ]
}
```

### What's Working
- ✅ EAS builds complete successfully
- ✅ APK downloads and installs
- ✅ ErrorBoundary catches startup crashes
- ✅ RevenueCat subscription system
- ✅ PaywallScreen with subscription UI
- ✅ Guest mode bypasses subscription
- ✅ Graceful degradation if RevenueCat fails

### Successful Build
- **Build ID:** 380221ea-7aed-4e6d-a737-8671c65b3786
- **Date:** 2025-11-30
- **Download:** https://expo.dev/accounts/mikecranesync/projects/friday/builds/380221ea-7aed-4e6d-a737-8671c65b3786

---

## GitHub Issues

### Issue #1: OAuth without Expo Proxy + Multi-Account
- Remove Expo proxy dependency
- Show Google account picker for multi-account users
- https://github.com/Mikecranesync/Friday/issues/1

### Issue #2: Voice Recording Enhancements
- Audio level visualization (real amplitude)
- Recording duration timer
- https://github.com/Mikecranesync/Friday/issues/2

### Issue #3: Gemini Integration
- Conversation history persistence
- Streaming responses
- https://github.com/Mikecranesync/Friday/issues/3

### Issue #4: TTS Backend (RESOLVED)
- ✅ Built Node.js backend with Google Cloud TTS
- ✅ Caching layer for cost reduction
- ✅ Mobile app integration
- https://github.com/Mikecranesync/Friday/issues/4

---

## Technical Notes

### Why Expo Go Failed
- `newArchEnabled` incompatible with Expo Go
- OTA updates causing java.io download errors
- Tested on 2 phones, both failed
- React Native Reanimated complexity

### Why EAS Build Works
- Compiles to real native APK
- No runtime dependency on Expo Go
- All native modules bundled
- ~10-15 min build time

### Backend TTS vs Device TTS
- **Backend (Google Cloud)**: High-quality Neural2 voices, consistent across devices
- **Device TTS**: Free but inconsistent quality, fails on some Android versions
- VoiceService automatically falls back to device TTS if backend unreachable

### Environment Variables
```env
# Mobile App (.env)
EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-key
EXPO_PUBLIC_BACKEND_URL=http://10.0.2.2:3001  # or local IP
EXPO_PUBLIC_USE_BACKEND_TTS=true

# Backend (.env)
PORT=3001
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
TTS_VOICE_NAME=en-US-Neural2-F
```

### Environment
- Expo SDK 51
- React Native 0.74.5
- Gemini 1.5 Flash API
- Node.js 18+ (backend)
- Google Cloud TTS (backend)
- EAS Build (cloud)

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

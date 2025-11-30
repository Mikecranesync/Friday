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

### Architecture
```
App.tsx (UI + State)
├── src/services/VoiceService.ts (Recording + TTS)
└── src/services/AIService.ts (Gemini transcription + chat)
```

### Core Files
- `App.tsx` - Main UI with animated waveform
- `src/services/VoiceService.ts` - Audio recording, TTS
- `src/services/AIService.ts` - Gemini API integration
- `app.json` - Expo/Android config
- `eas.json` - Build profiles

### Build Command
```bash
eas build --platform android --profile preview
```

### What's Working
- ✅ APK installs and runs on Android
- ✅ Microphone permission request
- ✅ Voice recording
- ✅ Gemini API connection
- ✅ Audio transcription
- ✅ AI chat responses
- ✅ Text-to-speech output
- ✅ Animated waveform states (idle/listening/processing/speaking)

---

## Open Issues (For Agents)

### Issue 1: App Icon & Splash Screen
- **Branch:** `feature/app-icon`
- **Worktree:** `../friday-icon`
- **Task:** Create custom purple-themed branding assets
- **Files:** `assets/icon.png`, `assets/adaptive-icon.png`, `assets/splash-icon.png`

### Issue 2: Conversation History UI
- **Branch:** `feature/conversation-history`
- **Worktree:** `../friday-history`
- **Task:** Add scrollable message history with bubbles
- **Files:** `App.tsx`, optionally `src/components/MessageBubble.tsx`

### Issue 3: Settings Screen
- **Branch:** `feature/settings-screen`
- **Worktree:** `../friday-settings`
- **Task:** In-app API key configuration with AsyncStorage
- **Files:** `src/screens/SettingsScreen.tsx`, `App.tsx`, `src/services/AIService.ts`

---

## Git Worktree Commands

### Setup Worktrees
```bash
cd C:\Users\hharp\PAI\friday
git worktree add ../friday-icon feature/app-icon
git worktree add ../friday-history feature/conversation-history
git worktree add ../friday-settings feature/settings-screen
```

### Agent Workflow
```bash
cd ../friday-icon  # or friday-history, friday-settings
# make changes
git add -A
git commit -m "Description of changes"
git push origin feature/app-icon
# Create PR on GitHub
```

### Cleanup
```bash
git worktree remove ../friday-icon
git branch -d feature/app-icon
```

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

### Environment
- Expo SDK 51
- React Native 0.74.5
- Gemini 1.5 Flash API
- EAS Build (cloud)

---

## Next Milestones

### Milestone 2: Enhanced UX
- [ ] Custom app icon/splash
- [ ] Conversation history display
- [ ] Settings screen
- [ ] Better error handling

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

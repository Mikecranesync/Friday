# 🐛 Friday Voice Assistant - Debugging Guide

**Last Updated:** November 29, 2025

This guide will help you diagnose and fix common issues with the Friday Voice Assistant app.

---

## 📋 Table of Contents

- [Quick Start Debugging](#quick-start-debugging)
- [Common Errors](#common-errors)
  - [Java IO Exceptions (Android)](#java-io-exceptions-android)
  - [Metro Bundler Errors](#metro-bundler-errors)
  - [Voice/Audio Errors](#voiceaudio-errors)
  - [AI/Gemini Errors](#aigemini-errors)
- [Development Tools](#development-tools)
- [Reading Metro Logs](#reading-metro-logs)
- [Platform-Specific Issues](#platform-specific-issues)
- [Performance Debugging](#performance-debugging)
- [Production Debugging](#production-debugging)

---

## 🚀 Quick Start Debugging

### 1. Clear Cache and Restart

Most issues can be fixed by clearing the cache:

```bash
# Clear Metro bundler cache and restart
npm run start:clear

# Or for Android specifically
npm run android:clear
```

### 2. Check Metro Bundler Logs

Metro bundler shows all errors in real-time. Look for:
- **Red text**: Critical errors that stop the build
- **Yellow text**: Warnings that might cause issues
- **File paths**: Tell you exactly where the error occurred

### 3. Enable Verbose Logging

In `src/constants/config.ts`:

```typescript
debug: {
  enableLogs: true,              // Enable all logging
  logVoiceTranscripts: true,     // Log voice transcriptions
  logAIResponses: true,          // Log AI responses
}
```

---

## 🔥 Common Errors

### Java IO Exceptions (Android)

#### **Error:** `java.io.FileNotFoundException` or `java.io.IOException`

**Symptoms:**
- App crashes on Android but works on web
- "Failed to read file" errors
- Metro shows Java stack traces

**Common Causes:**

1. **File System Permissions**
   ```typescript
   // ❌ BAD: Trying to access restricted directories
   const path = '/storage/emulated/0/restricted.mp3';

   // ✅ GOOD: Use Expo FileSystem directories
   import * as FileSystem from 'expo-file-system';
   const path = `${FileSystem.documentDirectory}recording.wav`;
   ```

2. **Missing File Extensions**
   ```typescript
   // ❌ BAD: No file extension
   const uri = recording.getURI(); // Might return null

   // ✅ GOOD: Check URI exists
   const uri = recording.getURI();
   if (!uri) {
     throw new RecordingError('No audio URI returned');
   }
   ```

3. **Android Asset Loading**
   ```typescript
   // ❌ BAD: Direct asset paths don't work on Android
   const icon = './assets/icon.png';

   // ✅ GOOD: Use require() for assets
   const icon = require('./assets/icon.png');
   ```

**Fix Steps:**

1. Check file paths use `FileSystem.documentDirectory` or `FileSystem.cacheDirectory`
2. Verify file exists before reading:
   ```typescript
   const fileInfo = await FileSystem.getInfoAsync(audioUri);
   if (!fileInfo.exists) {
     throw new FileReadError(audioUri);
   }
   ```
3. Add Android permissions in `app.json`:
   ```json
   "android": {
     "permissions": [
       "android.permission.RECORD_AUDIO",
       "android.permission.INTERNET",
       "android.permission.READ_EXTERNAL_STORAGE",
       "android.permission.WRITE_EXTERNAL_STORAGE"
     ]
   }
   ```

4. Clear cache and rebuild:
   ```bash
   npm run clean:android
   npm run android:clear
   ```

---

### Metro Bundler Errors

#### **Error:** `Unable to resolve module`

**Example:**
```
Error: Unable to resolve module react-native-reanimated from ...
```

**Fix:**
1. Check `babel.config.js` includes the plugin:
   ```javascript
   plugins: [
     'react-native-reanimated/plugin', // MUST be last
   ]
   ```

2. Clear cache and reinstall:
   ```bash
   npm run clean
   npm run start:clear
   ```

#### **Error:** `Syntax Error` or `Unexpected Token`

**Fix:**
1. Run ESLint to find syntax errors:
   ```bash
   npm run lint
   ```

2. Check for missing semicolons, brackets, or imports

3. Verify TypeScript types are correct:
   ```bash
   npm run type-check
   ```

---

### Voice/Audio Errors

#### **Error:** `MIC_PERMISSION_DENIED`

**User Message:** "Please enable microphone access in your device settings"

**Fix:**

**iOS:**
1. Go to Settings > Privacy > Microphone
2. Enable for "Friday"

**Android:**
1. Go to Settings > Apps > Friday > Permissions
2. Enable Microphone permission

**In Code:**
```typescript
// Check permission before recording
const hasPermission = await VoiceService.requestPermissions();
if (!hasPermission) {
  // Show user-friendly error
  Alert.alert(
    'Microphone Access Required',
    'Please enable microphone access in your device settings.'
  );
}
```

#### **Error:** `RECORDING_FAILED`

**Common Causes:**
- Another app is using the microphone
- Audio session not configured correctly
- Android audio focus issues

**Fix:**
```typescript
// Ensure audio mode is set before recording
await Audio.setAudioModeAsync({
  allowsRecordingIOS: true,
  playsInSilentModeIOS: true,
  playThroughEarpieceAndroid: false,
  staysActiveInBackground: false,
});
```

#### **Error:** `TTS_FAILED`

**Fix:**
- Check device volume is not muted
- Verify TTS engine is installed (Android)
- Try different voice settings in `config.ts`

---

### AI/Gemini Errors

#### **Error:** `API_KEY_INVALID`

**User Message:** "AI service not configured. Please add your API key to the .env file."

**Fix:**

1. Get a free API key at [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)

2. Create `.env` file in project root:
   ```env
   EXPO_PUBLIC_GEMINI_API_KEY=your_api_key_here
   ```

3. Restart Metro bundler:
   ```bash
   npm run start:clear
   ```

#### **Error:** `QUOTA_EXCEEDED`

**User Message:** "Daily API limit reached. Please try again tomorrow."

**Fix:**
- Wait 24 hours for quota to reset
- Upgrade to paid tier if needed
- Reduce number of API calls by caching responses

#### **Error:** `NETWORK_ERROR`

**User Message:** "Unable to connect to AI service. Please check your internet connection."

**Fix:**
- Check internet connection
- Try switching between WiFi and cellular
- Check if firewall/VPN is blocking requests
- Verify API endpoint is accessible

#### **Error:** `TRANSCRIPTION_FAILED`

**Fix:**
- Speak more clearly and slowly
- Reduce background noise
- Check microphone is working
- Try recording again with better audio quality

---

## 🛠️ Development Tools

### React DevTools

**Install:**
```bash
npm install -g react-devtools
react-devtools
```

**Usage:**
- Inspect component hierarchy
- View component props and state
- Profile component performance

### Metro Bundler Logs

**View logs in real-time:**
```bash
# iOS logs
npx react-native log-ios

# Android logs
npm run debug:logs
# or
npx react-native log-android
```

**Filter logs:**
```bash
# Only show errors
adb logcat *:E

# Filter by tag
adb logcat -s ReactNativeJS
```

### Chrome DevTools (Web Only)

**Enable:**
1. Open app in browser: `npm run web`
2. Press `F12` to open DevTools
3. Go to Console tab for logs
4. Use Network tab to debug API calls

### Expo Developer Tools

**Open:**
- Press `d` in Metro terminal
- Opens developer menu in app
- Access to:
  - Reload app
  - Enable Fast Refresh
  - Toggle Performance Monitor
  - Open React DevTools

---

## 📖 Reading Metro Logs

### Understanding Error Stack Traces

**Example Error:**
```
ERROR  Error: Recording failed: Failed to start recording
    at VoiceService.startRecording (VoiceService.ts:95:12)
    at FridayVoiceScreen.handleWaveformTap (FridayVoiceScreen.tsx:65:23)
```

**Read from bottom to top:**
1. Line 65 in `FridayVoiceScreen.tsx` - User tapped waveform
2. Line 95 in `VoiceService.ts` - Recording failed to start
3. Error message: "Recording failed: Failed to start recording"

### Common Log Prefixes

- `🎤` - Voice/Audio operations
- `🤖` - AI/Gemini operations
- `📝` - Transcription
- `🔊` - Text-to-speech
- `✅` - Success
- `⚠️` - Warning
- `❌` - Error

### Log Levels

```typescript
// Development logging
if (__DEV__) {
  console.log('Debug info');
  console.warn('Warning');
  console.error('Error');
}

// Production logging (errors only)
if (!__DEV__) {
  console.error('Error that should be logged in production');
}
```

---

## 📱 Platform-Specific Issues

### Android-Specific

#### Issue: App crashes on launch

**Fix:**
1. Check `android/app/build.gradle` for correct SDK versions
2. Run `npm run clean:android`
3. Rebuild: `npm run android:clear`

#### Issue: Native module errors

**Fix:**
```bash
cd android
./gradlew clean
cd ..
npm run android
```

#### Issue: Permissions not working

**Fix:**
- Check `app.json` has correct permissions array
- Uninstall and reinstall app
- Check Android settings manually

### iOS-Specific

#### Issue: Code signing errors

**Fix:**
- Open `ios/friday.xcworkspace` in Xcode
- Check signing & capabilities
- Select correct development team

#### Issue: Microphone not working

**Fix:**
- Check `Info.plist` has microphone permission description
- Add in `app.json`:
  ```json
  "ios": {
    "infoPlist": {
      "NSMicrophoneUsageDescription": "Friday needs microphone access for voice commands"
    }
  }
  ```

### Web-Specific

#### Issue: Audio not working

**Fix:**
- Modern browsers require user interaction before playing audio
- Some features (native modules) won't work on web
- Use Chrome/Firefox for best compatibility

---

## ⚡ Performance Debugging

### Enable Performance Monitor

**In app:**
1. Shake device (or Cmd+D / Ctrl+M in simulator)
2. Select "Show Performance Monitor"
3. Shows:
   - JavaScript FPS
   - UI FPS (native)
   - Memory usage

### Profile Components

```typescript
import { Profiler } from 'react';

<Profiler id="FridayWaveform" onRender={onRenderCallback}>
  <FridayWaveform />
</Profiler>

function onRenderCallback(
  id, phase, actualDuration, baseDuration, startTime, commitTime
) {
  console.log(`${id} took ${actualDuration}ms to render`);
}
```

### Memory Leaks

**Common causes:**
- Uncleared intervals/timeouts
- Event listeners not removed
- Large objects in state

**Fix:**
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    // Do something
  }, 1000);

  // Cleanup on unmount
  return () => {
    clearInterval(interval);
  };
}, []);
```

### Animation Performance

**Use Reanimated's `useAnimatedStyle`:**
```typescript
// ✅ GOOD: Runs on UI thread
const animatedStyle = useAnimatedStyle(() => ({
  opacity: opacity.value,
}));

// ❌ BAD: Runs on JS thread (slower)
const [opacity, setOpacity] = useState(1);
```

---

## 🚀 Production Debugging

### Error Reporting

**Sentry Integration (Recommended):**
```bash
npm install @sentry/react-native
```

```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'your-sentry-dsn',
  enableInExpoDevelopment: true,
});

// Catch errors
try {
  // Your code
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

### Remote Logging

**For production debugging:**
```typescript
// Send logs to your server
async function logToServer(level: string, message: string, data?: any) {
  if (!__DEV__) {
    await fetch('https://your-api.com/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level, message, data, timestamp: Date.now() }),
    });
  }
}
```

### Feature Flags

**Disable broken features in production:**
```typescript
const FEATURES = {
  voiceCommands: true,
  aiResponses: Platform.OS !== 'android', // Disable on Android if broken
  animations: true,
};

if (FEATURES.voiceCommands) {
  // Use voice commands
}
```

---

## 🆘 Getting Help

### Before Asking for Help

1. ✅ Clear cache: `npm run start:clear`
2. ✅ Check this DEBUG.md guide
3. ✅ Read error messages carefully
4. ✅ Check Metro bundler logs
5. ✅ Try on different device/simulator
6. ✅ Check if issue is platform-specific

### What to Include in Bug Reports

```markdown
**Environment:**
- OS: [Android 13 / iOS 17 / Web]
- Device: [Pixel 7 / iPhone 14 / Browser]
- App Version: 1.0.0
- Expo SDK: 51

**Error:**
[Paste exact error message and stack trace]

**Steps to Reproduce:**
1. Open app
2. Tap voice button
3. Error appears

**Expected Behavior:**
Should start recording audio

**Actual Behavior:**
App crashes with FileNotFoundException

**Logs:**
[Paste relevant Metro bundler logs]
```

---

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Debugging](https://reactnative.dev/docs/debugging)
- [Metro Bundler Guide](https://facebook.github.io/metro/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Expo FileSystem API](https://docs.expo.dev/versions/latest/sdk/filesystem/)
- [Expo AV (Audio/Video)](https://docs.expo.dev/versions/latest/sdk/av/)

---

## 🎯 Quick Reference

### Useful Commands

```bash
# Development
npm run start                # Start Metro bundler
npm run start:clear          # Clear cache and start
npm run android              # Run on Android
npm run android:clear        # Clear cache and run on Android

# Debugging
npm run debug:logs           # View Android logs
npm run type-check           # Check TypeScript errors
npm run lint                 # Check code quality
npm run validate             # Run all checks

# Cleanup
npm run clean                # Clean node_modules and reinstall
npm run clean:android        # Clean Android build
```

### Environment Variables

```env
# .env file
EXPO_PUBLIC_GEMINI_API_KEY=your_key_here
EXPO_PUBLIC_DEBUG_MODE=true
```

### Error Codes

| Code | Meaning | User Action |
|------|---------|-------------|
| `MIC_PERMISSION_DENIED` | Microphone access denied | Enable in settings |
| `RECORDING_FAILED` | Recording error | Check microphone |
| `TTS_FAILED` | Text-to-speech error | Check volume/TTS engine |
| `API_KEY_INVALID` | Invalid Gemini API key | Add valid API key |
| `QUOTA_EXCEEDED` | API limit reached | Wait or upgrade |
| `NETWORK_ERROR` | No internet connection | Check connection |
| `FILE_READ_ERROR` | Cannot read file | Check permissions |
| `TRANSCRIPTION_FAILED` | Audio transcription failed | Speak clearly |

---

**Happy Debugging! 🐛➡️✨**

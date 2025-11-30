# Friday Android Troubleshooting Guide

## 🔧 Issues Fixed

### 1. **java.io.IOException: failed to download remote update**

**Root Cause:** `newArchEnabled: true` in app.json is incompatible with Expo Go.

**Solution Applied:**
- Set `newArchEnabled: false` in app.json
- Added `jsEngine: "hermes"` for better performance
- Disabled OTA updates with `updates.enabled: false`

### 2. **Reanimated Compatibility Issues**

**Root Cause:** Complex shared value initialization with `useMemo` can cause Android crashes.

**Solutions Applied:**
- Created `FridayWaveformSafe.tsx` with better Android compatibility
- Used `useRef` for persistent shared values instead of `useMemo`
- Simplified spring animations for Android platform
- Added Platform-specific optimizations

### 3. **Metro Bundler Configuration**

**Enhancements Made:**
- Added Android-specific transform options
- Enabled inline requires for better performance
- Added source extensions for CommonJS modules
- Configured proper asset handling

## 🚀 Quick Start Commands

### Clean Start (Recommended First)
```bash
# Windows
cd C:\Users\hharp\PAI\friday
scripts\android-debug.bat
# Select option 4 for quick fix

# Or manually:
npx expo start --clear
```

### If Issues Persist
```bash
# 1. Clear everything
rm -rf node_modules .expo
npm install

# 2. Reset Metro cache
npx expo start --clear

# 3. Start with tunnel (if network issues)
npx expo start --tunnel --clear
```

## 📱 Testing on Android

### Option 1: Expo Go (Easiest)
1. Install Expo Go from Google Play Store
2. Run: `npx expo start --clear`
3. Scan QR code with Expo Go app

### Option 2: Android Emulator
```bash
# Start Android emulator first, then:
npx expo start --android --clear
```

### Option 3: Development Build (Most Reliable)
```bash
# Install EAS CLI
npm install -g eas-cli

# Create development build
eas build --platform android --profile development --local

# Or use preview build for APK
eas build --platform android --profile preview
```

## ⚠️ Common Issues & Solutions

### Issue: "Module not found" errors
```bash
# Solution: Clear and reinstall
rm -rf node_modules
npm install
npx expo start --clear
```

### Issue: "Invariant Violation" with Reanimated
```bash
# Solution: Use the safe waveform component
# In FridayVoiceScreen.tsx, replace:
import FridayWaveform from '../components/FridayWaveform';
# With:
import FridayWaveform from '../components/FridayWaveformSafe';
```

### Issue: Network timeout errors
```bash
# Solution: Use tunnel mode
npx expo start --tunnel
```

### Issue: Build crashes immediately
```bash
# Solution: Check logs
npx react-native log-android
# Or
adb logcat *:E
```

## 📋 Configuration Checklist

### app.json
✅ `newArchEnabled: false` (CRITICAL for Expo Go)
✅ `jsEngine: "hermes"`
✅ `updates.enabled: false`
✅ Android permissions include RECORD_AUDIO and INTERNET
✅ `assetBundlePatterns: ["**/*"]`

### babel.config.js
✅ `react-native-reanimated/plugin` is LAST in plugins array

### metro.config.js
✅ `inlineRequires: true` for Android optimization
✅ `resetCache: true` for debugging
✅ Proper asset extensions configured

### package.json
✅ All dependencies compatible with Expo SDK 51
✅ React Native 0.74.5
✅ Reanimated 3.10.1

## 🔍 Diagnostic Commands

```bash
# Check Expo diagnostics
npx expo doctor

# Check React Native info
npx react-native info

# Check for duplicate packages
npm ls react-native

# Verify Reanimated setup
npm list react-native-reanimated
```

## 🎯 Recommended Expo Configuration

For most reliable Android development with Expo SDK 51:

```json
{
  "expo": {
    "newArchEnabled": false,
    "jsEngine": "hermes",
    "updates": {
      "enabled": false,
      "fallbackToCacheTimeout": 0
    },
    "android": {
      "jsEngine": "hermes",
      "allowBackup": false,
      "softwareKeyboardLayoutMode": "pan"
    }
  }
}
```

## 💡 Performance Tips

1. **Use FridayWaveformSafe.tsx** instead of FridayWaveform.tsx on Android
2. **Clear cache regularly** during development
3. **Use development builds** instead of Expo Go for production-like testing
4. **Monitor memory usage** with `adb shell dumpsys meminfo com.friday.voice`
5. **Profile performance** with React DevTools

## 🆘 Still Having Issues?

1. **Create a minimal reproducible example**
2. **Check Expo forums** for similar issues
3. **File an issue** with complete logs:
   - `npx expo doctor` output
   - `adb logcat` output
   - Complete error messages

## 📚 Resources

- [Expo SDK 51 Documentation](https://docs.expo.dev/)
- [React Native Reanimated Docs](https://docs.swmansion.com/react-native-reanimated/)
- [Android Debugging Guide](https://reactnative.dev/docs/debugging)
- [Expo Troubleshooting](https://docs.expo.dev/troubleshooting/overview/)

---

**Last Updated:** November 29, 2024
**Expo SDK:** 51.0.0
**React Native:** 0.74.5
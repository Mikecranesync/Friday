# Friday Voice Assistant - EAS Build & Debug Guide

## 🚀 QUICK START - Build & Install

### **Option 1: Development Build (RECOMMENDED)**
This creates a debug APK with development tools and error visibility.

```bash
# Clean previous builds
cd C:\Users\hharp\pai\friday
rm -rf .expo android/app/build

# Build development APK with EAS
eas build --profile development --platform android --local

# Or build on EAS servers (faster if you have credits)
eas build --profile development --platform android
```

### **Option 2: Preview Build**
Now configured with development client for testing.

```bash
eas build --profile preview --platform android
```

---

## 📱 INSTALL ON DEVICE

### **After Build Completes:**

1. **Download the APK** from EAS dashboard or find locally:
   - EAS Cloud: Check email or `eas build:list`
   - Local build: Check `android/app/build/outputs/apk/`

2. **Install on Android Device:**
   ```bash
   # Via ADB (device connected via USB)
   adb install path/to/friday.apk

   # Or transfer APK to device and tap to install
   # Enable "Install from Unknown Sources" if prompted
   ```

3. **Grant Permissions:**
   - Open Friday app
   - Allow RECORD_AUDIO permission
   - Allow INTERNET permission

---

## 🐛 DEBUG CRASHES

### **Step 1: Get Crash Logs**

```bash
# Connect device via USB and enable USB debugging
# Then run:
adb logcat | grep -i "friday\|react\|expo\|error"

# Or for full logs:
adb logcat > friday_logs.txt

# Filter for errors only:
adb logcat *:E > friday_errors.txt
```

### **Step 2: Common Crash Causes**

#### **A. RevenueCat Initialization Error**
**Symptom:** App crashes on startup with no UI

**Solution:** Already fixed with graceful error handling, but verify:
```bash
# Check if RevenueCat API key is valid
grep "REVENUECAT_API_KEY" src/contexts/SubscriptionContext.tsx
```

#### **B. Missing Expo Dev Client**
**Symptom:** White screen or "Couldn't load project" error

**Solution:**
- Use `development` or `preview` profile (both now have `developmentClient: true`)
- Install expo-dev-client is already in package.json (v4.0.0)

#### **C. .env File Issues**
**Symptom:** App crashes when using Gemini AI

**Solution:**
```bash
# Verify .env exists and has GEMINI_API_KEY
cat .env

# Should contain:
# GEMINI_API_KEY=your_key_here
```

#### **D. Native Module Errors**
**Symptom:** "Unable to resolve module" or "Native module cannot be null"

**Solution:**
```bash
# Rebuild native modules
cd android
./gradlew clean
cd ..
rm -rf node_modules
npm install
eas build --profile development --platform android --local
```

---

## 🔍 VERIFY BUILD CONFIGURATION

### **Check Current Config:**

```bash
# View EAS build profiles
cat eas.json

# Verify expo-dev-client is installed
npm list expo-dev-client

# Check app.json permissions
cat app.json | grep -A 5 "permissions"
```

### **Expected Configuration:**

✅ `eas.json` - development profile:
```json
{
  "developmentClient": true,
  "distribution": "internal",
  "android": {
    "buildType": "apk"
  }
}
```

✅ `package.json` - dependencies:
```json
{
  "expo-dev-client": "~4.0.0",
  "react-native-purchases": "^9.6.8"
}
```

✅ `app.json` - permissions:
```json
{
  "android": {
    "permissions": [
      "RECORD_AUDIO",
      "INTERNET"
    ]
  }
}
```

---

## 🧪 TEST SPECIFIC FEATURES

### **Test 1: Basic App Launch**
```bash
# Start Metro bundler
npx expo start --dev-client

# Launch app on device
# App should show login screen
```

### **Test 2: Authentication Flow**
1. Tap "Continue as Guest"
2. Should reach voice screen
3. Check logs for "Guest mode activated"

### **Test 3: Voice Recording**
1. Login as guest
2. Tap microphone button
3. Grant RECORD_AUDIO permission
4. Speak command
5. Check logs for "Recording started"

### **Test 4: RevenueCat (Optional)**
1. Create real account
2. Check if subscription loads
3. Logs should show "RevenueCat initialized"

---

## 📊 MONITOR REAL-TIME LOGS

### **During App Usage:**

```bash
# Terminal 1: Metro bundler
cd C:\Users\hharp\pai\friday
npx expo start --dev-client

# Terminal 2: Android logs
adb logcat | grep "ReactNativeJS\|Friday\|ERROR"

# Terminal 3: Build commands (if needed)
```

---

## 🛠️ TROUBLESHOOTING CHECKLIST

- [ ] Built with `development` or `preview` profile (both have dev client)
- [ ] APK installed successfully (check `adb install` output)
- [ ] Permissions granted (RECORD_AUDIO, INTERNET)
- [ ] .env file exists with GEMINI_API_KEY
- [ ] Device has USB debugging enabled
- [ ] Metro bundler is running (for dev builds)
- [ ] ADB can see device (`adb devices`)
- [ ] No conflicting Friday apps installed (uninstall old versions)

---

## 🚨 EMERGENCY FIXES

### **App Won't Install:**
```bash
# Uninstall old version first
adb uninstall com.friday.voiceassistant

# Reinstall
adb install -r path/to/friday.apk
```

### **Immediate Crash on Launch:**
```bash
# Get crash stack trace
adb logcat -d > crash_log.txt

# Look for:
# - "FATAL EXCEPTION"
# - "ReactNativeJS:"
# - Stack traces with file:line numbers
```

### **White Screen / No Response:**
```bash
# Check if Metro is connected (dev builds only)
npx expo start --dev-client

# Shake device to open dev menu
# Or run: adb shell input keyevent 82
```

---

## 📋 RECENT FIXES APPLIED

✅ **Added `developmentClient: true` to preview profile** - Ensures expo-dev-client loads
✅ **Added ErrorBoundary component** - Catches and displays startup crashes
✅ **Made RevenueCat initialization resilient** - Won't crash if API fails
✅ **Changed preview to NODE_ENV=development** - Better debugging

---

## 🎯 NEXT STEPS AFTER SUCCESSFUL BUILD

1. Test guest login flow
2. Test voice recording permissions
3. Test Gemini AI integration (requires .env)
4. Test RevenueCat subscription flow (optional)
5. Monitor crash reports and fix issues

---

**Last Updated:** 2025-11-30
**Build Profiles:** development (recommended), preview (also works)
**Platform Tested:** Android (physical device required for voice)

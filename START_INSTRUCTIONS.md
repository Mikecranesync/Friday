# 🚀 Friday Voice Assistant - Start Instructions

**Updated:** November 30, 2025

---

## 📱 Quick Start

### **Option 1: Android Device/Emulator**

```bash
# 1. Navigate to Friday project
cd C:\Users\hharp\pai\friday

# 2. Start Expo (clears cache)
npm run android:clear

# OR without cache clear:
npm run android
```

### **Option 2: iOS Simulator**

```bash
cd C:\Users\hharp\pai\friday
npm run ios
```

### **Option 3: Expo Go (Development)**

```bash
cd C:\Users\hharp\pai\friday
npm start
# Then scan QR code with Expo Go app
```

---

## 🖥️ Backend Server (Required for Full Features)

Friday needs **two backend servers** running:

### **Server 1: TTS Service (Port 3001)**

```bash
# In new terminal
cd C:\Users\hharp\pai\friday\backend
npm run dev
```

**What it does:** Google Cloud Text-to-Speech

### **Server 2: Agent Service (Port 3002)**

```bash
# In another new terminal
cd C:\Users\hharp\pai\friday\backend
PORT=3002 npm run dev
```

**What it does:** Multi-agent AI orchestration (PersonalAssistant, Communication, Knowledge)

---

## 🔍 Troubleshooting OAuth Signin

The OAuth signin was fixed with these changes:

### **What Was Fixed:**

1. ✅ **Added explicit scopes**: `['profile', 'email']`
2. ✅ **Direct response handling**: Uses promptAsync result instead of waiting for useEffect
3. ✅ **Added iOS client ID**: `iosClientId` parameter
4. ✅ **Loading state**: Button shows spinner while signing in
5. ✅ **Proxy enabled**: `useProxy: true` for Expo auth proxy

### **Watch Console Logs:**

When you tap "Sign in with Google", you should see:

```
🔵 SignIn button pressed
Request object: [Object object]
🚀 Calling promptAsync...
[Browser opens to Google consent]
📥 PromptAsync result: { type: 'success', ... }
✅ Direct OAuth Success!
✅ Direct access token received, fetching user info...
```

### **If Button Still Doesn't Work:**

#### **Check 1: Request Object Ready**
```bash
# Look for this in console on app start:
OAuth redirect URI: friday://auth
Web Client ID: 948651982454-mqqfrut...
Android Client ID: 948651982454-4gi6aqu...
```

If client IDs show "undefined", check environment variables.

#### **Check 2: Google Cloud Console Settings**

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. **Authorized redirect URIs** must include:
   ```
   https://auth.expo.io/@mikecranesync/friday
   ```
4. For Android client, verify:
   - **Package name:** `com.friday.voiceassistant`
   - **SHA-1 certificate fingerprint:** (if using release build)

#### **Check 3: Clear App Data**

```bash
# Android
adb shell pm clear com.friday.voiceassistant

# Then restart app
npm run android:clear
```

---

## 📊 Expected Behavior

### **1. App Launch**
- Shows login screen with "Sign in with Google" button
- "Continue as Guest" option available

### **2. Tap Sign In**
- Button shows loading spinner
- Browser opens to Google consent screen
- Select Google account
- Grant permissions
- Browser closes, returns to app

### **3. After Successful Login**
- App navigates to VoiceScreen
- Shows user avatar/name in header
- "Tap to speak" appears

### **4. Voice Interaction**
- Tap waveform to start recording
- Speak your message
- Tap again to stop
- App transcribes → sends to AI → speaks response

---

## 🎯 Testing Checklist

Before reporting issues, verify:

- [ ] Both backend servers running (ports 3001, 3002)
- [ ] Android device/emulator connected: `adb devices`
- [ ] Console shows client IDs on app start
- [ ] No errors in Metro bundler
- [ ] Internet connection active
- [ ] Google Cloud Console redirect URI configured
- [ ] App cleared/reinstalled if testing OAuth changes

---

## 🔧 Common Commands

```bash
# Clear Metro cache and rebuild
npm run android:clear

# View logs
npm run debug:logs

# Type check
npm run type-check

# Lint code
npm run lint

# Format code
npm run format

# Full validation
npm run validate

# Clean reinstall
npm run clean
```

---

## 🐛 Common Issues

### **Issue: "OAuth request not ready yet"**
**Fix:** Wait 2-3 seconds after app loads, or restart app

### **Issue: "Backend not reachable"**
**Fix:** Start backend servers on ports 3001 and 3002

### **Issue: "Recording failed"**
**Fix:** Grant microphone permission in device settings

### **Issue: "Transcription failed"**
**Fix:** Check Gemini API key in AIService.ts

### **Issue: Browser doesn't open**
**Fix:** Check Chrome/browser installed on device

---

## 📱 Platform-Specific Notes

### **Android Emulator**
- Backend URL: `http://10.0.2.2:3001` (maps to host localhost)
- May need to enable virtualization in BIOS
- Google Play services required for OAuth

### **Physical Android Device**
- Backend URL: `http://YOUR_COMPUTER_IP:3001`
- Update `EXPO_PUBLIC_BACKEND_URL` in .env
- Must be on same WiFi network as development machine

### **iOS Simulator**
- Backend URL: `http://localhost:3001`
- Requires Xcode installed
- May need to accept certificate in simulator

---

## 🎬 Full Start Sequence

```bash
# Terminal 1: TTS Backend
cd C:\Users\hharp\pai\friday\backend
npm run dev

# Terminal 2: Agent Backend
cd C:\Users\hharp\pai\friday\backend
PORT=3002 npm run dev

# Terminal 3: Mobile App
cd C:\Users\hharp\pai\friday
npm run android:clear
```

**Expected Output:**

Terminal 1:
```
Friday Backend Server Started
Port: 3001
TTS: Google Cloud Text-to-Speech
```

Terminal 2:
```
Friday Backend Server Started
Port: 3002
Agents: Orchestrator, PersonalAssistant, Communication, Knowledge
```

Terminal 3:
```
› Metro waiting on exp://192.168.x.x:8081
› Opening on Android...
```

---

## 📞 Need Help?

1. Check console logs for emoji indicators (🔵 ✅ ❌ ⚠️)
2. Review `OAUTH_DEBUG_GUIDE.md` for detailed troubleshooting
3. Ensure redirect URI in Google Console matches exactly
4. Try "Continue as Guest" to test app without OAuth

---

## ✅ Success Indicators

**OAuth Working:**
- ✅ Button responds with spinner
- ✅ Browser opens to Google
- ✅ Can select Google account
- ✅ Returns to app after consent
- ✅ User info appears in header

**Full App Working:**
- ✅ Voice recording works (waveform animates)
- ✅ Transcription appears after speaking
- ✅ AI responds with text
- ✅ Response is spoken aloud
- ✅ Backend TTS sounds natural (vs robotic device TTS)

Happy testing! 🎉

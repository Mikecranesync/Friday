# 📱 Friday - Physical Device Setup Guide

**Updated:** November 30, 2025
**Your Computer IP:** 192.168.4.71

---

## ✅ Changes Made for Physical Device Testing

Both backend services now point to your computer's local IP address instead of emulator address:

**Before (Emulator):**
- `http://10.0.2.2:8888` (special emulator address)

**After (Physical Device):**
- `http://192.168.4.71:8888` (your computer on network)

---

## 🚀 How to Test on Your Physical Phone

### **Step 1: Connect Phone to Same WiFi**

Make sure your phone is on the **same WiFi network** as your computer (192.168.4.x subnet).

---

### **Step 2: Start Backend Server**

```powershell
cd C:\Users\hharp\pai\friday\backend
npm run dev
```

You should see:
```
╔═══════════════════════════════════════════════════╗
║          Friday Backend Server Started            ║
║  Port: 8888                                       ║
╚═══════════════════════════════════════════════════╝
```

---

### **Step 3: Start Expo (Without --android flag)**

```powershell
cd C:\Users\hharp\pai\friday
npm start
```

**NOT** `npm run android` (that auto-opens emulator)

---

### **Step 4: Scan QR Code on Phone**

**Option A: Expo Go App (Easiest)**

1. Install **Expo Go** from Play Store/App Store
2. Open Expo Go
3. Scan the QR code from terminal
4. App loads on your phone

**Option B: Development Build (Current Setup)**

Your app uses `expo-dev-client`, so you need a development build:

1. Build development APK (one-time):
   ```powershell
   npx eas build --profile development --platform android
   ```

2. Download and install APK on your phone

3. Open the app and connect to Metro:
   ```
   192.168.4.71:8081
   ```

---

### **Step 5: Test Backend Connection**

When app loads, open LogCat or console and look for:

```
✅ Backend TTS connected at http://192.168.4.71:8888
```

If you see:
```
❌ Backend TTS not reachable
```

Then check:
1. Phone and computer on same WiFi
2. Backend server running
3. Firewall not blocking port 8888

---

## 🔥 Windows Firewall Fix

If backend not reachable from phone:

### **Allow Node.js through firewall:**

```powershell
# Run as Administrator
New-NetFirewallRule -DisplayName "Node.js Backend" -Direction Inbound -Program "C:\Program Files\nodejs\node.exe" -Action Allow
```

Or manually:
1. Windows Defender Firewall → Advanced Settings
2. Inbound Rules → New Rule
3. Program → Browse to `node.exe`
4. Allow the connection
5. Name: "Node.js Backend"

---

## 🔄 Switch Back to Emulator

If you want to test on emulator later:

### **Edit both service files:**

**`src/services/AIService.ts`** (line 48):
```typescript
private BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://10.0.2.2:8888';
```

**`src/services/VoiceService.ts`** (line 9):
```typescript
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://10.0.2.2:8888';
```

Then:
```powershell
npm run android
```

---

## 🎯 Best Practice: Use Environment Variable

Instead of hardcoding IPs, create `.env` file:

**`friday/.env`**
```env
EXPO_PUBLIC_BACKEND_URL=http://192.168.4.71:8888
```

Then you can switch easily:
- **Physical device:** `http://192.168.4.71:8888`
- **Emulator:** `http://10.0.2.2:8888`

**Note:** Restart Expo after changing .env file:
```powershell
npm start -- --clear
```

---

## 📱 Alternative: USB Debugging

If WiFi doesn't work, use ADB reverse proxy:

### **Step 1: Connect phone via USB**

Enable **Developer Options** and **USB Debugging** on phone.

### **Step 2: Setup ADB reverse**

```powershell
# Forward port from phone to computer
adb reverse tcp:8888 tcp:8888
adb reverse tcp:8081 tcp:8081
```

### **Step 3: Use localhost in code**

```typescript
// Both services can use localhost now
const BACKEND_URL = 'http://localhost:8888';
```

### **Step 4: Start app**

```powershell
npm run android
```

App will run on connected phone (not emulator).

---

## 🧪 Test Backend from Phone Browser

Quick test to verify connectivity:

1. Open browser on your phone
2. Go to: `http://192.168.4.71:8888/api/health`

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-30T..."
}
```

If this works, backend is reachable from phone.

---

## 📊 Current Configuration Summary

| Component | URL | Notes |
|-----------|-----|-------|
| **Backend (TTS + Agent)** | http://192.168.4.71:8888 | Running on your PC |
| **Metro Bundler** | http://192.168.4.71:8081 | Expo dev server |
| **Phone WiFi** | Must be on 192.168.4.x | Same subnet |

---

## 🎬 Full Start Sequence (Physical Phone)

```powershell
# Terminal 1: Backend
cd C:\Users\hharp\pai\friday\backend
npm run dev

# Terminal 2: Expo (wait for backend to start)
cd C:\Users\hharp\pai\friday
npm start

# On Phone: Scan QR code with Expo Go
# (or use development build)
```

---

## 🐛 Troubleshooting

### **"Could not connect to Metro"**
- Ensure phone and PC on same WiFi
- Check Metro is running: `http://192.168.4.71:8081`
- Restart Expo: `npm start -- --clear`

### **"Backend TTS not reachable"**
- Check backend running: `http://localhost:8888/api/health`
- Check firewall rules
- Test from phone browser first

### **"QR code not scanning"**
- Enter URL manually in Expo Go: `exp://192.168.4.71:8081`
- Or use tunnel mode: `npm start -- --tunnel`

### **"App crashes on launch"**
- Clear app data on phone
- Reinstall app
- Check console for errors
- Verify API keys not expired

---

## 💡 Pro Tips

**1. Keep Metro Running**
- Don't close Metro terminal while testing
- Changes hot-reload automatically

**2. Monitor Logs**
- Phone logs: Shake phone → "Debug Remote JS"
- Or use LogCat: `adb logcat | findstr "Friday"`

**3. Network Speed**
- Same WiFi = faster than tunnel
- USB debugging = fastest

**4. Battery Saver**
- Disable battery optimization for Expo Go
- Keeps connection alive

**5. Use Development Build**
- Full native features
- Faster than Expo Go
- Required for OAuth to work properly

---

## 📝 Quick Reference

**Check Computer IP:**
```powershell
ipconfig | findstr "IPv4"
```

**Check Phone Connected:**
```powershell
adb devices
```

**Start Everything:**
```powershell
# Backend
cd C:\Users\hharp\pai\friday\backend && npm run dev

# App (new terminal)
cd C:\Users\hharp\pai\friday && npm start
```

**Stop Everything:**
```powershell
# Ctrl+C in both terminals
# Or kill all Node:
Stop-Process -Name "node" -Force
```

---

**Current Status:** ✅ Configured for physical device on 192.168.4.71
**To switch to emulator:** Change URLs to `http://10.0.2.2:8888`

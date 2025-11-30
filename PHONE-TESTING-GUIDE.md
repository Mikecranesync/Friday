# Testing Friday on Your Phone - Quick Start Guide

## Prerequisites

✅ Backend running on port 3002 (already running!)
✅ Phone and computer on the same WiFi network
✅ Expo Go app installed on your phone ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) | [iOS](https://apps.apple.com/app/expo-go/id982107779))

## Step 1: Update Backend URL in .env

Your phone needs to connect to your computer's IP address instead of localhost.

**Find your computer's IP:**
```powershell
ipconfig | Select-String "IPv4"
```

Look for something like `192.168.1.XXX`

**Update `friday/.env`:**
```env
# Replace with your computer's actual IP
EXPO_PUBLIC_BACKEND_URL=http://192.168.1.XXX:3002
```

## Step 2: Start the Friday App

```bash
cd c:\Users\hharp\PAI\friday
npm start
```

This will show a QR code in the terminal.

## Step 3: Connect from Your Phone

**Android:**
1. Open **Expo Go** app
2. Tap **Scan QR code**
3. Scan the QR code from your terminal
4. Wait for the app to load

**iOS:**
1. Open **Camera** app
2. Point at the QR code
3. Tap the notification to open in Expo Go
4. Wait for the app to load

## Step 4: Test the Voice Assistant

1. **Tap the waveform** to start recording
2. **Speak**: "Hello Friday, how are you?"
3. **Tap again** to stop recording
4. Watch Friday transcribe and respond!

## Step 5: Test OAuth (Optional)

To test Google Calendar/Gmail integration:

1. **Tap a button** (if you have one) to trigger OAuth
2. Or modify the code to add an OAuth test button
3. You'll be redirected to Google login
4. Grant permissions
5. You'll be redirected back to the app

## Troubleshooting

### "Unable to connect to backend"

**Check backend URL in `.env`:**
- Should be `http://192.168.1.XXX:3002` (your computer's IP)
- NOT `http://localhost:3002`
- NOT `http://10.0.2.2:3002` (that's for Android emulator)

**Verify backend is running:**
```bash
# On your computer
curl http://localhost:3002/api/health
```

**Check firewall:**
- Windows Defender may block port 3002
- Temporarily disable or add exception for Node.js

### "No response from microphone"

- Grant microphone permissions when prompted
- Check phone settings → Apps → Expo Go → Permissions

### "Expo Go won't scan QR code"

**Manual connection:**
1. In Expo Go, tap **"Enter URL manually"**
2. Type: `exp://192.168.1.XXX:8081` (use your IP)
3. Tap **Connect**

### Backend URL Configuration

Your backend is running on **port 3002**, so make sure `.env` files have:

**`friday/.env`:**
```env
EXPO_PUBLIC_BACKEND_URL=http://YOUR_IP:3002
```

**`friday/backend/.env`:**
```env
PORT=3002
```

## Quick Test Commands

**Check backend health from phone's network:**
```bash
# From your computer, use your IP
curl http://YOUR_IP:3002/api/health
```

**Test agent endpoint:**
```bash
curl -X POST http://YOUR_IP:3002/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello Friday"}'
```

## What You Should See

1. **Waveform animation** when idle
2. **Recording indicator** when speaking
3. **Transcription** appears after you stop
4. **Friday's response** is displayed and spoken via TTS

## Dev Tools

While the app is running, shake your phone to open the **Expo Dev Menu**:
- **Reload** - Refresh the app
- **Debug Remote JS** - Open Chrome debugger
- **Show Performance Monitor** - See FPS/memory

---

**Ready?** Let's start!

```bash
cd c:\Users\hharp\PAI\friday
npm start
```

Then scan the QR code with Expo Go!

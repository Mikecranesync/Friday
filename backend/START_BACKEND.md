# 🚀 Friday Backend - Windows PowerShell Start Guide

**Issue Fixed:** Port conflict and PowerShell environment variables

---

## ✅ Current Configuration

- **TTS Server Port:** 8888 (was 3001, changed to match existing server)
- **Agent Server Port:** 3002 (not conflicting)

**Note:** Port 8888 was already in use by an existing backend instance. We killed it and will reuse this port.

---

## 🖥️ How to Start on Windows PowerShell

### **Method 1: Single TTS+Agent Server (Port 8888)**

```powershell
cd C:\Users\hharp\pai\friday\backend
npm run dev
```

This starts **one unified server** on port 8888 with:
- ✅ TTS endpoints (`/api/tts`)
- ✅ Agent endpoints (`/api/agent`)
- ✅ Health check (`/api/health`)

---

### **Method 2: Separate Servers (TTS + Agent)**

If you need them on separate ports:

#### **Terminal 1: TTS Server (Port 8888)**
```powershell
cd C:\Users\hharp\pai\friday\backend
npm run dev
```

#### **Terminal 2: Agent Server (Port 3002)**
```powershell
cd C:\Users\hharp\pai\friday\backend
$env:PORT="3002"
npm run dev
```

**PowerShell Note:** Use `$env:PORT="3002"` instead of `PORT=3002`

---

## 🔧 Setting Environment Variables in PowerShell

### **Wrong (Linux/Mac syntax):**
```powershell
PORT=3002 npm run dev  # ❌ Doesn't work in PowerShell
```

### **Right (PowerShell syntax):**

**Option A: Single command**
```powershell
$env:PORT="3002"; npm run dev
```

**Option B: Separate lines**
```powershell
$env:PORT="3002"
npm run dev
```

**Option C: Inline (one-liner)**
```powershell
cmd /c "set PORT=3002 && npm run dev"
```

---

## 🐛 Troubleshooting

### **Issue: "Address already in use ::: 8888"**

**Cause:** Another process is using port 8888

**Fix:**

**1. Find the process:**
```powershell
netstat -ano | findstr ":8888"
```

Output shows PID (last column):
```
TCP    0.0.0.0:8888    LISTENING    27024
```

**2. Kill the process:**
```powershell
Stop-Process -Id 27024 -Force
```

**3. Restart backend:**
```powershell
npm run dev
```

---

### **Issue: "GOOGLE_APPLICATION_CREDENTIALS not found"**

**Fix:** Place `google-credentials.json` in backend folder:
```
C:\Users\hharp\pai\friday\backend\google-credentials.json
```

Or set environment variable:
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\google-credentials.json"
```

---

## 📱 Update Mobile App Backend URLs

After starting backend, update mobile app to point to correct ports:

### **If using Port 8888 (unified server):**

Edit `friday/src/services/AIService.ts`:
```typescript
private BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://10.0.2.2:8888';
```

Edit `friday/src/services/VoiceService.ts`:
```typescript
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://10.0.2.2:8888';
```

### **If using separate ports (8888 + 3002):**

AIService (Agent):
```typescript
private BACKEND_URL = 'http://10.0.2.2:3002';
```

VoiceService (TTS):
```typescript
const BACKEND_URL = 'http://10.0.2.2:8888';
```

---

## ✅ Verify Backend Running

**1. Check console output:**
```
╔═══════════════════════════════════════════════════╗
║          Friday Backend Server Started            ║
╠═══════════════════════════════════════════════════╣
║  Port: 8888                                       ║
║  Mode: development                                ║
║  TTS:  Google Cloud Text-to-Speech                ║
╚═══════════════════════════════════════════════════╝
```

**2. Test health endpoint:**
```powershell
curl http://localhost:8888/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-30T..."
}
```

**3. Test TTS endpoint:**
```powershell
curl -X POST http://localhost:8888/api/tts/base64 `
  -H "Content-Type: application/json" `
  -d '{"text":"Hello Friday","voice":"en-US-Neural2-F"}'
```

---

## 🎯 Full Start Sequence (PowerShell)

```powershell
# 1. Kill any existing backend
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue

# 2. Start backend (unified server on port 8888)
cd C:\Users\hharp\pai\friday\backend
npm run dev

# 3. In NEW PowerShell terminal - Start mobile app
cd C:\Users\hharp\pai\friday
npm run android:clear
```

---

## 🔍 Quick Commands

```powershell
# Check what's running on port 8888
netstat -ano | findstr ":8888"

# Kill all Node processes
Stop-Process -Name "node" -Force

# Check Node processes
Get-Process node

# Restart backend with different port
$env:PORT="3002"; npm run dev

# View backend logs with timestamps
npm run dev 2>&1 | ForEach-Object { "$(Get-Date -Format 'HH:mm:ss') $_" }
```

---

## 📊 Port Reference

| Service | Port | URL (Android Emulator) |
|---------|------|------------------------|
| TTS Backend | 8888 | http://10.0.2.2:8888 |
| Agent Backend | 3002 | http://10.0.2.2:3002 |
| Metro Bundler | 8081 | http://localhost:8081 |
| Expo Dev Server | 19000 | http://localhost:19000 |

---

## 🎬 Expected Flow

1. **Start backend** → See "Server Started" banner
2. **Start mobile app** → See Metro bundler
3. **App loads** → See "OAuth redirect URI" in logs
4. **Tap sign in** → Browser opens to Google
5. **Complete OAuth** → Return to app
6. **Tap waveform** → Record voice
7. **Stop recording** → Transcription → AI response → TTS speaks

---

## 💡 Pro Tips

- Use **Windows Terminal** for better experience (supports colors, tabs)
- Keep backend running in background terminal
- Use `npm run dev` (auto-restarts on file changes)
- Check `.env` file for configuration
- Backend must be running before starting mobile app for full features

---

**Updated:** November 30, 2025
**Port Changed:** 3001 → 8888 (to match existing server)

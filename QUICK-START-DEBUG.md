# 🚀 Quick Start - Debug Friday Mobile Crash

## 60-Second Start

### Step 1: Clear and Restart (30 seconds)
```bash
cd C:\Users\hharp\PAI\friday
expo start --clear
```

### Step 2: Connect Expo Go (30 seconds)
1. Open Expo Go app on your phone
2. Scan QR code from terminal
3. Watch console output

## What to Look For

### ✅ **If App Loads Successfully**
Console shows:
```
========================================
🚀 FRIDAY VOICE ASSISTANT STARTING
========================================
✅ Platform Information logged
✅ App.debug imported successfully
✅ Root component registered
🎉 Friday startup sequence complete!
```

**Next**: Tap 🐛 button (bottom-right) to open debug console

---

### ❌ **If App Crashes**
Console shows exactly WHERE it crashed:
```
✅ Platform Information logged
✅ App.debug imported successfully
❌ App import FAILED: [ERROR MESSAGE HERE]
```

**The crash location tells you what to fix!**

---

## 🐛 Debug Overlay Usage

Once app loads:

1. **Tap floating 🐛 button** (bottom-right corner)
2. **View**:
   - Environment info (versions, platform)
   - Service status (is API key present?)
   - Live logs (auto-refreshing every second)
3. **Use controls**:
   - ⏸️ **Pause** - Stop auto-refresh to read logs
   - 🧹 **Clear** - Clear all logs
   - 📤 **Export** - Share logs via message/email

---

## 🧪 Test with Minimal App

If debugging gets complex, test with ultra-minimal app:

**Edit `index.ts` line 62**:
```typescript
// Change:
const AppModule = require('./App.debug');

// To:
const AppModule = require('./debug-startup-test');
```

**Then restart**:
```bash
expo start --clear
```

**Expected**: "Friday is alive!" screen
- ✅ **Works** → Expo Go connection fine, issue is in your app code
- ❌ **Fails** → Expo/React Native setup issue

---

## 📊 Log Levels in Console

| Icon | Level | Meaning |
|------|-------|---------|
| 🚀 | STARTUP | App initialization |
| 📘 | INFO | Normal operation |
| ⚠️ | WARN | Warning (non-critical) |
| ❌ | ERROR | Error/crash |
| 🔍 | DEBUG | Detailed info |

---

## 🎯 Most Common Issues

### Issue: "Cannot find module 'expo-constants'"
**Fix**:
```bash
npm install
expo start --clear
```

### Issue: "Gemini API key missing"
**Not a crash** - app should still load and show this in debug overlay

### Issue: Imports fail on mobile but work on web
**Check**:
- Native modules (might need expo-dev-client instead of Expo Go)
- Platform-specific code

---

## 📱 Where to Find Logs

### On Computer (Metro Bundler)
All logs appear in the terminal where you ran `expo start`

### On Phone (If visible)
- **iOS**: Shake device → "Show Dev Menu" → "Debug"
- **Android**: Shake device → "Dev Settings" → "Debug"

### In App (If loads)
Tap 🐛 button → See last 20 logs in real-time

---

## 🔍 Quick Checklist

When debugging mobile crash:

- [ ] Console shows startup banner?
- [ ] Which step failed? (check ✅/❌ in logs)
- [ ] Error message clear?
- [ ] Tried `expo start --clear`?
- [ ] Tried minimal test app?
- [ ] Checked debug overlay (if app loads)?

---

## 📖 Need More Details?

See `DEBUG-GUIDE.md` for comprehensive documentation including:
- Detailed file descriptions
- Advanced debugging techniques
- Performance profiling
- Platform-specific notes
- Common crash scenarios

---

**Files Created**:
- ✅ `src/utils/debugLogger.ts` - Logging utility
- ✅ `src/components/DebugOverlay.tsx` - Debug UI overlay
- ✅ `App.debug.tsx` - Error boundary wrapper
- ✅ `debug-startup-test.tsx` - Minimal test app
- ✅ `index.ts` - Enhanced with startup logging
- ✅ `DEBUG-GUIDE.md` - Full documentation
- ✅ `QUICK-START-DEBUG.md` - This file

**Next**: Run `expo start --clear` and watch the console!

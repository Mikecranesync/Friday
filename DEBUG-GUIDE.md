# 🐛 Friday Debug Infrastructure Guide

## Overview

This debugging infrastructure helps identify and fix mobile app crashes in the Friday voice assistant. It provides comprehensive logging, error boundaries, and diagnostic tools.

## 📦 Files Created

### 1. `src/utils/debugLogger.ts`
**Centralized logging utility with:**
- Timestamped, color-coded console logs
- Multiple log levels (DEBUG, INFO, WARN, ERROR, STARTUP)
- Stack trace capture
- In-memory log storage (last 100 entries)
- Export functionality

**Usage:**
```typescript
import { logInfo, logError, logDebug, logWarn, logStartup } from '@/utils/debugLogger';

// Basic logging
logInfo('MyComponent', 'User tapped button');
logError('VoiceService', 'Failed to start recording', error);
logDebug('API', 'Request sent', { url, params });

// Create scoped logger
import { createLogger } from '@/utils/debugLogger';
const logger = createLogger('FridayVoiceScreen');
logger.info('Screen mounted');
logger.error('Processing failed', error);

// Performance logging
import { PerformanceTimer } from '@/utils/debugLogger';
const timer = new PerformanceTimer('API', 'fetchData');
// ... do work ...
timer.end(); // Logs duration

// Or with async functions
import { withPerformanceLog } from '@/utils/debugLogger';
await withPerformanceLog('DB', 'saveUser', async () => {
  // async work
});
```

### 2. `src/components/DebugOverlay.tsx`
**Floating debug panel (bottom-right corner) showing:**
- App version and Expo version
- Platform information
- Environment variables status
- Service status (API keys, etc.)
- Last 20 log entries (auto-refreshing)
- Log controls (pause, clear, export)

**Only visible in `__DEV__` mode**

**No imports needed** - automatically included in `App.debug.tsx`

### 3. `App.debug.tsx`
**Enhanced error boundary wrapper with:**
- Comprehensive startup logging
- Catches all React component errors
- User-friendly error screen
- Stack traces in dev mode
- Initialization step tracking
- Retry functionality
- Fallback UI if App.tsx fails

**Features:**
- Logs every import and initialization step
- Shows exactly where app crashes
- Displays initialization timeline
- Includes DebugOverlay component

### 4. `debug-startup-test.tsx`
**Ultra-minimal test app:**
- Only uses basic React Native components
- No complex dependencies
- Verifies Expo Go connection works
- Shows platform information

**Use to isolate issues:**
If this works but App.debug doesn't, the problem is in one of your imported modules.

### 5. `index.ts` (Modified)
**Enhanced entry point with:**
- Startup logging before any app code
- Platform and Expo version logging
- Error handling for imports
- Fallback to test app if main app fails
- Emergency minimal component as last resort

## 🚀 How to Use

### Step 1: Test the Debug Infrastructure

1. **Start with test app** (verify Expo Go works):
   ```typescript
   // In index.ts, temporarily change:
   const AppModule = require('./App.debug');
   // To:
   const AppModule = require('./debug-startup-test');
   ```

2. **Run the app**:
   ```bash
   cd C:\Users\hharp\PAI\friday
   expo start --clear
   ```

3. **Connect with Expo Go** on your mobile device

4. **Expected result**: You should see "Friday is alive!" screen
   - If this works: Expo Go connection is fine, proceed to Step 2
   - If this fails: Issue is with Expo/React Native setup, not your app code

### Step 2: Test Full App with Debug Infrastructure

1. **Switch back to App.debug** (if you changed it):
   ```typescript
   // In index.ts
   const AppModule = require('./App.debug');
   ```

2. **Run the app**:
   ```bash
   expo start --clear
   ```

3. **Check console logs** - you should see:
   ```
   ========================================
   🚀 FRIDAY VOICE ASSISTANT STARTING
   ========================================

   🚀 [timestamp] STARTUP [index] 📱 Platform Information
   🚀 [timestamp] STARTUP [index] 📦 Expo Information
   🚀 [timestamp] STARTUP [index] 🔧 Environment
   🚀 [timestamp] STARTUP [index] 📥 Importing App.debug...
   ```

4. **If app crashes**, check logs for:
   - Last successful initialization step
   - First failed step
   - Error message and stack trace

### Step 3: Use Debug Overlay

1. **Open the app** (if it loads successfully)

2. **Tap the floating 🐛 button** (bottom-right corner)

3. **Debug panel shows**:
   - Environment info (versions, platform)
   - Service status (API keys present?)
   - Live log stream (auto-refreshing)

4. **Use controls**:
   - ⏸️ Pause - Stop log auto-refresh
   - 🧹 Clear - Clear all logs
   - 📤 Export - Share logs via system share dialog

### Step 4: Add Logging to Your Components

**Add startup logging to any component:**
```typescript
import { createLogger } from '@/utils/debugLogger';

const logger = createLogger('MyComponent');

export default function MyComponent() {
  useEffect(() => {
    logger.startup('Component mounted');

    // Log async operations
    async function init() {
      try {
        logger.info('Starting initialization...');
        await someAsyncOperation();
        logger.info('Initialization complete');
      } catch (error) {
        logger.error('Initialization failed', error);
      }
    }

    init();
  }, []);

  return <View>...</View>;
}
```

**Add to existing services:**
```typescript
// In VoiceService.ts (for example)
import { createLogger } from '@/utils/debugLogger';

const logger = createLogger('VoiceService');

class VoiceService {
  async startRecording() {
    logger.info('Starting recording...');
    try {
      // ... recording logic
      logger.info('Recording started successfully');
    } catch (error) {
      logger.error('Failed to start recording', error);
      throw error;
    }
  }
}
```

## 🔍 Debugging Checklist

When app crashes on mobile:

### 1. **Check Console Logs**
Look for:
- [ ] Last successful initialization step
- [ ] First error message
- [ ] Missing dependencies or imports
- [ ] API key or configuration issues

### 2. **Identify Crash Location**
The logs will show exactly where it crashed:
```
✅ index - App.debug imported successfully
✅ App.debug - DebugErrorBoundary constructed
✅ App.debug - Importing App...
❌ App.debug - App import FAILED: Cannot find module 'XYZ'
```

### 3. **Check for Mobile-Specific Issues**
Common problems:
- [ ] Native modules not supported in Expo Go
- [ ] File system APIs that don't work on mobile
- [ ] Platform-specific code missing
- [ ] Permissions not requested

### 4. **Test Incrementally**
- [ ] Start with `debug-startup-test.tsx` (minimal)
- [ ] Add components one at a time
- [ ] Check logs after each addition
- [ ] Identify which component causes crash

### 5. **Use Debug Overlay**
- [ ] Check service status (API keys present?)
- [ ] Verify environment variables loaded
- [ ] Watch real-time logs while using app
- [ ] Export logs for offline analysis

## 📊 Log Levels

| Level | Icon | Usage | Example |
|-------|------|-------|---------|
| **STARTUP** | 🚀 | App initialization steps | `logStartup('index', 'Platform loaded')` |
| **DEBUG** | 🔍 | Detailed debugging info | `logDebug('API', 'Request params', params)` |
| **INFO** | 📘 | General information | `logInfo('User', 'Button tapped')` |
| **WARN** | ⚠️ | Warnings, non-critical issues | `logWarn('Cache', 'Cache miss')` |
| **ERROR** | ❌ | Errors, exceptions | `logError('DB', 'Save failed', error)` |

## 🎯 Common Mobile Crash Scenarios

### Scenario 1: App won't open at all
**Symptom**: White screen or immediate crash
**Check**:
1. Console logs in Metro bundler
2. Look for import errors in index.ts logs
3. Try `debug-startup-test.tsx`

### Scenario 2: App crashes on specific screen
**Symptom**: Some screens work, others crash
**Check**:
1. Debug overlay logs when navigating
2. Add logging to screen components
3. Check for missing native modules

### Scenario 3: App crashes on user interaction
**Symptom**: Tapping button or feature crashes app
**Check**:
1. Debug overlay logs (tap 🐛 before using feature)
2. Add logging to event handlers
3. Check error boundary logs

### Scenario 4: Intermittent crashes
**Symptom**: Works sometimes, crashes randomly
**Check**:
1. Export logs when crash happens
2. Look for timing/race conditions
3. Check async operation handling

## 📱 Platform-Specific Notes

### iOS
- Logs visible in: Xcode console or Metro bundler
- Shake device to open React Native dev menu
- Enable Debug overlay in app

### Android
- Logs visible in: `expo start` terminal or Android Studio Logcat
- Shake device or use `Cmd+M` / `Ctrl+M` for dev menu
- Use `npx react-native log-android` for detailed logs

### Web
- Logs in browser console (F12)
- Debug overlay appears normally
- Some mobile-specific features won't work

## 🛠️ Advanced Debugging

### Export and Analyze Logs
1. Open debug overlay (tap 🐛)
2. Tap "Export" button
3. Share logs via email/messages
4. Analyze timeline of events before crash

### Performance Profiling
```typescript
import { PerformanceTimer } from '@/utils/debugLogger';

function MyComponent() {
  const handleExpensiveOperation = async () => {
    const timer = new PerformanceTimer('MyComponent', 'expensiveOp');

    // Do expensive work
    await processLargeData();

    const duration = timer.end();
    // Automatically logs if > 1000ms
  };
}
```

### Custom Log Filters
```typescript
import { getLogHistory } from '@/utils/debugLogger';

// Get all error logs
const errorLogs = getLogHistory().filter(log => log.level === LogLevel.ERROR);

// Get logs from specific component
const componentLogs = getLogHistory().filter(log => log.context === 'VoiceService');

// Get recent logs
const recentLogs = getLogHistory().slice(-10);
```

## 🔄 Disabling Debug Infrastructure

When ready for production:

### Option 1: Keep infrastructure, it auto-disables
- Debug overlay only shows in `__DEV__` mode
- Logging can be configured with `setLogLevel()`
- Error boundary still catches errors in production

### Option 2: Switch back to original App
```typescript
// In index.ts
// Change:
const AppModule = require('./App.debug');
// Back to:
const AppModule = require('./App');
```

### Option 3: Configure log level
```typescript
// In App.tsx or App.debug.tsx
import { setLogLevel, LogLevel } from '@/utils/debugLogger';

// Only show errors and warnings in production
if (!__DEV__) {
  setLogLevel(LogLevel.WARN);
}
```

## 📞 Next Steps

1. ✅ **Run test app** - Verify Expo Go works
2. ✅ **Run App.debug** - See where it crashes
3. ✅ **Check console logs** - Find the error
4. ✅ **Use debug overlay** - Monitor in real-time
5. ✅ **Add more logging** - To narrow down issue
6. ✅ **Fix the crash** - Based on logs
7. ✅ **Test fix** - Verify it works
8. ✅ **Keep infrastructure** - For future debugging

## 🎓 Tips

- **Always check console first** - Most valuable information
- **Use debug overlay for runtime issues** - See what's happening in real-time
- **Export logs before crash** - Share with team or review later
- **Add logging incrementally** - Don't over-log, focus on problem areas
- **Keep debug infrastructure** - Helps with future issues

## 🐛 Still Crashing?

If app still crashes after using this infrastructure:

1. **Share console logs** from Metro bundler
2. **Export debug overlay logs** (if app partially loads)
3. **Note which test works**:
   - ✅ debug-startup-test.tsx works → Issue in main app
   - ❌ debug-startup-test.tsx fails → Expo/RN setup issue
4. **Check for**:
   - Missing native modules
   - API keys / environment variables
   - Platform-specific code
   - Network/permissions issues

---

**Created**: November 29, 2025
**Version**: 1.0.0
**For**: Friday Voice Assistant Mobile Debugging

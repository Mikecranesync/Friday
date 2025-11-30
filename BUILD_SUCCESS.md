# ✅ Friday Voice Assistant - Successful Build Guide

**Last Updated:** November 30, 2025
**Status:** ✅ BUILDING SUCCESSFULLY

---

## 🚀 Quick Start - Building the APK

### Prerequisites
- EAS CLI installed: `npm install -g eas-cli`
- Expo account logged in: `eas login`
- Clean dependencies: `cd friday && npm install`

### Build Command (Recommended)
```bash
cd friday
eas build --profile development --platform android --clear-cache
```

**Build Time:** ~10-15 minutes
**Output:** APK download link

---

## 📋 Build Profiles

### **Development** (Recommended for Testing)
```bash
eas build --profile development --platform android
```
- ✅ Includes dev tools
- ✅ Can connect to Metro bundler
- ✅ Hot reload support
- ✅ Debugging enabled

**After build completes:**
1. Download APK from link
2. Install on device: `adb install friday.apk`
3. Start Metro: `npx expo start --dev-client`
4. Launch app on device

### **Preview** (Standalone APK)
```bash
eas build --profile preview --platform android
```
- ✅ Standalone app (no Metro needed)
- ✅ Production-like environment
- ✅ Smaller build size
- ⚠️ No dev tools

**After build completes:**
1. Download APK from link
2. Install on device: `adb install friday.apk`
3. Launch app (runs independently)

---

## ✅ Working Configuration

### package.json (Key Dependencies)
```json
{
  "dependencies": {
    "expo": "~51.0.0",
    "expo-build-properties": "~0.12.5",
    "expo-linear-gradient": "~13.0.2",  // Must be 13.x for SDK 51
    "react-native": "0.74.5",
    "react-native-purchases": "^9.6.8",
    "@google/generative-ai": "^0.21.0"
  }
}
```

### app.json (Plugins)
```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 34,
            "targetSdkVersion": 34,
            "buildToolsVersion": "34.0.0",
            "kotlinVersion": "1.9.23"
          }
        }
      ]
    ]
  }
}
```

### eas.json (Build Profiles)
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug",
        "buildType": "apk"
      }
    },
    "preview": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

---

## 🔧 Common Issues & Fixes

### Issue 1: Gradle Build Fails
**Error:** "expo-module-gradle-plugin not found"

**Fix:**
```bash
npx expo install expo-build-properties
```

Then ensure `app.json` has expo-build-properties plugin configured.

---

### Issue 2: Version Mismatch
**Error:** "release property missing" or "SoftwareComponent error"

**Fix:**
```bash
# Check for mismatched versions
npx expo install --check

# Fix expo-linear-gradient specifically
npm install expo-linear-gradient@~13.0.2
```

---

### Issue 3: App Won't Open
**Possible causes:**
1. Missing permissions
2. RevenueCat initialization crash
3. Expo modules not configured

**Fix:**
1. Check `app.json` has plugins configured
2. Check ErrorBoundary is wrapping App.tsx
3. Get logs: `adb logcat | grep -i "friday\|react\|error"`

---

## 📱 Testing the Build

### Download & Install
```bash
# 1. Download APK from EAS build link
# 2. Install on device
adb install path/to/friday.apk

# OR drag and drop APK to device
```

### For Development Builds
```bash
# After installing, start Metro
npx expo start --dev-client

# App will connect to Metro when launched
```

### Monitor Logs
```bash
# Real-time logs
adb logcat | grep -i "friday\|react\|error"

# Save crash log
adb logcat -d > crash_log.txt
```

---

## 🎯 Successful Build Example

**Latest Successful Build:**
- **Date:** 2025-11-30
- **Build ID:** 380221ea-7aed-4e6d-a737-8671c65b3786
- **Profile:** development
- **Download:** https://expo.dev/accounts/mikecranesync/projects/friday/builds/380221ea-7aed-4e6d-a737-8671c65b3786
- **Status:** ✅ Build completed, APK ready

---

## 📦 Dependencies Checklist

Before building, verify:
- [x] `expo-build-properties` installed
- [x] `expo-linear-gradient` version is `~13.0.2`
- [x] All Expo packages use `~` for SDK 51 compatibility
- [x] `eas.json` has `developmentClient: true` in preview profile
- [x] `app.json` has expo-build-properties plugin configured

**Verify with:**
```bash
npx expo install --check
```

Should output: `Dependencies are up to date ✅`

---

## 🚨 Troubleshooting Commands

### Clear Everything & Rebuild
```bash
# Clear caches
rm -rf node_modules .expo .expo-shared
npm install

# Clear EAS cache and rebuild
eas build --profile development --platform android --clear-cache
```

### Check Build Status
```bash
# View recent builds
eas build:list --platform android

# View specific build
eas build:view [BUILD_ID]
```

### Local Testing (Before EAS)
```bash
# Type check
npm run type-check

# Lint
npm run lint

# Validate all
npm run validate
```

---

## 💡 Pro Tips

1. **Use `--clear-cache`** on first build after config changes
2. **Development builds** are faster to iterate with (Metro bundler)
3. **Preview builds** are good for final testing before production
4. **Always run `npx expo install --check`** before building
5. **Save successful build IDs** for reference

---

## 🎉 Next Steps After Successful Build

1. ✅ Download APK from EAS link
2. ✅ Install on Android device
3. ✅ Test app launches without crashing
4. ✅ Verify voice recording works
5. ✅ Test Google OAuth login
6. ✅ Test Guest mode
7. ✅ Test subscription flow (if authenticated user)
8. ✅ Collect any crash logs if issues occur

---

## 📚 Related Documentation

- **MEMORY.md** - Development history and milestones
- **CHANGES.md** - Detailed changelog
- **DEBUG.md** - Comprehensive debugging guide
- **BUILD_AND_DEBUG.md** - Build troubleshooting (created by engineer agent)

---

**Status:** ✅ **BUILDS WORKING AS OF 2025-11-30**

If builds start failing again, check:
1. Expo SDK version hasn't changed
2. Dependencies are still compatible (`npx expo install --check`)
3. Plugins are still configured in app.json
4. eas.json profiles haven't been modified

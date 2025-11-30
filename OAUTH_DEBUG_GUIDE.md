# 🔐 Google OAuth Signin Debug Guide

**Issue:** Google Sign In button not working
**Date:** November 30, 2025
**Status:** Enhanced debugging added

---

## ✅ What Was Done

### 1. **Enhanced Logging in AuthContext**

Added comprehensive debug logging to track OAuth flow:

```typescript
// Now logs:
- 🔵 When button is pressed
- 🚀 When promptAsync is called
- 📥 PromptAsync result
- ✅ OAuth success
- ❌ OAuth errors
- ⚠️  User dismissal/cancellation
```

### 2. **Request State Validation**

Added check to ensure OAuth request is ready before attempting signin:

```typescript
if (!request) {
  console.error('❌ OAuth request not ready yet');
  return;
}
```

---

## 🔍 How to Debug

### **Step 1: Check Console Logs**

Run the app and watch console output when tapping "Sign in with Google":

```bash
cd friday
npm run android  # or npm start
```

**Expected Log Sequence:**
```
1. OAuth redirect URI: friday://auth
2. Web Client ID: 948651982454-mqqfrut...
3. Android Client ID: 948651982454-4gi6aqu...
4. 🔵 SignIn button pressed
5. Request object: [Object object]
6. 🚀 Calling promptAsync...
7. [Browser opens]
8. 📥 PromptAsync result: { type: 'success', ... }
9. OAuth response: { type: 'success', ... }
10. ✅ OAuth Success!
11. ✅ Access token received, fetching user info...
```

### **Step 2: Identify the Problem**

#### **Problem A: Button doesn't respond at all**
**Symptoms:**
- No logs appear when tapping button
- Button doesn't visually respond

**Possible Causes:**
- UI rendering issue
- TouchableOpacity disabled
- Event handler not connected

**Check:**
```bash
# Search for LoginScreen issues
grep -n "onPress={signIn}" friday/src/screens/LoginScreen.tsx
```

---

#### **Problem B: "OAuth request not ready yet"**
**Symptoms:**
- Log: `❌ OAuth request not ready yet`
- Request object is null/undefined

**Possible Causes:**
- `useAuthRequest` hook not initialized
- Client IDs invalid or missing
- Redirect URI misconfigured

**Fix:**
1. Verify client IDs in Google Cloud Console
2. Check redirect URI matches: `https://auth.expo.io/@mikecranesync/friday`
3. Ensure `app.json` has correct owner: `"owner": "mikecranesync"`

---

#### **Problem C: Browser opens but returns error**
**Symptoms:**
- Browser opens
- Log: `❌ OAuth Error: [error details]`
- User returned to app without signin

**Common Errors:**

**1. `redirect_uri_mismatch`**
```
FIX: Add to Google Cloud Console OAuth 2.0 Client:
- https://auth.expo.io/@mikecranesync/friday
- friday://auth (for deep linking)
```

**2. `invalid_client`**
```
FIX: Verify client IDs match Google Cloud Console:
- Web Client ID (for iOS/Expo proxy)
- Android Client ID (for Android)
```

**3. `access_denied`**
```
User cancelled or consent screen not configured.
FIX: Enable Google+ API and configure OAuth consent screen
```

---

#### **Problem D: Browser opens and closes immediately**
**Symptoms:**
- Browser flashes open/closed
- Log: `⚠️  OAuth dismissed/cancelled by user`

**Possible Causes:**
- Deep linking not working
- App not registered with scheme `friday://`
- Expo auth proxy issue

**Fix:**
```bash
# Verify app scheme
npx expo config --type public | grep scheme

# Should show: scheme: 'friday'
```

---

#### **Problem E: Success but no access token**
**Symptoms:**
- Log: `✅ OAuth Success!`
- Log: `❌ No access token in response`

**Possible Causes:**
- Scopes not requested
- Token exchange failed

**Fix:**
Add scopes to `useAuthRequest`:
```typescript
const [request, response, promptAsync] = Google.useAuthRequest({
  clientId: WEB_CLIENT_ID,
  androidClientId: ANDROID_CLIENT_ID,
  webClientId: WEB_CLIENT_ID,
  redirectUri,
  scopes: ['profile', 'email'], // Add this
});
```

---

## 🔧 Common Fixes

### **Fix 1: Verify Google Cloud Console Setup**

1. Go to: https://console.cloud.google.com/apis/credentials
2. Select your OAuth 2.0 Client ID
3. **Authorized redirect URIs** should include:
   ```
   https://auth.expo.io/@mikecranesync/friday
   ```
4. If using Android Client ID, verify **package name**:
   ```
   com.friday.voiceassistant
   ```
5. Verify **SHA-1 fingerprint** for Android (if debug build):
   ```bash
   # Get debug keystore SHA-1
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```

### **Fix 2: Clear AsyncStorage Cache**

Sometimes old auth state causes issues:

```typescript
// Add this to LoginScreen temporarily
import AsyncStorage from '@react-native-async-storage/async-storage';

// In component:
const clearCache = async () => {
  await AsyncStorage.clear();
  console.log('Cache cleared');
};

// Add button:
<TouchableOpacity onPress={clearCache}>
  <Text>Clear Cache</Text>
</TouchableOpacity>
```

### **Fix 3: Test with Expo Go vs Development Build**

OAuth behavior differs:

**Expo Go (managed):**
- Uses Expo auth proxy automatically
- Redirect: `https://auth.expo.io/@mikecranesync/friday`

**Development Build (bare/custom):**
- May use direct deep linking
- Redirect: `friday://auth`

**Current app uses:** Development build (has `expo-dev-client`)

### **Fix 4: Verify Environment Variables**

```bash
# Check .env or app.json extra config
cat friday/.env  # If using .env
```

Should have:
```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=948651982454-mqqfrut1tarkjmfrpsjn6443si2uar3q.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=948651982454-4gi6aqu4e8ao126nppp0glk7i16234vl.apps.googleusercontent.com
```

---

## 🧪 Testing Checklist

- [ ] Console shows redirect URI on app start
- [ ] Console shows both client IDs on app start
- [ ] Tapping button logs "🔵 SignIn button pressed"
- [ ] Request object is not null
- [ ] Browser opens when button tapped
- [ ] Google consent screen appears
- [ ] After Google consent, app returns to foreground
- [ ] Console shows "✅ OAuth Success!"
- [ ] Console shows "✅ Access token received"
- [ ] User info fetched successfully
- [ ] App navigates to VoiceScreen

---

## 🐛 Current Known Issues

### **Issue: Request object may be null on first render**

**Workaround:** Add loading state
```typescript
if (isLoading || !request) {
  return <ActivityIndicator />;
}
```

### **Issue: OAuth redirect loop on Android**

**Cause:** Multiple redirect URIs configured
**Fix:** Use only one redirect URI in Google Console

### **Issue: "useAuthRequest requires Expo SDK 42+"**

**Current SDK:** 51.0.0 ✅ (No issue)

---

## 📱 Platform-Specific Notes

### **Android**
- Uses `androidClientId` from `useAuthRequest`
- Package name must match: `com.friday.voiceassistant`
- Deep link scheme: `friday://auth`
- May require SHA-1 fingerprint in Google Console

### **iOS**
- Uses `webClientId` (goes through Expo proxy)
- Bundle ID must match: `com.friday.voiceassistant`
- Deep link scheme: `friday://auth`

### **Web**
- Not currently supported in this app
- Would need different redirect URI

---

## 🆘 If Still Not Working

### **Last Resort Debugging**

1. **Enable React Native Debugger:**
   ```bash
   npm install -g react-devtools
   react-devtools
   ```

2. **Check network requests:**
   - Open Chrome DevTools Network tab
   - Filter by "googleapis.com"
   - Check OAuth token requests

3. **Test with simple OAuth flow:**
   ```typescript
   // Temporarily replace signIn with:
   const signIn = async () => {
     alert('Button works! OAuth issue is elsewhere.');
   };
   ```

4. **Try Google Sign-In Library directly:**
   ```bash
   npm install @react-native-google-signin/google-signin
   ```

5. **Check Expo forums:**
   - Search: "expo-auth-session Google OAuth not working"
   - Common thread: Redirect URI issues

---

## 📞 Need Help?

### **Check Expo Documentation**
- https://docs.expo.dev/guides/authentication/#google

### **Check Google Cloud Docs**
- https://developers.google.com/identity/protocols/oauth2

### **Common Error Codes**
- `redirect_uri_mismatch` → URI not in Google Console
- `invalid_client` → Wrong client ID
- `access_denied` → User denied or consent screen issue
- `unauthorized_client` → Client not authorized for grant type

---

## ✅ Success Criteria

OAuth is working when:
1. ✅ Button responds to tap
2. ✅ Browser opens to Google consent
3. ✅ User can select Google account
4. ✅ App returns after consent
5. ✅ Access token received
6. ✅ User info fetched
7. ✅ App navigates to VoiceScreen
8. ✅ User avatar/name displayed
9. ✅ Subsequent app opens remember user (AsyncStorage)

---

## 🎯 Next Steps

1. **Run the app** with enhanced logging
2. **Watch console** for error messages
3. **Identify** which stage fails (see Problem A-E above)
4. **Apply** corresponding fix
5. **Test** again

**Most common issue:** Redirect URI mismatch in Google Cloud Console

**Quick fix:** Ensure `https://auth.expo.io/@mikecranesync/friday` is added to authorized redirect URIs.

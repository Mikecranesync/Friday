# OAuth Implementation Guide

## Backend OAuth Endpoints

The Friday backend now has OAuth authentication implemented!

### Available Endpoints

#### 1. Initiate OAuth Flow
```
GET /api/auth/google
```
Returns the Google OAuth URL to redirect users to.

Response:
```json
{
  "authUrl": "https://accounts.google.com..."
}
```

#### 2. OAuth Callback
```
GET /api/auth/callback?code=AUTHORIZATION_CODE
```
Exchanges the authorization code for access tokens.

Response:
```json
{
  "success": true,
  "tokens": {
    "access_token": "ya29...",
    "refresh_token": "1//...",
    "expiry_date": 1234567890
  }
}
```

#### 3. Refresh Token
```
POST /api/auth/refresh
Body: { "refresh_token": "1//..." }
```
Refreshes an expired access token.

#### 4. Check Status
```
GET /api/auth/status
```
Check if user is authenticated.

## Google API Scopes Enabled

- `userinfo.profile` - User profile information
- `userinfo.email` - User email
- `calendar` - Google Calendar access
- `gmail.readonly` - Read Gmail messages
- `gmail.send` - Send emails

## Frontend Integration

### React Native (Expo)

Add to your frontend:

```typescript
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

// Get the auth URL from backend
const response = await fetch('http://10.0.2.2:3002/api/auth/google');
const { authUrl } = await response.json();

// Open the OAuth flow
const result = await WebBrowser.openAuthSessionAsync(
  authUrl,
  'friday://'
);

if (result.type === 'success') {
  // Extract the code from the URL
  const code = new URL(result.url).searchParams.get('code');
  
  // Exchange code for tokens
  const tokenResponse = await fetch(
    `http://10.0.2.2:3002/api/auth/callback?code=${code}`
  );
  const { tokens } = await tokenResponse.json();
  
  // Store tokens securely
  await SecureStore.setItemAsync('access_token', tokens.access_token);
  await SecureStore.setItemAsync('refresh_token', tokens.refresh_token);
}
```

## OAuth Credentials

- **Client ID**: `629976964482-1d117sk11mc6i6fmbel61faujsbrs40b.apps.googleusercontent.com`
- **Redirect URI**: `https://auth.expo.io/@mikecranesync/friday`

## Google API Helpers

Created helper functions for:
- **Calendar**: List events, create events
- **Gmail**: List messages, read messages, send messages

These can be used by the agents to provide real functionality!

## Next Steps

1. ✅ OAuth routes created
2. ✅ Google API helpers ready
3. ⏳ Update agents to use OAuth tokens
4. ⏳ Add token storage (database or secure storage)
5. ⏳ Implement frontend OAuth flow

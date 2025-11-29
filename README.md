# 📱 Jarvis Mobile - Expo App

AI-powered email assistant with voice control, built with Expo and React Native.

## ✨ Features

- 📬 **Inbox Management** - View and filter emails by tier (1/2/3)
- ✍️ **Draft Review** - Approve or reject AI-generated email responses
- 🎤 **Voice Commands** - Hands-free email management
- 🔊 **Text-to-Speech** - Read emails aloud
- ⚙️ **Settings** - Configure voice, notifications, and automation

## 🚀 Quick Start

### 1. Start the Development Server

```bash
cd C:/Users/hharp/pai/jarvis-unified/apps/jarvis-mobile-expo
bun start
```

Or with npm:
```bash
npm start
```

### 2. Test on Your Phone

#### Option A: Expo Go App (Easiest - Recommended)
1. Install **Expo Go** from App Store (iOS) or Play Store (Android)
2. Scan the QR code that appears in your terminal
3. App loads instantly on your phone!

#### Option B: Android Emulator
```bash
bun run android
```

#### Option C: iOS Simulator (Mac only)
```bash
bun run ios
```

## 📱 Screen Overview

### Inbox Screen
- List of emails with tier badges (Auto/Review/Urgent)
- Filter by tier (1/2/3)
- Pull-to-refresh
- Tap email to view details

### Email Detail Screen
- Full email content
- 🔊 **Read Aloud** button - TTS reads email
- Quick actions: Archive, Reply
- Tier badge showing priority

### Drafts Screen
- AI-generated draft responses
- Confidence score (e.g., 89%)
- Approve & Send or Reject buttons
- Shows tone (professional, casual, etc.)

### Voice Screen
- Quick voice commands
- Status indicator (Ready/Listening/Speaking)
- Pre-built commands:
  - "Read my emails"
  - "Read urgent emails"
  - "Archive all newsletters"
  - "Show drafts"

### Settings Screen
- Email statistics (Total, Tier 1/2/3)
- Voice commands toggle
- Push notifications toggle
- Auto-archive automation
- Sync with server button

## 🎯 Voice Features

### Text-to-Speech (Working Now!)
- Tap "Read Aloud" on any email
- Adjustable speech rate
- Stops when you tap again

### Speech-to-Text (Coming Soon)
- Wake word: "Hey Jarvis"
- Natural language commands
- Real-time voice feedback

## 🔌 Backend Integration

### Current State: Mock Data
The app currently uses **mock data** for instant testing:
- 3 sample emails (Tier 1, 2, 3)
- 1 sample draft
- All features work without backend

### Connect to Real Backend

#### Quick Start (Windows)
Use the auto-configuration launcher:
```bash
Launch-Jarvis-Expo.bat
```

This launcher will:
- ✅ Auto-detect your local IP address
- ✅ Set API_URL environment variable
- ✅ Update .env.local configuration
- ✅ Start Expo development server

#### Manual Configuration

1. **Configure Environment:**
   Create or edit `.env.local`:
   ```
   API_URL=http://192.168.1.100:3002
   ```
   Replace with your computer's local IP address.

2. **Start Tauri Backend:**
   ```bash
   cd ../jarvis-gmail/tauri-app
   bun run dev
   ```

3. **Start Expo:**
   ```bash
   npm start
   ```

4. **Reload App:**
   The app will automatically use the API_URL from your environment.

### Environment Variables

The app uses `expo-constants` to read configuration:

- `API_URL` - Backend API endpoint (default: `http://localhost:3002`)

Configuration is set via:
1. `.env.local` file (local development)
2. `Launch-Jarvis-Expo.bat` launcher (auto-configured)
3. Environment variables (CI/CD)

### Required API Endpoints

The Tauri app needs these REST endpoints:
- `GET /api/emails` - Fetch emails
- `GET /api/emails/:id` - Get single email
- `GET /api/drafts` - Fetch drafts
- `POST /api/drafts/:id/approve` - Approve draft
- `POST /api/emails/:id/archive` - Archive email

## 📦 Project Structure

```
jarvis-mobile-expo/
├── App.tsx                 # Main navigation setup
├── src/
│   ├── screens/           # All app screens
│   │   ├── InboxScreen.tsx
│   │   ├── EmailDetailScreen.tsx
│   │   ├── DraftsScreen.tsx
│   │   ├── VoiceScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/          # API and voice services
│   │   ├── api.ts         # Backend API (mock + real)
│   │   └── voice.ts       # Text-to-speech service
│   ├── hooks/             # React hooks
│   │   └── useVoiceCommands.ts
│   └── types/             # TypeScript types
│       └── email.ts
├── package.json
└── README.md
```

## 🛠️ Tech Stack

- **Framework:** Expo 54 + React Native 0.81
- **Navigation:** React Navigation 7 (Bottom Tabs + Stack)
- **Voice:** expo-speech (TTS), expo-av (audio)
- **API:** Axios for HTTP requests
- **TypeScript:** Full type safety
- **Styling:** React Native StyleSheet

## 📝 Development

### Add New Screen
1. Create in `src/screens/YourScreen.tsx`
2. Add to navigation in `App.tsx`
3. Import in `Tab.Navigator` or `Stack.Navigator`

### Add Voice Command
Edit `src/screens/VoiceScreen.tsx`:
```typescript
const voiceCommands = [
  {
    command: 'Your command',
    action: () => speak('Response text')
  },
];
```

### Modify Mock Data
Edit `src/services/api.ts`:
```typescript
private mockEmails: Email[] = [
  // Add your test emails here
];
```

## 🐛 Troubleshooting

### App won't load
- Make sure you ran `bun install` first
- Try clearing Metro bundler: Press `Shift + R` in Expo Go

### QR code won't scan
- Ensure phone and computer are on same WiFi
- Try typing the URL manually in Expo Go

### Voice not working
- Check phone volume
- Test with simple: `speak('Hello world')`
- Speech permissions may need approval

### Can't connect to backend
- Check firewall allows port 3000
- Use computer's local IP, not `localhost`
- Test backend URL in phone browser first

## 🚀 Next Steps

1. ✅ **Test on phone** - Scan QR code with Expo Go
2. ⏳ **Connect real backend** - Hook up to Tauri API
3. ⏳ **Add speech-to-text** - Voice input commands
4. ⏳ **Push notifications** - Alert on urgent emails
5. ⏳ **Offline mode** - Cache emails locally

## 📱 Build for Production

### Create APK (Android)
```bash
eas build --platform android
```

### Create IPA (iOS)
```bash
eas build --platform ios
```

### Requires:
- Expo account (free)
- `eas-cli` installed: `npm install -g eas-cli`

---

**Created:** November 2025
**Status:** ✅ Ready to test
**Next:** Scan QR code and test on your phone!

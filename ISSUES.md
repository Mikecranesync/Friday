# GitHub Issues for Friday Voice Assistant

## Issue 1: Add App Icon and Splash Screen

**Title:** Add custom app icon and splash screen

**Labels:** `enhancement`, `good first issue`

**Body:**
```
## Description
The app currently uses default Expo placeholder assets. Need custom Friday branding.

## Tasks
- [ ] Create 1024x1024 app icon (purple theme, "F" logo or waveform)
- [ ] Create adaptive icon for Android (foreground + background layers)
- [ ] Create splash screen (dark purple #0A0118 background, Friday logo)
- [ ] Update `assets/` folder with new images
- [ ] Test icon appears correctly on Android home screen

## Files to Modify
- `assets/icon.png`
- `assets/adaptive-icon.png`
- `assets/splash-icon.png`
- `app.json` (verify paths)

## Acceptance Criteria
- App icon visible on Android home screen
- Splash screen shows during app load
- Consistent purple branding (#D96BFF accent, #0A0118 background)

## Worktree Branch
```bash
git worktree add ../friday-icon feature/app-icon
cd ../friday-icon
# Make changes, commit, push, create PR
```
```

---

## Issue 2: Add Conversation History UI

**Title:** Display conversation history on screen

**Labels:** `enhancement`, `ui`

**Body:**
```
## Description
Currently only shows the last response. Need scrollable conversation history.

## Tasks
- [ ] Add state array to store conversation messages
- [ ] Create message bubble component (user = right, Friday = left)
- [ ] Add ScrollView/FlatList for conversation history
- [ ] Auto-scroll to bottom on new messages
- [ ] Style bubbles with purple theme

## Files to Modify
- `App.tsx` - Add conversation state and rendering
- (Optional) Create `src/components/MessageBubble.tsx`

## Design
- User messages: Right-aligned, darker purple background
- Friday messages: Left-aligned, lighter purple background
- Timestamps optional
- Max height ~40% of screen, scrollable

## Acceptance Criteria
- Conversation persists during session
- Clear visual distinction between user/Friday
- Smooth scrolling
- Auto-scroll on new message

## Worktree Branch
```bash
git worktree add ../friday-history feature/conversation-history
cd ../friday-history
# Make changes, commit, push, create PR
```
```

---

## Issue 3: Add Settings Screen with API Key Input

**Title:** Add settings screen for API key configuration

**Labels:** `enhancement`, `ux`

**Body:**
```
## Description
Users currently need to edit .env file manually. Add in-app settings to configure API key.

## Tasks
- [ ] Create Settings screen component
- [ ] Add gear icon button to main screen (top right)
- [ ] Add text input for Gemini API key
- [ ] Save API key to AsyncStorage
- [ ] Load API key on app start
- [ ] Add "Test Connection" button
- [ ] Show connection status (connected/error)

## Files to Create/Modify
- Create `src/screens/SettingsScreen.tsx`
- Modify `App.tsx` - Add navigation or modal
- Modify `src/services/AIService.ts` - Load key from storage

## Dependencies
Already installed: `@react-native-async-storage/async-storage`

## Acceptance Criteria
- Settings accessible from main screen
- API key saves and persists across app restarts
- Test button verifies key works
- Clear error message if key invalid

## Worktree Branch
```bash
git worktree add ../friday-settings feature/settings-screen
cd ../friday-settings
# Make changes, commit, push, create PR
```
```

---

## How to Create These Issues

### Option 1: GitHub CLI (Recommended)
```bash
cd C:\Users\hharp\PAI\friday

# Issue 1
gh issue create --title "Add custom app icon and splash screen" --body "See ISSUES.md for details" --label "enhancement,good first issue"

# Issue 2
gh issue create --title "Display conversation history on screen" --body "See ISSUES.md for details" --label "enhancement,ui"

# Issue 3
gh issue create --title "Add settings screen for API key configuration" --body "See ISSUES.md for details" --label "enhancement,ux"
```

### Option 2: GitHub Web UI
1. Go to your repo on GitHub
2. Click "Issues" tab
3. Click "New Issue"
4. Copy/paste from above

---

## Git Worktree Setup

Worktrees let agents work on separate branches simultaneously without switching.

### Initial Setup
```bash
cd C:\Users\hharp\PAI\friday

# Create worktrees for each issue
git worktree add ../friday-icon feature/app-icon
git worktree add ../friday-history feature/conversation-history  
git worktree add ../friday-settings feature/settings-screen
```

### Directory Structure After Setup
```
C:\Users\hharp\PAI\
├── friday/              # Main branch (main)
├── friday-icon/         # feature/app-icon branch
├── friday-history/      # feature/conversation-history branch
└── friday-settings/     # feature/settings-screen branch
```

### Agent Workflow
```bash
# Agent 1 works on icons
cd ../friday-icon
# make changes
git add -A
git commit -m "Add custom app icon and splash screen"
git push origin feature/app-icon
# Create PR on GitHub

# Agent 2 works on history (simultaneously)
cd ../friday-history
# make changes
git add -A
git commit -m "Add conversation history UI"
git push origin feature/conversation-history
# Create PR on GitHub
```

### Cleanup After Merge
```bash
cd C:\Users\hharp\PAI\friday
git worktree remove ../friday-icon
git branch -d feature/app-icon
```

# 🚀 Quick Installation Instructions

**Important:** Follow these steps to install the new error handling and debugging improvements.

---

## Step 1: Install Dependencies

```bash
cd C:\Users\hharp\PAI\friday
npm install
```

This will install:
- ESLint and TypeScript rules
- Prettier code formatter
- React Native linting plugins
- All required dev dependencies

---

## Step 2: Verify Installation

```bash
npm run validate
```

This runs:
1. TypeScript type checking
2. ESLint code quality checks
3. Prettier format verification

**Expected output:**
```
✓ Type checking passed
✓ Linting passed
✓ Formatting passed
```

---

## Step 3: Clear Cache and Test

```bash
npm run android:clear
```

Or if already running:
```bash
npm run start:clear
```

---

## Step 4: Configure Environment (If Not Done)

Create `.env` file in project root:

```env
EXPO_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

Get free API key: https://aistudio.google.com/apikey

---

## ✅ You're Done!

The app now has:
- ✅ Better error handling with user-friendly messages
- ✅ ErrorBoundary to prevent crashes
- ✅ ESLint for code quality
- ✅ Prettier for formatting
- ✅ Better source maps for debugging
- ✅ Comprehensive documentation (DEBUG.md)

---

## 🐛 If Something Goes Wrong

1. **Metro won't start?**
   ```bash
   npm run clean
   npm run start:clear
   ```

2. **ESLint errors?**
   ```bash
   npm run lint:fix
   npm run format
   ```

3. **TypeScript errors?**
   ```bash
   npm run type-check
   ```

4. **Still broken?**
   - Read `DEBUG.md` for troubleshooting
   - Check Metro bundler logs for errors
   - Verify all dependencies installed: `npm list`

---

## 📚 Documentation

- **DEBUG.md** - Troubleshooting guide
- **SETUP.md** - Complete setup guide
- **CHANGES.md** - What changed in this update

---

**Need Help?** Check DEBUG.md first!

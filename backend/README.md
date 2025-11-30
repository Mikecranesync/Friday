# Friday Backend - TTS Service

Node.js/Express backend for Friday Voice Assistant with Google Cloud Text-to-Speech.

## Features

- Google Cloud Text-to-Speech integration
- High-quality Neural2 voices
- Audio caching to reduce API costs
- RESTful API endpoints
- CORS support for mobile apps

## Quick Start

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Set up Google Cloud credentials

#### Option A: Service Account JSON file (recommended for development)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the **Cloud Text-to-Speech API**
4. Go to **IAM & Admin > Service Accounts**
5. Create a service account with **Text-to-Speech User** role
6. Create and download a JSON key
7. Save as `backend/google-credentials.json`

#### Option B: Application Default Credentials

```bash
gcloud auth application-default login
```

### 3. Create .env file

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
PORT=3001
NODE_ENV=development
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
TTS_VOICE_NAME=en-US-Neural2-F
```

### 4. Start the server

```bash
# Development (with hot reload)
npm run dev

# Production
npm run build
npm start
```

## API Endpoints

### Health Check
```
GET /api/health
```

### Text-to-Speech (Binary)
```
POST /api/tts
Content-Type: application/json

{
  "text": "Hello, I'm Friday!",
  "voice": "en-US-Neural2-F",  // optional
  "speakingRate": 1.0,         // optional (0.25 - 4.0)
  "pitch": 0.0                 // optional (-20.0 - 20.0)
}

Response: audio/mpeg binary
```

### Text-to-Speech (Base64)
```
POST /api/tts/base64
Content-Type: application/json

{
  "text": "Hello, I'm Friday!",
  "voice": "en-US-Neural2-F"
}

Response:
{
  "audio": "base64-encoded-audio",
  "mimeType": "audio/mpeg",
  "voice": "en-US-Neural2-F",
  "cached": false
}
```

### List Voices
```
GET /api/tts/voices?language=en-US
```

### Cache Statistics
```
GET /api/tts/stats
```

### Clear Cache
```
DELETE /api/tts/cache
```

## Available Voices

### Recommended (Neural2 - High Quality)
- `en-US-Neural2-F` - Female (default)
- `en-US-Neural2-D` - Male
- `en-US-Neural2-A` - Male
- `en-US-Neural2-C` - Female
- `en-US-Neural2-E` - Female
- `en-US-Neural2-H` - Female
- `en-US-Neural2-I` - Male
- `en-US-Neural2-J` - Male

### Studio (Highest Quality)
- `en-US-Studio-O` - Female
- `en-US-Studio-Q` - Male

## Mobile App Configuration

In your React Native app's `.env`:

```env
# For Android Emulator
EXPO_PUBLIC_BACKEND_URL=http://10.0.2.2:3001

# For Physical Device (use your computer's IP)
EXPO_PUBLIC_BACKEND_URL=http://192.168.1.100:3001

# Enable backend TTS (default: true)
EXPO_PUBLIC_USE_BACKEND_TTS=true
```

## Deployment

### Railway / Render / Fly.io

1. Set environment variables:
   - `GOOGLE_CREDENTIALS_BASE64` - Base64 encoded service account JSON
   - `PORT` - Usually auto-set by platform

2. Deploy:
```bash
npm run build
npm start
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

## Cost Estimation

| Voice Type | Cost per 1M chars |
|------------|-------------------|
| Standard   | $4.00            |
| WaveNet    | $16.00           |
| Neural2    | $16.00           |
| Studio     | $160.00          |

With caching enabled, repeated phrases cost nothing.

## Troubleshooting

### "Could not load the default credentials"
- Ensure `GOOGLE_APPLICATION_CREDENTIALS` points to valid JSON file
- Or run `gcloud auth application-default login`

### "Permission denied" on TTS API
- Enable Cloud Text-to-Speech API in Google Cloud Console
- Ensure service account has `Text-to-Speech User` role

### Mobile app can't connect
- Check firewall allows port 3001
- Use correct IP (10.0.2.2 for emulator, local IP for device)
- Verify backend is running: `curl http://localhost:3001/api/health`

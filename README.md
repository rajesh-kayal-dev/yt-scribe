# YTScribe
This project is a modern, feature-rich learning and content-management platform designed to help creators, educators, and sellers upload, organize, and deliver their digital courses efficiently. The system supports video-based learning with playlist creation, course purchase options, student progress tracking, and advanced analytics.

## Backend setup (YouTube + Auth)

Add the following to `server/.env`:

```
MONGODB_URI=mongodb+srv://...
PORT=5000
CLIENT_URL=http://localhost:3000

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

# YouTube Data API v3
YOUTUBE_API_KEY=your_youtube_api_key

# Deepgram
DEEPGRAM_API_KEY=your_deepgram_api_key

# Optional OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
```

Start servers:

```
cd server && npm run dev
cd client && npm run dev
```

## Docker (server)

Build and run the backend in Docker (includes python3 and ffmpeg for youtube-dl-exec):

```
cd server
docker build -t ytscribe-server .
docker run --env-file .env -p 5000:5000 ytscribe-server
```

## Quick curl checks

Import a YouTube playlist (requires auth token):

```
curl -X POST http://localhost:5000/api/playlists/import \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"playlistUrl":"https://www.youtube.com/playlist?list=PLxxxxxx"}'
```

Create a course (requires auth token):

```
curl -X POST http://localhost:5000/api/courses \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"My Course","description":"Desc","category":"Programming",
    "price":999,"currency":"INR","status":"pending","thumbnailUrl":"data:image/png;base64,..."
  }'
```

Get marketplace courses:

```
curl "http://localhost:5000/api/courses?limit=12&sort=popular"


🛠️ Transcription Setup Guide
To run the transcription feature locally, you need Python and FFmpeg installed.

1. Install Prerequisites
Python: Download here.

⚠️ IMPORTANT: Check the box "Add Python to PATH" during installation.

FFmpeg:

Windows: Run winget install Gyan.FFmpeg in PowerShell (Admin).

Mac: Run brew install ffmpeg.

2. Install Node Packages
Run this in the server folder:

Bash

npm install youtube-transcript @deepgram/sdk youtube-dl-exec fs-extra dotenv

3. Update your .env File

Create or update server/.env. You must add the path to where FFmpeg is installed on your specific computer.

How to find your path:

Open Terminal/PowerShell.

Run: where ffmpeg (Windows) or which ffmpeg (Mac).

Copy the folder path (exclude ffmpeg.exe).

Add this to .env:

Ini, TOML

# API Key (Get free at console.deepgram.com)
DEEPGRAM_API_KEY=your_key_here

# FFmpeg Path (REQUIRED)
# Windows Users: Use Double Backslashes (\\)
FFMPEG_PATH=C:\\Users\\YOUR_NAME\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg...\\bin

# Mac Users:
# FFMPEG_PATH=/usr/local/bin
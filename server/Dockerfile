# Backend Dockerfile for YTScribe (Node + Python3 + FFmpeg)
# IMPORTANT: Install python3 and ffmpeg BEFORE npm install so youtube-dl-exec works

FROM node:18-bullseye AS base

# Install system deps first
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       python3 \
       ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package manifests first (better cache)
COPY package*.json ./

# Install dependencies (prod for image size; use npm ci if lockfile exists)
RUN npm install --production

# Copy source
COPY . .

# Expose port
EXPOSE 5000

# Environment
ENV NODE_ENV=production

# Start server
CMD ["node", "-r", "dotenv/config", "src/server.js"]

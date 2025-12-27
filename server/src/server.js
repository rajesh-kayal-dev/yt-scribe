// Entry point for the backend server
// This file loads environment variables, connects to MongoDB, and starts Express

import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import chatHandler from './sockets/chatHandler.js';

async function startServer() {
  try {
    await connectDB();

    const port = process.env.PORT || 5000;

    // Create HTTP server and bind Socket.io
    const server = http.createServer(app);
    const io = new SocketIOServer(server, {
      cors: {
        origin: '*',
      },
    });

    io.on('connection', (socket) => {
      chatHandler(io, socket);
    });

    server.listen(port, () => {
      console.log(`running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error(' Failed to start server:', error.message || error);
    process.exit(1);
  }
}

startServer();

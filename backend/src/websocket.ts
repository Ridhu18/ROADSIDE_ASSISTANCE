import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

export const initializeWebSocket = (server: HTTPServer) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    const userId = socket.data.user._id;
    const userRole = socket.data.user.role;

    console.log(`User connected: ${userId} (${userRole})`);

    // Join room based on role
    if (userRole === 'mechanic') {
      socket.join(`mechanic:${userId}`);
    } else {
      socket.join(`user:${userId}`);
    }

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
    });
  });

  return io;
}; 
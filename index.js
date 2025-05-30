import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'https://pms-frontend.syolosoft.com'], // Replace with your frontend URL
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'], // Explicitly support both
});

// Make io accessible to routes/controllers
app.set('io', io);

// Configure Express CORS
app.use(cors({
  origin: ['http://localhost:5173', 'https://pms-frontend.syolosoft.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(bodyParser.json());

app.use('/api', authRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.send("PMS BACKEND IS RUNNING on  with scoet io SERVER");
});

// Track active sockets per user
const activeUsers = new Map();

// Socket.IO connection with JWT verification
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  console.log('Socket.IO: Received token:', token?.substring(0, 20) + '...');
  if (!token) {
    console.log('Socket.IO: No token provided');
    return next(new Error('Authentication error: No token provided'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Socket.IO: Token decoded:', { id: decoded.id, email: decoded.email });
    socket.user = decoded;
    next();
  } catch (err) {
    console.error('Socket.IO: Token verification failed:', err.message);
    next(new Error('Authentication error: Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id, 'Employee ID:', socket.user.id, 'Transport:', socket.conn.transport.name);

  const userId = socket.user.id.toString();
  const existingSocketId = activeUsers.get(userId);

  // Disconnect old socket if it exists
  if (existingSocketId && existingSocketId !== socket.id) {
    console.log(`Disconnecting old socket ${existingSocketId} for user ${userId}`);
    io.to(existingSocketId).emit('forceDisconnect', { message: 'New connection established' });
    io.sockets.sockets.get(existingSocketId)?.disconnect(true);
  }

  activeUsers.set(userId, socket.id);

  // Join a room based on user ID
  socket.on('join', (requestedUserId) => {
    if (requestedUserId === userId) {
      socket.join(userId);
      console.log(`User ${userId} joined room ${userId}`);
    } else {
      console.log(`Unauthorized room join attempt by ${userId} for ${requestedUserId}`);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('User disconnected:', socket.id, 'Reason:', reason);
    if (activeUsers.get(userId) === socket.id) {
      activeUsers.delete(userId);
    }
  });

  socket.on('error', (error) => {
    console.error('Socket.IO error for socket:', socket.id, 'Error:', error.message);
  });

  // Log transport changes (e.g., websocket to polling)
  socket.conn.on('upgrade', () => {
    console.log('Transport upgraded for socket:', socket.id, 'New transport:', socket.conn.transport.name);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
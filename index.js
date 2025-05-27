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
    origin: '*',
    methods: ['*'],
  },
});

// Make io accessible to routes/controllers
app.set('io', io);

// Configure Express CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(bodyParser.json());

app.use('/api', authRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.send("PMS BACKEND IS RUNNING On SERVER");
});

// Track active sockets per user
const activeUsers = new Map();

// Socket.IO connection with JWT verification
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    console.log('Socket.IO: No token provided');
    return next(new Error('Authentication error: No token provided'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // Store decoded user data (e.g., id)
    next();
  } catch (err) {
    console.log('Socket.IO: Invalid token');
    next(new Error('Authentication error: Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id, 'Employee ID:', socket.user.id);

  const userId = socket.user.id.toString();
  const existingSocketId = activeUsers.get(userId);

  // Disconnect old socket if it exists
  if (existingSocketId && existingSocketId !== socket.id) {
    io.to(existingSocketId).emit('forceDisconnect', { message: 'New connection established' });
    io.sockets.sockets.get(existingSocketId)?.disconnect(true);
    console.log(`Disconnected old socket ${existingSocketId} for user ${userId}`);
  }

  activeUsers.set(userId, socket.id);

  // Join a room based on user ID
  socket.on('join', (requestedUserId) => {
    if (requestedUserId === userId) {
      socket.join(userId);
      console.log(`User ${userId} joined room`);
    } else {
      console.log(`Unauthorized room join attempt by ${userId} for ${requestedUserId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (activeUsers.get(userId) === socket.id) {
      activeUsers.delete(userId);
    }
  });

  socket.on('forceDisconnect', () => {
    socket.disconnect(true);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
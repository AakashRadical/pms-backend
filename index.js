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

// Socket.IO connection with JWT verification
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // Store decoded user data (e.g., employeeId)
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id, 'Employee ID:', socket.user.id);

  // Join a room based on user ID
  socket.on('join', (userId) => {
    if (userId === socket.user.id.toString()) {
      socket.join(userId);
      console.log(`User ${userId} joined room`);
    } else {
      console.log(`Unauthorized room join attempt by ${socket.user.id} for ${userId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
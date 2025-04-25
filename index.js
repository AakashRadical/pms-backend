// server.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api', authRoutes);
app.use('/api/employee', employeeRoutes);

app.use('/api/tasks', taskRoutes);  
app.get('/',(req,res)=>{
  res.send("PMS BACKEND IS RUNNING")
})

app.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});

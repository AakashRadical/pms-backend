import express from 'express';
import {  createTask, deleteTask, getAssignedTasks, updateTask } from '../controllers/taskController.js';
const router = express.Router();

// router.get('/employees/:adminId', getEmployeesByAdmin);
router.post('/create-task', createTask);
router.get('/assigned/:adminId', getAssignedTasks);
router.put('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);


export default router;

import express from 'express';
import { addEmployee } from '../controllers/employeeController.js';

const router = express.Router();

router.post('/add', addEmployee);

export default router;

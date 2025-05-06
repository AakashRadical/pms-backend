import express from 'express';
import { addEmployee, getEmployeesByAdmin, updateEmployeeStatus } from '../controllers/employeeController.js';

const router = express.Router();

router.post('/add', addEmployee);
router.get('/:adminId', getEmployeesByAdmin);
router.put('/status/:id', updateEmployeeStatus);

export default router;

import db from '../db/db.js';

export const addEmployee = async (req, res) => {
  const { adminId, firstName, lastName, email, gender, designation, joinDate } = req.body;

  try {
    const [result] = await db.query(
      'INSERT INTO employees (admin_id, first_name, last_name, email, gender, designation, join_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [adminId, firstName, lastName, email, gender, designation, joinDate]
    );

    res.status(201).json({ message: 'Employee added successfully', id: result.insertId });
  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).json({ message: 'Failed to add employee' });
  }
};

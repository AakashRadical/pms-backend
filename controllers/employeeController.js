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

export const getEmployeesByAdmin = async (req, res) => {
  const { adminId } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT id, first_name, last_name, gender, status FROM employees WHERE admin_id = ?',
      [adminId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching employees', error: err });
  }
};

export const updateEmployeeStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const sql = 'UPDATE employees SET status = ? WHERE id = ?';
  db.query(sql, [status, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Status updated successfully' });
  });
};

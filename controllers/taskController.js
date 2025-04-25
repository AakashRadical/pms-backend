import db from '../db/db.js';

export const getEmployeesByAdmin = async (req, res) => {
  const { adminId } = req.params;
  try {
    const [rows] = await db.query('SELECT id, first_name, last_name,gender FROM employees WHERE admin_id = ?', [adminId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching employees', error: err });
  }
};

export const createTask = async (req, res) => {
    const {
      title, description, start_date, due_date,
      priority, status, admin_id, assignedEmployees
    } = req.body;
  
    try {
      const [result] = await db.query(
        'INSERT INTO tasks (title, description, start_date, due_date, priority, status, admin_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [title, description, start_date, due_date, priority, status, admin_id]
      );
      const taskId = result.insertId;
  
      const assignmentInserts = assignedEmployees.map(empId =>
        db.query('INSERT INTO task_assignments (task_id, employee_id) VALUES (?, ?)', [taskId, empId])
      );
  
      await Promise.all(assignmentInserts);
      res.status(201).json({ message: 'Task created and employees assigned' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error creating task', error: err });
    }
  };
  
  export const getAssignedTasks = async (req, res) => {
    const { adminId } = req.params;
  
    try {
      const [rows] = await db.query(`
        SELECT 
          e.id AS employee_id, e.first_name, e.last_name, e.gender,
          t.id AS task_id, t.title, t.description, 
          t.start_date, t.due_date, t.priority, 
          t.status, t.completion_date
        FROM tasks t
        INNER JOIN task_assignments ta ON ta.task_id = t.id
        INNER JOIN employees e ON ta.employee_id = e.id
        WHERE e.admin_id = ?
        ORDER BY 
          CASE WHEN t.status = 'Completed' THEN t.completion_date ELSE t.due_date END DESC
      `, [adminId]);
  
      res.status(200).json(rows);
    } catch (err) {
      console.error("Fetch error:", err);
      res.status(500).json({ message: "Server error" });
    }
  };
  
  
  export const updateTask = async (req, res) => {
    const { taskId } = req.params;
    const {
      title, description, start_date, due_date,
      priority, status, completion_date
    } = req.body;
  
    try {
      await db.query(`
        UPDATE tasks SET 
          title = ?, description = ?, start_date = ?, 
          due_date = ?, priority = ?, status = ?, 
          completion_date = ?
        WHERE id = ?
      `, [
        title, description, start_date,
        due_date, priority, status,
        status === 'Completed' ? completion_date : null,
        taskId
      ]);
  
      res.status(200).json({ message: "Task updated" });
    } catch (err) {
      console.error("Update error:", err);
      res.status(500).json({ message: "Update failed" });
    }
  };
  
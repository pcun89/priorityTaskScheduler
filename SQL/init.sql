-- create tasks table
CREATE TABLE
IF NOT EXISTS tasks
(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  priority INTEGER NOT NULL DEFAULT 2, -- 1=High,2=Medium,3=Low
  due_date TEXT, -- ISO 8601 date string (YYYY-MM-DD)
  completed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- optional index to speed ordering/filtering by priority+due_date
CREATE INDEX IF NOT EXISTS idx_tasks_priority_due ON tasks (priority, due_date);

-- sample data
INSERT INTO tasks
    (title, description, priority, due_date)
VALUES
    ('Finish resume', 'Update bullet points and GitHub link', 1, '2025-11-10'),
    ('Grocery shopping', 'Buy milk and eggs', 3, '2025-11-06'),
    ('Refactor scheduler', 'Improve backend endpoints', 2, '2025-11-07');

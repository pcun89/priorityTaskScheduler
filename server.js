/**
 * server.js
 * Simple Express + sqlite3 REST API for the Priority Task Scheduler.
 *
 * Run:
 *   npm install
 *   node server.js
 *
 * Endpoints:
 * GET /api/tasks?search=&priority=&completed=
 * POST /api/tasks
 * PUT /api/tasks/:id
 * DELETE /api/tasks/:id
 */

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'db', 'tasks.db');
const INIT_SQL = fs.readFileSync(path.join(__dirname, 'sql', 'init.sql'), 'utf8');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// ensure db dir exists
fs.mkdirSync(path.join(__dirname, 'db'), { recursive: true });
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Failed to open DB', err);
        process.exit(1);
    }
});

// initialize schema
db.exec(INIT_SQL, (err) => {
    if (err) {
        console.error('Failed to initialize DB schema', err);
    } else {
        console.log('DB ready');
    }
});

// helper: run SQL and return promise
function runAsync(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, changes: this.changes });
        });
    });
}
function allAsync(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}
function getAsync(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

// GET tasks with optional search and filters
app.get('/api/tasks', async (req, res) => {
    try {
        const { search = '', priority, completed } = req.query;
        let sql = 'SELECT * FROM tasks WHERE 1=1';
        const params = [];

        if (search) {
            sql += ' AND (title LIKE ? OR description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        if (priority) {
            sql += ' AND priority = ?';
            params.push(Number(priority));
        }
        if (completed !== undefined) {
            sql += ' AND completed = ?';
            params.push(Number(completed) ? 1 : 0);
        }

        // ordering: priority (ascending, 1 highest), then due_date ascending, then created_at desc
        sql += ' ORDER BY priority ASC, due_date IS NULL, due_date ASC, created_at DESC';

        const rows = await allAsync(sql, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST create task
app.post('/api/tasks', async (req, res) => {
    try {
        const { title, description = '', priority = 2, due_date = null } = req.body;
        if (!title || title.trim().length === 0) {
            return res.status(400).json({ error: 'Title required' });
        }
        const sql = `INSERT INTO tasks (title, description, priority, due_date) VALUES (?, ?, ?, ?)`;
        const result = await runAsync(sql, [title.trim(), description, priority, due_date]);
        const task = await getAsync('SELECT * FROM tasks WHERE id = ?', [result.id]);
        res.status(201).json(task);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT update task
app.put('/api/tasks/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const fields = [];
        const params = [];
        const allowed = ['title', 'description', 'priority', 'due_date', 'completed'];
        allowed.forEach(k => {
            if (req.body[k] !== undefined) {
                fields.push(`${k} = ?`);
                params.push(req.body[k]);
            }
        });
        if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
        params.push(id);
        const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`;
        await runAsync(sql, params);
        const task = await getAsync('SELECT * FROM tasks WHERE id = ?', [id]);
        res.json(task);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        await runAsync('DELETE FROM tasks WHERE id = ?', [id]);
        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));

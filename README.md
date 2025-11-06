# Priority Task Scheduler

Simple task manager built with HTML/CSS/vanilla JavaScript for the frontend and Node.js + SQLite for the backend.

Features:
- Add / edit / complete / delete tasks
- Tasks have title, description, priority (1-high,2-med,3-low) and due date
- Tasks are fetched sorted by priority then due date
- Search by title/description and filter by priority
- Lightweight REST API and persistent storage (SQLite)

Tech: HTML, CSS, JavaScript (frontend), Node.js + Express, sqlite3 (backend)

Run locally:
1. clone repo
2. npm install
3. node server.js
4. open http://localhost:3000
// app.js: frontend logic (vanilla JS)
const API = '/api/tasks';

async function fetchTasks({ search = '', priority = '', completed = '' } = {}) {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (priority) params.set('priority', priority);
    if (completed !== '') params.set('completed', completed);
    const res = await fetch(API + (params.toString() ? '?' + params.toString() : ''));
    return res.json();
}

function formatDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString();
}

function priorityText(p) {
    return p === 1 ? 'High' : p === 2 ? 'Medium' : 'Low';
}

function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = `task priority-${task.priority}`;
    const left = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = task.title + (task.completed ? ' ✅' : '');
    const meta = document.createElement('div');
    meta.className = 'meta small';
    meta.textContent = `${priorityText(task.priority)} • Due: ${formatDate(task.due_date) || 'No due date'}`;
    const desc = document.createElement('div');
    desc.className = 'small';
    desc.textContent = task.description || '';
    left.appendChild(title);
    left.appendChild(meta);
    left.appendChild(desc);

    const actions = document.createElement('div');
    actions.className = 'actions';
    const completeBtn = document.createElement('button');
    completeBtn.textContent = task.completed ? 'Undo' : 'Complete';
    completeBtn.onclick = async () => {
        await fetch(`${API}/${task.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completed: task.completed ? 0 : 1 }) });
        load();
    };

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = async () => {
        if (!confirm('Delete this task?')) return;
        await fetch(`${API}/${task.id}`, { method: 'DELETE' });
        load();
    };

    actions.appendChild(completeBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(left);
    li.appendChild(actions);
    return li;
}

async function load() {
    const search = document.getElementById('search').value.trim();
    const priority = document.getElementById('filterPriority').value;
    const tasks = await fetchTasks({ search, priority });
    const list = document.getElementById('taskList');
    list.innerHTML = '';
    tasks.forEach(t => list.appendChild(createTaskElement(t)));
}

document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const priority = Number(document.getElementById('priority').value);
    const due_date = document.getElementById('due_date').value || null;
    if (!title) return alert('Title required');
    await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, description, priority, due_date }) });
    document.getElementById('taskForm').reset();
    load();
});

document.getElementById('search').addEventListener('input', () => load());
document.getElementById('filterPriority').addEventListener('change', () => load());

window.addEventListener('load', () => load());

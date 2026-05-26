// todo list app - codealpha task 2
// uses localStorage to save tasks

let tasks      = [];
let currentFilter = 'all';
let editingId  = null;

// ---------- Init ----------
function init() {
  loadFromStorage();
  renderTasks();
  document.getElementById('task-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') addTask();
  });
}

// ---------- CRUD ----------
function addTask() {
  const input    = document.getElementById('task-input');
  const priority = document.getElementById('priority-select').value;
  const text     = input.value.trim();

  if (!text) {
    input.focus();
    input.style.outline = '2px solid #e63946';
    setTimeout(() => input.style.outline = '', 1000);
    return;
  }

  const task = {
    id:       Date.now(),
    text:     text,
    done:     false,
    priority: priority,
    created:  new Date().toISOString()
  };

  tasks.unshift(task);
  saveToStorage();
  renderTasks();

  input.value = '';
  input.focus();
}

function toggleTask(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
  saveToStorage();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveToStorage();
  renderTasks();
}

function openEdit(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  editingId = id;
  document.getElementById('edit-input').value      = task.text;
  document.getElementById('edit-priority').value   = task.priority;
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('edit-input').focus();
}

function saveEdit() {
  const newText     = document.getElementById('edit-input').value.trim();
  const newPriority = document.getElementById('edit-priority').value;
  if (!newText) return;
  tasks = tasks.map(t => t.id === editingId ? { ...t, text: newText, priority: newPriority } : t);
  saveToStorage();
  renderTasks();
  closeModal();
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  editingId = null;
}

function clearCompleted() {
  tasks = tasks.filter(t => !t.done);
  saveToStorage();
  renderTasks();
}

// ---------- Filter ----------
function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  renderTasks();
}

function getFiltered() {
  switch (currentFilter) {
    case 'active': return tasks.filter(t => !t.done);
    case 'done':   return tasks.filter(t =>  t.done);
    default:       return tasks;
  }
}

// ---------- Render ----------
function renderTasks() {
  const list     = document.getElementById('task-list');
  const empty    = document.getElementById('empty-state');
  const filtered = getFiltered();

  // Stats
  const total = tasks.length;
  const done  = tasks.filter(t => t.done).length;
  document.getElementById('total-count').textContent = `${total} task${total !== 1 ? 's' : ''}`;
  document.getElementById('done-count').textContent  = `${done} done`;

  list.innerHTML = '';

  if (filtered.length === 0) {
    empty.classList.add('visible');
    empty.querySelector('p').textContent =
      currentFilter === 'done'   ? 'No completed tasks yet.' :
      currentFilter === 'active' ? 'All tasks are done! 🎉'  :
      'No tasks yet. Add one above!';
    return;
  }

  empty.classList.remove('visible');

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item${task.done ? ' done' : ''}`;

    li.innerHTML = `
      <div class="task-check ${task.done ? 'checked' : ''}" onclick="toggleTask(${task.id})" title="Toggle complete"></div>
      <div class="priority-dot ${task.priority}"></div>
      <span class="task-text">${escapeHTML(task.text)}</span>
      <div class="task-actions">
        <button onclick="openEdit(${task.id})" title="Edit">✏️</button>
        <button class="delete-btn" onclick="deleteTask(${task.id})" title="Delete">🗑️</button>
      </div>
    `;

    list.appendChild(li);
  });
}

// ---------- Storage ----------
function saveToStorage() {
  try {
    localStorage.setItem('codealpha_tasks', JSON.stringify(tasks));
  } catch(e) { /* storage unavailable */ }
}

function loadFromStorage() {
  try {
    const data = localStorage.getItem('codealpha_tasks');
    tasks = data ? JSON.parse(data) : [];
  } catch(e) {
    tasks = [];
  }
}

// ---------- Utility ----------
function escapeHTML(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// Close modal on Escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeModal();
  if (e.key === 'Enter' && editingId) saveEdit();
});

// ---------- Boot ----------
init();
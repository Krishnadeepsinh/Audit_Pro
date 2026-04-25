/**
 * AuditDesk Pro - Application Logic
 * Optimized for Premium UX & Real-time State Management
 */

// --- AUTHENTICATION INTERCEPTOR ---
const originalFetch = window.fetch;
window.fetch = async function(...args) {
    const response = await originalFetch(...args);
    if (response.status === 401) {
        document.getElementById('auth-wall').classList.remove('hidden');
    }
    return response;
};

// --- AUTH LOGIC ---
async function attemptLogin() {
    const password = document.getElementById('auth-password').value;
    const errorEl = document.getElementById('auth-error');
    errorEl.style.display = 'none';

    try {
        const res = await originalFetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });
        
        if (res.ok) {
            document.getElementById('auth-wall').classList.add('hidden');
            document.getElementById('auth-password').value = '';
            // Reload all data cleanly
            initApp();
        } else {
            errorEl.style.display = 'block';
        }
    } catch (err) {
        console.error('Login error:', err);
    }
}

async function logout() {
    try {
        await originalFetch('/api/logout', { method: 'POST' });
        document.getElementById('auth-wall').classList.remove('hidden');
    } catch (err) {
        console.error('Logout error:', err);
    }
}

let allTasks = [];
let allClients = [];
let allArticles = [];

const escapeHTML = str => {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

// Lifecycle Initialization
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
});

async function initApp() {
    // 1. Theme Initialization
    const savedTheme = localStorage.getItem('auditdesk-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // 2. Data Initialization
    await loadArticles();
    await loadTasks();
}

function setupEventListeners() {
    const taskForm = document.getElementById('task-form');
    if (taskForm) {
        taskForm.addEventListener('submit', handleTaskSubmit);
    }
}

// Navigation & View Rendering
function showPage(pageId) {
    // 1. Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    
    // 2. Show target page
    const target = document.getElementById(`${pageId}-page`);
    if (target) target.classList.remove('hidden');

    // 3. Update active state in sidebar & bottom nav
    document.querySelectorAll('.nav-btn, .nav-btn-mobile').forEach(btn => btn.classList.remove('active'));
    
    const activeBtn = document.getElementById(`nav-${pageId}`);
    if (activeBtn) activeBtn.classList.add('active');
    
    const activeMobileBtn = document.getElementById(`m-nav-${pageId}`);
    if (activeMobileBtn) activeMobileBtn.classList.add('active');

    // 4. Update Header Title
    const titles = {
        'dashboard': 'Dashboard Overview',
        'assign': 'Work Assignment',
        'history': 'Master Audit Trail',
        'clients': 'Client Repository',
        'articles': 'Articles & Staff'
    };
    document.getElementById('page-header-title').innerText = titles[pageId] || 'AuditDesk';

    // 5. Context-based loading
    if (pageId === 'dashboard' || pageId === 'history') {
        loadTasks();
    } else if (pageId === 'assign') {
        loadAssignmentDropdowns();
    } else if (pageId === 'clients') {
        loadClients();
    } else if (pageId === 'articles') {
        loadArticles();
    }

    // Refresh icons
    if (window.lucide) lucide.createIcons();
}

/**
 * Directory Management (Clients & Articles)
 */

async function loadClients() {
    try {
        const res = await fetch(`/api/parties?_=${Date.now()}`);
        const clients = await res.json();
        allClients = clients; // Sync with global
        renderClientsGrid(clients);
    } catch (err) {
        console.error('Failed to load clients:', err);
    }
}

async function loadArticles() {
    try {
        const res = await fetch(`/api/articles?_=${Date.now()}`);
        const articles = await res.json();
        allArticles = articles; // Sync with global
        updateFilterDropdowns(); // Update history staff filter
        renderArticlesGrid(articles);
    } catch (err) {
        console.error('Failed to load articles:', err);
    }
}

function renderClientsGrid(clients) {
    const grid = document.getElementById('clients-grid');
    if (!grid) return;

    grid.innerHTML = clients.map(client => `
        <div class="m-card" data-client-id="${client.id}">
            <button onclick="console.log('Action: deleteClient', ${client.id}); deleteClient(${client.id})" class="action-btn" style="position: absolute; top: 12px; right: 12px; color: var(--danger); z-index: 10; cursor: pointer;">
                <i data-lucide="trash-2" style="width: 14px; height: 14px; pointer-events: none;"></i>
            </button>
            <div class="m-avatar"><i data-lucide="building-2"></i></div>
            <h3 class="outfit">${escapeHTML(client.name)}</h3>
            <p style="color: var(--text-mute); font-size: 13px">Client Record</p>
        </div>
    `).join('') || `<div style="grid-column: 1/-1; padding: 60px; text-align: center; color: var(--text-mute)">No clients registered in the repository.</div>`;
    
    if (window.lucide) lucide.createIcons();
}

function renderArticlesGrid(articles) {
    const grid = document.getElementById('articles-grid');
    if (!grid) return;

    grid.innerHTML = articles.map(art => `
        <div class="m-card" data-article-id="${art.id}">
            <button onclick="console.log('Action: deleteArticle', ${art.id}); deleteArticle(${art.id})" class="action-btn" style="position: absolute; top: 12px; right: 12px; color: var(--danger); z-index: 10; cursor: pointer;">
                <i data-lucide="trash-2" style="width: 14px; height: 14px; pointer-events: none;"></i>
            </button>
            <div class="m-avatar">${escapeHTML(art.name).charAt(0)}</div>
            <h3 class="outfit">${escapeHTML(art.name)}</h3>
            <p style="color: var(--text-mute); font-size: 13px">Article Assistant</p>
        </div>
    `).join('') || `<div style="grid-column: 1/-1; padding: 60px; text-align: center; color: var(--text-mute)">No staff/articles found.</div>`;
    
    if (window.lucide) lucide.createIcons();
}

async function addClient() {
    const name = await showInputModal(
        'Add New Client',
        'Register a new party or corporation to your audit directory.',
        'Company/Entity Name',
        'e.g. Reliance Industries'
    );
    if (!name) return;

    try {
        await fetch('/api/parties', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        loadClients();
    } catch (err) {
        console.error('Add client failed:', err);
    }
}

async function addArticle() {
    const name = await showInputModal(
        'Add Team Member',
        'Enroll a new article assistant or staff member to the firm.',
        'Staff Full Name',
        'e.g. Rahul Sharma'
    );
    if (!name) return;

    try {
        await fetch('/api/articles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        loadArticles();
    } catch (err) {
        console.error('Add article failed:', err);
    }
}

async function loadAssignmentDropdowns() {
    try {
        // Fetch parties and articles in parallel
        const [partiesRes, articlesRes] = await Promise.all([
            fetch('/api/parties'),
            fetch('/api/articles')
        ]);
        
        const parties = await partiesRes.json();
        const articles = await articlesRes.json();
        
        // Populate Datalists
        const clientDatalist = document.getElementById('clients-list');
        const articlesSelect = document.getElementById('assigned_to');
        
        if (clientDatalist) {
            clientDatalist.innerHTML = parties.map(p => `<option value="${p.name}">`).join('');
        }
        
        if (articlesSelect) {
            const currentVal = articlesSelect.value;
            articlesSelect.innerHTML = `<option value="" disabled ${!currentVal ? 'selected' : ''}>Select Team Member</option>` + 
                articles.map(a => `<option value="${a.name}" ${currentVal === a.name ? 'selected' : ''}>${a.name}</option>`).join('');
        }
    } catch (err) {
        console.error('Failed to load dropdowns:', err);
    }
}

async function deleteClient(id) {
    console.log('Initiating direct delete for client ID:', id);
    const confirmed = await showConfirm(
        'Delete Client Permantently?',
        'This will remove the client from the database and archive all associated history. Action is irreversible.'
    );
    if (!confirmed) return;

    // Optimistic UI: Hide it immediately
    const card = document.querySelector(`[data-client-id="${id}"]`);
    if (card) card.style.opacity = '0.3'; // Visual cue it's being deleted

    try {
        const res = await fetch(`/api/parties/${id}`, { method: 'DELETE' });
        if (res.ok) {
            console.log('DB Sync Successful: Client wiped');
            if (card) card.remove(); // Final removal
            await loadClients(); // Double-check sync
            await loadAssignmentDropdowns(); 
            await loadTasks(); 
        } else {
            const errData = await res.json();
            if (card) card.style.opacity = '1'; // Rollback
            alert('Cloud Sync Error: ' + errData.error);
        }
    } catch (err) {
        console.error('Delete network error:', err);
        if (card) card.style.opacity = '1'; // Rollback
    }
}

async function deleteArticle(id) {
    console.log('Initiating direct delete for staff ID:', id);
    const confirmed = await showConfirm(
        'Delete Staff Permantently?',
        'Removing this staff member will wipe their assignment history from the directory.'
    );
    if (!confirmed) return;

    // Optimistic UI: Hide it immediately
    const card = document.querySelector(`[data-article-id="${id}"]`);
    if (card) card.style.opacity = '0.3';

    try {
        const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
        if (res.ok) {
            console.log('DB Sync Successful: Staff wiped');
            if (card) card.remove(); 
            await loadArticles();
            await loadAssignmentDropdowns();
            await loadTasks();
        } else {
            const errData = await res.json();
            if (card) card.style.opacity = '1';
            alert('Cloud Sync Error: ' + errData.error);
        }
    } catch (err) {
        console.error('Delete network error:', err);
        if (card) card.style.opacity = '1';
    }
}

/**
 * UI Utilities (Modals & Notifications)
 */

function showConfirm(title, message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirm-modal');
        const titleEl = document.getElementById('modal-title');
        const messageEl = document.getElementById('modal-message');
        const confirmBtn = document.getElementById('modal-confirm');
        const cancelBtn = document.getElementById('modal-cancel');

        titleEl.innerText = title;
        messageEl.innerText = message;
        
        modal.classList.remove('hidden');
        if (window.lucide) lucide.createIcons();

        const handleConfirm = () => {
            cleanup();
            resolve(true);
        };

        const handleCancel = () => {
            cleanup();
            resolve(false);
        };

        const cleanup = () => {
            modal.classList.add('hidden');
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
        };

        confirmBtn.addEventListener('click', handleConfirm);
        cancelBtn.addEventListener('click', handleCancel);
    });
}

function showInputModal(title, message, label, placeholder) {
    return new Promise((resolve) => {
        const modal = document.getElementById('input-modal');
        const titleEl = document.getElementById('input-modal-title');
        const messageEl = document.getElementById('input-modal-message');
        const labelEl = document.getElementById('input-modal-label');
        const fieldEl = document.getElementById('modal-field');
        const submitBtn = document.getElementById('input-modal-submit');
        const cancelBtn = document.getElementById('input-modal-cancel');

        titleEl.innerText = title;
        messageEl.innerText = message;
        labelEl.innerText = label;
        fieldEl.placeholder = placeholder;
        fieldEl.value = '';
        
        modal.classList.remove('hidden');
        fieldEl.focus();

        const handleSubmit = () => {
            const val = fieldEl.value.trim();
            if (val) {
                cleanup();
                resolve(val);
            }
        };

        const handleCancel = () => {
            cleanup();
            resolve(null);
        };

        const cleanup = () => {
            modal.classList.add('hidden');
            submitBtn.removeEventListener('click', handleSubmit);
            cancelBtn.removeEventListener('click', handleCancel);
        };

        submitBtn.addEventListener('click', handleSubmit);
        cancelBtn.addEventListener('click', handleCancel);
        
        // Handle Enter key
        fieldEl.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') handleSubmit();
        });
    });
}

// Data Handling (Server Interaction)
async function loadTasks() {
    try {
        const res = await fetch(`/api/tasks?_=${Date.now()}`);
        const tasks = await res.json();
        allTasks = tasks; // Sync with global cache
        updateDashboardStats(tasks);
        applyFilters('dashboard');
        applyFilters('history');
    } catch (err) {
        console.error('Failed to load tasks:', err);
    }
}

function updateDashboardStats(tasks) {
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === 'Pending').length;
    const working = tasks.filter(t => t.status === 'Working').length;
    const completed = tasks.filter(t => t.status === 'Completed').length;

    document.getElementById('stat-total').innerText = total;
    document.getElementById('stat-pending').innerText = pending;
    document.getElementById('stat-working').innerText = working;
    document.getElementById('stat-completed').innerText = completed;
}

function renderDashboardTasks(tasks) {
    const dashboardBody = document.getElementById('dashboard-tasks-body');
    if (!dashboardBody) return;

    const dashboardTasks = tasks.slice(0, 10);
    
    dashboardBody.innerHTML = dashboardTasks.map(task => `
        <tr>
            <td>
                <div style="font-weight: 700; color: var(--text-main)">${escapeHTML(task.client_name)}</div>
                <div style="font-size: 11px; color: var(--text-mute); text-transform: uppercase; margin-top: 2px">${escapeHTML(task.task_name)}</div>
            </td>
            <td>${escapeHTML(task.task_name)}</td>
            <td>${escapeHTML(task.description || '-')}</td>
            <td>${escapeHTML(task.assigned_to)}</td>
            <td>
                <div style="font-size: 12px"><b>S:</b> ${formatSimpleDate(task.created_at)}</div>
                ${task.completion_date ? `<div style="font-size: 12px; color: var(--success)"><b>E:</b> ${formatSimpleDate(task.completion_date)}</div>` : ''}
            </td>
            <td><span class="badge badge-${task.status.toLowerCase()}">${task.status}</span></td>
            <td style="text-align: right; white-space: nowrap;">
                <select onchange="updateTaskStatus(${task.id}, this.value)" class="premium-input" style="padding: 6px 12px; font-size: 12px; width: auto; margin-right: 8px;">
                    <option value="Pending" ${task.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Working" ${task.status === 'Working' ? 'selected' : ''}>Working</option>
                    <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
                </select>
                <button onclick="deleteTask(${task.id})" class="action-btn" style="color: var(--danger); vertical-align: middle;">
                    <i data-lucide="trash-2" style="width: 14px; height: 14px; pointer-events: none;"></i>
                </button>
            </td>
        </tr>
    `).join('') || `<tr><td colspan="7" style="text-align: center; padding: 40px; color: var(--text-mute)">No active assignments found for this filter.</td></tr>`;

    if (window.lucide) lucide.createIcons();
}

function renderHistoryTasks(tasks) {
    const historyBody = document.getElementById('history-tasks-body');
    if (!historyBody) return;

    historyBody.innerHTML = tasks.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).map(task => {
        return `
            <tr>
                <td><div style="font-weight: 600">${escapeHTML(task.client_name)}</div></td>
                <td>${escapeHTML(task.task_name)}</td>
                <td>${escapeHTML(task.description || '-')}</td>
                <td>${escapeHTML(task.assigned_to)}</td>
                <td>${formatSimpleDate(task.created_at)}</td>
                <td>${task.completion_date ? formatSimpleDate(task.completion_date) : '<span style="color: var(--text-dim)">-</span>'}</td>
                <td><span class="badge badge-${task.status.toLowerCase()}">${escapeHTML(task.status)}</span></td>
                <td style="text-align: right; white-space: nowrap;">
                    <select onchange="updateTaskStatus(${task.id}, this.value)" class="premium-input" style="padding: 6px 12px; font-size: 12px; width: auto; margin-right: 8px;">
                        <option value="Pending" ${task.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Working" ${task.status === 'Working' ? 'selected' : ''}>Working</option>
                        <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
                    </select>
                    <button onclick="deleteTask(${task.id})" class="action-btn" style="color: var(--danger); vertical-align: middle;">
                        <i data-lucide="trash-2" style="width: 14px; height: 14px; pointer-events: none;"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('') || `<tr><td colspan="8" style="text-align: center; padding: 40px; color: var(--text-mute)">History archive is empty matching this filter.</td></tr>`;

    if (window.lucide) lucide.createIcons();
}

async function handleTaskSubmit(e) {
    e.preventDefault();
    const taskCategory = document.getElementById('task_name').value;
    const otherDetail = document.getElementById('other_task_name').value;
    
    // Use 'Other' detail if selected, otherwise use category
    const finalTaskName = taskCategory === 'OTHER' ? otherDetail : taskCategory;

    if (!finalTaskName) {
        alert('Please specify the task or select a category.');
        return;
    }

    const data = {
        client_name: document.getElementById('client_name').value,
        task_name: finalTaskName,
        assigned_to: document.getElementById('assigned_to').value,
        status: document.getElementById('status').value,
        description: document.getElementById('description').value || finalTaskName
    };

    try {
        const res = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            e.target.reset();
            document.getElementById('other-work-container').style.display = 'none';
            showPage('dashboard');
            loadTasks();
        }
    } catch (err) {
        console.error('Submission failed:', err);
    }
}

async function updateTaskStatus(id, status) {
    try {
        await fetch(`/api/tasks/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        loadTasks();
    } catch (err) {
        console.error('Status update failed:', err);
    }
}

async function deleteTask(id) {
    const confirmed = await showConfirm(
        'Delete Work Assignment?',
        'This will permanently delete this task. This action cannot be undone.'
    );
    if (!confirmed) return;

    try {
        const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
        if (res.ok) {
            loadTasks();
        } else {
            const errData = await res.json();
            alert('Cloud Sync Error: ' + errData.error);
        }
    } catch (err) {
        console.error('Delete network error:', err);
    }
}

// Theme Engine
function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('auditdesk-theme', next);
    updateThemeIcon(next);
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('theme-icon');
    if (!icon) return;
    
    // Smooth swap with Lucide
    if (theme === 'dark') {
        icon.setAttribute('data-lucide', 'sun');
    } else {
        icon.setAttribute('data-lucide', 'moon');
    }
    
    if (window.lucide) lucide.createIcons();
}

// Utilities
function formatSimpleDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

function toggleOtherWork(val) {
    const container = document.getElementById('other-work-container');
    const input = document.getElementById('other_task_name');
    if (val === 'OTHER') {
        container.style.display = 'block';
        if (input) {
            input.required = true;
            input.focus();
        }
    } else {
        container.style.display = 'none';
        if (input) {
            input.required = false;
            input.value = '';
        }
    }
}

function applyFilters(target) {
    if (target === 'dashboard') {
        const query = (document.getElementById('dash-search').value || '').toLowerCase();
        const status = document.getElementById('dash-status-filter').value;
        const staff = document.getElementById('dash-staff-filter').value;
        const filtered = allTasks.filter(t => {
            const searchStr = Object.values(t).map(v => (v || '').toString().toLowerCase()).join(' ');
            const matchesQuery = !query || searchStr.includes(query);
            const matchesStatus = !status || t.status === status;
            const matchesStaff = !staff || t.assigned_to === staff;
            return matchesQuery && matchesStatus && matchesStaff; 
        });
        renderDashboardTasks(filtered);
    } 
    else if (target === 'history') {
        const query = (document.getElementById('hist-search').value || '').toLowerCase();
        const status = document.getElementById('hist-status-filter').value;
        const staff = document.getElementById('hist-staff-filter').value;
        const filtered = allTasks.filter(t => {
            const searchStr = Object.values(t).map(v => (v || '').toString().toLowerCase()).join(' ');
            const matchesQuery = !query || searchStr.includes(query);
            const matchesStatus = !status || t.status === status;
            const matchesStaff = !staff || t.assigned_to === staff;
            return matchesQuery && matchesStatus && matchesStaff;
        });
        renderHistoryTasks(filtered);
    }
    else if (target === 'clients') {
        const query = document.getElementById('client-search').value.toLowerCase();
        const filtered = allClients.filter(c => (c.name || '').toLowerCase().includes(query));
        renderClientsGrid(filtered);
    }
    else if (target === 'staff') {
        const query = document.getElementById('staff-search').value.toLowerCase();
        const filtered = allArticles.filter(a => (a.name || '').toLowerCase().includes(query));
        renderArticlesGrid(filtered);
    }
}

function updateFilterDropdowns() {
    [document.getElementById('hist-staff-filter'), document.getElementById('dash-staff-filter')].forEach(el => {
        if (el) {
            const currentVal = el.value;
            const options = allArticles.map(a => `<option value="${a.name}" ${a.name === currentVal ? 'selected' : ''}>${a.name}</option>`).join('');
            el.innerHTML = '<option value="">All Staff</option>' + options;
        }
    });
}

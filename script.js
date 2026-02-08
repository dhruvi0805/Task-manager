/* ===========================
   PASTEL PRIORITY - SCRIPT
   =========================== */

// ===========================
// STATE MANAGEMENT
// ===========================

let appState = {
    currentUser: null,
    categories: [],
    tasks: [],
    currentView: 'categories',
    currentMonth: new Date(),
    selectedDate: null,
};

// Load state from localStorage on init
function loadState() {
    const saved = localStorage.getItem('appState');
    if (saved) {
        appState = JSON.parse(saved);
    }
}

// Save state to localStorage
function saveState() {
    localStorage.setItem('appState', JSON.stringify(appState));
}

// ===========================
// AUTHENTICATION
// ===========================

function initAuth() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const toggleSignupBtn = document.getElementById('toggleSignup');
    const closeSignupBtn = document.getElementById('closeSignup');
    const logoutBtn = document.getElementById('logoutBtn');

    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    toggleSignupBtn.addEventListener('click', showSignupModal);
    closeSignupBtn.addEventListener('click', closeSignupModal);
    logoutBtn.addEventListener('click', handleLogout);
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Simple validation (in production, connect to Supabase)
    if (email && password) {
        appState.currentUser = {
            id: generateId(),
            email: email,
            name: email.split('@')[0],
        };
        saveState();
        showAppView();
        document.getElementById('loginForm').reset();
    }
}

function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    if (name && email && password) {
        appState.currentUser = {
            id: generateId(),
            email: email,
            name: name,
        };
        saveState();
        closeSignupModal();
        showAppView();
        document.getElementById('signupForm').reset();
    }
}

function handleLogout() {
    appState.currentUser = null;
    appState.categories = [];
    appState.tasks = [];
    saveState();
    showLoginView();
}

function showLoginView() {
    document.getElementById('loginView').classList.add('active');
    document.getElementById('appView').classList.remove('active');
}

function showAppView() {
    document.getElementById('loginView').classList.remove('active');
    document.getElementById('appView').classList.add('active');
    updateUserDisplay();
    renderCategories();
    renderToday();
    renderCalendar();
}

function showSignupModal() {
    document.getElementById('signupOverlay').classList.remove('hidden');
}

function closeSignupModal() {
    document.getElementById('signupOverlay').classList.add('hidden');
}

function updateUserDisplay() {
    if (appState.currentUser) {
        document.getElementById('userDisplay').textContent = `Hello, ${appState.currentUser.name}!`;
    }
}

// ===========================
// CATEGORY MANAGEMENT
// ===========================

function initCategories() {
    document.getElementById('addCategoryBtn').addEventListener('click', openCategoryModal);
    document.getElementById('categoryForm').addEventListener('submit', handleAddCategory);
}

function openCategoryModal() {
    document.getElementById('categoryModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('categoryModal').classList.add('hidden');
}

function handleAddCategory(e) {
    e.preventDefault();
    
    const name = document.getElementById('categoryName').value;
    const color = document.querySelector('input[name="color"]:checked').value;

    if (name) {
        const category = {
            id: generateId(),
            user_id: appState.currentUser.id,
            name: name,
            color: color,
            created_at: new Date().toISOString(),
        };

        appState.categories.push(category);
        saveState();
        renderCategories();
        
        document.getElementById('categoryForm').reset();
        closeModal();
    }
}

function renderCategories() {
    const grid = document.getElementById('categoriesGrid');
    grid.innerHTML = '';

    if (appState.categories.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999; padding: 40px;">No categories yet. Create one to get started!</p>';
        return;
    }

    appState.categories.forEach(category => {
        const categoryCard = createCategoryCard(category);
        grid.appendChild(categoryCard);
    });
}

function createCategoryCard(category) {
    const card = document.createElement('div');
    card.className = 'category-card';
    
    const categoryTasks = appState.tasks.filter(t => t.category_id === category.id);
    const activeTasks = categoryTasks.filter(t => t.status === 'active');
    const completedTasks = categoryTasks.filter(t => t.status === 'completed');

    card.innerHTML = `
        <div class="category-header">
            <h3 class="category-name">${escapeHtml(category.name)}</h3>
            <div class="category-color-dot ${category.color}"></div>
        </div>

        <div class="category-tasks">
            <label class="task-section-title">Active (${activeTasks.length})</label>
            <div class="tasks-list" data-category-id="${category.id}" data-status="active">
                ${activeTasks.map(task => createTaskElement(task)).join('')}
            </div>

            ${activeTasks.length === 0 ? '<div class="task-item" style="opacity: 0.5;"><em style="color: #999;">No active tasks</em></div>' : ''}

            <div class="task-input-wrapper">
                <input type="text" class="task-quick-add" placeholder="Add new task..." data-category-id="${category.id}">
            </div>

            <label class="task-section-title" style="margin-top: 1rem;">Completed (${completedTasks.length})</label>
            <div class="tasks-list" data-category-id="${category.id}" data-status="completed">
                ${completedTasks.map(task => createTaskElement(task)).join('')}
            </div>
        </div>

        <div class="category-actions">
            <button class="btn btn-secondary btn-sm" onclick="editCategory('${category.id}')">Edit</button>
            <button class="btn btn-secondary btn-sm" onclick="deleteCategory('${category.id}')">Delete</button>
        </div>
    `;

    // Add event listeners for quick task add
    const quickInput = card.querySelector('.task-quick-add');
    quickInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTaskQuick(category.id, quickInput.value);
            quickInput.value = '';
        } else if (e.key === 'Escape') {
            quickInput.value = '';
        }
    });

    // Add event listeners for checkboxes and delete buttons
    card.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const taskId = e.target.closest('.task-item').dataset.taskId;
            toggleTaskComplete(taskId);
        });
    });

    card.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = e.target.closest('.task-item').dataset.taskId;
            deleteTask(taskId);
        });
    });

    return card;
}

function createTaskElement(task) {
    const priorityIcon = getPriorityIcon(task);
    const taskDate = task.due_date ? new Date(task.due_date).toLocaleDateString() : '';
    const taskHours = task.estimated_hours ? `⏱ ${task.estimated_hours}h` : '';
    
    return `
        <div class="task-item ${task.status === 'completed' ? 'completed' : ''}" data-task-id="${task.id}">
            <div class="task-checkbox-wrapper">
                <input type="checkbox" class="task-checkbox" ${task.status === 'completed' ? 'checked' : ''}>
                <span class="task-priority-indicator">${priorityIcon}</span>
            </div>
            <div class="task-content">
                <h4 class="task-title">${escapeHtml(task.title)}</h4>
                ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
                <div class="task-meta">
                    ${taskDate ? `<span class="task-date">📅 ${taskDate}</span>` : ''}
                    ${taskHours ? `<span class="task-hours">${taskHours}</span>` : ''}
                    ${task.is_recurring ? '<span class="task-recurring">🔁 Recurring</span>' : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="btn-icon btn-edit">✏️</button>
                <button class="btn-icon btn-delete">🗑</button>
            </div>
        </div>
    `;
}

function addTaskQuick(categoryId, title) {
    if (!title.trim()) return;

    const task = {
        id: generateId(),
        user_id: appState.currentUser.id,
        category_id: categoryId,
        title: title,
        description: '',
        status: 'active',
        due_date: null,
        start_by: null,
        estimated_hours: 0,
        priority_score: calculatePriority(null, null, 0),
        is_recurring: false,
        recurrence_days: [],
        appears_in_today: false,
        created_at: new Date().toISOString(),
        completed_at: null,
    };

    appState.tasks.push(task);
    saveState();
    renderCategories();
    renderToday();
    renderCalendar();
}

function toggleTaskComplete(taskId) {
    const task = appState.tasks.find(t => t.id === taskId);
    if (task) {
        if (task.status === 'active') {
            task.status = 'completed';
            task.completed_at = new Date().toISOString();
        } else {
            task.status = 'active';
            task.completed_at = null;
        }
        saveState();
        renderCategories();
        renderToday();
        renderCalendar();
    }
}

function deleteTask(taskId) {
    if (confirm('Delete this task?')) {
        appState.tasks = appState.tasks.filter(t => t.id !== taskId);
        saveState();
        renderCategories();
        renderToday();
        renderCalendar();
    }
}

function editCategory(categoryId) {
    alert('Edit category feature coming soon');
}

function deleteCategory(categoryId) {
    if (confirm('Delete this category and all its tasks?')) {
        appState.categories = appState.categories.filter(c => c.id !== categoryId);
        appState.tasks = appState.tasks.filter(t => t.category_id !== categoryId);
        saveState();
        renderCategories();
    }
}

// ===========================
// TODAY VIEW
// ===========================

function renderToday() {
    const today = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    document.getElementById('todayDate').textContent = today;

    const todayParams = getTodayTasks();
    const container = document.getElementById('todayTasksContainer');

    if (todayParams.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px; grid-column: 1/-1;">No tasks for today. Great job! 🎉</p>';
    } else {
        container.innerHTML = todayParams.map(task => createTodayTaskElement(task)).join('');
    }

    // Update stats
    document.getElementById('todayTaskCount').textContent = todayParams.length;
    const totalHours = todayParams.reduce((sum, t) => sum + (t.estimated_hours || 0), 0);
    document.getElementById('todayHoursCount').textContent = totalHours.toFixed(1);

    // Add event listeners
    container.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const taskId = e.target.closest('.task-item').dataset.taskId;
            toggleTaskComplete(taskId);
        });
    });

    container.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = e.target.closest('.task-item').dataset.taskId;
            deleteTask(taskId);
        });
    });
}

function getTodayTasks() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return appState.tasks
        .filter(task => {
            if (task.status !== 'active') return false;
            
            const dueDate = task.due_date ? new Date(task.due_date) : null;
            const startDate = task.start_by ? new Date(task.start_by) : null;
            
            dueDate?.setHours(0, 0, 0, 0);
            startDate?.setHours(0, 0, 0, 0);
            
            return (dueDate && dueDate <= today) || (startDate && startDate <= today) || task.appears_in_today;
        })
        .sort((a, b) => {
            // Sort by priority score (lower is higher priority)
            if (a.priority_score !== b.priority_score) {
                return a.priority_score - b.priority_score;
            }
            // Then by due date
            const aDate = a.due_date ? new Date(a.due_date) : new Date(8640000000000000);
            const bDate = b.due_date ? new Date(b.due_date) : new Date(8640000000000000);
            return aDate - bDate;
        });
}

function createTodayTaskElement(task) {
    const category = appState.categories.find(c => c.id === task.category_id);
    const priorityIcon = getPriorityIcon(task);
    const taskDate = task.due_date ? new Date(task.due_date).toLocaleDateString() : '';
    const taskHours = task.estimated_hours ? `⏱ ${task.estimated_hours}h` : '';

    return `
        <div class="task-item ${task.status === 'completed' ? 'completed' : ''}" data-task-id="${task.id}">
            <div class="task-checkbox-wrapper">
                <input type="checkbox" class="task-checkbox" ${task.status === 'completed' ? 'checked' : ''}>
                <span class="task-priority-indicator">${priorityIcon}</span>
            </div>
            <div class="task-content">
                <h4 class="task-title">${escapeHtml(task.title)}</h4>
                ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
                <div class="task-meta">
                    <span class="category-badge" style="background: var(--${category.color}); padding: 2px 8px; border-radius: 4px; font-size: 0.75rem;">${escapeHtml(category.name)}</span>
                    ${taskDate ? `<span class="task-date">📅 ${taskDate}</span>` : ''}
                    ${taskHours ? `<span class="task-hours">${taskHours}</span>` : ''}
                    ${task.is_recurring ? '<span class="task-recurring">🔁 Recurring</span>' : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="btn-icon btn-edit">✏️</button>
                <button class="btn-icon btn-delete">🗑</button>
            </div>
        </div>
    `;
}

// ===========================
// CALENDAR VIEW
// ===========================

function renderCalendar() {
    const year = appState.currentMonth.getFullYear();
    const month = appState.currentMonth.getMonth();

    // Update header
    const monthName = appState.currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    document.getElementById('currentMonth').textContent = monthName;

    // Generate calendar days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    const nextDays = 7 - lastDay.getDay() - 1;

    let daysHTML = '';

    // Previous month days
    for (let i = firstDay.getDay(); i > 0; i--) {
        const day = prevLastDay.getDate() - i + 1;
        daysHTML += `<div class="calendar-day other-month"><div class="day-number">${day}</div></div>`;
    }

    // Current month days
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split('T')[0];
        const dayTasks = appState.tasks.filter(t => t.due_date === dateStr && t.status === 'active');
        
        const isToday = new Date().toDateString() === date.toDateString();
        const dayClass = isToday ? 'calendar-day today' : 'calendar-day';

        let tasksHTML = '';
        dayTasks.slice(0, 3).forEach(task => {
            const category = appState.categories.find(c => c.id === task.category_id);
            const color = `--${category.color}`;
            tasksHTML += `
                <div class="day-task-preview">
                    <span class="day-task-dot" style="background-color: var(${color});"></span>
                    ${escapeHtml(task.title)}
                </div>
            `;
        });

        const moreIndicator = dayTasks.length > 3 ? `<div class="day-task-preview"><small>+${dayTasks.length - 3} more</small></div>` : '';

        daysHTML += `
            <div class="${dayClass}" onclick="selectCalendarDay('${dateStr}')">
                <div class="day-number">${day}</div>
                <div class="day-tasks">
                    ${tasksHTML}
                    ${moreIndicator}
                </div>
            </div>
        `;
    }

    // Next month days
    for (let day = 1; day <= nextDays; day++) {
        daysHTML += `<div class="calendar-day other-month"><div class="day-number">${day}</div></div>`;
    }

    document.getElementById('calendarDays').innerHTML = daysHTML;
}

function selectCalendarDay(dateStr) {
    appState.selectedDate = dateStr;
    const dayTasks = appState.tasks.filter(t => t.due_date === dateStr);
    
    const date = new Date(dateStr);
    const dateDisplay = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    document.getElementById('panelDateHeader').textContent = dateDisplay;
    
    const panelTasks = document.getElementById('panelTasksList');
    if (dayTasks.length === 0) {
        panelTasks.innerHTML = '<p style="text-align: center; color: #999;">No tasks for this day</p>';
    } else {
        panelTasks.innerHTML = dayTasks.map(task => createTaskElement(task)).join('');
    }

    document.getElementById('calendarTaskPanel').classList.remove('hidden');

    // Add event listeners
    document.getElementById('calendarTaskPanel').querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const taskId = e.target.closest('.task-item').dataset.taskId;
            toggleTaskComplete(taskId);
        });
    });

    document.getElementById('calendarTaskPanel').querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = e.target.closest('.task-item').dataset.taskId;
            deleteTask(taskId);
        });
    });
}

function closeTaskPanel() {
    document.getElementById('calendarTaskPanel').classList.add('hidden');
    appState.selectedDate = null;
}

// ===========================
// VIEW NAVIGATION
// ===========================

function initNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = e.target.dataset.view;
            switchView(view);
        });
    });
}

function switchView(viewName) {
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.nav-btn[data-view="${viewName}"]`).classList.add('active');

    // Update view content
    document.querySelectorAll('.view-content').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`${viewName}View`).classList.add('active');

    appState.currentView = viewName;

    // Re-render based on view
    if (viewName === 'today') {
        renderToday();
    } else if (viewName === 'calendar') {
        renderCalendar();
    }
}

// ===========================
// CALENDAR NAVIGATION
// ===========================

function initCalendarNavigation() {
    document.getElementById('prevMonth').addEventListener('click', () => {
        appState.currentMonth.setMonth(appState.currentMonth.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        appState.currentMonth.setMonth(appState.currentMonth.getMonth() + 1);
        renderCalendar();
    });
}

// ===========================
// PRIORITY CALCULATION
// ===========================

function calculatePriority(dueDate, startDate, estimatedHours) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let daysUntilDue = Number.MAX_SAFE_INTEGER;
    let daysUntilStart = Number.MAX_SAFE_INTEGER;

    if (dueDate) {
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);
        daysUntilDue = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
        daysUntilDue = Math.max(-999, daysUntilDue); // Overdue tasks get very high priority
    }

    if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        daysUntilStart = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
        daysUntilStart = Math.max(0, daysUntilStart);
    }

    const priorityScore = (daysUntilDue * 2) + daysUntilStart + (estimatedHours / 2);
    return Math.round(priorityScore);
}

function getPriorityIcon(task) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!task.due_date && !task.start_by) {
        return '⚪';
    }

    if (task.due_date) {
        const dueDate = new Date(task.due_date);
        dueDate.setHours(0, 0, 0, 0);
        
        if (dueDate < today) return '🔴'; // Overdue
        if (dueDate.getTime() === today.getTime()) return '🟡'; // Due today
    }

    if (task.is_recurring) return '🔁';
    return '🟢'; // Upcoming
}

// ===========================
// UTILITY FUNCTIONS
// ===========================

function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ===========================
// INITIALIZATION
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    loadState();
    initAuth();
    initCategories();
    initNavigation();
    initCalendarNavigation();

    // Check if user is already logged in
    if (appState.currentUser) {
        showAppView();
    } else {
        showLoginView();
    }
});

// Handle modal close on background click
document.getElementById('categoryModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'categoryModal') {
        closeModal();
    }
});

document.getElementById('signupOverlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'signupOverlay') {
        closeSignupModal();
    }
});

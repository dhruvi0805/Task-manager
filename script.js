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
    priorityMap: { 'low': 'medium', 'medium': 'high', 'high': 'low' }, // Priority cycle
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
    card.className = `category-card ${category.color}`;
    
    const categoryTasks = appState.tasks.filter(t => t.category_id === category.id);
    const activeTasks = categoryTasks.filter(t => t.status === 'active');
    const completedTasks = categoryTasks.filter(t => t.status === 'completed');

    card.innerHTML = `
        <div class="category-header">
            <h3 class="category-name">${escapeHtml(category.name)}</h3>
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
        if (e.key === 'Enter' && !e.ctrlKey) {
            e.preventDefault();
            const title = quickInput.value.trim();
            if (title) {
                addTaskQuick(category.id, title);
                quickInput.value = '';
                quickInput.focus(); // Keep focus on input for continuous entry
            }
        } else if (e.key === 'Escape' || (e.key === 'Enter' && e.ctrlKey)) {
            quickInput.value = '';
            quickInput.blur();
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
            const taskId = btn.dataset.taskId;
            deleteTask(taskId);
        });
    });

    card.querySelectorAll('.btn-date').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = btn.dataset.taskId;
            openDatePicker(taskId);
        });
    });

    card.querySelectorAll('.btn-clock').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = btn.dataset.taskId;
            openEstimatePicker(taskId);
        });
    });

    card.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = btn.dataset.taskId;
            editTask(taskId);
        });
    });

    return card;
}

function createTaskElement(task) {
    const taskDate = task.due_date ? new Date(task.due_date).toLocaleDateString() : '';
    const taskHours = task.estimated_hours ? `${task.estimated_hours}h` : '';
    const priority = task.priority || 'low';
    
    return `
        <div class="task-item ${task.status === 'completed' ? 'completed' : ''}" data-task-id="${task.id}">
            <div class="task-checkbox-wrapper">
                <input type="checkbox" class="task-checkbox" ${task.status === 'completed' ? 'checked' : ''}>
            </div>
            <div class="task-actions-left">
                <button class="btn-icon btn-date" title="Add dates" data-action="date" data-task-id="${task.id}">📅</button>
                <button class="btn-icon btn-clock" title="Estimate time" data-action="estimate" data-task-id="${task.id}">⏱</button>
                <button class="priority-tag" title="Toggle priority" data-priority="${priority}" data-task-id="${task.id}" onclick="cyclePriority('${task.id}')">${priority.charAt(0).toUpperCase() + priority.slice(1)}</button>
            </div>
            <div class="task-content">
                <h4 class="task-title">${escapeHtml(task.title)}</h4>
                ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
                <div class="task-meta">
                    ${taskDate ? `<span class="task-date">📅 ${taskDate}</span>` : ''}
                    ${taskHours ? `<span class="task-hours">⏱ ${taskHours}</span>` : ''}
                    ${task.is_recurring ? '<span class="task-recurring">🔁 Recurring</span>' : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="btn-icon btn-edit" data-task-id="${task.id}">✏️</button>
                <button class="btn-icon btn-delete" data-task-id="${task.id}">🗑</button>
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
        priority: 'low',
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
// TASK INTERACTION HANDLERS
// ===========================

function openDatePicker(taskId) {
    const task = appState.tasks.find(t => t.id === taskId);
    if (!task) return;

    const dueDateInput = prompt('Enter due date (YYYY-MM-DD):',  task.due_date || '');
    if (dueDateInput !== null) {
        if (dueDateInput && /^\d{4}-\d{2}-\d{2}$/.test(dueDateInput)) {
            task.due_date = dueDateInput;
            task.priority_score = calculatePriority(dueDateInput, task.start_by, task.estimated_hours);
            saveState();
            renderCategories();
            renderToday();
            renderCalendar();
        } else if (dueDateInput === '') {
            task.due_date = null;
            task.priority_score = calculatePriority(null, task.start_by, task.estimated_hours);
            saveState();
            renderCategories();
            renderToday();
            renderCalendar();
        } else {
            alert('Invalid date format. Use YYYY-MM-DD');
        }
    }
}

function openEstimatePicker(taskId) {
    const task = appState.tasks.find(t => t.id === taskId);
    if (!task) return;

    const hours = prompt('Estimated hours (e.g., 1.5):', task.estimated_hours || '');
    if (hours !== null) {
        const numHours = parseFloat(hours);
        if (isNaN(numHours)) {
            alert('Please enter a valid number');
        } else {
            task.estimated_hours = numHours >= 0 ? numHours : 0;
            task.priority_score = calculatePriority(task.due_date, task.start_by, task.estimated_hours);
            saveState();
            renderCategories();
            renderToday();
            renderCalendar();
        }
    }
}

function cyclePriority(taskId) {
    const task = appState.tasks.find(t => t.id === taskId);
    if (!task) return;

    const priorities = ['low', 'medium', 'high'];
    const currentIndex = priorities.indexOf(task.priority || 'low');
    task.priority = priorities[(currentIndex + 1) % priorities.length];
    
    saveState();
    renderCategories();
    renderToday();
    renderCalendar();
}

function editTask(taskId) {
    const task = appState.tasks.find(t => t.id === taskId);
    if (!task) return;

    const newTitle = prompt('Edit task title:', task.title);
    if (newTitle !== null && newTitle.trim()) {
        task.title = newTitle.trim();
        saveState();
        renderCategories();
        renderToday();
        renderCalendar();
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

    const groupedTasks = getTodayTasksGrouped();
    const container = document.getElementById('todayTasksContainer');

    let html = '';

    // Due Today or Overdue
    if (groupedTasks.dueToday.length > 0) {
        html += '<div class="task-group">';
        html += '<h3 style="color: #FF6B6B; font-size: 0.9rem; margin-bottom: 0.5rem; text-transform: uppercase;">Due Today or Overdue</h3>';
        html += groupedTasks.dueToday.map(task => createTodayTaskElement(task)).join('');
        html += '</div>';
    }

    // Future Due Dates
    if (groupedTasks.futureDue.length > 0) {
        html += '<div class="task-group">';
        html += '<h3 style="color: #FFD93D; font-size: 0.9rem; margin-bottom: 0.5rem; text-transform: uppercase;">Future Due Dates</h3>';
        html += groupedTasks.futureDue.map(task => createTodayTaskElement(task)).join('');
        html += '</div>';
    }

    // No Due Date
    if (groupedTasks.noDueDate.length > 0) {
        html += '<div class="task-group" style="border-top: 2px solid #E5E5E5; padding-top: 1rem; margin-top: 1rem;">';
        html += '<h3 style="color: #666; font-size: 0.9rem; margin-bottom: 0.5rem; text-transform: uppercase;">No Due Date</h3>';
        html += groupedTasks.noDueDate.map(task => createTodayTaskElement(task)).join('');
        html += '</div>';
    }

    if (!html) {
        html = '<p style="text-align: center; color: #999; padding: 40px;">No tasks. Great job! 🎉</p>';
    }

    container.innerHTML = html;

    // Update stats
    const allTasks = [...groupedTasks.dueToday, ...groupedTasks.futureDue, ...groupedTasks.noDueDate];
    document.getElementById('todayTaskCount').textContent = allTasks.length;
    const totalHours = allTasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0);
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
            const taskId = btn.dataset.taskId;
            deleteTask(taskId);
        });
    });

    container.querySelectorAll('.btn-date').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = btn.dataset.taskId;
            openDatePicker(taskId);
        });
    });

    container.querySelectorAll('.btn-clock').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = btn.dataset.taskId;
            openEstimatePicker(taskId);
        });
    });

    container.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = btn.dataset.taskId;
            editTask(taskId);
        });
    });
}

function getTodayTasksGrouped() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeTasks = appState.tasks.filter(task => task.status === 'active');

    const dueToday = activeTasks.filter(task => {
        if (!task.due_date) return false;
        const dueDate = new Date(task.due_date);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate <= today;
    }).sort((a, b) => {
        const aDate = new Date(a.due_date || 0);
        const bDate = new Date(b.due_date || 0);
        return aDate - bDate;
    });

    const futureDue = activeTasks.filter(task => {
        if (!task.due_date) return false;
        const dueDate = new Date(task.due_date);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate > today;
    }).sort((a, b) => {
        const aDate = new Date(a.due_date);
        const bDate = new Date(b.due_date);
        return aDate - bDate;
    });

    const noDueDate = activeTasks.filter(task => !task.due_date).sort((a, b) => {
        // Sort by priority
        if (a.priority !== b.priority) {
            const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
            return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
        }
        return 0;
    });

    return { dueToday, futureDue, noDueDate };
}

function createTodayTaskElement(task) {
    const category = appState.categories.find(c => c.id === task.category_id);
    const taskDate = task.due_date ? new Date(task.due_date).toLocaleDateString() : '';
    const taskHours = task.estimated_hours ? `${task.estimated_hours}h` : '';
    const priority = task.priority || 'low';

    return `
        <div class="task-item ${task.status === 'completed' ? 'completed' : ''}" data-task-id="${task.id}">
            <div class="task-checkbox-wrapper">
                <input type="checkbox" class="task-checkbox" ${task.status === 'completed' ? 'checked' : ''}>
            </div>
            <div class="task-actions-left">
                <button class="btn-icon btn-date" title="Add dates" data-action="date" data-task-id="${task.id}">📅</button>
                <button class="btn-icon btn-clock" title="Estimate time" data-action="estimate" data-task-id="${task.id}">⏱</button>
                <button class="priority-tag" title="Toggle priority" data-priority="${priority}" data-task-id="${task.id}" onclick="cyclePriority('${task.id}')">${priority.charAt(0).toUpperCase() + priority.slice(1)}</button>
            </div>
            <div class="task-content">
                <h4 class="task-title">${escapeHtml(task.title)}</h4>
                ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
                <div class="task-meta">
                    <span class="category-badge" style="background: var(--${category.color}); padding: 2px 8px; border-radius: 4px; font-size: 0.75rem;">${escapeHtml(category.name)}</span>
                    ${taskDate ? `<span class="task-date">📅 ${taskDate}</span>` : ''}
                    ${taskHours ? `<span class="task-hours">⏱ ${taskHours}</span>` : ''}
                    ${task.is_recurring ? '<span class="task-recurring">🔁 Recurring</span>' : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="btn-icon btn-edit" data-task-id="${task.id}">✏️</button>
                <button class="btn-icon btn-delete" data-task-id="${task.id}">🗑</button>
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
    const panel = document.getElementById('calendarTaskPanel');
    
    panel.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const taskId = e.target.closest('.task-item').dataset.taskId;
            toggleTaskComplete(taskId);
        });
    });

    panel.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = btn.dataset.taskId;
            deleteTask(taskId);
        });
    });

    panel.querySelectorAll('.btn-date').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = btn.dataset.taskId;
            openDatePicker(taskId);
        });
    });

    panel.querySelectorAll('.btn-clock').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = btn.dataset.taskId;
            openEstimatePicker(taskId);
        });
    });

    panel.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = btn.dataset.taskId;
            editTask(taskId);
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

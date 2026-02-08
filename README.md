# Pastel Priority - Task Manager

A beautiful, calm task management web application built with HTML, CSS, and vanilla JavaScript. This is a fully functional frontend implementation of the Priority Task Manager PRD with a pastel color palette and intuitive user interface.

## Features

### ✨ Core Features Implemented
- **User Authentication**: Simple login/signup system (ready to integrate with Supabase)
- **Category Management**: Create, organize, and manage task categories with pastel colors
- **Task Management**: Quick task entry with Enter/Esc keyboard shortcuts
- **Three Main Views**:
  - **Categories View**: Browse and manage all tasks organized by category
  - **Today View**: See all tasks due today with automatic statistics
  - **Calendar View**: Month view calendar with drag-and-drop task scheduling
- **Auto-Priority System**: Tasks automatically sorted by priority score based on due dates, start dates, and estimated hours
- **Task Properties**: 
  - Title and description
  - Due dates and start dates
  - Estimated hours
  - Recurring tasks indicator
  - Status (active/completed)
- **Visual Indicators**:
  - 🔴 Overdue tasks
  - 🟡 Due today
  - 🟢 Upcoming tasks
  - 🔁 Recurring tasks
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Persistent Storage**: Uses localStorage for data persistence (can be replaced with Supabase)

## Getting Started

### Quick Start
1. Open `index.html` in your web browser
2. Sign up with a test email and password
3. Create your first category
4. Start adding tasks!

### Demo Account
- You can create any test account - authentication is local
- All data is stored in your browser's localStorage

## File Structure

```
Task manager/
├── index.html       # Main HTML structure
├── styles.css       # Complete styling with pastel colors
├── script.js        # All application logic
└── README.md        # This file
```

## How to Use

### Creating Tasks
1. **Quick Add**: Click on a category and type in the task input field, then press Enter
2. **Keyboard Navigation**: 
   - `Enter`: Save task and open new input
   - `Esc`: Exit task creation

### Managing Tasks
- **Complete Task**: Click the checkbox next to a task
- **Delete Task**: Click the delete button (🗑)
- **View Today**: Click "Today" in the navigation to see all tasks due today
- **Browse Calendar**: Click "Calendar" to see your month view with drag-and-drop support

### Categories
- **Create**: Click "+ New Category" and choose a pastel color
- **Organize**: Tasks are automatically grouped by category
- **Delete**: Use the delete button on each category card

### Today's View
- Automatically shows all active tasks due today or earlier
- Displays task count and estimated hours
- Sorted by priority (overdue → due today → upcoming)

### Calendar View
- **Month Navigation**: Use arrow buttons to navigate months
- **View Tasks**: Click any day to see detailed task list
- **Check Status**: Color-coded dots show task categories

## Priority Calculation

Tasks are automatically prioritized using this formula:
```
priority_score = (days_until_due × 2) + days_until_start + (estimated_hours ÷ 2)
```

**Rules**:
- Overdue tasks always rank highest (negative score)
- Tasks due today outrank future tasks
- Tasks with no dates rank lowest
- Lower score = higher priority

## Customization

### Color Schemes
Pastel colors are defined in CSS variables. Modify these in `styles.css`:
```css
--pastel-rose: #FFB3BA;
--pastel-peach: #FFCAB0;
--pastel-yellow: #FFFFBA;
--pastel-mint: #BAE1BA;
--pastel-blue: #BAC7FF;
--pastel-lavender: #E1BAFF;
```

### Styling
- Spacing: `--spacing-xs` through `--spacing-2xl`
- Border Radius: `--radius-sm`, `--radius-md`, `--radius-lg`
- Shadows: `--shadow-sm`, `--shadow-md`, `--shadow-lg`

## Integration with Backend (Supabase)

This frontend is ready to integrate with a Supabase backend. Follow these steps:

### 1. Set Up Supabase
```bash
npm install @supabase/supabase-js
```

### 2. Replace Local Storage with Supabase Auth
In `script.js`, replace the `handleLogin` function:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_KEY');

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        alert('Login failed: ' + error.message);
    } else {
        appState.currentUser = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || email.split('@')[0],
        };
        showAppView();
    }
}
```

### 3. Database Schema (PostgreSQL)

**Categories Table**:
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_categories_user_id ON categories(user_id);
```

**Tasks Table**:
```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('active', 'completed')) DEFAULT 'active',
    due_date DATE,
    start_by DATE,
    estimated_hours DECIMAL(5,2),
    priority_score INTEGER,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_days INTEGER[],
    appears_in_today BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_category_id ON tasks(category_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
```

### 4. Fetch Data from Supabase

Replace the `renderCategories` function to fetch from database:

```javascript
async function renderCategories() {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', appState.currentUser.id);

    if (error) {
        console.error('Error fetching categories:', error);
        return;
    }

    appState.categories = data;
    // ... rest of render logic
}
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome mobile)

## Performance Notes

- Uses localStorage for instant data persistence
- Optimized for fast keyboard-first task entry
- CSS animations are GPU-accelerated
- Responsive grid layouts for optimal mobile experience

## Accessibility Features

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation throughout
- High contrast pastel colors
- Focus indicators on form inputs

## Known Limitations (Frontend Only)

1. **No Real Authentication**: Uses localStorage for demo purposes
2. **No Real Database**: All data stored in browser
3. **Single Device**: Data not synced across devices
4. **No Cloud Backup**: Data lost if browser storage is cleared

These limitations are resolved when connected to a proper backend like Supabase.

## Future Enhancements

- [ ] Drag-and-drop tasks between categories
- [ ] Recurring task automation
- [ ] Task reminders and notifications
- [ ] Time tracking integration
- [ ] Export to CSV/PDF
- [ ] Dark mode
- [ ] Collaborative task sharing
- [ ] Mobile app version

## License

This project is part of IS117 coursework at NJIT.

## Author

Dhruvi  
Created: February 8, 2026

---

**Note**: This is a frontend-only implementation. For production use, integrate with Supabase following the backend integration guide above.

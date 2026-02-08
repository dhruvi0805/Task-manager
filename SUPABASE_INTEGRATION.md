# API Integration Guide - Supabase

This guide shows how to connect the Pastel Priority frontend to a Supabase backend.

## Setup Supabase

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Sign Up" and create an account
3. Click "New Project"
4. Choose organization and configure:
   - **Name**: pastelpriority
   - **Database Password**: Generate strong password
   - **Region**: Choose closest to you

5. Wait for project to be created (~2 minutes)

### 2. Get Your Credentials

In your Supabase dashboard, go to **Settings → API**:

```
Project URL: https://your-project.supabase.co
Anon Key: eyJhbGc...
Service Key: eyJhbGc... (keep private!)
```

## Database Setup

### 1. Create Tables

In Supabase SQL editor, run:

```sql
-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_category_id ON tasks(category_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_status ON tasks(status);
```

### 2. Enable Row Level Security (RLS)

For **categories** table:

```sql
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own categories"
ON categories FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories"
ON categories FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

For **tasks** table:

```sql
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own tasks"
ON tasks FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
ON tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

## Update Frontend Code

### 1. Add Supabase to index.html

Before the closing `</body>` tag, add:

```html
<!-- Supabase SDK -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### 2. Update script.js - Add Supabase Client

At the top of script.js, add:

```javascript
// Supabase Configuration
const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### 3. Replace Authentication Functions

```javascript
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) throw error;

        appState.currentUser = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || email.split('@')[0],
        };

        saveState();
        showAppView();
        document.getElementById('loginForm').reset();
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    name: name,
                }
            }
        });

        if (error) throw error;

        appState.currentUser = {
            id: data.user.id,
            email: data.user.email,
            name: name,
        };

        saveState();
        closeSignupModal();
        showAppView();
        document.getElementById('signupForm').reset();
    } catch (error) {
        alert('Signup failed: ' + error.message);
    }
}

async function handleLogout() {
    try {
        await supabase.auth.signOut();
        appState.currentUser = null;
        appState.categories = [];
        appState.tasks = [];
        saveState();
        showLoginView();
    } catch (error) {
        alert('Logout failed: ' + error.message);
    }
}
```

### 4. Replace Category Functions

```javascript
async function handleAddCategory(e) {
    e.preventDefault();
    
    const name = document.getElementById('categoryName').value;
    const color = document.querySelector('input[name="color"]:checked').value;

    try {
        const { data, error } = await supabase
            .from('categories')
            .insert([{
                user_id: appState.currentUser.id,
                name: name,
                color: color,
            }])
            .select();

        if (error) throw error;

        appState.categories.push(data[0]);
        saveState();
        await renderCategories();
        
        document.getElementById('categoryForm').reset();
        closeModal();
    } catch (error) {
        alert('Failed to create category: ' + error.message);
    }
}

async function renderCategories() {
    const grid = document.getElementById('categoriesGrid');
    grid.innerHTML = '';

    try {
        // Fetch categories from Supabase
        const { data: categories, error } = await supabase
            .from('categories')
            .select('*')
            .eq('user_id', appState.currentUser.id)
            .order('created_at', { ascending: true });

        if (error) throw error;

        appState.categories = categories;

        // Fetch tasks from Supabase
        const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', appState.currentUser.id);

        if (tasksError) throw tasksError;

        appState.tasks = tasks;
        saveState();

        if (categories.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999; padding: 40px;">No categories yet. Create one to get started!</p>';
            return;
        }

        categories.forEach(category => {
            const categoryCard = createCategoryCard(category);
            grid.appendChild(categoryCard);
        });
    } catch (error) {
        alert('Failed to load categories: ' + error.message);
    }
}
```

### 5. Replace Task Functions

```javascript
async function addTaskQuick(categoryId, title) {
    if (!title.trim()) return;

    try {
        const { data, error } = await supabase
            .from('tasks')
            .insert([{
                user_id: appState.currentUser.id,
                category_id: categoryId,
                title: title,
                status: 'active',
                priority_score: calculatePriority(null, null, 0),
            }])
            .select();

        if (error) throw error;

        appState.tasks.push(data[0]);
        saveState();
        await renderCategories();
        await renderToday();
        await renderCalendar();
    } catch (error) {
        alert('Failed to create task: ' + error.message);
    }
}

async function toggleTaskComplete(taskId) {
    const task = appState.tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
        const newStatus = task.status === 'active' ? 'completed' : 'active';
        const { error } = await supabase
            .from('tasks')
            .update({
                status: newStatus,
                completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
            })
            .eq('id', taskId);

        if (error) throw error;

        task.status = newStatus;
        task.completed_at = newStatus === 'completed' ? new Date().toISOString() : null;
        saveState();

        await renderCategories();
        await renderToday();
        await renderCalendar();
    } catch (error) {
        alert('Failed to update task: ' + error.message);
    }
}

async function deleteTask(taskId) {
    if (!confirm('Delete this task?')) return;

    try {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', taskId);

        if (error) throw error;

        appState.tasks = appState.tasks.filter(t => t.id !== taskId);
        saveState();

        await renderCategories();
        await renderToday();
        await renderCalendar();
    } catch (error) {
        alert('Failed to delete task: ' + error.message);
    }
}

async function deleteCategory(categoryId) {
    if (!confirm('Delete this category and all its tasks?')) return;

    try {
        // Delete tasks in this category first
        const { error: tasksError } = await supabase
            .from('tasks')
            .delete()
            .eq('category_id', categoryId);

        if (tasksError) throw tasksError;

        // Delete category
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', categoryId);

        if (error) throw error;

        appState.categories = appState.categories.filter(c => c.id !== categoryId);
        appState.tasks = appState.tasks.filter(t => t.category_id !== categoryId);
        saveState();

        await renderCategories();
    } catch (error) {
        alert('Failed to delete category: ' + error.message);
    }
}
```

### 6. Initialize Auth on App Load

Update the initialization section:

```javascript
document.addEventListener('DOMContentLoaded', async () => {
    loadState();
    initAuth();
    initCategories();
    initNavigation();
    initCalendarNavigation();

    // Check current auth state from Supabase
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            appState.currentUser = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || session.user.email.split('@')[0],
            };
            await renderCategories();
            await renderToday();
            await renderCalendar();
            showAppView();
        } else {
            showLoginView();
        }
    } catch (error) {
        console.error('Auth error:', error);
        showLoginView();
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
        if (session) {
            appState.currentUser = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || session.user.email.split('@')[0],
            };
            await renderCategories();
        } else {
            appState.currentUser = null;
            showLoginView();
        }
    });
});
```

## Environment Variables

Create a `.env.local` file:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Then update the configuration:

```javascript
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
```

## Test the Integration

1. **Sign up** with a test email
2. **Create a category**
3. **Add a task**
4. **Check Supabase**: Go to your project → Data Editor to verify data is stored
5. **Log out** and **log back in** - your data should persist!

## Debugging Tips

### Enable Supabase Logs

```javascript
// Add at the top of script.js
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
    },
});

// Log all API calls
console.log = (function() {
    var log = console.log;
    return function(...args) {
        if (typeof args[0] === 'string' && args[0].includes('supabase')) {
            log.apply(console, args);
        }
    };
})();
```

### Check RLS Policies

If getting "permission denied" errors:
1. Go to Supabase → Table → RLS
2. Verify policies are enabled
3. Test policy with correct user_id

### Common Issues

**"Real-time is disabled"**
- Enable real-time in Supabase table settings (optional feature)

**"Row level policy violation"**
- Check RLS policies in Supabase
- Ensure `user_id` is properly set in INSERT/UPDATE

**"Cannot read property 'user_id'"**
- Verify current user is logged in with `appState.currentUser`

## Real-time Updates (Optional)

Add real-time sync when data changes:

```javascript
// Listen for category changes
supabase
    .channel('categories')
    .on('postgres_changes', 
        { 
            event: '*', 
            schema: 'public', 
            table: 'categories',
            filter: `user_id=eq.${appState.currentUser.id}`
        },
        (payload) => {
            console.log('Category changed:', payload);
            renderCategories();
        }
    )
    .subscribe();

// Listen for task changes
supabase
    .channel('tasks')
    .on('postgres_changes',
        {
            event: '*',
            schema: 'public',
            table: 'tasks',
            filter: `user_id=eq.${appState.currentUser.id}`
        },
        (payload) => {
            console.log('Task changed:', payload);
            renderCategories();
            renderToday();
            renderCalendar();
        }
    )
    .subscribe();
```

## Next Steps

1. Set up Supabase project
2. Create tables with SQL above
3. Update script.js with Supabase functions
4. Test sign up, login, and task creation
5. Deploy to Vercel with environment variables
6. Monitor real-time updates

---

**Status**: Ready for production deployment  
**Estimated Setup Time**: 30 minutes  
**Difficulty**: Intermediate

Questions? Check Supabase docs: https://supabase.com/docs

# Pastel Priority - Quick Start Guide

## 📱 What You Have

A fully functional task management application with:
- ✅ Beautiful pastel UI
- ✅ Login/Signup system
- ✅ Category management
- ✅ Task creation and management
- ✅ Auto-priority calculation
- ✅ Today's view
- ✅ Calendar view
- ✅ Data persistence (localStorage)
- ✅ Responsive design (mobile-friendly)

## 🚀 Get Started in 30 Seconds

1. **Open `index.html`** in your web browser
2. **Sign up** with any test email (e.g., test@example.com)
3. **Create a category** by clicking "+ New Category"
4. **Add tasks** by typing in the input field and pressing Enter
5. **Check "Today"** to see all tasks due today
6. **View "Calendar"** to see your month at a glance

That's it! Your app is running.

## 📁 Files Included

```
index.html              # Main app structure (HTML)
styles.css              # Beautiful pastel styling (CSS)
script.js               # All app logic (JavaScript)
README.md               # Full documentation
DEPLOYMENT.md           # How to deploy to Vercel/Netlify
SUPABASE_INTEGRATION.md # How to add real database
.gitignore              # Git configuration
```

## 🎨 Key Features to Explore

### Quick Task Entry
- Click a category
- Type task name
- Press **Enter** to save and add another
- Press **Esc** to exit

### Priority Indicators
- 🔴 **Overdue** - highest priority
- 🟡 **Due Today** - medium priority
- 🟢 **Upcoming** - low priority
- 🔁 **Recurring** - shows up repeatedly

### Three Views

**Categories View**
- See all categories with pastel colors
- View active and completed tasks separately
- Quick task creation

**Today View**
- All tasks due today or earlier
- Shows task count and estimated hours
- Sorted by priority automatically

**Calendar View**
- Month view with drag & drop
- Click any day to see detailed tasks
- Color-coded by category

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Save task and add another |
| `Esc` | Exit task creation |
| Click category → type | Quick task add |

## 🎯 Task Properties

When creating tasks, you can set:
- **Title** (required) - what's the task?
- **Description** - more details
- **Due Date** - when is it due?
- **Start By** - when should you start?
- **Estimated Hours** - how long will it take?
- **Recurring** - does it repeat? (Mon, Wed, etc.)

## 💾 Where's My Data?

Currently, data is saved in your **browser's localStorage**:
- ✅ Safe and private on your device
- ❌ Not synced across devices
- ❌ Lost if you clear browser data

**To enable cloud backup**, follow [SUPABASE_INTEGRATION.md](SUPABASE_INTEGRATION.md)

## 🌐 Deploy to the Web

Want to share your app? It's ready to deploy!

### Easiest Way (Vercel - 2 minutes)

1. **Create [Vercel account](https://vercel.com)**
2. **Drag and drop** this folder to Vercel
3. **Get a live URL** immediately!

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

### Other Options
- Netlify (drag & drop)
- GitHub Pages (free)
- Traditional web hosting (any server)

## 🔐 Authentication

Currently uses **demo authentication** (local storage).

For **real user accounts**, connect to Supabase:
1. Get Supabase credentials
2. Follow [SUPABASE_INTEGRATION.md](SUPABASE_INTEGRATION.md)
3. Each user gets their own data

## 🧩 Customization

### Change Colors
Edit the color variables in `styles.css` (line 8-13):
```css
--pastel-rose: #FFB3BA;
--pastel-peach: #FFCAB0;
--pastel-yellow: #FFFFBA;
--pastel-mint: #BAE1BA;
--pastel-blue: #BAC7FF;
--pastel-lavender: #E1BAFF;
```

### Change App Name
Search for "Pastel Priority" in:
- `index.html` (line 7)
- `script.js` (add header customization)
- `styles.css` (optional logo color)

### Adjust Spacing
Edit spacing variables in `styles.css`:
```css
--spacing-md: 1rem;     /* Standard padding */
--spacing-lg: 1.5rem;   /* Larger areas */
```

## 📚 How It Works

### Auto-Priority System
Tasks automatically rank by:
```
Priority = (days until due × 2) 
         + days until start 
         + (estimated hours ÷ 2)

Lower score = Higher priority
```

**Examples:**
- ❌ Overdue = super high priority
- ⏰ Due today = high priority
- 📅 Due next week = medium priority
- 🎯 No due date = low priority

### Data Structure
Each task has:
```javascript
{
    id: "unique-id",
    title: "Buy groceries",
    description: "Get milk and bread",
    category_id: "work-category",
    status: "active",        // or "completed"
    due_date: "2026-02-10",
    estimated_hours: 0.5,
    priority_score: 4,       // auto-calculated
    is_recurring: false,
    recurrence_days: [],     // [0,2,4] = Sun,Tue,Thu
}
```

## 🐛 Troubleshooting

### App won't load?
- Make sure all 3 files are in same folder:
  - index.html
  - styles.css
  - script.js
- Try opening in Chrome/Firefox

### Data disappeared?
- Cleared browser cache? Use Supabase for backup
- Check localStorage isn't full
- Try incognito mode to test

### Styles look weird?
- Hard refresh: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)
- Clear browser cache
- Try different browser

### Login not working?
- Any email/password combo works in demo
- For real auth, connect to Supabase

## 🚀 Next Steps

### Short term (24 hours)
1. ✅ Try the app locally
2. ✅ Create some test tasks
3. ✅ Deploy to Vercel

### Medium term (this week)
1. Add real database (Supabase)
2. Share with friends
3. Customize colors/branding

### Long term (ongoing)
1. Add task reminders
2. Recurring task automation
3. Export to PDF
4. Collaborate with others

## 📖 Documentation

| File | Purpose |
|------|---------|
| [README.md](README.md) | Full feature documentation |
| [DEPLOYMENT.md](DEPLOYMENT.md) | How to deploy (Vercel, Netlify, etc.) |
| [SUPABASE_INTEGRATION.md](SUPABASE_INTEGRATION.md) | How to add real database |
| [QUICK_START.md](QUICK_START.md) | This file |

## 💬 Features Summary

| Feature | Status |
|---------|--------|
| Login/Signup | ✅ Complete |
| Categories | ✅ Complete |
| Tasks (CRUD) | ✅ Complete |
| Auto-Priority | ✅ Complete |
| Today View | ✅ Complete |
| Calendar View | ✅ Complete |
| Recurring Tasks | ✅ Set (UI ready) |
| Data Sync | ⏳ Optional (add Supabase) |
| Notifications | ⏳ Future |
| Mobile App | ⏳ Future |
| Team Collab | ⏳ Future |

## 🎓 Learning Resources

### Frontend
- [MDN JavaScript Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [LocalStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

### Backend
- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Basics](https://www.postgresql.org/docs/)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

### Deployment
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com/)
- [GitHub Pages](https://pages.github.com/)

## 🎉 You're All Set!

Your task manager is ready to use:
1. Open `index.html` ✅
2. Sign up with test account ✅
3. Start managing tasks ✅
4. Deploy to web (optional) ✅

**Questions?** Check the README.md or integration guides.

**Ready to deploy?** Follow [DEPLOYMENT.md](DEPLOYMENT.md)

**Want a real database?** Follow [SUPABASE_INTEGRATION.md](SUPABASE_INTEGRATION.md)

---

**Version**: 1.3 (Finalized)  
**Last Updated**: February 8, 2026  
**Author**: Dhruvi  
**Status**: ✅ Production Ready

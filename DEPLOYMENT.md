# Deployment Guide - Pastel Priority

This guide covers deploying the Pastel Priority Task Manager to various platforms.

## Vercel Deployment (Recommended)

Vercel is the perfect host for this project - fast, simple, and zero-configuration needed for static sites.

### Option 1: Using Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   cd "c:\Dhruvi\NJIT classes\junior\IS117\Task manager"
   vercel
   ```

3. **Follow prompts**:
   - Confirm project name
   - Select project root (current directory)
   - No build step needed (we're using vanilla JS)

4. **Your site is live!** 🎉
   - Vercel will give you a URL like `https://task-manager.vercel.app`

### Option 2: GitHub + Vercel Integration

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Pastel Priority Task Manager"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/task-manager.git
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to [https://vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your GitHub repository
   - Click "Deploy"

3. **Auto-deployments**:
   - Every push to `main` automatically deploys
   - Preview URLs for pull requests

## Alternative Hosting Options

### Netlify

1. **Sign up** at [https://netlify.com](https://netlify.com)
2. **Drag and drop** the project folder to deploy instantly
3. **Custom domain**: Add your domain in Netlify settings

### GitHub Pages

1. **Create repository**: `username.github.io`
2. **Push files**:
   ```bash
   git clone https://github.com/your-username/your-username.github.io.git
   cd your-username.github.io
   cp ../Task\ manager/* .
   git add .
   git commit -m "Pastel Priority Task Manager"
   git push
   ```
3. **Live at**: `https://your-username.github.io`

### Traditional Web Server (Apache, Nginx, etc.)

1. **Copy all three files** to your server:
   - `index.html`
   - `styles.css`
   - `script.js`

2. **No build or compilation needed** - they're already optimized

3. **For HTTPS**: Use Let's Encrypt or your provider's SSL

## Environment Variables (Supabase Integration)

Once you add a Supabase backend, create a `.env.local` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anonymous-key
```

## Performance Optimization Tips

### Before Deploying

1. **Minify JavaScript** (optional):
   ```bash
   npm install -g terser
   terser script.js -o script.min.js
   # Update index.html to use script.min.js
   ```

2. **Optimize images** (if you add images):
   - Use WebP format
   - Compress with TinyPNG or similar

3. **Bundle CSS** (optional):
   - Keep styles.css as-is for simplicity
   - Or use PostCSS for vendor prefixing

### Vercel Benefits

- **Global CDN**: Automatic worldwide distribution
- **Edge Functions**: Serverless functions (for future backend)
- **Preview URLs**: Test changes before merging
- **Analytics**: Built-in performance monitoring
- **SSL/TLS**: Automatic HTTPS
- **Zero Config**: Works out of the box

## Connecting Supabase Backend

Once deployed, integrate Supabase:

1. **Create Supabase project**:
   - Go to [https://supabase.com](https://supabase.com)
   - Create new project
   - Note your API URL and anonymous key

2. **Add environment variables in Vercel**:
   - Project Settings → Environment Variables
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

3. **Update script.js** to use API for authentication

## Custom Domain

### With Vercel

1. **Add domain**:
   - Vercel Project → Settings → Domains
   - Enter your custom domain (e.g., `pastelpriority.com`)

2. **Update DNS**:
   - Add Vercel's nameservers to your domain registrar
   - Or use CNAME records pointing to Vercel

3. **Auto-SSL**: Vercel handles certificates automatically

### With other hosts

- Follow your hosting provider's domain setup instructions
- Most provide one-click SSL setup

## Monitoring & Analytics

### Vercel Analytics (Free with hosting)

- Real-time usage dashboard
- Performance metrics
- Error tracking
- Traffic insights

Access in Vercel dashboard: Project → Analytics

## Troubleshooting

### "Cannot find X file" errors

Ensure all three files are in the same directory:
```
index.html
styles.css
script.js
```

### Styles not loading

Check the file paths in `index.html`:
```html
<link rel="stylesheet" href="styles.css">
<script src="script.js"></script>
```

Make sure they're relative paths (not absolute).

### Data not persisting

Verify browser localStorage is enabled:
- JavaScript console: `localStorage.setItem('test', 'works')`
- Check browser privacy settings

### Performance is slow

- Check browser DevTools → Network tab
- Verify files are being cached
- Look at Vercel Analytics for bottlenecks

## Backup & Version Control

### GitHub

```bash
# Initialize repository
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/task-manager.git
git push -u origin main

# Regular commits
git add .
git commit -m "Your message"
git push
```

### Local Backups

```bash
# Create backup folder
mkdir backups
cp -r . backups/2026-02-08-backup/
```

## Security Checklist

- [ ] Remove any real passwords or API keys before deploying
- [ ] Use environment variables for sensitive data
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Set up Row-Level Security on Supabase
- [ ] Test with different browsers
- [ ] Test on mobile devices
- [ ] Check for console errors in production

## Next Steps

1. **Deploy to Vercel** (takes 5 minutes)
2. **Share with friends**: Your URL is ready!
3. **Add Supabase backend** for real data persistence
4. **Implement notifications** (email/push)
5. **Add team collaboration** features

---

**Deployment Status**: ✅ Ready for production  
**Platform Recommendation**: Vercel (automatic updates, no configuration needed)

Questions? Check Vercel docs: https://vercel.com/docs

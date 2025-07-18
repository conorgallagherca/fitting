# 🚀 FitLingo Deployment Guide

This guide walks you through deploying FitLingo to production on Vercel with a PostgreSQL database.

## 📋 Pre-Deployment Checklist

### ✅ Development Requirements
- [ ] All tests passing (`npm test`)
- [ ] Build successful (`npm run build`)
- [ ] Environment variables configured
- [ ] Database schema ready
- [ ] API endpoints tested
- [ ] UI components responsive on mobile/desktop

### ✅ Production Setup Requirements
- [ ] Domain name chosen (optional)
- [ ] Database hosting selected (Supabase/Railway/PlanetScale)
- [ ] OpenAI API key obtained
- [ ] Google OAuth configured (recommended)
- [ ] Vercel account ready

## 🗄️ Database Setup

### Option 1: Supabase (Recommended)

1. **Create Supabase Project**
   ```bash
   # Go to https://supabase.com/dashboard
   # Create new project
   # Note the connection string
   ```

2. **Configure Database**
   ```sql
   -- Supabase automatically creates the database
   -- Connection string format:
   -- postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
   ```

### Option 2: Railway

1. **Create Railway Project**
   ```bash
   # Go to https://railway.app/new
   # Add PostgreSQL service
   # Get connection string from Variables tab
   ```

### Option 3: PlanetScale (MySQL)

1. **Create PlanetScale Database**
   ```bash
   # Go to https://app.planetscale.com/
   # Create database
   # Get connection string
   # Note: Requires schema adjustments for MySQL
   ```

## 🔐 OAuth Configuration

### Google OAuth Setup

1. **Google Cloud Console**
   ```
   1. Go to https://console.cloud.google.com/
   2. Create new project or select existing
   3. Enable Google+ API
   4. Create OAuth 2.0 credentials
   5. Add authorized domains:
      - http://localhost:3000 (development)
      - https://your-app.vercel.app (production)
   6. Save Client ID and Secret
   ```

2. **Authorized Redirect URIs**
   ```
   Development: http://localhost:3000/api/auth/callback/google
   Production: https://your-app.vercel.app/api/auth/callback/google
   ```

## 🌐 Vercel Deployment

### Step 1: Prepare Repository

```bash
# Ensure all changes are committed
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### Step 2: Connect to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure build settings:
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### Step 3: Configure Environment Variables

Add these environment variables in Vercel Dashboard:

```env
# Database
DATABASE_URL=your_database_connection_string

# NextAuth
NEXTAUTH_SECRET=your_generated_secret_key
NEXTAUTH_URL=https://your-app.vercel.app

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AI (Optional)
OPENAI_API_KEY=sk_your_openai_api_key

# Production Settings
NODE_ENV=production
```

### Step 4: Deploy

1. Click "Deploy" in Vercel
2. Wait for build to complete
3. Visit your deployed app
4. Test core functionality

## 🗃️ Database Migration

### Run Migrations on Production

```bash
# Option 1: Using Vercel CLI
npx vercel env pull .env.local
npx prisma migrate deploy

# Option 2: Using Prisma directly with production URL
DATABASE_URL="your_production_db_url" npx prisma migrate deploy
```

### Seed Production Database (Optional)

```bash
# Only run if you want sample data in production
DATABASE_URL="your_production_db_url" npx prisma db seed
```

## 🧪 Post-Deployment Testing

### ✅ Core Functionality Tests

1. **Authentication**
   - [ ] Sign up with email works
   - [ ] Sign in with email works
   - [ ] Google OAuth works
   - [ ] Sign out works
   - [ ] Protected routes redirect properly

2. **Workout Features**
   - [ ] Dashboard loads without errors
   - [ ] Generate workout button works
   - [ ] Complete workout flow works
   - [ ] History page displays data
   - [ ] Profile settings save properly

3. **Gamification**
   - [ ] Badges display correctly
   - [ ] Streak tracking works
   - [ ] Notifications appear (if enabled)
   - [ ] Progress charts render

4. **Performance**
   - [ ] Page load times < 3 seconds
   - [ ] Mobile responsiveness works
   - [ ] Dark mode toggle functions
   - [ ] No console errors

### 🐛 Common Issues & Solutions

**Issue: Database connection fails**
```bash
# Solution: Check DATABASE_URL format and network access
# Ensure database allows connections from Vercel IPs
```

**Issue: OAuth redirect mismatch**
```bash
# Solution: Update OAuth provider settings
# Add production domain to authorized URLs
```

**Issue: Environment variables not loading**
```bash
# Solution: Check Vercel environment variable settings
# Ensure all required variables are set
# Redeploy after adding variables
```

**Issue: Build fails**
```bash
# Solution: Check build logs in Vercel
# Common fixes:
# - Update package.json dependencies
# - Fix TypeScript errors
# - Ensure all imports are correct
```

## 📊 Monitoring & Analytics

### Health Monitoring

1. **Health Check Endpoint**
   ```
   https://your-app.vercel.app/api/health
   ```

2. **Vercel Analytics**
   - Enable in Vercel dashboard
   - Monitor page views and performance

3. **Error Tracking (Optional)**
   ```bash
   # Add Sentry for error monitoring
   npm install @sentry/nextjs
   ```

### Performance Monitoring

1. **Vercel Speed Insights**
   - Enable in project settings
   - Monitor Core Web Vitals

2. **Database Performance**
   - Monitor connection pooling
   - Check query performance
   - Set up alerts for downtime

## 🔒 Security Checklist

- [ ] NEXTAUTH_SECRET is cryptographically secure
- [ ] Database credentials are not exposed
- [ ] OAuth apps configured with correct domains
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] API routes have proper authentication
- [ ] Environment variables are not logged

## 📈 Post-Launch

### User Feedback Collection

1. **Analytics Setup**
   - Google Analytics (optional)
   - User behavior tracking
   - Feature usage metrics

2. **Feedback Mechanisms**
   - In-app feedback forms
   - Error reporting
   - User surveys

### Maintenance Tasks

- [ ] Monitor error rates
- [ ] Check database performance
- [ ] Update dependencies regularly
- [ ] Backup database regularly
- [ ] Monitor API usage (OpenAI)

## 🚀 Launch Announcement

```markdown
🎉 FitLingo is now live!

🏋️‍♂️ Your AI-powered fitness companion
🎯 Duolingo-style workout gamification
🤖 Personalized daily workouts
📊 Progress tracking and achievements

Try it now: https://your-app.vercel.app

#FitLingo #Fitness #AI #NextJS
```

## 📞 Support

### Getting Help

- **Documentation**: Check README.md for setup issues
- **GitHub Issues**: Report bugs and feature requests
- **Vercel Support**: For deployment-related issues
- **Database Support**: Contact your database provider

### Rollback Plan

If issues arise:

1. **Revert Deployment**
   ```bash
   # In Vercel dashboard, revert to previous deployment
   # Or redeploy from previous Git commit
   ```

2. **Database Rollback**
   ```bash
   # Restore from backup if available
   # Or manually fix data issues
   ```

---

**🎉 Congratulations! FitLingo is now production-ready!**

Your AI-powered fitness app is ready to help users build healthy habits and achieve their fitness goals. 
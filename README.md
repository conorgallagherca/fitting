# 🏋️‍♂️ FitLingo - Your AI Fitness Companion

A Duolingo-inspired fitness application that gamifies your workout journey with AI-powered exercise routines, progress tracking, and social motivation.

## 🚀 Features

### Core MVP Features
- **🤖 AI-Generated Workouts**: Personalized daily workouts created by OpenAI based on your fitness level and goals
- **📊 Progress Tracking**: Comprehensive analytics and charts using Recharts to visualize your fitness journey
- **🎯 Gamification System**: Earn achievements, maintain streaks, and level up your fitness journey
- **🔥 Daily Streaks**: Build consistency with daily workout tracking, just like language learning
- **🌙 Dark Mode**: Beautiful, accessible design with automatic dark mode support
- **📱 Mobile-First**: Responsive design optimized for all devices
- **🏆 Badge System**: Collect badges for milestones like 3-day streaks, 100 workouts, and comebacks
- **🔔 Smart Notifications**: Browser notifications for daily workout reminders and achievement celebrations
- **🎨 Modern UI**: Polished interface with loading states, error handling, and micro-interactions

### Technical Stack
- **Frontend**: Next.js 14+ with TypeScript and App Router
- **Styling**: Tailwind CSS with custom fitness theme (green/blue gradients)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js for secure user management with OAuth support
- **State Management**: Zustand for lightweight, efficient state handling
- **AI Integration**: OpenAI API for workout generation and fitness advice
- **Charts & Analytics**: Recharts for beautiful progress visualization
- **Testing**: Jest with React Testing Library for comprehensive unit tests
- **UI Components**: Custom component library with accessibility features

## 📁 Project Structure

```
fitlingo/
├── app/                    # Next.js 14 App Router
│   ├── layout.tsx         # Global layout with navigation and theme
│   ├── page.tsx           # Homepage with hero and features
│   ├── dashboard/         # Main dashboard pages
│   ├── profile/           # User profile and settings
│   ├── history/           # Workout history and analytics
│   └── globals.css        # Global styles and Tailwind imports
├── components/            # Reusable UI components
│   ├── Navbar.tsx         # Modern navigation with dark mode
│   ├── BadgeDisplay.tsx   # Gamification badges component
│   ├── LoadingSpinner.tsx # Various loading state components
│   └── ThemeProvider.tsx  # Theme provider for dark mode
├── lib/                   # Utility functions and configurations
│   ├── stores/            # Zustand state management stores
│   │   ├── dashboard-store.ts    # Dashboard and workout state
│   │   ├── profile-store.ts      # User profile management
│   │   ├── history-store.ts      # Workout history tracking
│   │   ├── gamification-store.ts # Badges and achievements
│   │   └── auth-store.ts         # Authentication state
│   ├── seed-workouts.ts   # Starter workouts for new users
│   ├── notification-utils.ts # Browser notification utilities
│   ├── prisma.ts          # Database client configuration
│   └── utils.ts           # Helper functions for UI and business logic
├── pages/api/             # Next.js API routes for backend functionality
│   ├── auth/              # NextAuth.js authentication endpoints
│   ├── generate-workout.ts # AI workout generation
│   ├── log-workout.ts     # Workout completion and feedback
│   ├── get-today-workout.ts # Daily workout retrieval
│   └── history.ts         # Workout history API
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Complete database schema
│   └── seed.ts           # Database seeding with sample data
├── __tests__/            # Test files
│   └── components/       # Component unit tests
├── public/               # Static assets
└── jest.setup.js         # Test configuration
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- OpenAI API key (optional for AI features)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/fitlingo.git
cd fitlingo
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/fitlingo"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# OAuth (optional but recommended)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI Integration (optional)
OPENAI_API_KEY="sk-your-openai-api-key"
```

### 4. Database Setup
```bash
# Create and migrate database
npx prisma migrate dev --name init

# Seed with sample data
npx prisma db seed
```

### 5. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🚀 Deployment Guide

### Vercel Deployment (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically on every push

3. **Environment Variables for Production**
   ```env
   DATABASE_URL="your-production-postgres-url"
   NEXTAUTH_SECRET="your-production-secret"
   NEXTAUTH_URL="https://your-app.vercel.app"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   OPENAI_API_KEY="your-openai-api-key"
   ```

### Database Hosting Options

1. **Supabase** (Recommended for PostgreSQL)
   - Free tier includes 500MB database
   - Built-in authentication features
   - Easy integration with Vercel

2. **PlanetScale** (MySQL alternative)
   - Serverless MySQL platform
   - Great for scaling applications

3. **Railway** (PostgreSQL)
   - Simple deployment
   - Good for development and small apps

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] OAuth providers configured with production URLs
- [ ] Error monitoring set up (optional: Sentry)
- [ ] Analytics configured (optional: Google Analytics)
- [ ] Domain configured
- [ ] SSL certificate enabled

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure
- **Unit Tests**: Component testing with React Testing Library
- **Integration Tests**: API route testing
- **E2E Tests**: Coming soon with Playwright

## 📖 API Documentation

### Authentication
All API routes require authentication via NextAuth.js sessions.

### Core Endpoints

#### `GET /api/get-today-workout`
Retrieves today's workout for the authenticated user.

**Response:**
```json
{
  "workout": {
    "id": "workout-id",
    "routine": [...],
    "workoutType": "strength",
    "completed": false,
    "date": "2024-01-01"
  },
  "userStats": {
    "streak": 5,
    "totalWorkouts": 25,
    "level": 2
  }
}
```

#### `POST /api/generate-workout`
Generates a new AI-powered workout based on user profile.

**Request:**
```json
{
  "forceRegenerate": false
}
```

#### `POST /api/log-workout`
Logs workout completion and user feedback.

**Request:**
```json
{
  "workoutId": "workout-id",
  "exercises": [...],
  "feedback": {
    "difficulty": 4,
    "enjoyment": 5,
    "energy": 3,
    "notes": "Great workout!"
  },
  "completionPercentage": 100,
  "totalDuration": 45
}
```

#### `GET /api/history`
Retrieves workout history with optional filtering.

**Query Parameters:**
- `startDate`: Filter by start date (ISO string)
- `endDate`: Filter by end date (ISO string)
- `limit`: Number of workouts to return
- `includeIncomplete`: Include incomplete workouts

## 🎮 Gamification System

### Badge Types
- **Streak Badges**: 3, 7, 14, 30, 100 day streaks
- **Volume Badges**: 10, 50, 100 total workouts
- **Special Badges**: First workout, comeback after break

### Notification System
- Daily workout reminders
- Achievement celebrations
- Streak milestone alerts
- Customizable notification preferences

## 🛠️ Development

### Key Features in Development
- Social features (friend connections, challenges)
- Nutrition tracking integration
- Wearable device sync
- Advanced analytics dashboard
- Workout video demonstrations

### Contributing
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Style
- TypeScript for type safety
- ESLint + Prettier for code formatting
- Conventional commits for git history
- Component-driven development

## 📱 Mobile App
Coming soon! React Native version in development.

## 🤝 Support

### Getting Help
- [GitHub Issues](https://github.com/yourusername/fitlingo/issues)
- [Documentation](https://fitlingo-docs.vercel.app)
- [Discord Community](https://discord.gg/fitlingo)

### Reporting Bugs
Please include:
- OS and browser version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Duolingo's habit-forming design
- OpenAI for AI workout generation
- Next.js team for the amazing framework
- Tailwind CSS for beautiful styling
- All contributors and beta testers

---

**Built with ❤️ for the fitness community**

*Transform your fitness journey with AI-powered workouts and Duolingo-style motivation.*

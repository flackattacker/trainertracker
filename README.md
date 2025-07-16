# Trainer Tracker

A comprehensive fitness training management system built with Next.js, featuring AI-powered program generation, client management, and progress tracking aligned with the NASM OPT model.

## 🚀 Features

### Core Functionality
- **🔐 Authentication System** - JWT-based user registration and login
- **👥 Client Management** - Complete CRUD operations for client profiles
- **📋 Assessment Tracking** - PARQ, movement assessments, and health evaluations
- **🏋️ AI Program Generation** - OPT model-aligned training plans with real exercises
- **📊 Progress Tracking** - Integrated progress updates tied to training plans
- **💪 Exercise Database** - 200+ exercises with proper acute variables
- **📄 Export Functionality** - PDF reports for clients and programs
- **🎨 Professional UI** - Responsive, modern design with excellent UX

### Training Features
- **OPT Model Integration** - Full NASM Optimum Performance Training model support
- **Phase-Based Programming** - Stabilization, Strength, and Power phases
- **Exercise Progression** - Systematic exercise advancement with acute variables
- **Progress Monitoring** - Three types of progress tracking (General, Workout, Assessment)
- **Training Plan Display** - Detailed workout plans with exercises and parameters

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **CSS Modules** - Scoped styling
- **Turbopack** - Fast development builds

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Database management and migrations
- **SQLite** - Development database (easily switchable to PostgreSQL/MySQL)
- **JWT Authentication** - Secure token-based auth

### AI & Data
- **OpenAI Integration** - AI-powered program generation
- **Comprehensive Exercise Database** - 200+ exercises with acute variables
- **OPT Model Compliance** - NASM-aligned training methodology

### Development Tools
- **Turborepo** - Monorepo management
- **ESLint** - Code quality and consistency
- **TypeScript Config** - Shared type definitions

## 📁 Project Structure

```
trainer-tracker/
├── apps/
│   ├── api/                 # Backend API (Next.js)
│   │   ├── prisma/         # Database schema and migrations
│   │   ├── src/app/api/    # API routes
│   │   └── src/lib/        # Exercise database and utilities
│   ├── web/                # Frontend application (Next.js)
│   │   ├── app/           # App Router pages and components
│   │   └── src/           # Shared components and utilities
│   └── docs/               # Documentation site
├── packages/
│   ├── eslint-config/      # Shared ESLint configuration
│   ├── typescript-config/  # Shared TypeScript configuration
│   └── ui/                # Shared UI components
└── turbo.json             # Turborepo configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd trainer-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cd apps/api
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-secret-key"
   OPENAI_API_KEY="your-openai-key"
   ```

4. **Set up the database**
   ```bash
   cd apps/api
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Start the development servers**
   ```bash
   npm run dev
   ```

### Access Points
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **Documentation**: http://localhost:3002

## 📊 Database Schema

### Core Entities
- **Users** - Trainer accounts with authentication
- **Clients** - Client profiles and information
- **Assessments** - Health and movement evaluations
- **Programs** - Training programs with OPT phases
- **Progress** - Progress tracking and updates

### Key Features
- **Multi-tenant** - Each trainer has isolated data
- **Relational** - Proper foreign key relationships
- **Flexible** - JSON fields for complex data structures
- **Auditable** - Created/updated timestamps

## 🎯 Training System

### OPT Model Integration
The system follows the NASM Optimum Performance Training model:

1. **Stabilization Endurance** - Foundation and movement quality
2. **Strength Endurance** - Muscular endurance and strength
3. **Muscular Development** - Muscle growth and development
4. **Maximal Strength** - Peak strength development
5. **Power** - Explosive strength and performance

### AI Program Generation
- **Client Assessment Integration** - Uses client data for personalized programs
- **Exercise Selection** - Real exercises with proper acute variables
- **Progression Planning** - Systematic advancement through phases
- **Training Parameters** - Sets, reps, rest periods, and intensity

### Progress Tracking
Three types of progress updates:
- **General Progress** - Weight, body composition, general notes
- **Workout Performance** - Exercise-specific performance tracking
- **Assessment Results** - Structured evaluation updates

## 🔧 Development

### Available Scripts
```bash
# Development
npm run dev          # Start all development servers
npm run build        # Build all applications
npm run lint         # Lint all packages
npm run type-check   # Type check all packages

# Database
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio
```

### Adding New Features
1. **API Routes** - Add to `apps/api/src/app/api/`
2. **Frontend Components** - Add to `apps/web/app/` or `apps/web/src/`
3. **Database Changes** - Update `apps/api/prisma/schema.prisma`
4. **Shared Code** - Add to `packages/` for reusable components

## 🚀 Deployment

### Environment Setup
- Set production environment variables
- Configure database connection
- Set up OpenAI API key
- Configure JWT secret

### Build and Deploy
```bash
npm run build
# Deploy to your preferred platform (Vercel, Netlify, etc.)
```

## 📈 Roadmap

### Planned Enhancements
- [ ] **Mobile App** - React Native companion app
- [ ] **Advanced Analytics** - Progress visualization and insights
- [ ] **Nutrition Tracking** - Meal planning and macro tracking
- [ ] **Social Features** - Client-trainer communication
- [ ] **Video Integration** - Exercise demonstration videos
- [ ] **Calendar Integration** - Scheduling and session management
- [ ] **Payment Processing** - Subscription and billing management
- [ ] **Multi-language Support** - Internationalization

### Technical Improvements
- [ ] **Performance Optimization** - Caching and optimization
- [ ] **Testing Suite** - Unit and integration tests
- [ ] **CI/CD Pipeline** - Automated testing and deployment
- [ ] **Monitoring** - Error tracking and performance monitoring
- [ ] **Security Audit** - Comprehensive security review

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation at `/docs`
- Review the API documentation

---

**Built with ❤️ for fitness professionals**

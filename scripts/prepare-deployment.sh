#!/bin/bash

# Trainer Tracker Deployment Preparation Script
# This script helps prepare the monorepo for deployment to Render

set -e

echo "🚀 Preparing Trainer Tracker for Render Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "turbo.json" ]; then
    print_error "This script must be run from the root of the Trainer Tracker project"
    exit 1
fi

# Create deployment directories
print_status "Creating deployment directories..."

# API Repository
print_status "Preparing API repository..."
mkdir -p ../trainer-tracker-api
cp -r apps/api/* ../trainer-tracker-api/
cp -r packages ../trainer-tracker-api/
cp apps/api/package.json ../trainer-tracker-api/
cp apps/api/next.config.ts ../trainer-tracker-api/
cp apps/api/tsconfig.json ../trainer-tracker-api/
cp apps/api/env.example ../trainer-tracker-api/.env.example
cp -r apps/api/prisma ../trainer-tracker-api/

# Create API package.json
cat > ../trainer-tracker-api/package.json << 'EOF'
{
  "name": "trainer-tracker-api",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev --port 3001",
    "build": "next build",
    "start": "next start -p $PORT",
    "lint": "next lint --max-warnings 0",
    "check-types": "tsc --noEmit",
    "seed": "tsx prisma/seed.ts",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate deploy",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^6.12.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "lucide-react": "^0.525.0",
    "next": "^15.4.0-canary.116",
    "openai": "^5.9.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "pg": "^8.11.3"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.2",
    "@types/jsonwebtoken": "^9.0.7",
    "@types/node": "^22.15.3",
    "@types/react": "19.1.0",
    "@types/react-dom": "19.1.1",
    "client-only": "^0.0.1",
    "electron-to-chromium": "^1.5.183",
    "eslint": "^9.30.0",
    "picocolors": "^1.1.1",
    "prisma": "^6.12.0",
    "tsx": "^4.20.3",
    "typescript": "5.8.2"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

# Web Repository
print_status "Preparing Web repository..."
mkdir -p ../trainer-tracker-web
cp -r apps/web/* ../trainer-tracker-web/
cp -r packages ../trainer-tracker-web/
cp apps/web/package.json ../trainer-tracker-web/
cp apps/web/next.config.js ../trainer-tracker-web/
cp apps/web/tsconfig.json ../trainer-tracker-web/
cp apps/web/tailwind.config.js ../trainer-tracker-web/
cp apps/web/postcss.config.js ../trainer-tracker-web/

# Create Web package.json
cat > ../trainer-tracker-web/package.json << 'EOF'
{
  "name": "trainer-tracker-web",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack --port 3000",
    "build": "next build",
    "start": "next start -p $PORT",
    "lint": "next lint --max-warnings 0",
    "check-types": "tsc --noEmit"
  },
  "dependencies": {
    "@repo/ui": "*",
    "lucide-react": "^0.525.0",
    "next": "^15.3.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.54.1",
    "@repo/eslint-config": "*",
    "@repo/typescript-config": "*",
    "@types/node": "^22.15.3",
    "@types/react": "19.1.0",
    "@types/react-dom": "19.1.1",
    "autoprefixer": "^10.4.21",
    "client-only": "^0.0.1",
    "electron-to-chromium": "^1.5.183",
    "eslint": "^9.30.0",
    "picocolors": "^1.1.1",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.4.17",
    "typescript": "5.8.2"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

# Copy deployment files
cp DEPLOYMENT.md ../trainer-tracker-api/
cp DEPLOYMENT.md ../trainer-tracker-web/

# Create .gitignore files
cat > ../trainer-tracker-api/.gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Next.js
.next/
out/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Database
*.db
*.db-journal

# Logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
EOF

cp ../trainer-tracker-api/.gitignore ../trainer-tracker-web/

# Create README files
cat > ../trainer-tracker-api/README.md << 'EOF'
# Trainer Tracker API

This is the API service for the Trainer Tracker application, deployed on Render.

## Environment Variables

Required environment variables for deployment:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `OPENAI_API_KEY`: OpenAI API key for AI features
- `NODE_ENV`: Set to "production"
- `PORT`: Port number (Render will set this)

## Development

```bash
npm install
npm run dev
```

## Deployment

This service is configured for deployment on Render. See DEPLOYMENT.md for details.
EOF

cat > ../trainer-tracker-web/README.md << 'EOF'
# Trainer Tracker Web

This is the web frontend for the Trainer Tracker application, deployed on Render.

## Environment Variables

Required environment variables for deployment:

- `NEXT_PUBLIC_API_URL`: URL of the API service
- `NODE_ENV`: Set to "production"
- `PORT`: Port number (Render will set this)

## Development

```bash
npm install
npm run dev
```

## Deployment

This service is configured for deployment on Render. See DEPLOYMENT.md for details.
EOF

print_status "✅ Deployment preparation complete!"

print_warning "Next steps:"
echo "1. Create new GitHub repositories for each service"
echo "2. Push the prepared code to the new repositories"
echo "3. Follow the DEPLOYMENT.md guide to deploy on Render"
echo ""
echo "API repository: ../trainer-tracker-api"
echo "Web repository: ../trainer-tracker-web"

print_status "Remember to:"
echo "- Set up PostgreSQL database on Render"
echo "- Configure environment variables"
echo "- Run database migrations after deployment" 
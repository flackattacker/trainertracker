# 🚀 Render Deployment Guide

This guide will help you deploy the Trainer Tracker application to Render.

## 📋 Prerequisites

- GitHub account
- Render account
- OpenAI API key (for AI features)

## 🗄️ Database Setup

### 1. Create PostgreSQL Database on Render

1. Go to your Render dashboard
2. Click "New" → "PostgreSQL"
3. Configure:
   - **Name**: `trainer-tracker-db`
   - **Database**: `trainer_tracker`
   - **User**: `trainer_tracker_user`
   - **Plan**: Starter (Free tier)
4. Click "Create Database"
5. Copy the **Internal Database URL** (you'll need this later)

## 🔧 Repository Setup

### 1. Create Separate Repositories

You'll need to create two separate GitHub repositories:

#### API Repository
```bash
# Create new repo for API
git clone <your-current-repo> trainer-tracker-api
cd trainer-tracker-api
# Remove web app and docs
rm -rf apps/web apps/docs
# Update package.json to remove web dependencies
# Push to new repo
```

#### Web Repository
```bash
# Create new repo for web app
git clone <your-current-repo> trainer-tracker-web
cd trainer-tracker-web
# Remove API app and docs
rm -rf apps/api apps/docs
# Update package.json to remove API dependencies
# Push to new repo
```

### 2. Update Package.json Files

#### API Repository (apps/api/package.json)
```json
{
  "name": "trainer-tracker-api",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev --port 3001",
    "build": "next build",
    "start": "next start -p $PORT",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate deploy"
  }
}
```

#### Web Repository (apps/web/package.json)
```json
{
  "name": "trainer-tracker-web",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start -p $PORT"
  }
}
```

## 🚀 Deploy to Render

### 1. Deploy API Service

1. Go to Render dashboard
2. Click "New" → "Web Service"
3. Connect your API GitHub repository
4. Configure:
   - **Name**: `trainer-tracker-api`
   - **Environment**: Node
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: Starter (Free tier)

#### Environment Variables (API)
```
NODE_ENV=production
DATABASE_URL=<your-postgresql-internal-url>
JWT_SECRET=<generate-a-secure-jwt-secret>
NEXTAUTH_SECRET=<same-as-jwt-secret>
NEXTAUTH_URL=https://trainer-tracker-api.onrender.com
OPENAI_API_KEY=<your-openai-api-key>
```

### 2. Deploy Web Service

1. Go to Render dashboard
2. Click "New" → "Web Service"
3. Connect your Web GitHub repository
4. Configure:
   - **Name**: `trainer-tracker-web`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: Starter (Free tier)

#### Environment Variables (Web)
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://trainer-tracker-api.onrender.com
NEXTAUTH_SECRET=<same-as-jwt-secret>
NEXTAUTH_URL=https://trainer-tracker-web.onrender.com
```

## 🔄 Database Migration

### 1. Run Database Migrations

After the API service is deployed:

1. Go to your API service on Render
2. Click "Shell"
3. Run the following commands:
```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

### 2. Verify Database Connection

Check the health endpoint: `https://trainer-tracker-api.onrender.com/api/health`

## 🌐 Domain Configuration

### 1. Custom Domains (Optional)

1. Go to your Render service
2. Click "Settings" → "Custom Domains"
3. Add your domain and configure DNS

### 2. Update CORS Settings

If using custom domains, update the API CORS settings in your environment variables.

## 🔍 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (requires >=18)
   - Verify all dependencies are in package.json
   - Check build logs for specific errors

2. **Database Connection Issues**
   - Verify DATABASE_URL is correct
   - Ensure database is accessible from Render
   - Check Prisma migrations are up to date

3. **Environment Variables**
   - Verify all required variables are set
   - Check variable names match exactly
   - Ensure sensitive data is properly secured

### Health Checks

- API Health: `https://trainer-tracker-api.onrender.com/api/health`
- Web Health: `https://trainer-tracker-web.onrender.com`

## 📊 Monitoring

### Render Metrics
- Monitor service uptime in Render dashboard
- Check build and deployment logs
- Monitor database performance

### Application Logs
- View logs in Render dashboard
- Set up external logging if needed
- Monitor error rates and performance

## 🔒 Security Considerations

1. **Environment Variables**
   - Never commit secrets to Git
   - Use Render's secure environment variable storage
   - Rotate JWT secrets regularly

2. **Database Security**
   - Use Render's managed PostgreSQL
   - Enable SSL connections
   - Regular backups

3. **API Security**
   - Implement rate limiting
   - Use HTTPS only
   - Validate all inputs

## 🚀 Post-Deployment

### 1. Test All Features
- User registration and login
- Program creation and management
- Client portal functionality
- AI features (if enabled)

### 2. Performance Optimization
- Monitor load times
- Optimize database queries
- Implement caching if needed

### 3. Backup Strategy
- Set up automated database backups
- Document recovery procedures
- Test restore processes

## 📞 Support

For issues with:
- **Render Platform**: Contact Render support
- **Application**: Check logs and GitHub issues
- **Database**: Use Render's database management tools

---

**Note**: This deployment guide assumes you're using the free tier of Render. For production applications, consider upgrading to paid plans for better performance and support. 
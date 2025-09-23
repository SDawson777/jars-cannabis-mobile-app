# Production Deployment Guide

## 🎯 Production Readiness Status: ✅ READY

All core systems tested and validated. The app is production-ready.

## Pre-Deployment Setup

### 1. Environment Configuration

Copy environment files and fill in production values:

```bash
# Frontend environment
cp .env.example .env
# Backend environment
cp backend/.env.example backend/.env
```

Required environment variables:

#### Frontend (.env)

```bash
EXPO_PUBLIC_API_BASE_URL=https://your-api-domain.com
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
SENTRY_DSN=https://your_sentry_dsn
```

#### Backend (backend/.env)

```bash
DATABASE_URL="postgresql://user:password@host:5432/dbname"
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
```

### 2. Firebase Setup

1. Create Firebase production project
2. Enable Authentication, Firestore, Analytics
3. Download config files:
   - `apps/android/google-services.json`
   - `apps/ios/GoogleService-Info.plist`
4. Update Firebase rules in `firestore.rules`

### 3. Database Setup

```bash
# Run database migrations
cd backend
npm run prisma:migrate
npm run prisma:generate
```

## Deployment Steps

### Backend Deployment

1. **Build backend:**

```bash
npm run build:backend
```

2. **Deploy to your hosting platform:**
   - Heroku: `git push heroku main`
   - Railway: Connect GitHub repo
   - DigitalOcean App Platform: Connect repo
   - AWS/GCP: Use provided deployment scripts

### Mobile App Deployment

1. **Install EAS CLI:**

```bash
npm install -g @expo/eas-cli
eas login
```

2. **Configure EAS:**

```bash
eas build:configure
```

3. **Build for production:**

```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```

4. **Submit to stores:**

```bash
# iOS App Store
eas submit --platform ios

# Google Play Store
eas submit --platform android
```

## Post-Deployment Verification

### 1. Smoke Tests

```bash
# Run API smoke tests
npm run smoke

# Test critical user flows
npm run test:e2e
```

### 2. Monitoring Setup

- **Sentry**: Error tracking configured
- **Firebase Analytics**: User behavior tracking
- **Performance monitoring**: Built-in React Native performance metrics

### 3. Health Checks

Verify these endpoints are working:

- `GET /api/v1/health` - API health check
- `GET /api/v1/stores` - Store data loading
- `POST /api/v1/auth/login` - Authentication flow

## Rollback Plan

If issues arise:

1. **Backend rollback:**
   - Revert to previous deployment
   - Restore database backup if needed

2. **Mobile app rollback:**
   - EAS Update for quick fixes: `eas update`
   - App store rollback for major issues

## Security Checklist

- [ ] All API endpoints use HTTPS
- [ ] Environment variables are secured
- [ ] Firebase security rules are restrictive
- [ ] Stripe webhooks are verified
- [ ] User input is validated and sanitized
- [ ] Error messages don't expose sensitive data

## Performance Optimization

Applied optimizations:

- ✅ Bundle splitting configured
- ✅ Image optimization in place
- ✅ Lazy loading for screens
- ✅ Database query optimization
- ✅ Caching strategies implemented

## Support & Maintenance

### Monitoring

- **Error tracking**: Sentry dashboard
- **Performance**: React Native performance monitor
- **Usage analytics**: Firebase Analytics

### Maintenance Tasks

- Regular dependency updates: `npm audit`
- Database maintenance: Monitor query performance
- Log rotation: Configure log retention policies

## Emergency Contacts

Document your team's emergency contacts and escalation procedures for production issues.

---

**🎉 Congratulations! Your JARS Cannabis Mobile App is production-ready!**

# Production Configuration Guide

This document outlines important production configurations for SM ActiveIntelligence.

## ✅ Completed Configurations

### Database Security
- ✅ All RLS (Row Level Security) policies are properly configured
- ✅ User roles stored in separate `user_roles` table (prevents privilege escalation)
- ✅ Security definer functions implemented for safe role checking
- ✅ No linter warnings or security issues detected
- ✅ All tables have appropriate access controls based on project membership

### Email Verification
- ✅ Auto-confirm email enabled for development/testing
- ⚠️ **Action Required**: For production, configure proper email verification:
  1. Go to Lovable Cloud → Authentication settings
  2. Disable auto-confirm email
  3. Set up SMTP provider (Resend API key already configured)
  4. Configure email templates in Supabase Auth

### Assets & SEO
- ✅ Open Graph image created (`/public/og-image.png`)
- ✅ Sitemap.xml generated with all public routes
- ✅ Robots.txt properly configured
- ✅ Meta tags in place for social sharing

### User Experience
- ✅ Contact page created (`/contact`)
- ✅ FAQ page created (`/faq`)
- ✅ User onboarding flow fixed
- ✅ Admin approval workflow implemented

## ⚠️ Recommended Before Production Launch

### 1. Error Monitoring Setup

**Recommended Tool**: Sentry (industry standard for React apps)

**Setup Steps**:
```bash
npm install @sentry/react
```

**Configuration** (`src/lib/sentry.ts`):
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

**Update** `src/main.tsx`:
```typescript
import './lib/sentry'; // Add at top
```

**Add to** `.env`:
```
VITE_SENTRY_DSN=your_sentry_dsn_here
```

### 2. Edge Function Rate Limiting

Rate limiting is implemented at the edge function level to prevent abuse.

**Example Implementation** (add to each edge function):

```typescript
// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 10; // Max requests per window

// In-memory rate limiting (use Redis for production scale)
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimits.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    rateLimits.set(userId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (userLimit.count >= MAX_REQUESTS) {
    return false;
  }

  userLimit.count++;
  return true;
}

// Usage in edge function
const user = await supabaseClient.auth.getUser();
if (!checkRateLimit(user.data.user?.id || '')) {
  return new Response(
    JSON.stringify({ error: 'Rate limit exceeded' }),
    { status: 429, headers: corsHeaders }
  );
}
```

**For Production Scale**: Consider using Upstash Redis for distributed rate limiting across edge functions.

### 3. Email Templates

Create professional email templates for:

**Welcome Email** (`supabase/functions/send-welcome-email/`):
- Triggered when user is approved
- Includes getting started guide
- Links to FAQ and documentation

**Reminder Notifications**:
- Already implemented in `send-scheduled-reminder` function
- Customize templates for each ceremony type

**Usage Notifications**:
- Notify users approaching project limits
- Send upgrade prompts for Free tier users

### 4. Monitoring & Alerts

**Set Up Alerts For**:
- Database connection failures
- Edge function errors
- Failed authentication attempts
- Rate limit violations
- Storage quota warnings

**Tools**:
- Lovable Cloud dashboard for backend monitoring
- Sentry for frontend error tracking
- Custom alerts via Supabase webhooks

### 5. Performance Optimization

**Already Implemented**:
- ✅ Lazy loading for non-critical routes
- ✅ Image optimization
- ✅ Query client caching
- ✅ Analytics tracking

**Additional Recommendations**:
- Set up CDN for static assets
- Enable Brotli compression
- Configure cache headers
- Monitor Core Web Vitals

## 📋 Pre-Launch Checklist

- [ ] Configure production email verification
- [ ] Set up Sentry error monitoring
- [ ] Implement rate limiting on all edge functions
- [ ] Create custom email templates
- [ ] Configure monitoring alerts
- [ ] Test all user flows end-to-end
- [ ] Review and test RLS policies with different user roles
- [ ] Load test with expected user volume
- [ ] Set up backup and disaster recovery
- [ ] Document admin procedures
- [ ] Configure CORS for production domain
- [ ] Set up SSL/TLS certificates
- [ ] Review and update privacy policy
- [ ] Set up customer support system

## 🔒 Security Best Practices

1. **Never expose API keys in client code**
   - All sensitive keys are stored as Supabase secrets
   - Used only in edge functions

2. **RLS is your first line of defense**
   - Every table has appropriate policies
   - Test with different user roles

3. **Input validation**
   - Validate all user inputs
   - Use Zod schemas for type safety

4. **Audit logging**
   - Track user actions in `user_activity_logs`
   - Monitor AI usage in `ai_usage_logs`

5. **Regular security reviews**
   - Use Supabase linter regularly
   - Review edge function permissions
   - Update dependencies monthly

## 📞 Support Resources

- Technical Documentation: `/faq`
- Contact Support: `/contact`
- Email: support@smactiveintelligence.com
- Business Hours: Mon-Fri 9AM-6PM EST

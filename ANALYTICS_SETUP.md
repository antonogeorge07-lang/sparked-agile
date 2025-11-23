# Analytics System Setup Guide

## Current Status: Ready but Inactive

The analytics system is fully integrated throughout the application but is currently not sending data to any analytics provider.

## What's Already Integrated

✅ **Analytics Provider** - Wraps the entire app (`src/components/AnalyticsProvider.tsx`)
✅ **Page View Tracking** - Automatically tracks route changes
✅ **User Identification** - Tracks authenticated users
✅ **Event Tracking** - Available via `useAnalytics()` hook
✅ **Landing Page Integration** - Tracks button clicks and interactions

## Events Currently Tracked

When a provider is configured, the following events are tracked:

- **Page Views** - Automatic tracking on route change
- **Button Clicks** - User interactions with CTAs
- **User Signup/Login** - Conversion tracking
- **Feature Usage** - Which features users engage with
- **Integration Connections** - When users connect third-party services
- **Search Queries** - What users search for
- **Errors** - Technical issues and error tracking

## How to Activate Analytics

### Option 1: Google Analytics (Currently Configured)

1. **Get Google Analytics Measurement ID**
   - Go to [Google Analytics](https://analytics.google.com)
   - Create a property or use existing one
   - Copy your Measurement ID (format: `G-XXXXXXXXXX`)

2. **Add to Environment Variables**
   - In Lovable Cloud: Go to Settings → Secrets
   - Add new secret: `VITE_GA_MEASUREMENT_ID`
   - Paste your Measurement ID

3. **Deploy**
   - Frontend changes require clicking "Update" in publish dialog
   - Analytics will start tracking immediately after deployment

### Option 2: Alternative Providers (Mixpanel, Amplitude, etc.)

1. **Install Provider SDK**
   ```bash
   npm install [provider-sdk]
   ```

2. **Update `src/lib/analytics.ts`**
   - Replace Google Analytics implementation with your provider's SDK
   - Maintain the same interface for compatibility

3. **Configure Secrets**
   - Add provider API keys to Lovable Cloud secrets
   - Update `.env.example` with new variable names

## Files Involved

- `src/lib/analytics.ts` - Core analytics service
- `src/hooks/useAnalytics.ts` - React hook for components
- `src/components/AnalyticsProvider.tsx` - App-wide provider
- `src/components/landing/HeroSection.tsx` - Landing page tracking
- `src/pages/Landing.tsx` - Landing page events

## Data Privacy & GDPR

The system is configured with privacy in mind:
- IP anonymization enabled by default
- No tracking until provider is configured
- User consent handled via `PrivacyBanner` component
- User data tracked only when authenticated

## Testing Analytics

Once configured, test by:
1. Opening browser DevTools → Console
2. Look for "Analytics: [event type] tracked" logs
3. Check your analytics dashboard (may take 24-48 hours for data to appear)

## Removing Analytics

If you decide not to use analytics:
1. Remove `<AnalyticsProvider>` from `src/main.tsx`
2. Remove analytics imports from components
3. Delete `src/lib/analytics.ts`, `src/hooks/useAnalytics.ts`, `src/components/AnalyticsProvider.tsx`

## Performance Impact

- **Before Configuration**: Zero impact (no external scripts loaded)
- **After Configuration**: ~10KB additional payload (Google Analytics script)
- Page load performance: No noticeable impact due to async loading

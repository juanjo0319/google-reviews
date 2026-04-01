# RevUp.ai Launch Checklist

## DNS & Domain

- [ ] Custom domain configured in Railway (revup-ai.com or similar)
- [ ] SSL certificate provisioned and active
- [ ] www subdomain redirects to apex (or vice versa)
- [ ] DNS propagation verified (`dig` or dnschecker.org)
- [ ] Old domain redirects in place (if migrating)

## Analytics & Tracking

- [ ] Google Analytics 4 property created and `NEXT_PUBLIC_GA_MEASUREMENT_ID` set
- [ ] PostHog project created and `NEXT_PUBLIC_POSTHOG_KEY` set
- [ ] Google Search Console property verified (`NEXT_PUBLIC_GOOGLE_VERIFICATION` set)
- [ ] Sitemap submitted to Google Search Console
- [ ] Verify real-time data flowing in GA4
- [ ] Verify events firing in PostHog
- [ ] Sentry project configured (`SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`, `NEXT_PUBLIC_SENTRY_DSN`)

## Social & Marketing

- [ ] Twitter/X profile created and linked from site
- [ ] LinkedIn company page created
- [ ] Product Hunt launch page drafted
- [ ] G2 product listing submitted
- [ ] Capterra product listing submitted
- [ ] Open Graph images generated for all key pages
- [ ] Social sharing tested (paste URL in Twitter, LinkedIn, Slack)
- [ ] Launch announcement post drafted for each platform

## Technical

- [ ] All environment variables set in Railway production environment
- [ ] `npm run build` completes without errors
- [ ] Health check endpoint (`/api/health`) returns 200
- [ ] Custom 404 page renders correctly
- [ ] Global error boundary (`global-error.tsx`) catches and reports errors
- [ ] Cookie consent banner functional
- [ ] CORS configured correctly for API routes
- [ ] Rate limiting in place for public API endpoints
- [ ] Database migrations applied to production Supabase
- [ ] Stripe webhook endpoint configured and verified
- [ ] Email sending works via Resend (test a signup flow)
- [ ] Google OAuth flow works end-to-end in production
- [ ] Standalone output deploys correctly (`node .next/standalone/server.js`)

## SEO

- [ ] Unique `<title>` and `<meta name="description">` on every page
- [ ] `sitemap.xml` generated and accessible
- [ ] `robots.txt` allows crawling of public pages
- [ ] JSON-LD structured data on homepage and key landing pages
- [ ] Canonical URLs set on all pages
- [ ] No broken internal links (run a crawler like Screaming Frog or `npx broken-link-checker`)
- [ ] Favicon set (including apple-touch-icon, manifest icons)
- [ ] Alt text on all images
- [ ] Heading hierarchy is logical (one H1 per page)

## Performance

- [ ] Lighthouse Performance score >= 90
- [ ] Lighthouse Accessibility score >= 90
- [ ] Lighthouse Best Practices score >= 90
- [ ] Lighthouse SEO score >= 90
- [ ] Core Web Vitals passing (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] Images served in AVIF/WebP with proper sizing
- [ ] No render-blocking resources in critical path
- [ ] Bundle size reviewed (`npx @next/bundle-analyzer`)

## Legal

- [ ] Privacy Policy page published and linked in footer
- [ ] Terms of Service page published and linked in footer
- [ ] Cookie consent mechanism compliant with GDPR/CCPA
- [ ] Data processing agreement ready for enterprise customers
- [ ] GDPR: data export and deletion flows tested
- [ ] Contact/support email configured and monitored

## Content

- [ ] All marketing copy proofread (no typos, consistent tone)
- [ ] Pricing page accurate and matches Stripe product config
- [ ] Contact email works and reaches the team
- [ ] Screenshots and demo content are up to date
- [ ] FAQ section covers common objections
- [ ] Testimonials/social proof displayed (if available)

# SiamClones — Project Instructions

## What This Is

A peer-to-peer marketplace for cannabis clones, seeds, and buds targeting
the Thai market. Connects verified growers with buyers across all 77
provinces of Thailand. Two portals: a buyer marketplace and a seller
dashboard. AI chatbot powered by Gemini. Payments via PromptPay QR and
Cash on Delivery.

Built by Austin. Lives at siamclones.com.

## The Core Architecture

No build step. Both HTML files (index.html, seller.html) use React 18
with browser-compiled JSX via Babel Standalone. This means:
- JSX syntax errors cause the ENTIRE page to go blank with zero visible error
- Always check browser console for Babel parse errors if a page goes blank
- Never add extra closing tags — one stray `</div>` kills the whole app
- Never remove the Babel `<script>` tags from the HTML files

Hash-based routing (`#home`, `#products`, `#cart`, etc.) with History API
for the buyer SPA. The seller portal uses screen-based state management.

## Tech Stack

- **Frontend**: React 18 (browser-compiled JSX via Babel Standalone)
- **Routing**: Hash-based (`#home`, `#products`, `#vendors`, `#cart`, `#checkout`, etc.)
- **Backend / DB**: Supabase (PostgreSQL, Auth, Storage, Edge Functions, Row Level Security)
- **Hosting**: Vercel — auto-deploy from GitHub main branch
- **Serverless API**: Vercel Functions (`api/chat.js`) — CommonJS `module.exports` pattern
- **AI Chatbot**: Gemini 2.5 Flash via Google Generative AI REST API
- **i18n**: Bilingual EN/TH with `useLanguage` hook and `t()` function, localStorage persistence
- **Payments**: PromptPay QR code generation + Cash on Delivery (COD)
- **PWA**: Service worker (`sw.js`), `manifest.json`, offline fallback
- **Security**: CSP headers, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy via `vercel.json`

## File Structure (actual, not aspirational)

```
bloom-marketplace/
├── index.html            (~3,600 lines) Buyer marketplace SPA
├── seller.html           (~3,670 lines) Seller portal SPA
├── chatbot.js            (402 lines)    Floating chat widget (IIFE, zero deps)
├── api/
│   └── chat.js           (~120 lines)   Vercel serverless: Gemini API, rate limiting, CORS
├── sw.js                 (~115 lines)   Service worker v5: network-first HTML, SWR assets
├── vercel.json           (~30 lines)    Vercel config: maxDuration, security headers
├── manifest.json                        PWA manifest
├── package.json                         Minimal: name, version, engines >= 18
├── supabase-setup.sql    (~180 lines)   Full DB schema, RLS policies, indexes
├── supabase/
│   └── functions/
│       └── notify-order/
│           └── index.ts                 Edge Function for order email notifications
├── favicon.svg
├── icon-192.png
├── icon-512.png
├── payment-qr.png                       PromptPay QR template
├── robots.txt
├── sitemap.xml
└── .gitignore
```

## Live URLs

| Resource | URL |
|---|---|
| Buyer Marketplace | https://siamclones.com |
| Seller Portal | https://siamclones.com/seller.html |
| Chatbot API Health | https://siamclones.com/api/chat (GET) |
| Vercel Dashboard | vercel.com/austins-projects-7e45e08e/bloom-marketplace |
| GitHub Repo | github.com/TegridyRepoRanch/bloom-marketplace |
| Supabase Project | bqglrepbhjxmbgggdqal.supabase.co |

## Environment Variables

| Variable | Where | What |
|---|---|---|
| `GEMINI_API_KEY` | Vercel Environment Variables | Google Generative AI key for chatbot. Already set. Do NOT change unless rotating. Model `gemini-2.5-flash` stable through June 2026. |

The Supabase anon key is embedded in the HTML files (public by design,
protected by Row Level Security). Not a secret.

## Supabase Schema

Project: `bqglrepbhjxmbgggdqal` in Supabase.

Key tables (all have RLS policies):
- `listings` — id, seller_id, title, description, price, price_unit, category (clones/seeds/buds), images (JSONB), quantity_available, is_available, growing_method, location
- `orders` — id, seller_id, items (JSONB), total, customer_name, customer_phone, address, district, province, postal_code, payment_method, payment_proof_url, status, delivery_notes
- `profiles` — id (FK to auth.users), display_name, farm_name, location, phone, promptpay_id, avatar_url

Storage buckets:
- `payment-proofs` — Customer payment proof uploads
- `listing-images` — Product listing images
- `avatars` — Seller profile avatars

## Key Design Decisions

### No build step — Babel compiles JSX in-browser
Chose this for simplicity: no webpack/vite/bundler config, no node_modules
bloat, instant deploys (just static files). Tradeoff: slower initial parse
on mobile, requires `unsafe-eval` in CSP. Worth it for a small marketplace.

### Hash routing instead of file-based routing
Single-file SPA means all buyer pages live in index.html. Hash changes
(`#products`, `#cart`, `#checkout`) trigger React state updates. The
`renderPage()` switch statement in the App component handles routing.
Invalid hashes hit the `default:` case which shows a 404 page.

### Price units are category-aware with legacy fallbacks
`getPriceUnitLabel(priceUnit, t, category)` handles both new listings
(explicit `price_unit` field) and legacy listings (`null` price_unit,
falls back based on category: clones→per_clone, seeds→per_seed,
buds→per_gram). Test with Khalifa Mints listing which has null price_unit.

### CORS restricted to production domains
`api/chat.js` checks the Origin header against an allowlist:
`siamclones.com`, `www.siamclones.com`, `bloom-marketplace.vercel.app`.
Requests from other origins get a default `siamclones.com` CORS header
(effectively blocking cross-origin browser requests).

### Service worker: network-first for HTML, SWR for assets
HTML pages always fetch from network (with cache fallback for offline).
Static assets (JS, CSS, images) use stale-while-revalidate for speed.
SW registration uses `updateViaCache: 'none'` and `controllerchange`
listener to auto-reload when a new SW activates after deploy.

### Product card images use 4:3 aspect ratio
Changed from 1:1 (square) which caused a white gap beside non-square
product photos. Now uses `aspectRatio: '4 / 3'` with `width: 100%` and
`objectFit: 'cover'` so images fill the full card width.

## Chatbot Architecture

Two pieces:
1. `chatbot.js` — Self-contained IIFE widget injected via `<script>` tag
   on both pages. Zero dependencies. Handles UI, message history, suggested
   questions, mobile fullscreen below 640px. Reads language from localStorage.
2. `api/chat.js` — Vercel serverless function. Receives `{messages: [...]}`,
   forwards to Gemini 2.5 Flash with inlined system prompt, returns `{text: "..."}`.
   Rate limited to 20 req/min per IP. Safety block responses return friendly
   fallback messages instead of errors.

## What's Done

### Security
- XSS fixed (React state-based rendering, no innerHTML)
- Supabase RLS on all tables
- CORS restricted to production domains
- Rate limiting on chatbot API (20/min/IP)
- Input sanitization on checkout fields
- CSP + X-Frame-Options + X-Content-Type-Options + Referrer-Policy + Permissions-Policy headers
- No sensitive data in client console.log

### Features
- Full bilingual EN/TH (150+ translation keys, both portals)
- 404 page for invalid hash routes (bilingual)
- Double-submit prevention on checkout
- Chatbot safety-block handling with friendly fallback messages
- PromptPay payment confirmation timeline note
- Product card images: 4:3 aspect ratio, full-width, no white gap
- Order cancellation, search, CSV export on seller portal
- Drag-and-drop proof upload for PromptPay
- Price filter cross-validation (min <= max with red border)
- Service worker auto-update with controllerchange reload

### SEO
- Schema.org (WebSite, Organization, Store)
- Open Graph + Twitter Card meta tags
- robots.txt + sitemap.xml
- Google site verification

## What Still Needs Work

### Service worker propagation
Browsers with the old SW (v2/v3/v4) need one hard refresh to pick up v5.
After that, all future deploys auto-update. The fix (updateViaCache: 'none'
+ controllerchange reload) is in the code but needs to reach all users.

### Verify notify-order Edge Function
The Supabase Edge Function at `supabase/functions/notify-order/index.ts`
is supposed to send email notifications on new orders. Verify it's actually
deployed and working on the Supabase dashboard.

### Image optimization
Product images served at full resolution. Consider Vercel Image Optimization
or lazy loading with srcset for better mobile performance.

### Analytics
No Google Analytics, Plausible, or equivalent. Traffic is untracked.

### Seller image handling
No image cropping/resizing before upload. Large images go straight to
Supabase Storage. Consider client-side resize before upload.

## Dangerous Patterns to Avoid

- **NEVER** add `type: module` to vercel.json or convert api/chat.js to ESM — Vercel serverless functions use CommonJS
- **NEVER** nest extra closing tags in JSX — one extra `</div>` blanks the entire page
- **NEVER** use `require()` in api/chat.js to import local files — Vercel bundling won't resolve them
- **NEVER** remove the Babel `<script>` tags from HTML — JSX compilation stops entirely
- **NEVER** add a `runtime` field to vercel.json — this caused a Vercel build failure previously
- **NEVER** use `WidthType.PERCENTAGE` in any future docx generation — breaks in Google Docs
- **NEVER** set `Access-Control-Allow-Origin: *` on the chatbot API — use the allowlist in api/chat.js

## Deployment

GitHub repo: `TegridyRepoRanch/bloom-marketplace` (main branch)
Vercel auto-deploys on push. ~5-10 seconds for static files.

After pushing:
1. Check Vercel dashboard for "Ready" status
2. Hard refresh the site once to pick up new SW
3. Test buyer flow: home → products → add to cart → checkout
4. Test seller portal: login → dashboard → listings → orders
5. Test chatbot: open bubble → ask question → verify response

## Testing Checklist (Quick)

- [ ] Homepage loads, zero console errors
- [ ] Products page: cards have full-width images, search works
- [ ] Add to cart → cart page → checkout form validates
- [ ] Language toggle EN↔TH works everywhere
- [ ] 404 page shows for `#nonexistent`
- [ ] Chatbot responds in English and Thai
- [ ] `GET /api/chat` returns `{status: "ok", configured: true}`
- [ ] Seller portal: dashboard, listings, orders, analytics load
- [ ] Security headers present (check with fetch HEAD)

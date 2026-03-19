# SiamClones — Production Readiness Audit Report

**Date:** March 19, 2026
**Auditor:** Claude Opus 4.6 — Principal Engineer Audit
**Scope:** Full codebase (`bloom-marketplace 2/`)
**Files Audited:** index.html, seller.html, chatbot.js, api/chat.js, sw.js, vercel.json, supabase-setup.sql, supabase/functions/notify-order/index.ts, index.ts (root), manifest.json, package.json, robots.txt, sitemap.xml

---

## 1. Executive Summary

### Health Score: 62 / 100

| Category | Score | Weight | Notes |
|----------|-------|--------|-------|
| Security | 55/100 | 25% | XSS vector in chatbot, JWT not verified, rate limit bypassable, unsanitized inputs |
| Functionality | 75/100 | 25% | Core flows work; ContactPage dead, ErrorBoundary broken, lang ignored in chatbot API |
| UX/UI Polish | 70/100 | 20% | Good empty/loading states; 30+ hardcoded colors bypass theme; no analytics integration |
| Scalability | 40/100 | 15% | Zero pagination, no realtime, TOCTOU race on checkout, CDN single-point-of-failure |
| Code Quality | 65/100 | 15% | Monolithic files (~3,600+ lines each), no tests, 5 console.error leaks, stale duplicate file |

**Overall Assessment:** The marketplace is functionally complete for a low-traffic launch but has critical security gaps and architectural bottlenecks that will break under moderate load or targeted attack. The checkout flow has a race condition that can oversell inventory, the chatbot has an XSS vector, and all database queries are unbounded.

---

## 2. Critical Vulnerabilities & Bugs

### CRITICAL — Must fix before launch

#### C1. Chatbot XSS via `javascript:` protocol in markdown links
- **File:** `chatbot.js:273`
- **Issue:** `renderMarkdown()` converts `[text](url)` to `<a href="url">` with no URL protocol validation. Bot response containing `[click](javascript:alert(1))` executes arbitrary JS.
- **Impact:** If Gemini echoes user-controlled text in a markdown link, attacker gets full XSS in the user's session.
- **Fix:** Add URL protocol allowlist (`https:`, `http:`, `mailto:`) before creating `<a>` tags.

#### C2. Inventory oversell — TOCTOU race condition in checkout
- **File:** `index.html:2470-2595`
- **Issue:** Stock is verified at line 2470, but order creation happens at line 2573 — 2-4 seconds later (after payment proof upload + price verification). No database transaction or atomic stock deduction. Two concurrent buyers can both pass stock check and both place orders for the last available unit.
- **Impact:** Seller committed to fulfilling orders they can't fill; customer trust destroyed.
- **Fix:** Create a Supabase RPC function that atomically decrements `quantity_available` and inserts the order within a single transaction. Abort if stock < requested quantity.

#### C3. Edge Function JWT signature not verified
- **File:** `supabase/functions/notify-order/index.ts:254-267`
- **Issue:** JWT is decoded (base64 payload parse) but signature is **never verified**. Attacker can forge a JWT with `{iss: "supabase", role: "anon", exp: 9999999999}` and call the notification endpoint directly.
- **Impact:** Spam vendor notification channels (email, LINE, Discord) with fake order data.
- **Fix:** Use Deno `jose` library to verify JWT signature against Supabase's JWT secret.

#### C4. Stale duplicate `index.ts` at project root with wildcard CORS
- **File:** `./index.ts` (root) vs `./supabase/functions/notify-order/index.ts`
- **Issue:** Root `index.ts` (267 lines) is an outdated copy that has `Access-Control-Allow-Origin: *` (line 216), no `NOTIFY_WEBHOOK_SECRET` env var, no JWT validation, and no field validation. If accidentally deployed, it replaces the secured version.
- **Impact:** Any origin can trigger vendor notifications with arbitrary payloads.
- **Fix:** Delete `./index.ts` from root. It's dead code that shadows the real Edge Function.

#### C5. ErrorBoundary calls undefined `t()` function
- **File:** `index.html:3060,3063`
- **Issue:** ErrorBoundary is a class component that calls `t('error_generic')` and `t('error_apologize')`, but `t` is a hook-returned function scoped to the App functional component — not accessible in a class component's render method. When an actual error triggers the boundary, it will **throw a second error** (`t is not a function`), resulting in a blank page.
- **Impact:** Error recovery is completely broken. Any React render error = blank white screen.
- **Fix:** Hardcode bilingual strings inside ErrorBoundary or pass `t` as a prop.

### HIGH — Fix in first sprint

#### H1. Rate limiter memory leak + IP spoofing
- **File:** `api/chat.js:30-41, 64`
- **Issue (Memory):** Rate limit Map is never garbage-collected. Every unique IP adds an entry that persists until the serverless function cold-starts. Under sustained traffic, Map grows unbounded.
- **Issue (Spoofing):** Uses `x-forwarded-for` header which clients can set. Attacker sends different `x-forwarded-for` per request to bypass 20/min limit.
- **Fix:** Add Map size cap (e.g., 10,000 entries with LRU eviction). For spoofing, Vercel's `x-real-ip` is more reliable than `x-forwarded-for` — use it as primary.

#### H2. Unsanitized checkout fields
- **File:** `index.html:2579,2582,2583`
- **Issue:** `customer_phone`, `province`, and `postal_code` bypass `sanitize()` and are inserted directly into the orders table. While RLS protects against SQL injection, these values are later rendered in seller.html order views.
- **Fix:** Apply `sanitize()` to all user-supplied fields at line 2578-2584.

#### H3. `lang` parameter ignored by chatbot API
- **File:** `api/chat.js:75` (reads `messages` only, ignores `lang`)
- **Issue:** `chatbot.js:362` sends `lang: getLang()` but `api/chat.js` destructures only `{ messages }`. The Gemini system prompt is English-only. Thai users get English bot responses.
- **Fix:** Read `lang` from request body. If `lang === 'th'`, prepend instruction to system prompt: "Respond in Thai unless the user writes in English."

#### H4. pg_net extension status unknown
- **File:** `supabase-setup.sql:134-144`
- **Issue:** The `notify_vendor_new_order()` trigger calls `net.http_post()` which requires the `pg_net` extension. If not enabled, all order notifications silently fail — orders succeed but vendors are never alerted.
- **Fix:** Verify pg_net is enabled in Supabase Dashboard → Database → Extensions. If not, enable it and redeploy the trigger.

#### H5. No request body size limit on chatbot API
- **File:** `api/chat.js` (no validation)
- **Issue:** Attacker can send a multi-megabyte `messages` array. Vercel's default is 6MB. Large payloads waste Gemini API tokens and could cause timeout.
- **Fix:** Add `if (JSON.stringify(body).length > 50000) return res.status(413)` or limit `messages.length` to 50.

---

## 3. UX/UI Action Plan

### 3A. Design System Inconsistency

**Problem:** `colors` object defined at line 231 (index.html) / 308 (seller.html) but **30+ hex values hardcoded inline** throughout both files. Makes global theme changes impossible without find-and-replace across 7,000+ lines.

**Missing from `colors` object (should be added):**

| Color | Hex | Usage |
|-------|-----|-------|
| successBg | `#E8F5E9` | Alert backgrounds, confirmation states |
| successText | `#2E7D32` | Success text, in-stock labels |
| warningBg | `#FFF8E1` | Warning notes, COD payment callouts |
| warningText/Border | `#FFD54F` / `#F57F17` | Warning borders, caution text |
| infoBg | `#E8F0FE` | PromptPay section background |
| infoText | `#1A4DB0` | PromptPay text, info headings |
| infoBorder | `#B8D4FE` | PromptPay section border |
| clonesBadge | `#E8F5E9` / `#2E7D32` | Clones category badge |
| seedsBadge | `#FFF3E0` / `#E65100` | Seeds category badge |
| budsBadge | `#F3E5F5` / `#7B1FA2` | Buds category badge |
| lineGreen | `#06C755` | LINE share button |
| whatsappGreen | `#25D366` | WhatsApp share button |

**Key hardcoded instances (index.html):** Lines 133, 136, 140, 148-150, 767, 770, 775, 894-901, 1345-1346, 1519-1529, 2622, 2817, 2834-2858, 2962, 3007-3018

### 3B. Broken / Placeholder Features

| Feature | File:Line | Issue | Effort |
|---------|-----------|-------|--------|
| Contact form | `index.html:3393` | `onSubmit` only calls `setSent(true)` — no data sent anywhere | Medium — integrate Supabase `leads` table or email API |
| Password reset | `seller.html` | No forgot-password flow exists | Medium — add `supabase.auth.resetPasswordForEmail()` |
| ErrorBoundary i18n | `index.html:3060` | Shows broken `t()` calls instead of bilingual error text | Quick — hardcode EN/TH strings |
| ErrorBoundary i18n | `seller.html:3452-3470` | Hardcoded English only (no `t()` attempt — less broken but not bilingual) | Quick — add Thai strings |

### 3C. Console Leaks in Production

| File | Line | Statement | Risk |
|------|------|-----------|------|
| `index.html` | 997 | `console.error('QR generation failed:', err)` | Exposes QR lib internals |
| `index.html` | 2512 | `console.error('Upload error:', uploadError)` | Exposes Supabase storage errors |
| `index.html` | 2592 | `console.error('Order error:', orderError)` | Exposes order insertion errors |
| `index.html` | 3043 | `console.error('Error caught by boundary:', error, errorInfo)` | Exposes full React stack trace |
| `seller.html` | 3435 | `console.error('Error boundary caught:', error, errorInfo)` | Exposes full React stack trace |

**Fix:** Remove or wrap in `if (location.hostname === 'localhost')` guard.

### 3D. Accessibility Gaps

| Issue | File | Detail |
|-------|------|--------|
| Order status buttons lack `aria-label` | `seller.html` | "Confirm", "Cancel" buttons don't identify which order |
| Tab navigation z-index conflict | Both files | Chatbot z-index (9999) can occlude skip-to-content (10000) |
| No `aria-live` on seller order list | `seller.html` | Screen readers don't announce new order status changes |

### 3E. Mobile-Specific Issues

- **seller.html hamburger menu CSS defined (lines 217-232) but never rendered in JSX** — mobile users have no navigation toggle
- **Seller `button` padding overridden globally** (`seller.html:191`): `button { padding: 8px 12px !important; }` — breaks custom-sized buttons everywhere on mobile

---

## 4. Robustness & Scalability Gaps

### 4A. Zero Pagination on All Queries

Every Supabase `.select()` fetches ALL matching rows with no `.limit()` or `.range()`:

| File | Line | Query | Risk at Scale |
|------|------|-------|---------------|
| `index.html` | 1633 | All listings by category | 1000+ products = 5MB+ response |
| `index.html` | 3202 | All active vendor profiles | 500+ vendors = slow grid render |
| `seller.html` | 2507 | All seller's listings | Power seller with 1000+ items |
| `seller.html` | 2523 | All seller's orders (all time) | 6 months of orders loaded at once |

**Fix:** Add `.range(0, 49)` with "Load More" or infinite scroll. Priority: product listings and order history.

### 4B. No Realtime Subscriptions

- Seller portal has **zero** Supabase Realtime channels
- New orders only appear on manual refresh or screen navigation
- No live inventory updates for buyers (another buyer could empty stock while browsing)

**Fix:** Add `supabase.channel('orders').on('postgres_changes', ...)` to seller dashboard for live order notifications.

### 4C. Sequential Order Creation for Multi-Seller Cart

- **File:** `index.html:2570-2595`
- Cart items grouped by seller, then each seller's order inserted **sequentially** with `await`
- 5-seller cart = 5 sequential DB round-trips (~500ms each = 2.5s total)

**Fix:** Use `Promise.all()` for concurrent inserts (or batch into single RPC call).

### 4D. CDN Single Point of Failure

Both HTML files load 5 critical libraries from `unpkg.com`:
- React 18, React-DOM 18, Babel Standalone, Supabase JS v2, qrcode-generator

**If unpkg goes down:** Entire site renders a blank white page. No fallback, no error message.

**Fix:** Either:
1. Self-host libraries in `/lib/` directory (safest)
2. Add `<script>` fallback chains: `<script src="cdn1"></script><script>window.React || document.write('<script src="cdn2"><\/script>')</script>`

### 4E. Analytics Not Memoized (Seller Portal)

- **File:** `seller.html:3147-3239`
- Revenue totals, order counts, top products, and payment breakdowns recalculated on every React render cycle
- No `useMemo()` wrapping any of these computations

**Fix:** Wrap each calculation block in `useMemo(() => ..., [orders, listings])`.

### 4F. Orphaned Storage Files on Listing Deletion

- **File:** `seller.html:2579-2582`
- Listing delete removes DB row but **never deletes images** from Supabase Storage
- Over time, storage fills with unreferenced images

**Fix:** Before `.delete()`, extract image URLs from listing, call `supabase.storage.from('images').remove([...paths])`.

### 4G. No Test Coverage

- Zero test files in the repository
- No test framework configured in `package.json`
- No CI/CD pipeline beyond Vercel auto-deploy

### 4H. Profile Load Error Silently Ignored

- **File:** `seller.html:3545-3560`
- If `supabase.from('profiles').select()` fails (DB error, network issue), the error object is ignored and user is silently redirected to the setup screen as if no profile exists
- Could cause sellers to accidentally create duplicate profiles

---

## 5. The "Next Steps" Checklist

### Quick Wins (< 30 min each)

| # | Task | File(s) | Impact |
|---|------|---------|--------|
| Q1 | Fix ErrorBoundary — hardcode bilingual strings instead of calling `t()` | `index.html:3032-3080` | Prevents blank-page crashes |
| Q2 | Sanitize phone, province, postal_code in checkout | `index.html:2579-2583` | Closes input injection gap |
| Q3 | Add URL protocol allowlist in chatbot `renderMarkdown()` | `chatbot.js:273` | Blocks XSS via markdown links |
| Q4 | Delete stale root `index.ts` | `./index.ts` | Removes wildcard-CORS dead code |
| Q5 | Remove/guard 5 `console.error` statements | `index.html`, `seller.html` | Stops stack trace leaks |
| Q6 | Add `.limit(50)` to product and vendor queries | `index.html:1633,3202` | Prevents unbounded data loads |
| Q7 | Pass `lang` to Gemini system prompt in `api/chat.js` | `api/chat.js` | Chatbot responds in user's language |
| Q8 | Add `loading` state guard to seller order status buttons | `seller.html:2535-2547` | Prevents double-click race |

### Medium Effort (1-3 hours each)

| # | Task | File(s) | Impact |
|---|------|---------|--------|
| M1 | Create atomic order RPC (transaction: decrement stock + insert order) | `supabase-setup.sql`, `index.html` | Eliminates oversell race condition |
| M2 | Implement JWT signature verification in Edge Function | `supabase/functions/notify-order/index.ts` | Blocks forged notification requests |
| M3 | Add pagination + "Load More" to product grid and seller orders | `index.html`, `seller.html` | Scalability for growth |
| M4 | Self-host React/Babel/Supabase libraries | `index.html`, `seller.html`, `/lib/` | Eliminates CDN SPOF |
| M5 | Wire up Contact form to Supabase `leads` table or email | `index.html:3378-3406` | Makes contact form functional |
| M6 | Add Supabase Realtime channel for seller order notifications | `seller.html` | Live order alerts |
| M7 | Consolidate hardcoded hex colors into `colors` object | `index.html`, `seller.html` | Design system consistency |
| M8 | Add password reset flow (`resetPasswordForEmail`) | `seller.html` | Critical auth UX |
| M9 | Verify pg_net extension enabled + test notification trigger | Supabase Dashboard | Confirms order alerts work |
| M10 | Delete orphaned images on listing delete | `seller.html` | Prevents storage bloat |

### Deep Refactors (4+ hours each)

| # | Task | Impact |
|---|------|--------|
| D1 | Split monolithic HTML files into component modules (separate `.js` files loaded by Babel) | Maintainability, cacheability |
| D2 | Add build step (Vite/esbuild) to pre-compile JSX, eliminating `unsafe-eval` CSP requirement | Security, 2-4x faster load |
| D3 | Implement comprehensive test suite (Playwright for E2E, Vitest for units) | Regression safety |
| D4 | Add rate limiting at Supabase level (Edge Function middleware) instead of in-memory Map | Persistent, unforgeable rate limits |
| D5 | Add Supabase Realtime for buyer-side live inventory (show "X people viewing" / stock changes) | Premium marketplace UX |

---

## Appendix: File Size & Complexity

| File | Lines | Approx Size | Components/Functions |
|------|-------|-------------|---------------------|
| `index.html` | 3,607 | 257 KB | 19 React components, 150+ i18n keys |
| `seller.html` | 3,678 | 184 KB | 16 React components, 150+ i18n keys |
| `chatbot.js` | 402 | 16 KB | 1 IIFE widget |
| `api/chat.js` | ~120 | 5 KB | 1 serverless handler |
| `sw.js` | ~115 | 4 KB | 3 event handlers |
| `supabase-setup.sql` | ~180 | 7 KB | 3 triggers, 1 webhook fn |
| `notify-order/index.ts` | 330 | 12 KB | 3 notification channels |
| `index.ts` (ROOT — STALE) | 267 | 10 KB | **DELETE THIS FILE** |

---

*Generated by Claude Opus 4.6 — Production Readiness Audit*

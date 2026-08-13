# Build Plan

Step-by-step implementation plan for the portfolio site described in [README.md](README.md). Each stage has a **Build** checklist and a **Test Gate** checklist. Do not start the next stage until every box in the current stage's Test Gate is checked and confirmed working (dev server / test run), per project convention — see [memory.md](memory.md) for rationale and running decisions log.

Legend: `[ ]` pending · `[x]` done

---

## Stage 0 — Planning docs

- [x] `README.md` — functional requirements, content model, tech stack
- [x] `todo.md` — this file
- [x] `memory.md` — decisions/learnings/draft log

**Test Gate:** N/A (docs only)

---

## Stage 1 — Project scaffolding

**Build**

- [x] Next.js 16 (App Router, TypeScript, Turbopack) project in repo root — package renamed `shruti-shahu-portfolio`
- [x] ESLint + Prettier config
- [x] Base folder structure — `src/app/` exists from scaffold; `lib/`, `prisma/`, `components/` will be added as Stages 2+ need them, not created empty upfront
- [x] `.env.example` with all required env vars stubbed (DB URL, NextAuth secret, Resend key, Blob token)
- [x] `.gitignore` updated — already covered `node_modules`, `.env*`, `.next/` out of the box from the scaffold template

**Test Gate**

- [x] `npm run dev` starts without errors, default page loads at `localhost:3000` (HTTP 200 confirmed)
- [x] `npm run build` completes successfully
- [x] `npm run lint` passes with no errors

---

## Stage 2 — Database & ORM

**Build**

- [x] Postgres instance provisioned: **Neon**, via the Vercel Storage integration
- [x] Prisma (v7.9.1) installed, `schema.prisma` with models: `Category` (self-relation via `parentId`), `Project`, `ProjectLink`, `AdminUser`, `PasswordResetToken`, `SiteContent` (singleton)
- [x] Initial migration created and applied (`20260804184045_init`)
- [x] Prisma client singleton at `src/lib/prisma.ts` (Prisma 7 requires an explicit driver adapter — using `@prisma/adapter-pg` + `pg`, see memory.md)
- [x] Vitest installed and configured (`vitest.config.ts`, `npm test`)

**Test Gate**

- [x] `npx prisma migrate dev` runs clean against the real DB
- [x] CRUD round-trip covered by an automated test instead of manual Prisma Studio use (equivalent coverage, faster to re-run at every future stage)
- [x] Automated test: `src/lib/prisma.test.ts` — 6 tests passing against the real Neon DB (nested categories, project with gallery/tags/links, updates, cascade deletes, admin user + reset token cascade, SiteContent singleton upsert); self-cleans via a per-run unique prefix
- [x] `npm run build` and `npm run lint` still pass with Prisma wired in

---

## Stage 3 — Auth (admin login)

**Build**

- [x] NextAuth.js (v5 beta) credentials provider — `src/auth.ts`
- [x] Admin seed script: creates/upserts one `AdminUser` row with a bcrypt-hashed password from `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars — `prisma/seed.ts`, run via `npx prisma db seed`
- [x] `/admin/login` page — server-action form, error state on invalid credentials
- [x] `src/proxy.ts` protecting all `/admin/*` routes except `/admin/login` (Next.js 16 renamed `middleware.ts` → `proxy.ts` — see memory.md)

**Test Gate**

- [x] Unit test: password hashing + verification helper (`src/lib/password.test.ts` — correct password passes, wrong password fails, hash ≠ plaintext)
- [x] Manual (via curl against the real dev server + NextAuth's credentials callback endpoint): seeded credentials log in successfully, session cookie set, session reflects the admin email
- [x] Manual: wrong password rejected, session stays `null`, no cookie set
- [x] Manual: visiting `/admin` while logged out returns 307 → `/admin/login`
- [x] Manual: visiting `/admin` while logged in (with session cookie) returns 200 and renders "Signed in as `shruti2004shahu@gmail.com`"

---

## Stage 4 — Password reset flow

**Build**

- [x] "Forgot password?" link on `/admin/login` → `/admin/forgot-password` (email form, always shows the same generic confirmation regardless of whether the email matched, to avoid account enumeration)
- [x] Token generation (`src/lib/passwordReset.ts`: random 32-byte token, SHA-256 hashed at rest, 1-hour expiry) + Resend email send (`src/lib/email.ts`)
- [x] `/admin/reset-password?token=...` page that validates the token and sets a new password, redirecting to `/admin/login?reset=1` on success
- [x] `src/proxy.ts` updated so `/admin/forgot-password` and `/admin/reset-password` are also public (previously only `/admin/login` was)

**Test Gate**

- [x] Unit test: token is single-use (`src/lib/passwordReset.test.ts` — second use after consumption returns `invalid_or_expired`, password stays at the first reset's value)
- [x] Unit test: expired token is rejected (manually-inserted already-expired token)
- [x] Unit test: non-existent token rejected; unknown email returns `null` without leaking whether it exists
- [x] Manual, against the real dev server + real Neon DB: submitted the actual `/admin/forgot-password` form (genuine multipart POST mimicking a no-JS browser submit), confirmed a `PasswordResetToken` row was created; used a directly-generated raw token to submit the real `/admin/reset-password` form; confirmed the old password now fails login and the new password succeeds; restored the original password via `npx prisma db seed` afterward so the live credential matches what Shruti set

**Known limitation (needs a decision, not a code bug):** Resend's free tier only allows sending to the account owner's own email address until a domain is verified — see memory.md. The reset **token/link generation works correctly end-to-end**, but the actual email currently fails to deliver to `shruti2004shahu@gmail.com` (403 from Resend, logged server-side, silently ignored so as not to leak account existence to the UI). Needs either a verified sending domain or an accepted workaround before this is truly production-ready.

---

## Stage 5 — Category admin (multi-level tree)

**Build**

- [x] Server actions (`src/lib/categories.ts`): create, rename, move (re-nest), reorder (up/down siblings), delete (cascade or move-contents)
- [x] Admin UI (`src/app/admin/categories/page.tsx`): recursive tree view, per-node rename/reorder/move-to-parent/add-subcategory forms, all plain HTML forms + server actions (no drag-and-drop — consistent with "functionality first" for this phase)
- [x] Delete confirmation flow (`src/app/admin/categories/[id]/delete/page.tsx`): empty categories get a single confirm button; categories with children/projects get a choice between "delete everything" (cascade) or "move contents to…" (target category picker)
- [x] Guard against circular parent references — covers three cases: moving a category under itself, under its own descendant, and (found while building the delete-move UI) moving a deleted category's contents into one of the very children being relocated

**Test Gate**

- [x] Unit test: creating a subcategory nests it correctly under its parent (`src/lib/categories.test.ts`)
- [x] Unit test: moving a category under its own descendant is rejected (`CircularMoveError`, both direct self-move and descendant-move cases)
- [x] Unit test: reordering siblings via `moveSibling` updates `order` correctly
- [x] Unit tests: cascade delete removes children + projects; move-mode delete relocates children + projects to the target; move requires a target when there are direct projects; move-mode delete rejects a target that's one of the children being relocated — 9 tests total in this file
- [x] Manual, against the real dev server + real Neon DB: logged in, built an actual 3-level tree (Marketing → Video/UGC Scripts → Instagram Campaigns) via genuine HTTP form submissions, confirmed correct `<ul>/<li>` nesting in the rendered HTML; checked both branches of the delete-confirmation page (empty vs. has-contents); submitted a real cascade delete and confirmed all 3 categories were removed, restoring an empty tree for Stage 10's real seeding
- **Adjusted from the original wording**: "confirm it renders correctly on the public category pages" wasn't possible yet — those pages don't exist until Stage 7. Verified via the admin tree view's own rendering instead; revisit visually once Stage 7 builds the public category pages.
- **Bug caught before it shipped:** `/admin/categories` had no dynamic API usage of its own (no `auth()`/`searchParams`), so Next.js statically prerendered it at build time — meaning it would have served stale, build-time category data to every visitor forever. Fixed with `export const dynamic = 'force-dynamic'`. Worth checking for on every future admin page that doesn't already use a dynamic API.

---

## Stage 6 — Project admin (CRUD + assets)

**Build**

- [x] Server actions (`src/lib/projects.ts`): create, update (wholesale link replacement), delete, reorder (up/down siblings), toggle featured
- [x] Fields: header, rich text description (Tiptap, `src/components/RichTextEditor.tsx`), coverImage, gallery[], videoUrl, client, tags, links[] (6 fixed slots — see Technical learnings), featured, order, category assignment
- [x] Image upload to Vercel Blob (`src/lib/blob.ts` + `src/lib/projectFormData.ts`) — cover and multi-file gallery, server-upload method (fine for our image sizes, well under the 4.5MB Vercel request-body cap)
- [x] Admin UI: `src/app/admin/projects/new` (create), `src/app/admin/projects/[id]/edit` (edit, with per-image gallery removal checkboxes), `src/app/admin/projects/[id]/delete` (confirm); project list + reorder/feature-toggle controls wired into each category node on `/admin/categories`

**Test Gate**

- [x] Unit tests: project creation requires header (`ProjectValidationError`) and requires category — plus 6 more covering full-field creation, blank link rows getting dropped, update wholesale-replacing links, featured toggle, reorder, delete (8 tests in `src/lib/projects.test.ts`)
- [x] Manual, against the real dev server + real Neon DB + real Vercel Blob: uploaded a real cover image and a 2-image gallery through the actual form, confirmed both persisted as real public Blob URLs (verified one directly with `curl` — 200, correct content-type, byte-identical size to source) and displayed correctly on the edit page after reload
- [x] Manual: `videoUrl` stored and retrieved correctly
- [x] Manual: 2 `links[]` entries with labels persisted and displayed correctly on reload
- [x] Manual: reorder (moved a project from last to second-to-last among 7 real siblings) and featured toggle (set at creation, then unfeatured) both confirmed via before/after page state
- **Known gap, not in original scope:** deleting a project does not delete its Blob-stored images — they become orphaned in storage. Not a correctness bug (nothing breaks), but worth a cleanup pass later. See memory.md.

---

## Stage 7 — Public pages

**Build**

- [x] Home page (`src/app/page.tsx`): About Me (rich text) + Download Resume link + top-level category entry points, with graceful "coming soon" fallbacks when `SiteContent` doesn't exist yet (Stage 9 hasn't built the admin UI to populate it)
- [x] Category view (`src/app/category/[slug]/page.tsx`): breadcrumbs (root → current), subcategories, direct projects sorted featured-first then by manual order; 404s via `notFound()` for an unknown slug
- [x] Project detail (`src/app/project/[id]/page.tsx`): header, rich-text description, cover image, YouTube video embed (`src/lib/youtube.ts` converts watch/shorts/youtu.be URLs to embed URLs), gallery images, client/tags, links; 404s for a bad id
- [x] Contact page (`src/app/contact/page.tsx`): static email + social links from `SiteContent`, with a "coming soon" fallback

**Test Gate**

- [x] Manual (chose manual over RTL — consistent with this project's established pattern of unit-testing lib functions + live-verifying actual pages, rather than introducing a new component-testing framework for one stage): Home shows About Me content (including embedded rich-text formatting) and links to seeded top-level categories, verified against the real dev server + real DB
- [x] Manual: built a genuine 3-level category tree (Marketing → Video/UGC Scripts → Instagram Campaigns) via the lib functions directly (the admin forms themselves were already proven in Stages 5–6; this stage is about the public *read* side), confirmed the breadcrumb trail and its hrefs match the path exactly at the deepest level
- [x] Manual: a project with a YouTube `videoUrl` renders a working `<iframe>` embed (verified the exact converted embed URL); a project with a 2-image gallery plus cover image renders all 3 `<img>` tags with real, live Blob URLs
- [x] Manual: a project with 2 `links[]` entries renders both with correct labels and hrefs
- All test data (category tree, projects, `SiteContent` singleton) cleaned up afterward — confirmed the Home page returns to its "coming soon" fallback state
- **New pages caught by the Stage 5 static-rendering lesson:** `/` and `/contact` have no dynamic API usage of their own (no `auth()`/`searchParams`) and needed `export const dynamic = 'force-dynamic'` explicitly; confirmed via build output that `/category/[slug]` and `/project/[id]` are already dynamic automatically (their `params` prop is itself a dynamic API)
- **Lint caught 3 internal `<a href="/">` links that should be `next/link`'s `<Link>`** (`@next/next/no-html-link-for-pages`) — fixed, and proactively converted all internal navigation across the 4 new pages to `<Link>` for consistency (external links, e.g. the resume URL, stay as plain `<a>`)

---

## Stage 8 — Contact form (Resend)

**Build**

- [x] Contact form (name, email, message) — client-side `required`/`type="email"` + real server-side validation (`src/lib/contact.ts`)
- [x] Server Action sends email via Resend to `ADMIN_EMAIL` (`src/lib/email.ts`'s `sendContactMessage`, `replyTo` set to the visitor's email so Shruti can just hit reply) — functionally equivalent to "an API route" (Server Actions are themselves POST endpoints under the hood), consistent with every other mutation in this codebase; see memory.md

**Test Gate**

- [x] Unit tests: form rejects empty name, empty/malformed email, empty message; accepts a valid submission (5 tests, `src/lib/contact.test.ts`)
- [x] Manual, against the real dev server: submitted an invalid email through the real form (genuine HTTP POST) → correctly redirected to `?error=validation` with the right message shown
- [x] Manual: server-side validation is what actually rejects bad input — confirmed by submitting directly via `curl` (bypassing any client-side check entirely)
- [x] Manual: submitted a fully valid message → **correctly detected the Resend delivery failure and showed a real error, not a false "message sent"** (see Technical learnings: the Resend SDK returns `{ data, error }` rather than throwing, so this had to be checked explicitly or a failed send would have silently looked successful) — confirmed via server log this was the same known 403 recipient restriction from Stage 4, not a new bug
- [x] Manual: separately proved the Resend mechanism itself is correct end-to-end by sending a one-off test email to the Resend account's own address (the one recipient the free tier allows) — real success, message ID returned, `error: null`
- **Same open item as Stage 4, not re-litigated here:** real messages to Shruti's actual inbox stay blocked until a domain is verified in Resend. The contact form is fully correct and will start working automatically the moment that's resolved — no code changes needed then.

---

## Stage 9 — About Me & Resume management

**Build**

- [x] Admin UI (`/admin/site-content`): edit About Me rich text (Tiptap) + profile photo upload
- [x] Admin UI: upload/replace Resume PDF (Blob storage) — `src/lib/blob.ts`'s `uploadImage` renamed to `uploadFile` since it's genuinely generic (used for photo + PDF now, not just images)
- [x] Public: Download Resume button (Home page) reflects the latest uploaded file
- **Scope addition, not in the original checklist:** also built contact email + social links editing (`SOCIAL_LINK_SLOTS = 6`, same fixed-slots pattern as project links) in the same form — README's admin capabilities list explicitly calls for "Edit contact info (email, social links)" as its own item, and it lives on the same `SiteContent` singleton, so building it separately later would've meant a second near-identical page. See memory.md.

**Test Gate**

- [x] Manual, against the real dev server + real Neon DB + real Vercel Blob: edited About Me (rich text with real HTML formatting) and uploaded a real profile photo — both appeared immediately on the public Home page (no caching lag, page is already `force-dynamic`)
- [x] Manual: uploaded a real resume PDF — the public Download Resume link on Home served the exact correct Blob URL
- [x] Manual: replaced the resume with a different PDF — confirmed via both the admin page and the public Home page that the link updated to the new file and the old URL is no longer referenced anywhere (single `resumeUrl` field, not an array — structurally can't duplicate); also incidentally confirmed the profile photo URL stayed unchanged when no new photo was uploaded in that same submission, proving the "keep existing file if none provided" merge logic works independently per field
- [x] Manual: contact email + one social link (LinkedIn) round-tripped correctly to both the admin form and the public Contact page
- All test data cleaned up afterward; confirmed Home/Contact both correctly return to their "coming soon" placeholder states with nothing in `SiteContent`

---

## Stage 10 — Seed real content

**Build**

- [x] Populated categories per the Seed content plan: **Writing** → History / Culture / Science & Psychology / Academic, **Editing** (flat), **Marketing** → Copywriting / Video-UGC Scripts, **Digital Journalism** (flat) — 10 categories, 4 top-level
- [x] Entered all 26 real projects from the work-sample files — every non-excluded file from both folders is represented (only `Article - Historical Narration.pdf` stayed excluded, per Decision #15); see memory.md for the exact category-by-category breakdown and the judgment calls made for files the original seed-content-plan bullets didn't explicitly name
- [x] Uploaded the real resume PDF and wrote real About Me copy (from the CV) + real contact email + LinkedIn social link

**Test Gate**

- [x] Manual: every category exists with correct nesting — verified live via both the public breadcrumb trail and the admin tree view
- [x] Manual: every project is present, correctly categorized, and its assets work — verified live: doc links (PDF/docx uploads, including a byte-perfect 19,135,424-byte upload of the 18MB Creative Portfolio PDF), a YouTube video embed, and a 9-image gallery (cover + 8) all confirmed accessible and correctly rendered
- [x] Manual: full click-through of the live site from Home → each top-level category → each subcategory → representative projects at every depth, plus Contact — all confirmed correct
- **Extra verification beyond the original checklist:** cross-checked admin-side project counts per category against the exact seed numbers (0+3+4+5+2+3+0+2+6+1 = 26) — exact match; confirmed the automated test suite's isolated unique-prefix convention (see memory.md) meant none of it touched or was touched by the real seeded content; full `build`+`lint`+`test` regression run clean against the now-populated database

---

## Stage 11 — Regression pass & deploy prep

**Build**

- [ ] Full test suite run (`npm test`, `npm run build`, `npm run lint`) clean
- [ ] Env var checklist for production (DB URL, NextAuth secret, Resend key, Blob token) documented in `.env.example`
- [ ] Vercel project settings reviewed (build command, env vars)

**Test Gate**

- [ ] All automated tests from Stages 1–9 still pass together (no regressions introduced by later stages)
- [ ] Production build succeeds locally (`next build`)
- [ ] **Explicit user confirmation before actual deploy/push to any shared environment**

---

## Resolved blockers

- [x] Postgres provider decision: **Neon**, provisioned via the Vercel Storage integration
- [x] Resend account/API key: obtained, stored in `.env` (not committed) — sending from the default `onboarding@resend.dev` sender for now
- [x] Vercel Blob token: obtained, stored in `.env` (not committed) — store access set to **Public**

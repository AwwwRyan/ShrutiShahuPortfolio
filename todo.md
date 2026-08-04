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

- [ ] "Forgot password" link/form on `/admin/login`
- [ ] Token generation (random, hashed at rest, 1-hour expiry) + Resend email send
- [ ] Reset-password page that validates token and sets new password

**Test Gate**

- [ ] Unit test: token is single-use (second use after consumption fails)
- [ ] Unit test: expired token is rejected
- [ ] Manual: full flow — request reset, receive email (or dev-mode console log), set new password, log in with new password

---

## Stage 5 — Category admin (multi-level tree)

**Build**

- [ ] API routes / server actions: create, rename, delete, move (re-nest), reorder
- [ ] Admin UI: tree view with move-to-parent controls
- [ ] Delete confirmation flow when a category has children/projects
- [ ] Guard against circular parent references (can't move a category under its own descendant)

**Test Gate**

- [ ] Unit test: creating a subcategory nests it correctly under its parent
- [ ] Unit test: moving a category under its own descendant is rejected
- [ ] Unit test: reordering siblings updates `order` correctly
- [ ] Manual: build a 3-level tree in the admin UI (e.g. Marketing → Video/UGC Scripts) and confirm it renders correctly on the public category pages

---

## Stage 6 — Project admin (CRUD + assets)

**Build**

- [ ] API routes / server actions: create, edit, delete project
- [ ] Fields: header, rich text description (Tiptap), coverImage, gallery[], videoUrl, client, tags, links[], featured, order, category assignment
- [ ] Image upload to Vercel Blob (cover + gallery)
- [ ] Admin UI: project form + list view within a category

**Test Gate**

- [ ] Unit test: project creation requires header + category (validation)
- [ ] Manual: upload a cover image and a multi-image gallery, confirm both round-trip (visible after page reload)
- [ ] Manual: add a `videoUrl` and confirm it's stored/retrieved correctly
- [ ] Manual: add multiple `links[]` entries with labels and confirm all persist
- [ ] Manual: reorder projects within a category and toggle `featured`

---

## Stage 7 — Public pages

**Build**

- [ ] Home page: About Me + Download Resume link + top-level category entry points
- [ ] Category view: breadcrumbs, subcategories, direct projects (featured surfaced first)
- [ ] Project detail: header, description, cover, gallery/video, client/tags, links
- [ ] Contact page: static contact info section

**Test Gate**

- [ ] Render test (RTL or manual): Home shows About Me content and links to seeded top-level categories
- [ ] Manual: navigate 3 levels deep into a nested category, confirm breadcrumbs match the path
- [ ] Manual: a video project shows an embedded player; an image-gallery project shows all images
- [ ] Manual: a project with multiple `links[]` renders all of them with correct labels

---

## Stage 8 — Contact form (Resend)

**Build**

- [ ] Contact form (name, email, message) with client + server-side validation
- [ ] API route sends email via Resend to Shruti's address

**Test Gate**

- [ ] Unit test: form rejects empty/invalid email
- [ ] Manual: submitting the form in dev actually delivers an email (or hits Resend's test mode) end-to-end
- [ ] Manual: server-side validation rejects a malformed request even if the client check is bypassed

---

## Stage 9 — About Me & Resume management

**Build**

- [ ] Admin UI: edit About Me rich text + profile photo
- [ ] Admin UI: upload/replace Resume PDF (Blob storage)
- [ ] Public: Download Resume button reflects the latest uploaded file

**Test Gate**

- [ ] Manual: edit About Me in admin, confirm change reflects immediately on the public Home page
- [ ] Manual: upload a resume PDF, confirm the public download link serves the correct file
- [ ] Manual: replace the resume, confirm the old file is no longer served (link updates, not duplicated)

---

## Stage 10 — Seed real content

**Build**

- [ ] Populate categories per the Seed content plan in README (Writing → History/Culture/Science/Academic; Editing; Marketing → Copywriting/Video-UGC; Digital Journalism)
- [ ] Enter all real projects from the work-sample files reviewed earlier, with correct fields/assets per project
- [ ] Upload the resume PDF and write real About Me copy (from CV + LinkedIn)

**Test Gate**

- [ ] Manual: every category in the plan exists with correct nesting
- [ ] Manual: every project from the seed content plan is present, correctly categorized, and its assets (image/gallery/video/links) work
- [ ] Manual: full click-through of the live site from Home to every leaf project

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

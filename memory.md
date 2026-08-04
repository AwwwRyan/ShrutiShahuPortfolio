# Project Memory

Running log of decisions, learnings, and draft history for the Shruti Shahu Portfolio project. Update this file whenever a decision is made, a requirement changes, or something non-obvious is learned — this is the context a fresh session (or a compacted one) needs to avoid re-deriving or re-litigating settled ground. Pair with [todo.md](todo.md) (what's next) and [README.md](README.md) (current state of requirements).

---

## Decisions log

Chronological. Each entry is a decision that's settled — don't revisit without new information.

1. **Stack:** Next.js (App Router) full-stack app, single deployable, hosted on Vercel.
2. **Database:** Postgres via Prisma ORM, provider is **Neon**, provisioned through the Vercel Storage integration (gets Neon's free tier + Vercel's env var integration).
3. **Auth:** NextAuth.js, credentials provider, single admin account (Shruti), no public sign-up. Admin provisioned via seed script.
4. **Password reset:** Email-based single-use link, 1-hour expiry, token hashed at rest, sent via Resend. Chosen over security questions / magic-link-only because it reuses infra already committed to (Resend + Prisma) and there's only one account to secure.
5. **File storage:** Vercel Blob for images and docs (cover images, gallery images, PDFs). Chosen for low traffic (<100 users/day) — no need for a managed server disk, generous free tier, zero-config with Next.js.
6. **Video hosting:** External (YouTube/Vimeo, unlisted), embedded via URL — NOT uploaded to Blob. Reasoning: sample videos run 10–33MB each; direct Blob hosting would mean real storage cost and no adaptive streaming. Blob storage stays scoped to images/docs only.
7. **Rich text editor:** Tiptap, for project descriptions and About Me.
8. **Contact form:** Working form (name/email/message) → Resend → email to Shruti. Not just static contact info.
9. **Categories are fully dynamic and multi-level** (self-referencing `parentId` on Category, unlimited depth). The four category names in the README (Writing, Editing, Marketing, Digital Journalism) are seed data only, not hardcoded. A category can hold both subcategories AND projects directly at the same time (folder-with-files-and-subfolders model) — projects are not restricted to leaf categories.
10. **Project fields beyond the original spec:** client/publication name, tags (freeform, separate from category), multiple `links[]` (each with label + url), featured flag, manual order, cover image, `gallery[]` (multi-image, for carousel-style pieces like the Digital News series), `videoUrl` (external embed for video projects).
11. **Multi-piece source documents** (e.g. the 18MB Creative Portfolio PDF, the Investimate pitch deck) go in as **one project = one doc link**, not split into per-page projects. Applies to the whole doc, not per-piece.
12. **Video script bank "KW" column → `tags` field.** `client` field stays empty for affiliate/UGC-style video projects since they're not client-attributed work.
13. **Client/brand names in real samples (MoneyHub, Investimate) are fine to display publicly as-is** — no anonymization needed, confirmed by Shruti.
14. **The MoneyHub EMI Calculator editing sample (with visible Grammarly-style feedback notes) is intentional**, not a work-in-progress artifact — it's meant to show editorial suggestion-making to recruiters. Goes in as-is.
15. **"Article - Historical Narration.pdf" is excluded** from the portfolio entirely (per Shruti — not a piece she wants shown).
16. **The 8-image Digital News series (49–56.jpg) becomes ONE project** using the `gallery[]` field (carousel), not 8 separate projects.
17. **No dedicated Writing → "Personal Essays" subcategory.** The Y2K fashion/algorithm essay and the Tradwife Trend piece fold into a "Culture" subcategory instead.
18. **No structured Work Experience/Resume data model.** The CV (skills, 8 roles, education, certifications) is NOT modeled as site content — instead it's a single admin-uploadable PDF surfaced as a "Download Resume" link/button near About Me. Keeps the data model scoped to what the original 6 requirements asked for.
19. **The CV's "Best Written Works" link** will eventually point at this new site once live — not an external site to integrate with.
20. **Workflow convention (this instruction):** Build in stages per `todo.md`, each with a test gate. Do not proceed to the next stage until the current stage's tests pass and are manually confirmed working. Every planning artifact (this file, todo.md, README.md) is treated as a living draft, updated in place rather than left stale.
21. **Admin credentials:** `shruti2004shahu@gmail.com` / a password Shruti chose herself (weak — flagged once, her call, changeable later via Stage 4's reset flow). Stored in `.env` as `ADMIN_EMAIL`/`ADMIN_PASSWORD` (seed script input only, gitignored) — the actual `AdminUser.passwordHash` in the DB is bcrypt-hashed, plaintext is never stored there.

---

## Video project embed URLs (confirmed)

The 6 marketing videos are now uploaded to YouTube (Shorts). These are the real `videoUrl` values to use when seeding those projects at Stage 10 — sourced from the updated `Video Script bank .xlsx` at repo root (which supersedes the older copies in `Marketing And Copy Writing/` and `Shruti Shahu - Work Samples/Best Written Stuff/`, which still only have mp4 filenames, not links):

| Project (KW)                                                | YouTube URL                              |
| ----------------------------------------------------------- | ---------------------------------------- |
| Luxury Villas in Sicily                                     | <https://youtube.com/shorts/1hKp5_FtMdc> |
| Dental Clips Guide                                          | <https://youtube.com/shorts/_9ZI2VvwAC0> |
| MRI Technician Training (TTD)                               | <https://youtube.com/shorts/7Tv3Wbli7ws> |
| All Inclusive Tanzania Safari and Zanzibar Packages (EN/ES) | <https://youtube.com/shorts/0h9xgkb7v_4> |
| Rent to own Food Trucks                                     | <https://youtube.com/shorts/JwGFaDy5JZc> |
| Rent to own ATVs                                            | <https://youtube.com/shorts/G_R_z-LJjaA> |

Remaining rows in the script bank (Best Diet for Fatty Liver, Reduce Wrinkles Around the Mouth, Early Signs of Parkinson's, How to Stop Dementia, Ireland/Scotland packages, Cancun packages, Christmas Markets in Germany) have no linked video/file — script-only, not video projects (or not yet produced).

---

## Content inventory (source files reviewed)

Reviewed in full: `Marketing And Copy Writing/` and `Shruti Shahu - Work Samples/` (34 files — PDFs, docx, xlsx, mp4, jpg). Full breakdown lives in the "Seed content plan" section of README.md — this is the short version:

- **Marketing And Copy Writing/**: Investimate pitch deck (PDF), Creative Portfolio (18MB PDF), MoneyHub EMI blog draft w/ edit feedback (docx), Video Script bank (xlsx, EN/ES rows), 6 matching mp4s in `Videos/`.
- **Shruti Shahu - Work Samples/Best Written Stuff/**: ~10 long-form writing samples (finance listicle, postcolonial lit-crit paper, archaeology, entertainment, history x2, culture/trend pieces, AI/future-of-work, workplace culture, psychology, celebrity bio) + a duplicate script bank xlsx.
- **Shruti Shahu - Work Samples/Editing/**: 5 files — BizOps skills guide, Y2K/personal-style essay, duplicate MoneyHub draft, "Article - Historical Narration" (excluded), Sample Editing doc PDF.
- **Shruti Shahu - Work Samples/Digital News/**: 8 numbered jpgs (49–56), a sequential graphic/carousel series → becomes one project.
- **Shruti Shahu - CV - Content.pdf** (repo root): Full resume — Summary, Skills, 8 roles of Work Experience, Education (BA English Lit, V.G. Vaze College 2021–2024), Certification (Udemy Editing/Proofreading/Copywriting 2023 & 2025). Not modeled as structured data — see Decision #18.

---

## Technical learnings

- **Read tool cannot open `.docx`/`.xlsx` directly** ("binary file" error). Both formats are zip archives of XML under the hood — wrote a stdlib-only Python script (no pip installs needed) at the time to extract text: `word/document.xml` for docx (`<w:t>` runs), `xl/worksheets/sheet*.xml` + `xl/sharedStrings.xml` for xlsx. Reusable approach if more Office docs show up.
- **`python3` on this machine is a broken Windows Store alias.** Use the real interpreter directly: `/c/Users/Aryan/AppData/Local/Programs/Python/Python312/python` (from Git Bash). `python-docx` / `openpyxl` are NOT installed — stick to the stdlib zip/XML approach rather than assuming they're available.
- **Read tool handles PDFs and images natively** (renders pages/images for multimodal viewing) — no extraction script needed for those, unlike docx/xlsx.
- **Markdown lint hook is active on this repo** (PostToolUse on Write) — enforces blank lines around headings and lists (MD022/MD032) and table pipe alignment (MD060). Write markdown with blank lines around every heading/list and aligned table columns from the start to avoid a follow-up fix pass; for tables, generate the padding programmatically (e.g. a quick script) rather than hand-aligning pipes.
- **Next.js 16 (Turbopack) here is newer than training data — read its bundled docs before writing app code.** `create-next-app`/`next dev` auto-generate `AGENTS.md` (imported by `CLAUDE.md` via `@AGENTS.md`) warning that APIs/conventions/file structure may differ from what's expected, and pointing to `node_modules/next/dist/docs/` as the source of truth. Consult that before writing App Router routes, data fetching, or config in Stage 2+ rather than assuming pre-16 patterns still apply.
- **`npm install` can drop mid-download (ECONNRESET) on this machine's network** — safe to just retry `npm install` in place; partial installs don't corrupt the project.
- **`create-next-app` rejects directory names starting with `_`** (npm naming restriction) — use a plain name like `scaffold-tmp` when bootstrapping into a temp folder for a merge-into-existing-repo workflow.
- **The two "work sample" folders and the CV PDF are untracked, uncommitted local files** sitting in the repo working directory (not yet in git, not mentioned in `git status` output shown at session start beyond README.md). Worth deciding, before Stage 10, whether these raw source files get committed to the repo, gitignored, or live only in Blob storage post-upload.
- **Prisma installed at v7.9.1 — a major architecture change from the 5/6 patterns in training data. Do not assume old Prisma conventions.** Concretely, on this project:
  - `prisma init` no longer just writes `schema.prisma` + a `DATABASE_URL` line in `.env`. It also generates **`prisma.config.ts`** at repo root, which is what the **Prisma CLI** (`migrate`, `generate`, `studio`) reads for the datasource URL — `schema.prisma`'s `datasource` block now only has `provider = "postgresql"`, no `url = env(...)` line.
  - The default `generator client` provider is now **`prisma-client`** (not `prisma-client-js`), and it generates a TypeScript source tree into a custom `output` path (we used `src/generated/prisma`, gitignored automatically by the CLI) — not the old `node_modules/.prisma` + `@prisma/client` re-export pattern. Import the client from `@/generated/prisma/client`, not `@prisma/client` (that package now just provides shared runtime bits).
  - **The generated client requires an explicit driver adapter at runtime — it no longer reads `DATABASE_URL` implicitly.** For Postgres: `npm install @prisma/adapter-pg pg` (+ `@types/pg`), then `new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })`. This is separate from `prisma.config.ts` (CLI-only) — the app's own runtime client needs the adapter wired manually. See `src/lib/prisma.ts`.
  - `prisma.config.ts` needs `dotenv` installed (`import "dotenv/config"` at its top) since it reads `process.env.DATABASE_URL` outside of Next.js's own env-loading.
  - Vitest does **not** auto-load `.env` like Next.js does — `vitest.config.ts` needs `import 'dotenv/config'` itself, or DB-touching tests silently fail to connect.
  - `prisma migrate dev` did not auto-run `prisma generate` reliably here — ran `npx prisma generate` explicitly afterward to produce `src/generated/prisma`.
- **Testing convention for this project:** DB-touching Vitest tests run against the real (free-tier, low-traffic) Neon dev database rather than a separate test DB — each test file uses a unique per-run prefix (e.g. `` `test-${Date.now()}` `` on slugs/emails) and cleans up its own rows in `afterAll`, relying on the schema's cascade deletes to sweep up children. Keep doing this for Stage 3+ tests rather than standing up test-DB infrastructure the project doesn't need yet.
- **`middleware.ts` is deprecated in Next.js 16 — renamed to `proxy.ts`.** Confirmed via `node_modules/next/dist/docs/.../file-conventions/middleware.md`, which redirects to `proxy.md`. Same request/response signature and `config.matcher` behavior, just: file renamed `middleware.ts` → `proxy.ts`, exported function renamed `middleware` → `proxy` (default or named export either works). A NextAuth v5 `auth(...)`-wrapped handler works fine as the default export of `proxy.ts` — the rename is purely about the file/export name Next.js looks for, not the function signature. Built this project with `src/proxy.ts` from the start rather than the deprecated name. `next build` output explicitly labels it `ƒ Proxy (Middleware)` when correctly detected.
- **NextAuth v5 (`next-auth@beta`, currently 5.0.0-beta.32) App Router wiring, confirmed against the installed package's own `.d.ts` files (not assumed from training data):**
  - `src/auth.ts`: `export const { handlers, signIn, signOut, auth } = NextAuth({ providers: [...] })`.
  - Route handler at `src/app/api/auth/[...nextauth]/route.ts` must destructure: `export const { GET, POST } = handlers;` — NOT `export { GET, POST } from '@/auth'` (that fails; `auth.ts` only exports `handlers`, `GET`/`POST` live inside it).
  - `src/proxy.ts`: `export default auth((req) => { ... req.auth ... })`, with `export const config = { matcher: [...] }` same as the old middleware convention.
  - Credentials provider's `authorize()` receives `credentials` (values from the form/POST body) and must return a `User`-shaped object (`{ id, email, ... }`) or `null` — never throw for "just wrong password," return `null` instead; NextAuth turns that into a `CredentialsSignin` error at the call site.
  - In a Server Action (e.g. the `/admin/login` form's `action`), a failed `signIn()` throws — catch it, check `error instanceof AuthError` (imported from `next-auth`, re-exported from `@auth/core/errors`), then call Next.js's own `redirect()` to show an error state; rethrow anything that isn't an `AuthError` (Next.js's internal redirect-on-success also throws internally and must propagate uncaught).
  - Verified the whole flow (correct login, wrong login, protected-route redirect, authenticated access) with `curl` against NextAuth's own endpoints directly — `GET /api/auth/csrf` for a token, `POST /api/auth/callback/credentials` (`csrfToken`, `email`, `password`, `redirect=false`, `json=true`) to sign in, `GET /api/auth/session` to confirm session state — rather than needing a browser. Useful pattern for testing future auth-gated stages without browser automation.

---

## Draft history

- **README.md**
  1. Initial scaffold: tech stack, content model (flat categories), public pages, admin module, decisions-locked section, open questions.
  2. Added multi-level category nesting (`parentId`, tree semantics, folder-with-files-and-subfolders rule).
  3. Locked in Tiptap, Resend, email-based password reset; added "Decisions Locked In" section.
  4. Added `gallery[]` and `videoUrl` project fields, external video hosting note, and the "Seed content plan" section mapping real reviewed files to categories/projects.
  5. Added Resume as an admin-uploadable PDF + "Download Resume" link (About Me / Home), after deciding not to build a structured Experience data model.
- **todo.md** — created: 12 stages (0–11) from planning docs through seed content and deploy prep, each with a Build checklist and a Test Gate checklist. Stage 1's blockers (Postgres/Resend/Blob provisioning) resolved and checked off; Stage 1 itself built and its test gate passed (dev/build/lint all green).
- **memory.md** — created: this file.
- **Stage 1 scaffolding**: `create-next-app` (Next.js 16, TypeScript, App Router, Turbopack, Tailwind, ESLint) bootstrapped into a temp folder and merged into repo root (our README.md/todo.md/memory.md preserved, the tool's own generated README.md discarded); added Prettier; `package.json` renamed to `shruti-shahu-portfolio`; `.env` (real secrets, gitignored) and `.env.example` (stub) created.
- **Stage 2 database**: Prisma 7.9.1 + `@prisma/adapter-pg` installed; `prisma/schema.prisma` written with all 6 models; migration `20260804184045_init` applied to the real Neon DB; `src/lib/prisma.ts` client singleton; Vitest installed and `src/lib/prisma.test.ts` written (6 tests, all passing against the live DB). See Technical learnings above for the Prisma 7 architecture details this uncovered.
- **Stage 3 auth**: `bcryptjs` + `next-auth@beta` (5.0.0-beta.32) installed; `src/lib/password.ts` (+3 unit tests); `prisma/seed.ts` seeds `AdminUser` from `ADMIN_EMAIL`/`ADMIN_PASSWORD`, wired into `prisma.config.ts`'s new `migrations.seed` field, run via `npx prisma db seed`; `src/auth.ts` (Credentials provider), `src/app/api/auth/[...nextauth]/route.ts`, `src/app/admin/login/page.tsx` (server-action form), `src/app/admin/page.tsx` (placeholder dashboard), `src/proxy.ts` (not `middleware.ts` — see Technical learnings). Full login/logout/protected-route flow verified via curl against the live dev server.

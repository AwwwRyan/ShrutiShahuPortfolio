# Shruti Shahu Portfolio

A portfolio site for Shruti Shahu showcasing writing, editing, marketing, and digital journalism work, with a password-protected admin panel for self-service content management.

This README focuses on **functionality and requirements**. Visual design/styling is deferred to a later pass.

## Tech Stack

- **Framework:** Next.js (App Router) — full-stack, single deployable app
- **Database:** Postgres (e.g. Neon or Vercel Postgres)
- **ORM:** Prisma
- **Auth:** NextAuth.js (email + password / credentials provider), single admin account
- **File storage:** Vercel Blob — cover/gallery images and doc uploads (low traffic, no server-managed disk needed)
- **Video hosting:** external (YouTube/Vimeo, unlisted) — projects with video embed a player via URL rather than uploading the video file itself; keeps Blob storage scoped to images/docs and avoids paying for/streaming large video files directly
- **Rich text:** Tiptap, for project descriptions
- **Email (contact form + password reset):** Resend
- **Hosting:** Vercel

## Content Model

### Category

- `id`
- `name`
- `slug`
- `parentId` (nullable, self-referencing) — enables multi-level nesting: a category can have subcategories, which can themselves have subcategories, to any depth
- `order` (for manual reordering among siblings)
- Fully dynamic: admin can create, rename, delete, re-nest (move under a different parent), and reorder categories at any level. The four categories below are just seed top-level data, not hardcoded:
  - Writing
  - Editing
  - Marketing
  - Digital Journalism
- A category can hold both subcategories and projects directly at the same time (like a folder that contains both files and subfolders) — projects aren't restricted to leaf categories only
- Deleting a category with subcategories or projects requires an explicit confirmation in the admin UI (choose to move or delete its contents)

### Project

Belongs to one Category (at any level of the hierarchy).

- `id`
- `header` (title)
- `description` (rich text)
- `coverImage` (optional, stored in Blob storage) — the thumbnail shown in category/listing views
- `gallery[]` (optional, stored in Blob storage) — additional images beyond the cover, rendered as a gallery/carousel on the project detail page (e.g. a multi-slide graphic series); ordered, admin can add/remove/reorder
- `videoUrl` (optional) — external embed URL (YouTube/Vimeo unlisted) for video projects; renders an embedded player on the project detail page alongside the (rich text) description
- `client` / publication name (optional)
- `tags` (freeform list, separate from category — e.g. "SEO", "long-form")
- `links[]` — multiple links/docs per project, each with:
  - `label` (e.g. "Read on Medium", "Download PDF")
  - `url`
- `featured` (boolean)
- `order` (for manual reordering within a category)
- `createdAt` / `updatedAt`

### Seed content plan (from real work samples)

Based on reviewing the actual source files in `Marketing And Copy Writing/` and `Shruti Shahu - Work Samples/`:

- **Writing**
  - History (Wild West long-read, Romanovs, archaeology/Guangxi sinkhole piece)
  - Culture (Tradwife Trend piece, "Nobody Has a Personal Style Anymore" — Y2K fashion/algorithm essay, entertainment listicle)
  - Science / Psychology (psychology & therapy article, AI & future-of-work piece, workplace/hybrid-work pieces)
  - Academic (postcolonial literary analysis paper)
- **Editing**
  - The MoneyHub EMI Calculator draft (with visible editor suggestions/Grammarly notes) goes in **as-is** — it's a deliberate choice to show editorial suggestions to recruiters, not a work-in-progress
  - "Article - Historical Narration.pdf" is excluded — not going in the portfolio
- **Marketing**
  - Copywriting — Investimate pitch deck and the Creative Portfolio PDF each go in as **one project with the whole document as a single doc link** (not split into per-page/per-piece projects); same for the MoneyHub blog draft
  - Video/UGC scripts — each video project pairs the `videoUrl` embed with rich-text description sourced from the matching script bank row (e.g. Luxury Villas in Sicily, Dental Clips, MRI Tech Training, Rent-to-Own ATVs/Food Trucks, Tanzania & Zanzibar — EN/ES); the script bank's "KW" column becomes that project's `tags` entry (e.g. "Luxury Villas in Sicily"); `client` stays empty for these — they're affiliate/UGC-style, not client-attributed
- **Digital Journalism**
  - Single project ("Digital News Roundup" or similar) using the `gallery[]` field for the 8-image numbered news graphic series (49–56.jpg)

Client/brand names in samples (MoneyHub, Investimate) are fine to display as-is — no anonymization needed.

### Site content (singleton, admin-editable)

- **About Me** section: rich text + optional profile photo
- **Resume**: admin-uploadable PDF (stored in Blob storage) surfaced as a "Download Resume" link/button near About Me or Contact — work experience, skills, education, and certifications stay inside this PDF rather than being modeled as structured site content
- **Contact info**: email, social links (displayed alongside the contact form)

## Public Site Pages

1. **Home** — About Me section (with Download Resume link) + entry points into top-level categories
2. **Category view** — shows a category's subcategories (if any) alongside its own projects (respecting `order`, with `featured` projects surfaced); breadcrumb navigation reflects the category's position in the hierarchy
3. **Project detail** (or expandable card) — header, description, cover image, client/tags, links/docs
4. **Contact** — working contact form (name, email, message) → sends email to Shruti via Resend; also displays static contact info/social links

## Admin Module

- Route: `/admin` (or similar), protected — unauthenticated users are redirected to `/admin/login`
- **Auth:** email + password login (NextAuth credentials provider), single admin user seeded in the database (Shruti's account)
- **Capabilities:**
  - Create / rename / delete / reorder categories, and nest them under other categories (multi-level, e.g. Marketing → Social Media → Instagram Campaigns) via a tree view with drag-and-drop or move-to-parent controls
  - Create / edit / delete projects (all fields above, including cover image upload and multiple links), assignable to any category in the tree
  - Reorder projects within a category, toggle featured
  - Edit About Me content, upload/replace the Resume PDF
  - Edit contact info (email, social links)
- No public sign-up — the admin account is provisioned directly (e.g. via a seed script), not through a registration form
- **Password reset:** email-based reset link — admin requests reset from `/admin/login`, receives a single-use, time-limited (1 hour) token link via Resend, and sets a new password; token is hashed at rest and invalidated after use or expiry

## Decisions Locked In

- Rich text editor: **Tiptap**
- Contact form + password reset emails: **Resend**
- Password reset: email-based single-use link (see Admin Module above)

## Open Questions / Next Steps

- [ ] Anything else to nail down before scaffolding? (deployment target details, exact DB provider — Neon vs. Vercel Postgres, domain name)
- [ ] Scaffold Next.js project, Prisma schema, and auth — **on hold, do not start yet**

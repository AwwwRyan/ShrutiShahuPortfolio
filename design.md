# Design Plan

Visual design pass for the portfolio site. README.md said design/styling would be "deferred to a later pass" while Stages 1–11 built functionality — this is that pass. Nothing here changes the content model, admin capabilities, or data (see README.md/todo.md) unless explicitly noted; this is about how the existing functionality *looks and feels*.

**Status:** IMPLEMENTED. All public pages (Home, Category, Project, Contact) have been rebuilt against the locked decisions and design tokens below — see memory.md's Stage 11 draft-history entry for the build notes. The "Reference inspiration log" below is kept as historical context for *why* each decision was made; the **Locked decisions** and **Design tokens** sections remain the source of truth if anything needs revisiting.

**Implementation notes (deviations/judgment calls made while building, not raised as new open questions):**
- Category has no `image` field in the schema (schema changes were out of scope), so category tiles use solid accent colors cycling through the palette rather than photos — matches the "solid accent color" half of Locked decision 5.
- Skills/tools chips render as plain text badges (no brand logos) — pulling real Grammarly/ChatGPT/etc. icons would mean bundling third-party trademarked assets; a clean text-chip in the site's own type/color system was the safer, still-editorial choice.
- Added (not in the original brief, done proactively per later requests in the same session): skeleton loaders + a top progress bar via Next.js `loading.tsx` per route, styled 404 pages (root + site-scoped), per-page meta descriptions (static for Home/Contact, `generateMetadata` for Category/Project), full alt-text audit, and the custom favicon.

**Refinement round 1 (post-launch feedback):**
- All external links (social links, resume, project doc links) now open in a new tab (`target="_blank" rel="noopener noreferrer"`) rather than navigating away from the site.
- **Services section changed from the bordered-card grid to a numbered editorial list** — the cards looked clickable but weren't, which read as a UI bug. New treatment: a single-column list, large serif service name + a faint serif ordinal (`01`–`06`), thin divider rules between rows, no box/background at all. Supersedes the "6 bordered cards" wording in Locked decision 3 below — the *content* (the 6 service names) is unchanged, only the visual treatment.
- **Doc-link downloads:** investigated why some project doc links downloaded instead of opening — 14 of 18 are PDFs (Vercel Blob already serves these `Content-Disposition: inline`, so they render in-browser), but 4 are `.docx` (Blob serves these `attachment`, forcing a download regardless of link target). Decision: for those 4 specific projects only, replace the short blurb + download-link pattern with the real document content rendered directly in `description` (already a rich-text field, no code change needed once Shruti supplies the text) and remove the doc link. The other 14 PDF links are unaffected. Affected projects: "Nobody Has a Personal Style Anymore," "A Postcolonial Analysis of Urvashi Butalia's *The Other Side of Silence*," "MoneyHub EMI Calculator — Editorial Feedback Sample," "Editing Sample: Top Skills a BizOps Leader Needs to Learn."

**Refinement round 2 (full dark-theme repaint):**
- **The site is now dark-themed** — this directly supersedes Locked decision 7 below ("no full-width dark section, dark tones reserved for buttons"). The near-black tone is now the page background everywhere on the public site, not just a button color.
- **Palette replaced entirely** with a new 6-swatch reference (see Design tokens below). The new palette is more tonal than the original — only 2 of the 6 swatches are light enough to serve as text or a "pop" accent; the other 4 are all dark greens. That reshaped several component-level color *roles*, not just hex values: `teal` and `olive-sage` flipped from "light fill, dark text" to "dark fill, light text" everywhere they're used as a Card tone, and every place that used `teal`/`olive-sage` as a text/hover/focus color (breadcrumb hovers, stat numbers, focus rings, link hovers, form focus borders, alert banners) was swept to `chartreuse` or `paper` instead, since those are the only two colors left light enough for that job.
- **Services section changed again** — from round 1's numbered list to icon-badge cards (per a reference screenshot of a "Service We Provide" section), each genuinely linking to `/contact` this time (fixing the original "looks clickable but isn't" complaint by making it real, not just removing the affordance). Icons are from `lucide-react` (MIT-licensed), not scraped web images — a curated SVG icon library matches the site's existing clean/editorial aesthetic better than a mismatched hand-drawn set would, and avoids any licensing ambiguity around sourced icon assets.
- **"Human touch" hero treatment**, per a third reference screenshot (organic blob-masked photo, layered/overlapping composition): the profile portrait now uses a CSS-only organic blob mask (`border-radius` trick, no SVG asset), with a soft blurred color-glow behind it and a small decorative circular badge overlapping its corner. Deeper elements from that same reference (education/experience timeline, hobbies section) weren't added — they'd need real content from Shruti and aren't part of the current data model.
- **Dark theme is scoped to the public site only**, via a `.site-shell` wrapper class (see `src/components/SiteShell.tsx`) that both `(site)/layout.tsx` and the root `not-found.tsx` use. It works by redefining the palette's CSS custom properties *inside* `.site-shell` rather than at `:root` — `/admin/*` sits outside that scope entirely and never sees the dark values, keeping it on its original light/unstyled appearance untouched, per the standing "admin stays out of scope" rule.

**Refinement round 3:**
- **Category tiles now have real background photos** (Writing/Marketing/Digital Journalism — Editing has none yet) with a green-tinted overlay, and their label text moved to the top of the tile instead of the bottom. Hardcoded per-slug in `CategoryTiles.tsx`, not a new database field — same "no schema changes" reasoning as elsewhere in this pass.
- **PDF doc links now open in an in-app preview modal** (`src/components/DocumentLink.tsx`) instead of a new tab, per a Google-Drive-style reference — the browser's own native PDF viewer renders inside an iframe, so the component just supplies the modal chrome around it. Non-PDF links (the 4 `.docx` files still pending real content, per round 1) fall back to the previous new-tab behavior automatically.

**Goal, in Shruti's words:** make it "look like ART" — not just clean/functional, but a genuinely striking, editorial-feeling portfolio, not a generic template look.

---

## Design tokens (final)

**Palette — superseded by refinement round 2.** Original palette (kept for history):
- Teal — `#54C9CC` · Navy-teal — `#1F4F5A` · Olive-sage — `#75A08E` · Chartreuse — `#DCD964` · Near-black-olive — `#213502` · Paper — `#F7F5EF`

**Current palette** (dark theme, scoped to `.site-shell` — admin keeps the original `paper`/`ink` pairing above):
| Token | Hex | Role |
|---|---|---|
| `near-black-olive` | `#051F20` | Page background (darkest) |
| `navy-teal` | `#0B2B26` | Surface — header/footer/phone-mockup bezel |
| `olive-sage` | `#163B32` | Secondary dark surface/border |
| `teal` | `#235347` | Tertiary dark tone (structural only — not used as text/light-fill) |
| `chartreuse` | `#8EB69B` | Bright accent — the workhorse: stat numbers, focus rings, hover states, badges, one "pop" Card tone |
| `paper` | `#DAF1DE` | Lightest — body text, button fills, borders-on-dark, skeleton loaders |

Only `chartreuse` and `paper` are light enough to use as text or a bright fill in this palette — everything else is a structural/background tone.

**Type**
- Display/headings: editorial serif (e.g. Fraunces)
- Body/UI: clean sans (e.g. Inter)

---

## Locked decisions

Supersedes the "Open questions" this doc originally raised. Two of these are explicit *changes* from the original reference-log takeaways below — flagged inline.

1. **Homepage structure:** Option (a) — About Me leads the first fold (short bio + portrait + a pill "View My Work" button that scrolls to the category tiles), with the 4 category tiles below on the *same* page. Categories do not get a separate nav destination.
2. **Stats/credibility bar** — real numbers, on a light/tinted background (sage or chartreuse tint), not dark:
   - 4+ Years experience
   - 80k+ Impressions & reads
   - 15+ Writers trained
   - 20+ Clients
3. **Services section** — 6 bordered cards, using the shared card component: Content Editing & Proofreading · Manuscript Editing · Academic Editing · Writing · Digital News Reportage · Research.
4. **Skills/tools** — icon-badge section, **four labeled sub-groups** (not one flat row), each using the shared icon-badge component:
   - **Editorial:** Grammarly, QuillBot, Hemingway Editor, Wordtune (+ others)
   - **CMS / Productivity:** ClickUp, Monday.com, Notion, Google Workspace, MS Office, Teams
   - **SEO:** Semrush, Surfer, Ahrefs, AdHeart, Meta (FB) Ad Library, Meta Business Suite
   - **AI:** ChatGPT, Copilot, Gemini, Perplexity, Claude, Copy.ai, Creatify
5. **Category tiles** — image (or solid accent color if no image) + category name **only**. No stat badge, no project count, no description line — a deliberate simplification of the ref #2 "Our Properties" pattern.
6. **Contact CTA — CHANGED FROM PLAN.** Ref #7's two-button pair ("Want to discuss?" outline + "Let's Talk" filled) is dropped. Replaced with **one button**, label **"Want to know more? Let's talk"**, linking to the existing `/contact` page. Appears once in the header and once in the footer, on every page. The two-tier button *style* can still exist elsewhere (e.g. "View My Work" stays a distinct pill button) — it's specifically the header/footer contact CTA that becomes single, not the whole button system.
7. **Dark treatment — CHANGED FROM PLAN.** No full-width dark section (drops ref #3's dark stats-band idea entirely). Navy-teal and near-black-olive are used for **button fills** instead — bold dark buttons on an otherwise light/paper background. The stats bar (decision 2) sits on a light or lightly-tinted background, never a dark band.
8. **Admin (`/admin/*`)** — confirmed out of scope for this visual pass. Stays functional/plain (Shruti-only, not recruiter-facing).

---

## Reference inspiration log

Each entry: what the reference shows, what Shruti said about it (verbatim where given), and the concrete design takeaway.

### 1. "Stand Out" — Denise's site (warm/earthy hero + service icons + about)

Forest-photo hero, bold headline over an illustrated motif, short intro line ("Hi, my name is Denise, I create..."), a row of 4 circular service icons, then a photo + About Me block with a pull-quote and a QR/footer element.

> **Shruti:** "first page should only be about me and my experience and skills"

**Takeaway — structural, not stylistic.** The homepage's first fold should lead with About Me (bio + experience/skills), not category tiles. This is a cue about *page hierarchy* (About first), not the earthy color palette or the illustration style, which aren't otherwise referenced elsewhere. Confirm with Shruti whether category entry points (Writing/Editing/Marketing/Digital Journalism) live below the About fold on the same page, or move to their own nav destination — see Open Questions.

### 2. "Our Properties" — real estate before/after card grid

Clean 4-card grid, warm cream background, olive-green serif heading, each card pairing a photo with a bold stat callout (60%, 210%, 310%, 380%) and a short label.

> **Shruti:** "Our properties image, shruti feels that might be a good way to go to the separate writing, editing, marketing, digital journalism containing categories."

**Takeaway — this is the pattern for the 4 top-level category tiles.** Writing / Editing / Marketing / Digital Journalism become a card grid in this style: photo/visual + short label per card, elegant serif heading above the grid. Open question: this reference's cards lead with a *stat* (a percentage). Shruti's categories don't have an equivalent metric — needs a decision on what (if anything) replaces the stat badge (e.g. project count, a representative tag line, or just image + name with no stat).

### 3. "Botanie" — plant shop (dark green, organic, stats bar + icon-badge services)

Deep forest-green background throughout, large serif headline ("Leafy Beauties For Every Space"), warm product photography, a horizontal stats bar (256k+ / 98% / 308+ / 20+), and a "Service We Provide" section using circular icon badges in a row.

**Takeaway — mood/pattern reference**, no direct quote attached, but it reinforces two patterns that recur across other references and should be treated as validated, not one-off: (a) a horizontal credibility stats bar, and (b) circular/rounded icon badges for a services-style section. Also a data point for the "rich, saturated, nature-adjacent palette" direction that pairs with the color palette reference below — worth weighing against the literal teal/olive palette in #4 as an alternate mood, not necessarily both at once.

### 4. Color combination palette

A 5-color palette (pill swatches + a gradient variant): teal/cyan, a deep navy-teal, a muted olive/sage green, a yellow-green (chartreuse), and a very dark olive-black green.

> **Shruti:** "color combination"

**Takeaway — this is the color direction.** Approximate reads on the swatches (verify exact hex against the source screenshot before locking into CSS, OCR-off-image so treat as close, not certified):
- Teal / cyan — `#54C9CC`
- Deep navy-teal — `~#1F4F5A`
- Muted olive/sage — `#75A08E`
- Yellow-green / chartreuse — `#DCD964`
- Near-black olive — `#213502`

A sophisticated, nature-adjacent, editorial palette — teal as a cool accent, olive/chartreuse as warm-organic accents, near-black-green instead of pure black for text/dark sections. This is the palette to build the whole site's design tokens from (backgrounds, accents, buttons, dark-section fills).

### 5. "Maria Luné" — web/product designer portfolio

Portrait-led hero, cream/sage palette, serif script "Hello, I'm" over a large serif name, a pill-shaped "VIEW MY WORK →" button, and a horizontal credibility stats bar (5+ years experience / 50+ projects completed / 30+ happy clients / 8 industries served) on a sage banner beneath the hero.

> **Shruti:** "I like both of these" — with arrows pointing specifically at (a) the "VIEW MY WORK" pill button, and (b) the stats bar.

**Takeaway — two specific, adoptable UI elements**, not the whole page: (1) primary CTA buttons should be soft pill-shaped, filled, dark-on-light (matches the button language in #7 too); (2) a horizontal stats/credibility bar (icon or number + label, evenly spaced) is a confirmed pattern for this site — likely placed near About Me on the homepage. Content for the stats needs real numbers from Shruti (e.g. years of experience, pieces published, clients/publications worked with) — see Open Questions.

### 6. "Brand Partnerships" — phone-mockup video showcase

A row of phone-frame mockups, each showing a vertical video thumbnail, with the associated brand name/logo labeled underneath each phone (Hollister, fwee, LilyAna Naturals, and others).

> **Shruti:** "for the videos let's do smth like this"

**Takeaway — display pattern for video/UGC projects.** Maps directly onto the already-seeded Marketing → Video/UGC Scripts projects (Luxury Villas in Sicily, Dental Clips, MRI Tech Training, Rent-to-Own ATVs/Food Trucks, Tanzania & Zanzibar EN/ES). Instead of a plain embedded YouTube iframe on the project detail page (or in addition to it), render video projects as phone-bezel-framed vertical thumbnails in a horizontal row/carousel, each labeled with its brand/client. Likely lives on the Marketing category page and/or as a homepage highlight row.

### 7. "KA." — Kazim's UI/UX portfolio (yellow accent, services grid, dual CTA)

Minimal portfolio with a yellow accent color, header nav plus a filled yellow "Let's Talk" pill button, a hero with two buttons ("Want to discuss?" outlined + "Let's Talk" filled), a "Services." section of 6 plain bordered cards, and a "Portfolios." section using the same card grid, clickable per category.

> **Shruti:** "this is great. we need the services section def. and then let's do the want to discuss? let's talk buttons at the top and bottom of the web page both"

**Takeaway — two concrete, explicit requirements:**
1. A **Services section** styled as a bordered card grid (like this reference's `Services.` block) is now in scope — needs content: what services does Shruti offer as a freelance content specialist (e.g. copywriting, editing, content strategy, UGC scripting, journalism)? See Open Questions.
2. A **two-button CTA pair** — "Want to discuss?" (secondary/outline) + "Let's Talk" (primary/filled) — placed **both at the top (header/nav) and bottom (footer) of every page**, not just once. This is a new nav/footer requirement, likely pointing at the existing Contact page or a mailto/contact anchor.

### 8. Randy Fahmi — resume-style portfolio (skills icon grid)

Black-and-white photo, "About"/"Hello." intro, a two-column Education/Working Experience timeline, and (circled by Shruti) a "Software Skill" section: a grid of small rounded-square colored icon badges for tools (Premiere Pro, Illustrator, Photoshop, Lightroom, Canva, VS Code, Figma, etc.).

> **Shruti:** "let's do a section like this with the other skills"

**Takeaway — a Skills section using icon badges**, adapted to Shruti's actual toolset rather than design software — likely things like Grammarly, Google Docs/Workspace, WordPress or another CMS, SEO tools, Canva, AP style guides, etc. Needs the real tool list from Shruti — see Open Questions. Same icon-badge visual language as the services icons in refs #1 and #3, so these should share one component/style, not be built as three different patterns.

---

## Synthesized design language (final)

- **Palette:** see Design tokens above. Navy-teal / near-black-olive reserved for button fills, not full sections (Locked decision 7).
- **Typography:** editorial serif for display (Fraunces or similar) + clean sans for body/UI (Inter or similar).
- **Buttons:** two button *styles* coexist, used for different purposes — (a) the single "Want to know more? Let's talk" contact CTA, filled in a dark palette color, in header + footer only; (b) a separate pill "View My Work" CTA in the homepage hero (scrolls to category tiles). Not a matched pair — they serve different actions and don't need to visually match beyond sharing the pill shape.
- **Icon badges:** one consistent rounded-badge component reused for (a) the Services cards' icons if any, (b) the 4 grouped Skills sections — refs #1, #3, #8.
- **Stats/credibility bar:** horizontal number+label row, light/tinted background (sage or chartreuse tint) — never dark (Locked decision 7). Real copy: see Locked decision 2.
- **Card grid:** one shared card component reused for (a) the 4 category tiles (image/accent color + name only, Locked decision 5) and (b) the 6 Services cards (Locked decision 3).
- **Video display:** phone-mockup framed thumbnails for video/UGC projects (ref #6) on project detail pages where a `videoUrl` exists.

## Homepage plan (final)

Single page, About-first, in this order:

1. **Hero** — About Me: short bio + portrait, with a pill "View My Work" button that scrolls down to the category tiles.
2. **Stats bar** — light/tinted background, evenly spaced: `4+ Years experience · 80k+ Impressions & reads · 15+ Writers trained · 20+ Clients`.
3. **Category tiles** — the 4 seeded top-level categories (Writing / Editing / Marketing / Digital Journalism), shared card component, image or solid accent color + name only.
4. **Services section** — 6 bordered cards (shared card component): Content Editing & Proofreading · Manuscript Editing · Academic Editing · Writing · Digital News Reportage · Research.
5. **Skills/tools** — icon-badge section, 4 labeled groups (Editorial / CMS & Productivity / SEO / AI) per Locked decision 4.
6. **Footer** — single "Want to know more? Let's talk" CTA (→ `/contact`) + contact/social links from `SiteContent`.

**Header (all pages):** nav + the single "Want to know more? Let's talk" CTA.
**Footer (all pages):** repeat of the same single CTA + contact/social links.
**Category page:** shared card grid for subcategories; project list styling inherits the same card language.
**Project detail:** video projects get the phone-mockup treatment (ref #6) where a `videoUrl` exists; text/image projects keep an editorial single-column layout.
**Admin (`/admin/*`):** out of scope — stays functional/plain (Locked decision 8).

## Non-goals for this pass

- No changes to the content model, admin CRUD behavior, or database schema
- No changes to auth, routing structure, or the categories/projects data already seeded (Stage 10)
- Not re-litigating anything in Stage 11 (deploy/regression) — this is purely visual/UI on top of what's already built and deployed

# Restoring the database in Neon

This is the safety net for "I made a change and something broke." Instead of building custom undo logic into the admin panel, this project relies on Neon's own point-in-time restore — it rolls back **everything** (categories, projects, site content) to a consistent earlier state in a couple of clicks, and it's reversible if the restore itself turns out to be wrong.

This only covers the database. Uploaded files (images, PDFs) live in Vercel Blob and aren't touched by a Neon restore — in practice this is rarely an issue here, since the app never deletes an old file when a new one is uploaded, so old URLs almost always still resolve even after a restore points the database back at them.

## How much history you have

Neon only keeps a rolling window of history to restore from — how far back you can go depends on your plan:

| Plan            | Default window | Max (if increased in Settings) |
| ---------------- | -------------- | ------------------------------- |
| Free              | 6 hours        | —                                |
| Launch (paid)      | 1 day          | up to 7 days                    |
| Scale (paid)       | 1 day          | up to 30 days                   |

If you're on the Free plan, you have **6 hours** to notice something's wrong and restore — worth checking the admin dashboard's Recent Activity feed regularly rather than assuming you'll catch a bad edit whenever. You can also just increase the window (Neon Console → your project → **Settings → Instant restore**) if 6 hours ever feels too tight — this only affects storage cost, not anything about how the app works.

## Important: this only works on your production branch

Neon's instant restore (the point-in-time feature below) only works on **root branches** — that's your real production branch, the one your live site actually reads from. It does **not** work on the `dev` branch you created for local testing (see `memory.md` for how that branch was set up) — child branches can't be restored to an arbitrary past point, only reset to match their parent's *current* state.

In practice this is exactly what you want: the scenario this guide protects against is "I broke the live site," and that's always going to be the production branch.

## Steps to restore

1. Go to **console.neon.tech** and open your project.
2. Make sure you're looking at your **production** branch (not `dev`).
3. Open **Postgres database → Backup & Restore**.
4. Click **Restore from history**.
5. Pick the date & time you want to restore to (or a specific point if you know it more precisely).
6. Click **Next** — Neon shows you exactly what this will do before committing to anything.
7. Click **Restore**.

That's it — your database (categories, projects, site content, everything) is now back to how it looked at that moment.

## If you got the timestamp wrong

Neon doesn't let you shoot yourself in the foot here: before applying the restore, it automatically saves your branch's pre-restore state as a new backup branch (named something like `production_old_<timestamp>`). If you picked the wrong time or the restore wasn't actually what you wanted, you can restore *again*, this time using that backup branch as the source, to get back to exactly where you were before you touched anything.

## After restoring

- **Restart your local dev server** if it was running — same reason as any `.env`/DB change: it needs to reconnect. (Only matters if you're pointed at production locally, which per the dev-branch setup you generally shouldn't be — but if you're actively debugging the incident itself, you might be.)
- **Double check the live site**, not just the admin panel, to confirm the restore actually fixed what you thought was broken.
- Nothing needs to be redeployed on Vercel — the restore happens entirely in Neon, and your app just reads from the database as it already does.

## Sources

- [Instant restore — Neon Docs](https://neon.com/docs/introduction/branch-restore)
- [Backup & restore — Neon Docs](https://neon.com/docs/guides/backup-restore)
- [Announcing Point-in-Time Restore — Neon](https://neon.com/blog/announcing-point-in-time-restore)

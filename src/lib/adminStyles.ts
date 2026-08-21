/**
 * Shared class-string constants for /admin — the same lightweight pattern already used
 * for the public Contact page's `inputClasses`, not a wrapped component library, so every
 * admin page/form stays plain HTML + Server Actions with just classNames added.
 */

export const adminInputClasses =
  'w-full rounded-lg border border-paper/15 bg-paper/[0.06] px-4 py-3 text-paper placeholder:text-paper/40 focus:border-chartreuse focus:outline-none';

export const adminLabelClasses = 'mb-1.5 block text-sm font-medium text-paper';

/**
 * Card container. Deliberately NOT applied directly to a <fieldset> that has a <legend> —
 * browsers cut a UA notch into a border painted directly on a bordered fieldset around the
 * legend text. Wrap: <div className={adminCardClasses}><fieldset className="border-0 p-0">.
 */
export const adminCardClasses = 'rounded-2xl border border-paper/10 bg-paper/[0.06] p-6';

export const adminLegendClasses = 'mb-4 font-serif text-lg text-paper';

export const adminButtonPrimary =
  'inline-flex items-center justify-center gap-2 rounded-full bg-chartreuse px-6 py-3 text-sm font-semibold text-near-black-olive transition-colors hover:bg-paper disabled:cursor-not-allowed disabled:opacity-60';

export const adminButtonSecondary =
  'inline-flex items-center justify-center gap-1.5 rounded-full border border-paper/20 px-3 py-1.5 text-xs font-medium text-paper/80 transition-colors hover:border-paper/40 hover:text-paper disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm';

/** Square icon-only button — reorder chevrons, featured star. */
export const adminIconButtonClasses =
  'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-paper/15 text-paper/70 transition-colors hover:border-chartreuse hover:text-chartreuse disabled:pointer-events-none disabled:opacity-30';

export const adminButtonDanger =
  'inline-flex items-center justify-center gap-2 rounded-full bg-rust px-6 py-3 text-sm font-semibold text-near-black-olive transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60';

export const adminButtonDangerGhost =
  'inline-flex items-center gap-1 text-xs font-medium text-rust hover:underline disabled:cursor-not-allowed disabled:opacity-50';

/** Restyles just the native file-picker button via Tailwind's real file: pseudo-element variant — no JS. */
export const adminFileInputClasses =
  'block w-full text-sm text-paper/70 file:mr-4 file:rounded-full file:border-0 file:bg-chartreuse file:px-4 file:py-2 file:text-sm file:font-semibold file:text-near-black-olive file:transition-colors hover:file:bg-paper';

/** Native accent-color utility — recolors a plain <input type="checkbox"> with no JS. */
export const adminCheckboxClasses = 'h-4 w-4 rounded accent-chartreuse';

export const adminAlertClasses = 'rounded-lg border border-rust/30 bg-rust/10 px-4 py-3 text-sm text-paper';

export const adminStatusClasses =
  'rounded-lg border border-chartreuse/30 bg-chartreuse/10 px-4 py-3 text-sm text-paper';

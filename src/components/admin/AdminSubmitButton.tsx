'use client';

import type { ReactNode } from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';

/**
 * Drop-in replacement for a plain <button type="submit"> that swaps its content for a
 * spinner while its nearest ancestor <form>'s Server Action is in flight — same
 * useFormStatus() pattern as the public site's ContactSubmitButton, applied across /admin
 * so every action gives visible feedback instead of leaving "did that click register?"
 * ambiguous. Must render inside the <form> it tracks (useFormStatus reads the nearest one).
 */
export function AdminSubmitButton({
  children,
  className,
  ariaLabel,
  ariaPressed,
}: {
  children: ReactNode;
  className: string;
  ariaLabel?: string;
  ariaPressed?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      aria-busy={pending}
      className={className}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : children}
    </button>
  );
}

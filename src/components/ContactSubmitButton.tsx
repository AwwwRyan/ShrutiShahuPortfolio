'use client';

import { useFormStatus } from 'react-dom';

export function ContactSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-paper px-6 py-3 font-sans text-sm font-semibold tracking-wide text-near-black-olive transition-colors duration-200 hover:bg-chartreuse disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-paper motion-reduce:transition-none"
    >
      {pending && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {pending ? 'Sending…' : 'Send'}
    </button>
  );
}

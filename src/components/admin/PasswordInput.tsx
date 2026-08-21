'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { adminInputClasses } from '@/lib/adminStyles';

export function PasswordInput({
  id,
  name,
  required,
  autoComplete,
}: {
  id: string;
  name: string;
  required?: boolean;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        id={id}
        name={name}
        required={required}
        autoComplete={autoComplete}
        className={`${adminInputClasses} pr-11`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-paper/50 transition-colors hover:text-chartreuse"
      >
        {visible ? (
          <EyeOff className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Eye className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

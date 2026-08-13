import { describe, expect, it } from 'vitest';
import { ContactValidationError, validateContactForm } from './contact';

describe('validateContactForm', () => {
  it('accepts a valid submission', () => {
    expect(() =>
      validateContactForm({ name: 'Jane Doe', email: 'jane@example.com', message: 'Hello!' }),
    ).not.toThrow();
  });

  it('rejects an empty name', () => {
    expect(() =>
      validateContactForm({ name: '  ', email: 'jane@example.com', message: 'Hello!' }),
    ).toThrow(ContactValidationError);
  });

  it('rejects an empty email', () => {
    expect(() => validateContactForm({ name: 'Jane', email: '', message: 'Hello!' })).toThrow(
      ContactValidationError,
    );
  });

  it('rejects a malformed email', () => {
    expect(() =>
      validateContactForm({ name: 'Jane', email: 'not-an-email', message: 'Hello!' }),
    ).toThrow(ContactValidationError);
  });

  it('rejects an empty message', () => {
    expect(() =>
      validateContactForm({ name: 'Jane', email: 'jane@example.com', message: '   ' }),
    ).toThrow(ContactValidationError);
  });
});

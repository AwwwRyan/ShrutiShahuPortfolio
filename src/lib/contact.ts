export class ContactValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContactValidationError';
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ContactFormInput = {
  name: string;
  email: string;
  message: string;
};

export function validateContactForm(input: ContactFormInput): void {
  if (!input.name.trim()) {
    throw new ContactValidationError('Name is required.');
  }
  if (!input.email.trim() || !EMAIL_REGEX.test(input.email.trim())) {
    throw new ContactValidationError('A valid email address is required.');
  }
  if (!input.message.trim()) {
    throw new ContactValidationError('Message is required.');
  }
}

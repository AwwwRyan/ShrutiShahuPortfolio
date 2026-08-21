'use server';

import { auth } from '@/auth';
import { uploadFile } from './blob';

const ALLOWED_FOLDERS = ['projects/covers', 'projects/gallery', 'projects/docs'];

/**
 * Uploads a single file, called once per file from the client instead of bundling every
 * file into the same request as the rest of the form — a request body over Vercel's hard
 * 4.5MB per-request limit fails regardless of what Next.js's own bodySizeLimit allows, so
 * splitting uploads into their own requests (a "queue" of one file each) sidesteps that
 * ceiling entirely rather than needing to raise it. Auth-gated the same way every other
 * mutation in /admin is — this exists to be called directly from client components, not
 * behind a <form>.
 */
export async function uploadSingleFile(
  formData: FormData,
): Promise<{ url: string } | { error: string }> {
  const session = await auth();
  if (!session) {
    return { error: 'Unauthorized' };
  }

  const file = formData.get('file');
  const folder = formData.get('folder');
  if (!(file instanceof File) || file.size === 0) {
    return { error: 'No file provided' };
  }
  if (typeof folder !== 'string' || !ALLOWED_FOLDERS.includes(folder)) {
    return { error: 'Invalid upload target' };
  }

  const url = await uploadFile(file, folder);
  if (!url) {
    return { error: 'Upload failed' };
  }
  return { url };
}

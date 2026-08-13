import { put } from '@vercel/blob';

/**
 * Uploads a File to Vercel Blob under the given folder, returning its public URL.
 * Returns null for an empty/missing file input (nothing was selected). Generic —
 * used for images (cover/gallery/profile photo) and documents (resume PDF) alike.
 */
export async function uploadFile(file: File | null, folder: string): Promise<string | null> {
  if (!file || file.size === 0) {
    return null;
  }

  const blob = await put(`${folder}/${file.name}`, file, {
    access: 'public',
    addRandomSuffix: true,
  });

  return blob.url;
}

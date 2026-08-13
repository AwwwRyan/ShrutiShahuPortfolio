import { LINK_SLOTS, type ProjectInput } from './projects';
import { uploadFile } from './blob';

/**
 * Parses the shared project form fields (everything except image uploads)
 * out of a submitted FormData — used by both the create and edit actions.
 */
export function parseProjectFields(
  formData: FormData,
): Omit<ProjectInput, 'coverImage' | 'gallery'> {
  const header = String(formData.get('header') ?? '');
  const categoryId = String(formData.get('categoryId') ?? '');
  const description = String(formData.get('description') ?? '');
  const client = String(formData.get('client') ?? '').trim() || null;
  const videoUrl = String(formData.get('videoUrl') ?? '').trim() || null;
  const featured = formData.get('featured') === 'on';
  const tags = String(formData.get('tags') ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const links = Array.from({ length: LINK_SLOTS }, (_, i) => ({
    label: String(formData.get(`linkLabel${i}`) ?? ''),
    url: String(formData.get(`linkUrl${i}`) ?? ''),
  }));

  return { header, categoryId, description, client, videoUrl, featured, tags, links };
}

export async function uploadCoverImage(formData: FormData): Promise<string | null> {
  const file = formData.get('coverImage');
  return uploadFile(file instanceof File ? file : null, 'projects/covers');
}

export async function uploadGalleryImages(formData: FormData): Promise<string[]> {
  const files = formData.getAll('gallery').filter((f): f is File => f instanceof File);
  const urls = await Promise.all(files.map((f) => uploadFile(f, 'projects/gallery')));
  return urls.filter((u): u is string => u !== null);
}

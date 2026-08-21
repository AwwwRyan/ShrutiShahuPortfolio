import { LINK_SLOTS, type ProjectInput } from './projects';

/**
 * Parses the project form fields out of a submitted FormData — used by both the create and
 * edit actions. `coverImage`/`gallery`/`externalDoc` arrive as already-uploaded Blob URLs
 * (see FileUpload.tsx / uploadSingleFile) rather than raw File objects — uploads happen
 * client-side, one file per request, before this form is ever submitted.
 */
export function parseProjectFields(formData: FormData): ProjectInput {
  const header = String(formData.get('header') ?? '');
  const categoryId = String(formData.get('categoryId') ?? '');
  const description = String(formData.get('description') ?? '');
  const client = String(formData.get('client') ?? '').trim() || null;
  const videoUrl = String(formData.get('videoUrl') ?? '').trim() || null;
  const typedExternalUrl = String(formData.get('externalUrl') ?? '').trim() || null;
  const uploadedExternalDoc = String(formData.get('externalDoc') ?? '').trim() || null;
  const showDescriptionPage = formData.get('showDescriptionPage') === 'on';
  const featured = formData.get('featured') === 'on';
  const tags = String(formData.get('tags') ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const links = Array.from({ length: LINK_SLOTS }, (_, i) => ({
    label: String(formData.get(`linkLabel${i}`) ?? ''),
    url: String(formData.get(`linkUrl${i}`) ?? ''),
  }));

  const coverImage = String(formData.get('coverImage') ?? '').trim() || null;
  const gallery = formData
    .getAll('gallery')
    .map((v) => String(v).trim())
    .filter(Boolean);

  return {
    header,
    categoryId,
    description,
    client,
    videoUrl,
    // A new upload always wins over whatever's typed into the plain URL field.
    externalUrl: uploadedExternalDoc ?? typedExternalUrl,
    showDescriptionPage,
    featured,
    tags,
    links,
    coverImage,
    gallery,
  };
}

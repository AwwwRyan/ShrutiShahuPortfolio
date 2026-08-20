import { LINK_SLOTS } from '@/lib/projects';
import { RichTextEditor } from './RichTextEditor';

type CategoryOption = { id: string; name: string };

type ExistingLink = { label: string; url: string };

export function ProjectForm({
  action,
  categories,
  defaultCategoryId,
  defaults,
  existingGallery = [],
  submitLabel,
}: {
  action: (formData: FormData) => void;
  categories: CategoryOption[];
  defaultCategoryId?: string;
  defaults?: {
    header?: string;
    description?: string;
    client?: string;
    videoUrl?: string;
    externalUrl?: string;
    tags?: string[];
    featured?: boolean;
    links?: ExistingLink[];
    coverImage?: string | null;
  };
  existingGallery?: string[];
  submitLabel: string;
}) {
  const linkSlots = Array.from({ length: LINK_SLOTS }, (_, i) => defaults?.links?.[i]);

  return (
    <form action={action}>
      <label>
        Header
        <input type="text" name="header" defaultValue={defaults?.header} required />
      </label>

      <label>
        Category
        <select name="categoryId" defaultValue={defaultCategoryId} required>
          <option value="" disabled>
            Choose a category…
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <div>
        <span>Description</span>
        <RichTextEditor name="description" defaultValue={defaults?.description} />
      </div>

      <label>
        Client / publication (optional)
        <input type="text" name="client" defaultValue={defaults?.client} />
      </label>

      <label>
        Tags (comma-separated)
        <input type="text" name="tags" defaultValue={defaults?.tags?.join(', ')} />
      </label>

      <label>
        Video URL (optional, e.g. YouTube)
        <input type="url" name="videoUrl" defaultValue={defaults?.videoUrl} />
      </label>

      <label>
        External URL (optional) — if set, this project&apos;s card links straight here in a new
        tab instead of its own page. For pieces that are really just a pointer to a client&apos;s
        own published article.
        <input type="url" name="externalUrl" defaultValue={defaults?.externalUrl} />
      </label>

      <label>
        <input type="checkbox" name="featured" defaultChecked={defaults?.featured} />
        Featured
      </label>

      <fieldset>
        <legend>Cover image</legend>
        {defaults?.coverImage && (
          <p>
            Current: <a href={defaults.coverImage}>{defaults.coverImage}</a>
          </p>
        )}
        <input type="file" name="coverImage" accept="image/*" />
      </fieldset>

      {existingGallery.length > 0 && (
        <fieldset>
          <legend>Existing gallery images</legend>
          {existingGallery.map((url) => (
            <label key={url} style={{ display: 'block' }}>
              <input type="checkbox" name="removeGallery" value={url} />
              Remove — <a href={url}>{url}</a>
            </label>
          ))}
        </fieldset>
      )}

      <fieldset>
        <legend>Add gallery images</legend>
        <input type="file" name="gallery" accept="image/*" multiple />
      </fieldset>

      <fieldset>
        <legend>Links / docs</legend>
        {linkSlots.map((link, i) => (
          <div key={i}>
            <label>
              Label
              <input type="text" name={`linkLabel${i}`} defaultValue={link?.label} />
            </label>
            <label>
              URL
              <input type="url" name={`linkUrl${i}`} defaultValue={link?.url} />
            </label>
          </div>
        ))}
      </fieldset>

      <button type="submit">{submitLabel}</button>
    </form>
  );
}

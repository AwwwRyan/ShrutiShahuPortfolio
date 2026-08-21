import { LINK_SLOTS } from '@/lib/projects';
import { RichTextEditor } from './RichTextEditor';
import { CategoryTreeSelect } from './admin/CategoryTreeSelect';
import {
  adminInputClasses,
  adminLabelClasses,
  adminCardClasses,
  adminLegendClasses,
  adminButtonPrimary,
  adminFileInputClasses,
  adminCheckboxClasses,
} from '@/lib/adminStyles';

type CategoryOption = { id: string; name: string; parentId: string | null; order: number };

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
    <form action={action} className="space-y-6">
      <div>
        <label htmlFor="header" className={adminLabelClasses}>
          Header
        </label>
        <input
          type="text"
          id="header"
          name="header"
          defaultValue={defaults?.header}
          required
          className={adminInputClasses}
        />
      </div>

      <CategoryTreeSelect categories={categories} defaultCategoryId={defaultCategoryId} />

      <div>
        <span className={adminLabelClasses}>Description</span>
        <RichTextEditor name="description" defaultValue={defaults?.description} />
      </div>

      <div>
        <label htmlFor="client" className={adminLabelClasses}>
          Client / publication (optional)
        </label>
        <input type="text" id="client" name="client" defaultValue={defaults?.client} className={adminInputClasses} />
      </div>

      <div>
        <label htmlFor="tags" className={adminLabelClasses}>
          Tags (comma-separated)
        </label>
        <input
          type="text"
          id="tags"
          name="tags"
          defaultValue={defaults?.tags?.join(', ')}
          className={adminInputClasses}
        />
      </div>

      <div>
        <label htmlFor="videoUrl" className={adminLabelClasses}>
          Video URL (optional, e.g. YouTube)
        </label>
        <input type="url" id="videoUrl" name="videoUrl" defaultValue={defaults?.videoUrl} className={adminInputClasses} />
      </div>

      <div className={adminCardClasses}>
        <fieldset className="m-0 min-w-0 border-0 p-0">
          <legend className={adminLegendClasses}>External URL (optional)</legend>
          <p className="mb-3 text-xs text-paper/50">
            If set, this project&apos;s card links straight here in a new tab instead of its own page — for
            pieces that are really just a pointer to a client&apos;s own published article, or a PDF hosted
            here directly.
          </p>
          <label htmlFor="externalUrl" className={adminLabelClasses}>
            URL
          </label>
          <input
            type="url"
            id="externalUrl"
            name="externalUrl"
            defaultValue={defaults?.externalUrl}
            className={adminInputClasses}
          />

          <label htmlFor="externalDoc" className={`mt-4 block ${adminLabelClasses}`}>
            Or replace it by uploading a new file
          </label>
          <p className="mb-1.5 text-xs text-paper/50">
            Uploading a file here overrides the URL above with the newly-uploaded file&apos;s address.
          </p>
          <input
            type="file"
            id="externalDoc"
            name="externalDoc"
            accept="application/pdf,.pdf"
            className={adminFileInputClasses}
          />
        </fieldset>
      </div>

      <label className="flex items-center gap-2 text-sm text-paper">
        <input type="checkbox" name="featured" defaultChecked={defaults?.featured} className={adminCheckboxClasses} />
        Featured
      </label>

      <div className={adminCardClasses}>
        <fieldset className="m-0 min-w-0 border-0 p-0">
          <legend className={adminLegendClasses}>Cover image</legend>
          {defaults?.coverImage && (
            <p className="mb-3 truncate text-xs text-paper/50">
              Current:{' '}
              <a href={defaults.coverImage} className="underline hover:text-chartreuse">
                {defaults.coverImage}
              </a>
            </p>
          )}
          <input type="file" name="coverImage" accept="image/*" className={adminFileInputClasses} />
        </fieldset>
      </div>

      {existingGallery.length > 0 && (
        <div className={adminCardClasses}>
          <fieldset className="m-0 min-w-0 border-0 p-0">
            <legend className={adminLegendClasses}>Existing gallery images</legend>
            <div className="space-y-2">
              {existingGallery.map((url) => (
                <label key={url} className="flex items-center gap-2 text-sm text-paper/80">
                  <input type="checkbox" name="removeGallery" value={url} className={adminCheckboxClasses} />
                  <span>
                    Remove —{' '}
                    <a href={url} className="truncate underline hover:text-chartreuse">
                      {url}
                    </a>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      )}

      <div className={adminCardClasses}>
        <fieldset className="m-0 min-w-0 border-0 p-0">
          <legend className={adminLegendClasses}>Add gallery images</legend>
          <input type="file" name="gallery" accept="image/*" multiple className={adminFileInputClasses} />
        </fieldset>
      </div>

      <div className={adminCardClasses}>
        <fieldset className="m-0 min-w-0 border-0 p-0">
          <legend className={adminLegendClasses}>Links / docs</legend>
          <div className="space-y-3">
            {linkSlots.map((link, i) => (
              <div key={i} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_2fr]">
                <input
                  type="text"
                  name={`linkLabel${i}`}
                  defaultValue={link?.label}
                  placeholder="Label"
                  aria-label={`Link ${i + 1} label`}
                  className={adminInputClasses}
                />
                <input
                  type="url"
                  name={`linkUrl${i}`}
                  defaultValue={link?.url}
                  placeholder="URL"
                  aria-label={`Link ${i + 1} URL`}
                  className={adminInputClasses}
                />
              </div>
            ))}
          </div>
        </fieldset>
      </div>

      <button type="submit" className={adminButtonPrimary}>
        {submitLabel}
      </button>
    </form>
  );
}

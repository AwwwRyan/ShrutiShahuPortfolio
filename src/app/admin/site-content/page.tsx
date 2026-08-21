import { redirect } from 'next/navigation';
import { RichTextEditor } from '@/components/RichTextEditor';
import { uploadFile } from '@/lib/blob';
import { SOCIAL_LINK_SLOTS, getSiteContent, updateSiteContent } from '@/lib/siteContent';
import {
  adminInputClasses,
  adminLabelClasses,
  adminCardClasses,
  adminLegendClasses,
  adminButtonPrimary,
  adminFileInputClasses,
  adminStatusClasses,
} from '@/lib/adminStyles';
import { AdminSubmitButton } from '@/components/admin/AdminSubmitButton';

async function updateSiteContentAction(formData: FormData) {
  'use server';

  const existing = await getSiteContent();

  const aboutMe = String(formData.get('aboutMe') ?? '');
  const contactEmail = String(formData.get('contactEmail') ?? '').trim() || null;

  const socialLinks = Array.from({ length: SOCIAL_LINK_SLOTS }, (_, i) => ({
    label: String(formData.get(`socialLabel${i}`) ?? ''),
    url: String(formData.get(`socialUrl${i}`) ?? ''),
  }));

  const profilePhotoFile = formData.get('profilePhoto');
  const newProfilePhoto = await uploadFile(
    profilePhotoFile instanceof File ? profilePhotoFile : null,
    'site/profile',
  );

  const resumeFile = formData.get('resume');
  const newResumeUrl = await uploadFile(resumeFile instanceof File ? resumeFile : null, 'site/resume');

  await updateSiteContent({
    aboutMe,
    contactEmail,
    socialLinks,
    profilePhoto: newProfilePhoto ?? existing?.profilePhoto ?? null,
    resumeUrl: newResumeUrl ?? existing?.resumeUrl ?? null,
  });

  redirect('/admin/site-content?saved=1');
}

export default async function SiteContentAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [siteContent, { saved }] = await Promise.all([getSiteContent(), searchParams]);
  const socialLinkSlots = Array.from(
    { length: SOCIAL_LINK_SLOTS },
    (_, i) => (siteContent?.socialLinks as { label: string; url: string }[] | null)?.[i],
  );

  return (
    <main className="mx-auto max-w-2xl px-6 py-12 sm:px-8">
      <h1 className="font-serif text-3xl text-paper">About Me &amp; Contact Info</h1>

      {saved && (
        <p role="status" className={`mt-4 ${adminStatusClasses}`}>
          Saved.
        </p>
      )}

      <form action={updateSiteContentAction} className="mt-8 space-y-6">
        <div className={adminCardClasses}>
          <fieldset className="m-0 min-w-0 border-0 p-0">
            <legend className={adminLegendClasses}>About Me</legend>
            <RichTextEditor name="aboutMe" defaultValue={siteContent?.aboutMe} />
          </fieldset>
        </div>

        <div className={adminCardClasses}>
          <fieldset className="m-0 min-w-0 border-0 p-0">
            <legend className={adminLegendClasses}>Profile photo</legend>
            {siteContent?.profilePhoto && (
              <p className="mb-3 truncate text-xs text-paper/50">
                Current:{' '}
                <a href={siteContent.profilePhoto} className="underline hover:text-chartreuse">
                  {siteContent.profilePhoto}
                </a>
              </p>
            )}
            <input type="file" name="profilePhoto" accept="image/*" className={adminFileInputClasses} />
          </fieldset>
        </div>

        <div className={adminCardClasses}>
          <fieldset className="m-0 min-w-0 border-0 p-0">
            <legend className={adminLegendClasses}>Resume (PDF)</legend>
            {siteContent?.resumeUrl && (
              <p className="mb-3 truncate text-xs text-paper/50">
                Current:{' '}
                <a href={siteContent.resumeUrl} className="underline hover:text-chartreuse">
                  {siteContent.resumeUrl}
                </a>
              </p>
            )}
            <input type="file" name="resume" accept="application/pdf" className={adminFileInputClasses} />
          </fieldset>
        </div>

        <div>
          <label htmlFor="contactEmail" className={adminLabelClasses}>
            Contact email
          </label>
          <input
            type="email"
            id="contactEmail"
            name="contactEmail"
            defaultValue={siteContent?.contactEmail ?? ''}
            className={adminInputClasses}
          />
        </div>

        <div className={adminCardClasses}>
          <fieldset className="m-0 min-w-0 border-0 p-0">
            <legend className={adminLegendClasses}>Social links</legend>
            <div className="space-y-3">
              {socialLinkSlots.map((link, i) => (
                <div key={i} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_2fr]">
                  <input
                    type="text"
                    name={`socialLabel${i}`}
                    defaultValue={link?.label}
                    placeholder="Label"
                    aria-label={`Social link ${i + 1} label`}
                    className={adminInputClasses}
                  />
                  <input
                    type="url"
                    name={`socialUrl${i}`}
                    defaultValue={link?.url}
                    placeholder="URL"
                    aria-label={`Social link ${i + 1} URL`}
                    className={adminInputClasses}
                  />
                </div>
              ))}
            </div>
          </fieldset>
        </div>

        <AdminSubmitButton className={adminButtonPrimary}>Save</AdminSubmitButton>
      </form>
    </main>
  );
}

import { redirect } from 'next/navigation';
import { RichTextEditor } from '@/components/RichTextEditor';
import { uploadFile } from '@/lib/blob';
import { SOCIAL_LINK_SLOTS, getSiteContent, updateSiteContent } from '@/lib/siteContent';

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
    <main>
      <h1>About Me &amp; Contact Info</h1>
      <p>
        <a href="/admin">Back to dashboard</a>
      </p>

      {saved && <p role="status">Saved.</p>}

      <form action={updateSiteContentAction}>
        <fieldset>
          <legend>About Me</legend>
          <RichTextEditor name="aboutMe" defaultValue={siteContent?.aboutMe} />
        </fieldset>

        <fieldset>
          <legend>Profile photo</legend>
          {siteContent?.profilePhoto && (
            <p>
              Current: <a href={siteContent.profilePhoto}>{siteContent.profilePhoto}</a>
            </p>
          )}
          <input type="file" name="profilePhoto" accept="image/*" />
        </fieldset>

        <fieldset>
          <legend>Resume (PDF)</legend>
          {siteContent?.resumeUrl && (
            <p>
              Current: <a href={siteContent.resumeUrl}>{siteContent.resumeUrl}</a>
            </p>
          )}
          <input type="file" name="resume" accept="application/pdf" />
        </fieldset>

        <fieldset>
          <legend>Contact email</legend>
          <input type="email" name="contactEmail" defaultValue={siteContent?.contactEmail ?? ''} />
        </fieldset>

        <fieldset>
          <legend>Social links</legend>
          {socialLinkSlots.map((link, i) => (
            <div key={i}>
              <label>
                Label
                <input type="text" name={`socialLabel${i}`} defaultValue={link?.label} />
              </label>
              <label>
                URL
                <input type="url" name={`socialUrl${i}`} defaultValue={link?.url} />
              </label>
            </div>
          ))}
        </fieldset>

        <button type="submit">Save</button>
      </form>
    </main>
  );
}

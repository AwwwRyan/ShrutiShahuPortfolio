import { Pill } from '@/components/Pill';

type HeroProps = {
  aboutMeHtml: string | null;
  profilePhoto: string | null;
  resumeUrl: string | null;
};

export function Hero({ aboutMeHtml, profilePhoto, resumeUrl }: HeroProps) {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-12 pb-20 sm:pt-20 sm:pb-28">
      <div className="grid items-center gap-10 sm:grid-cols-[1.2fr_0.8fr] sm:gap-16">
        <div>
          <h1 className="font-serif text-4xl leading-tight tracking-tight text-ink sm:text-5xl">
            Shruti Shahu
          </h1>

          {aboutMeHtml ? (
            <div
              className="rich-text mt-6 max-w-xl text-base leading-relaxed text-ink/80 sm:text-lg"
              dangerouslySetInnerHTML={{ __html: aboutMeHtml }}
            />
          ) : (
            <p className="mt-6 max-w-xl text-base text-ink/60 sm:text-lg">
              About me content coming soon.
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Pill href="#categories" tone="teal">
              View My Work
            </Pill>
            {resumeUrl && (
              <a
                href={resumeUrl}
                className="text-sm font-medium text-ink underline underline-offset-4 hover:text-navy-teal"
              >
                Download Resume
              </a>
            )}
          </div>
        </div>

        {profilePhoto && (
          <div className="justify-self-center sm:justify-self-end">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profilePhoto}
              alt="Shruti Shahu"
              className="aspect-[4/5] w-full max-w-xs rounded-3xl object-cover shadow-lg sm:max-w-sm"
            />
          </div>
        )}
      </div>
    </section>
  );
}

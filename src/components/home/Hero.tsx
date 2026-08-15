import { Feather } from 'lucide-react';
import { Pill } from '@/components/Pill';
import { DocumentLink } from '@/components/DocumentLink';
import { PortraitScene } from './PortraitScene';

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
          <h1 className="font-serif text-4xl leading-tight tracking-tight text-paper sm:text-5xl">
            Hi, I&apos;m Shruti
          </h1>

          {aboutMeHtml ? (
            <div
              className="rich-text mt-6 max-w-xl text-base leading-relaxed text-paper/80 sm:text-lg"
              dangerouslySetInnerHTML={{ __html: aboutMeHtml }}
            />
          ) : (
            <p className="mt-6 max-w-xl text-base text-paper/60 sm:text-lg">
              About me content coming soon.
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Pill href="#categories" tone="teal">
              View My Work
            </Pill>
            {resumeUrl && (
              <DocumentLink
                href={resumeUrl}
                title="Resume"
                className="text-sm font-medium text-paper underline underline-offset-4 hover:text-chartreuse"
              >
                Download Resume
              </DocumentLink>
            )}
          </div>
        </div>

        {profilePhoto && (
          <div className="relative isolate justify-self-center sm:justify-self-end">
            <PortraitScene />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profilePhoto}
              alt="Shruti Shahu"
              style={{
                maskImage: 'linear-gradient(to bottom, black 82%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 82%, transparent 100%)',
              }}
              className="relative z-10 h-auto max-h-[34rem] w-full max-w-sm object-contain drop-shadow-2xl sm:max-w-md"
            />
            <span className="absolute right-2 bottom-4 z-10 flex h-16 w-16 items-center justify-center rounded-full border border-paper/15 bg-near-black-olive shadow-lg">
              <Feather className="h-6 w-6 text-chartreuse" strokeWidth={1.5} aria-hidden="true" />
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

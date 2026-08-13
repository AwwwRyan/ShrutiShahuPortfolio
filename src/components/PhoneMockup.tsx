/** Phone-bezel-framed video embed for project detail pages, per design.md ref #6. */
export function PhoneMockup({ embedUrl, title }: { embedUrl: string; title: string }) {
  return (
    <div className="mx-auto w-full max-w-[280px]">
      <div className="relative aspect-[9/19.5] rounded-[2.5rem] border-[10px] border-near-black-olive bg-near-black-olive shadow-xl">
        <div className="absolute inset-2 overflow-hidden rounded-[1.75rem] bg-black">
          <iframe
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}

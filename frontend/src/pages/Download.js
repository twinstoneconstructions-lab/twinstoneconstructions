import { Download as DownloadIcon, FileText } from "lucide-react";
import SEO from "@/components/SEO";
import Reveal from "@/components/Reveal";
import ResponsiveImage from "@/components/ResponsiveImage";
import { useBrochures } from "@/lib/hooks";
import { fileUrl } from "@/lib/api";
import { track } from "@/lib/analytics";

export default function Download() {
  const { data: brochures, isLoading } = useBrochures();

  return (
    <>
      <SEO
        title="Download Brochures — TwinStone Constructions"
        description="Download the TwinStone Constructions company profile and project brochures."
        path="/download"
      />
      <section className="bg-[#171A1C] pt-40 pb-20 lg:pt-52 lg:pb-28 relative overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-50" aria-hidden="true" />
        <div className="container-x relative">
          <Reveal>
            <p className="overline-label mb-5">Download</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F7F5F0] leading-[1.08]">
              Brochures & Documents
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-xl text-base text-[#E9E4DA]/65 leading-relaxed">
              Company profiles, project brochures and specifications — print-ready documentation of how we build.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-[#F7F5F0] min-h-[40vh]">
        <div className="container-x">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="aspect-[3/4] bg-[#E9E4DA] animate-pulse" />
              ))}
            </div>
          ) : brochures?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="brochures-grid">
              {brochures.map((b, i) => (
                <Reveal key={b.id} delay={(i % 3) * 0.08}>
                  <article
                    className="group bg-white border border-[#202427]/10 overflow-hidden transition-[box-shadow,transform] duration-500 hover:shadow-2xl hover:-translate-y-1"
                    data-testid={`brochure-card-${b.id}`}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#252A2D]">
                      {b.thumbnail?.external_url || b.thumbnail?.storage_path ? (
                        <ResponsiveImage
                          media={b.thumbnail}
                          alt={`${b.title} cover`}
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText size={44} strokeWidth={1} className="text-[#E9E4DA]/30" />
                        </div>
                      )}
                      <span className="absolute top-4 left-4 bg-[#171A1C]/85 backdrop-blur text-[#E9E4DA] text-[0.6rem] font-semibold tracking-[0.2em] uppercase px-3 py-1.5">
                        PDF
                      </span>
                    </div>
                    <div className="p-6 lg:p-7">
                      <p className="overline-label mb-2">{b.category}</p>
                      <h2 className="font-display text-lg font-semibold tracking-tight text-[#202427]">{b.title}</h2>
                      {b.description && <p className="mt-2 text-sm text-[#667078] leading-relaxed line-clamp-2">{b.description}</p>}
                      {b.file_path ? (
                        <a
                          href={fileUrl(b.file_path)}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-testid={`brochure-download-${b.id}`}
                          onClick={() => track("brochure_download", { brochure: b.title })}
                          className="mt-5 inline-flex items-center gap-2 bg-[#171A1C] text-[#F7F5F0] px-6 py-3 text-[0.65rem] font-semibold tracking-[0.2em] uppercase transition-colors hover:bg-[#B77A45] hover:text-[#171A1C]"
                        >
                          <DownloadIcon size={14} /> Download Brochure
                        </a>
                      ) : (
                        <p className="mt-5 text-xs text-[#667078] italic">File being prepared</p>
                      )}
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center" data-testid="brochures-empty">
              <p className="font-editorial italic text-3xl text-[#202427]/60">Brochures are being prepared.</p>
              <p className="mt-3 text-sm text-[#667078]">Check back soon or contact us directly for documentation.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

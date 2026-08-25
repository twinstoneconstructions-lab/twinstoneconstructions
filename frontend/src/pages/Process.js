import SEO from "@/components/SEO";
import Reveal from "@/components/Reveal";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PROCESS_STEPS } from "@/lib/content";

export default function Process() {
  return (
    <>
      <SEO
        title="Our Process — TwinStone Constructions"
        description="How TwinStone builds: consultation, planning, design, construction, quality inspection and documented handover."
        path="/process"
      />
      <section className="bg-[#171A1C] pt-40 pb-20 lg:pt-52 lg:pb-28 relative overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-50" aria-hidden="true" />
        <div className="container-x relative">
          <Reveal>
            <p className="overline-label mb-5">The Method</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F7F5F0] leading-[1.08]">
              How We Build
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-xl text-base text-[#E9E4DA]/65 leading-relaxed">
              Six stages. Zero improvisation. Every TwinStone project follows the same disciplined path — so quality is a
              system, not a hope.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-24 lg:py-32 bg-[#F7F5F0]">
        <div className="container-x max-w-5xl">
          {PROCESS_STEPS.map((step, i) => (
            <Reveal key={step.n} delay={0.05}>
              <div
                className="group grid grid-cols-12 gap-6 py-12 lg:py-16 border-t border-[#202427]/10 last:border-b items-start"
                data-testid={`process-detail-${step.n}`}
              >
                <span className="col-span-3 sm:col-span-2 font-editorial text-6xl lg:text-7xl text-[#202427]/15 group-hover:text-[#B77A45] transition-colors leading-none">
                  {step.n}
                </span>
                <div className="col-span-9 sm:col-span-10 lg:col-span-7">
                  <h2 className="font-display text-2xl lg:text-3xl font-bold tracking-tight text-[#202427]">{step.title}</h2>
                  <p className="mt-4 text-sm sm:text-base text-[#667078] leading-relaxed max-w-xl">{step.copy}</p>
                </div>
                <div className="hidden lg:flex col-span-3 justify-end">
                  <span className="w-2 h-2 rotate-45 bg-[#B77A45] mt-3 group-hover:scale-150 transition-transform" aria-hidden="true" />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-24 lg:py-32 bg-[#171A1C] text-center">
        <div className="container-x flex flex-col items-center gap-8">
          <Reveal>
            <h2 className="font-editorial italic text-3xl sm:text-4xl lg:text-5xl text-[#F7F5F0] max-w-2xl leading-tight">
              Ready to begin stage 01?
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <Link
              to="/contact"
              data-testid="process-cta"
              className="inline-flex items-center gap-2 bg-[#B77A45] text-[#171A1C] px-8 py-4 text-[0.7rem] font-bold tracking-[0.2em] uppercase transition-colors hover:bg-[#F7F5F0]"
            >
              Request a Consultation <ArrowRight size={15} />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}

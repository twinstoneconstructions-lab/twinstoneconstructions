import SEO from "@/components/SEO";
import Reveal from "@/components/Reveal";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, ClipboardCheck, Hammer, Home as HomeIcon, Landmark, Layers } from "lucide-react";
import { SERVICES } from "@/lib/content";

const SERVICE_ICONS = [HomeIcon, Building2, Hammer, ClipboardCheck, Landmark, Layers];

export default function Services() {
  return (
    <>
      <SEO
        title="Services — TwinStone Constructions"
        description="Residential construction, commercial construction, renovation, project management, structural works and interior finishing."
        path="/services"
      />
      <section className="bg-[#171A1C] pt-40 pb-20 lg:pt-52 lg:pb-28 relative overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-50" aria-hidden="true" />
        <div className="container-x relative">
          <Reveal>
            <p className="overline-label mb-5">Services</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F7F5F0] max-w-3xl leading-[1.08]">
              Six disciplines. One standard.
            </h1>
          </Reveal>
        </div>
      </section>

      <section className="py-24 lg:py-32 bg-[#F7F5F0]">
        <div className="container-x flex flex-col gap-px bg-[#202427]/10 border border-[#202427]/10">
          {SERVICES.map((service, i) => {
            const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length];
            return (
              <Reveal key={service.id} className="bg-[#F7F5F0]">
                <article
                  className="group grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 lg:p-14 hover:bg-[#171A1C] transition-colors duration-500"
                  data-testid={`service-detail-${service.id}`}
                >
                  <div className="lg:col-span-1 flex lg:flex-col items-start gap-4">
                    <span className="font-editorial italic text-2xl text-[#B77A45]">{String(i + 1).padStart(2, "0")}</span>
                    <Icon size={26} strokeWidth={1.5} className="text-[#B77A45]" />
                  </div>
                  <div className="lg:col-span-5">
                    <h2 className="font-display text-2xl font-bold tracking-tight text-[#202427] group-hover:text-[#F7F5F0] transition-colors">
                      {service.title}
                    </h2>
                    <p className="mt-3 text-sm sm:text-base text-[#667078] group-hover:text-[#E9E4DA]/60 leading-relaxed transition-colors">
                      {service.copy}
                    </p>
                  </div>
                  <div className="lg:col-span-4">
                    <p className="text-[0.65rem] font-semibold tracking-[0.25em] uppercase text-[#B77A45] mb-4">Scope of Work</p>
                    <ul className="space-y-2">
                      {service.scope.map((item) => (
                        <li key={item} className="text-sm text-[#202427] group-hover:text-[#E9E4DA]/80 transition-colors flex items-center gap-3">
                          <span className="w-3 h-px bg-[#B77A45]" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="lg:col-span-2 flex lg:justify-end items-start">
                    <Link
                      to="/contact"
                      data-testid={`service-inquire-${service.id}`}
                      className="inline-flex items-center gap-2 text-[0.65rem] font-semibold tracking-[0.2em] uppercase text-[#B77A45] border border-[#B77A45]/40 px-5 py-3 hover:bg-[#B77A45] hover:text-[#171A1C] transition-colors"
                    >
                      Enquire <ArrowRight size={13} />
                    </Link>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>
    </>
  );
}

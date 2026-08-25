import SEO from "@/components/SEO";
import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";
import Marquee from "@/components/Marquee";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { IMG, MARQUEE_ITEMS } from "@/lib/content";

const PILLARS = [
  { n: "01", title: "Engineering First", copy: "Every aesthetic decision is backed by verified structural engineering. Beauty that stands because it is built to." },
  { n: "02", title: "Radical Transparency", copy: "Open budgets, honest timelines and documented progress. Our clients always know exactly where their project stands." },
  { n: "03", title: "Craft & Material", copy: "Stone, concrete, timber and metal selected for provenance and longevity — then finished by people who care about the last millimetre." },
  { n: "04", title: "Long-Term Value", copy: "We build for the second and third decade of a building's life, not just for the handover photograph." },
];

const TEAM = [
  { img: IMG.founder, role: "Founding Principal", note: "Profile coming soon" },
  { img: IMG.architect, role: "Lead Architect", note: "Profile coming soon" },
  { img: IMG.studio, role: "Head of Delivery", note: "Profile coming soon" },
];

export default function About() {
  return (
    <>
      <SEO
        title="About TwinStone Constructions — Our Practice"
        description="TwinStone Constructions is a professional building practice defined by precision engineering, transparency and craftsmanship."
        path="/about"
      />
      <section className="bg-[#171A1C] pt-40 pb-24 lg:pt-52 lg:pb-32 relative overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-50" aria-hidden="true" />
        <div className="container-x relative">
          <Reveal>
            <p className="overline-label mb-5">About Us</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F7F5F0] max-w-3xl leading-[1.08]">
              Built on stone.<br />Run on trust.
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-xl text-base sm:text-lg text-[#E9E4DA]/65 leading-relaxed">
              TwinStone Constructions is a professional building practice delivering residential, commercial and renovation
              projects — defined by engineering precision, honest communication and materials that outlast trends.
            </p>
          </Reveal>
        </div>
      </section>

      <Marquee items={MARQUEE_ITEMS} />

      <section className="py-24 lg:py-32 bg-[#F7F5F0]">
        <div className="container-x grid grid-cols-1 lg:grid-cols-12 gap-14">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <SectionHead
                overline="Our Pillars"
                title="The Principles Behind Every Build"
                copy="Four commitments shape how TwinStone plans, builds and hands over every project."
              />
            </div>
          </div>
          <div className="lg:col-span-7 flex flex-col">
            {PILLARS.map((p, i) => (
              <Reveal key={p.n} delay={i * 0.06}>
                <div className="flex gap-6 sm:gap-10 py-9 border-t border-[#202427]/10 last:border-b" data-testid={`pillar-${p.n}`}>
                  <span className="font-editorial text-5xl text-[#B77A45]/80 leading-none w-16 shrink-0">{p.n}</span>
                  <div>
                    <h3 className="font-display text-xl font-semibold tracking-tight text-[#202427]">{p.title}</h3>
                    <p className="mt-2 text-sm sm:text-base text-[#667078] leading-relaxed">{p.copy}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32 bg-[#E9E4DA]">
        <div className="container-x">
          <SectionHead
            overline="Leadership"
            title="The People Behind The Practice"
            copy="Senior oversight on every project — from first sketch to final inspection."
          />
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {TEAM.map((member, i) => (
              <Reveal key={member.role} delay={i * 0.08}>
                <figure className="group" data-testid={`team-${member.role.toLowerCase().replace(/\s+/g, "-")}`}>
                  <div className="overflow-hidden">
                    <img
                      src={member.img}
                      alt={member.role}
                      loading="lazy"
                      className="w-full aspect-[3/4] object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                    />
                  </div>
                  <figcaption className="mt-4">
                    <p className="font-display font-semibold text-[#202427]">{member.role}</p>
                    <p className="text-xs text-[#667078] mt-1 italic font-editorial text-sm">{member.note}</p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32 bg-[#171A1C] text-center">
        <div className="container-x flex flex-col items-center gap-8">
          <Reveal>
            <h2 className="font-editorial italic text-3xl sm:text-4xl lg:text-5xl text-[#F7F5F0] max-w-2xl leading-tight">
              “A building should outlive the conversation that started it.”
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <Link
              to="/contact"
              data-testid="about-cta"
              className="inline-flex items-center gap-2 bg-[#B77A45] text-[#171A1C] px-8 py-4 text-[0.7rem] font-bold tracking-[0.2em] uppercase transition-colors hover:bg-[#F7F5F0]"
            >
              Start Your Project <ArrowRight size={15} />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}

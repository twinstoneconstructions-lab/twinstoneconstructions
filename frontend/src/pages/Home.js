import { lazy, Suspense, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, Building2, ClipboardCheck, Hammer, Home as HomeIcon, Landmark, Layers } from "lucide-react";
import SEO from "@/components/SEO";
import KineticLines from "@/components/KineticLines";
import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";
import Marquee from "@/components/Marquee";
import ProjectCard, { coverOf } from "@/components/ProjectCard";
import { useProjects, useSettings } from "@/lib/hooks";
import { fileUrl } from "@/lib/api";
import ResponsiveImage from "@/components/ResponsiveImage";
import useCanWebGL from "@/lib/useCanWebGL";
import { HERO_FALLBACK_IMG, IMG, MARQUEE_ITEMS, SERVICES, PROCESS_STEPS, WHY_POINTS } from "@/lib/content";

const HeroScene = lazy(() => import("@/components/three/HeroScene"));

const SERVICE_ICONS = [HomeIcon, Building2, Hammer, ClipboardCheck, Landmark, Layers];

function Hero() {
  const { data: settings } = useSettings();
  const canWebGL = useCanWebGL();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const fallbackImgY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const hero = settings?.hero || {};
  const prefersReduced =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const heroVideo = hero.mode === "video" && hero.video_path ? hero.video_path : null;

  return (
    <section ref={ref} className="relative min-h-screen bg-[#171A1C] overflow-hidden flex items-center" data-testid="hero-section">
      <div className="absolute inset-0 blueprint-grid" aria-hidden="true" />
      {heroVideo && !prefersReduced ? (
        <video
          key={heroVideo}
          src={fileUrl(heroVideo)}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          data-testid="hero-video"
          aria-hidden="true"
        />
      ) : canWebGL ? (
        <div className="absolute inset-0 opacity-90">
          <Suspense fallback={null}>
            <HeroScene />
          </Suspense>
        </div>
      ) : (
        <motion.img
          src={HERO_FALLBACK_IMG}
          alt="Architectural construction by TwinStone"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
          style={{ y: fallbackImgY }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#171A1C] via-[#171A1C]/20 to-[#171A1C]/70" aria-hidden="true" />

      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="relative container-x pt-32 pb-28 w-full">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="overline-label mb-6"
          data-testid="hero-overline"
        >
          {hero.overline || "TwinStone Constructions"}
        </motion.p>
        <KineticLines
          lines={[hero.line1 || "Building With Purpose.", hero.line2 || "Built To Last."]}
          className="font-display text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] text-[#F7F5F0] max-w-4xl"
          accentLast
          delay={0.35}
        />
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mt-7 max-w-xl text-base sm:text-lg text-[#E9E4DA]/70 leading-relaxed"
          data-testid="hero-subtitle"
        >
          {hero.subtitle ||
            "Professional construction solutions designed around quality, precision, engineering excellence and long-term value."}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.05, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <Link
            to="/projects/completed"
            data-testid="hero-cta-explore"
            className="inline-flex items-center gap-2 bg-[#B77A45] text-[#171A1C] px-7 py-4 text-[0.7rem] font-bold tracking-[0.2em] uppercase transition-colors duration-300 hover:bg-[#F7F5F0]"
          >
            Explore Our Projects <ArrowRight size={15} />
          </Link>
          <Link
            to="/contact"
            data-testid="hero-cta-start"
            className="inline-flex items-center gap-2 border border-[#E9E4DA]/30 text-[#F7F5F0] px-7 py-4 text-[0.7rem] font-semibold tracking-[0.2em] uppercase transition-colors duration-300 hover:border-[#B77A45] hover:text-[#B77A45]"
          >
            Start Your Project <ArrowUpRight size={15} />
          </Link>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="mt-16 flex flex-wrap gap-x-3 gap-y-2 text-[0.62rem] tracking-[0.3em] sm:tracking-[0.35em] uppercase text-[#E9E4DA]/40"
        >
          {["Residential", "Commercial", "Renovation", "Project Management"].map((s, i) => (
            <span key={s} className="flex items-center gap-3">
              {i > 0 && <span className="text-[#B77A45]/60" aria-hidden="true">·</span>}
              {s}
            </span>
          ))}
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        aria-hidden="true"
      >
        <span className="text-[0.55rem] tracking-[0.4em] uppercase text-[#E9E4DA]/40">Scroll</span>
        <span className="w-px h-10 bg-gradient-to-b from-[#B77A45] to-transparent" />
      </motion.div>
    </section>
  );
}

function Intro() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [50, -50]);

  const chapters = [
    { n: "01", title: "Vision", copy: "Every project begins as an idea worth building properly. We shape that idea into something that can stand for generations." },
    { n: "02", title: "Execution", copy: "Drawings become structure through disciplined engineering, verified milestones and craftsmanship that refuses shortcuts." },
    { n: "03", title: "Legacy", copy: "We measure success in decades. A TwinStone building is delivered to hold its integrity, its beauty and its value." },
  ];

  return (
    <section ref={ref} className="py-24 lg:py-36 bg-[#F7F5F0]" data-testid="intro-section">
      <div className="container-x grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-20">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <SectionHead
              overline="Who We Are"
              title="Construction Built on Trust"
              copy="TwinStone Constructions is a professional building practice delivering residential, commercial and renovation projects. Our work is defined by precision engineering, transparent communication and materials chosen to last."
            />
            <Reveal delay={0.2} className="mt-10">
              <Link
                to="/about"
                data-testid="intro-about-link"
                className="inline-flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.2em] uppercase text-[#B77A45] border-b border-[#B77A45]/40 pb-1 hover:gap-3 transition-all"
              >
                More About TwinStone <ArrowRight size={14} />
              </Link>
            </Reveal>
          </div>
        </div>
        <div className="lg:col-span-7 flex flex-col gap-14">
          <div className="relative overflow-hidden">
            <motion.img
              src={IMG.structure}
              alt="Architectural structure detail"
              loading="lazy"
              className="w-full aspect-[16/10] object-cover"
              style={{ y: imgY, scale: 1.15 }}
            />
            <span className="absolute bottom-0 left-0 bg-[#171A1C] text-[#E9E4DA] text-[0.6rem] tracking-[0.3em] uppercase px-5 py-3">
              Precision in every layer
            </span>
          </div>
          <div className="flex flex-col">
            {chapters.map((c, i) => (
              <Reveal key={c.n} delay={i * 0.08}>
                <div className="flex gap-6 sm:gap-10 py-8 border-t border-[#202427]/10 group" data-testid={`manifesto-chapter-${c.n}`}>
                  <span className="font-editorial text-5xl sm:text-6xl text-[#B77A45]/80 leading-none shrink-0 w-16 sm:w-20">{c.n}</span>
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-[#202427] group-hover:text-[#B77A45] transition-colors">
                      {c.title}
                    </h3>
                    <p className="mt-2 text-sm sm:text-base text-[#667078] leading-relaxed max-w-lg">{c.copy}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedProjects() {
  const { data: projects } = useProjects({ featured: true });
  if (!projects?.length) return null;
  return (
    <section className="py-24 lg:py-32 bg-[#E9E4DA]" data-testid="featured-section">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-14">
          <SectionHead overline="Selected Work" title="Featured Projects" copy="A cinematic selection of TwinStone builds — architecture presented at the scale it deserves." />
          <Reveal delay={0.2}>
            <Link to="/projects/completed" data-testid="featured-view-all" className="inline-flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.2em] uppercase text-[#202427] hover:text-[#B77A45] transition-colors">
              View All Projects <ArrowUpRight size={14} />
            </Link>
          </Reveal>
        </div>
        <div className="flex flex-col gap-20 lg:gap-28">
          {projects.slice(0, 3).map((project, i) => {
            const cover = coverOf(project);
            const flip = i % 2 === 1;
            return (
              <Reveal key={project.id}>
                <Link
                  to={`/projects/${project.slug}`}
                  data-testid={`featured-project-${project.slug}`}
                  className={`group grid grid-cols-1 lg:grid-cols-12 gap-8 items-center`}
                >
                  <div className={`lg:col-span-7 overflow-hidden ${flip ? "lg:order-2" : ""}`}>
                    {cover && (
                      <ResponsiveImage
                        media={cover}
                        alt={cover.alt || project.name}
                        sizes="(max-width: 1024px) 100vw, 58vw"
                        className="w-full aspect-[16/10] object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className={`lg:col-span-5 ${flip ? "lg:order-1 lg:text-right" : ""}`}>
                    <p className="overline-label mb-3">{project.category} — {project.status === "ongoing" ? "In Progress" : project.year}</p>
                    <h3 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-[#202427] leading-tight group-hover:text-[#B77A45] transition-colors">
                      {project.name}
                    </h3>
                    <p className="mt-4 text-sm sm:text-base text-[#667078] leading-relaxed line-clamp-3">{project.description}</p>
                    <span className="mt-6 inline-flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.2em] uppercase text-[#202427] group-hover:text-[#B77A45] transition-colors">
                      View Project <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section className="py-24 lg:py-32 bg-[#F7F5F0]" data-testid="services-section">
      <div className="container-x">
        <SectionHead overline="What We Build" title="Services" copy="Six disciplines, one standard: precision from foundation to finish." />
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#202427]/10 border border-[#202427]/10">
          {SERVICES.map((service, i) => {
            const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length];
            return (
              <Reveal key={service.id} delay={(i % 3) * 0.08} className="bg-[#F7F5F0]">
                <Link
                  to="/services"
                  data-testid={`service-card-${service.id}`}
                  className="group flex flex-col gap-5 p-8 lg:p-10 h-full hover:bg-[#171A1C] transition-colors duration-500"
                >
                  <Icon size={26} strokeWidth={1.5} className="text-[#B77A45]" />
                  <h3 className="font-display text-lg font-semibold tracking-tight text-[#202427] group-hover:text-[#F7F5F0] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-sm text-[#667078] leading-relaxed group-hover:text-[#E9E4DA]/60 transition-colors">{service.copy}</p>
                  <span className="mt-auto inline-flex items-center gap-2 text-[0.65rem] font-semibold tracking-[0.2em] uppercase text-[#B77A45]">
                    Explore <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function OngoingPreview() {
  const { data: projects } = useProjects({ status: "ongoing" });
  if (!projects?.length) return null;
  return (
    <section className="py-24 lg:py-32 bg-[#171A1C]" data-testid="ongoing-section">
      <div className="container-x flex flex-wrap items-end justify-between gap-6 mb-12">
        <SectionHead dark overline="Live Sites" title="Ongoing Projects" copy="Active construction, documented progress. Follow each build as it rises." />
        <Reveal delay={0.2}>
          <Link to="/projects/ongoing" data-testid="ongoing-view-all" className="inline-flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.2em] uppercase text-[#E9E4DA] hover:text-[#B77A45] transition-colors">
            All Ongoing <ArrowUpRight size={14} />
          </Link>
        </Reveal>
      </div>
      <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-6 container-x" style={{ scrollbarWidth: "none" }}>
        {projects.map((project, i) => {
          const cover = coverOf(project);
          return (
            <Link
              key={project.id}
              to={`/projects/${project.slug}`}
              data-testid={`ongoing-card-${project.slug}`}
              className="group relative shrink-0 w-[82vw] sm:w-[55vw] lg:w-[38vw] snap-start overflow-hidden"
            >
              {cover && (
                <ResponsiveImage
                  media={cover}
                  alt={cover.alt || project.name}
                  sizes="(max-width: 640px) 82vw, 38vw"
                  className="w-full aspect-[4/5] object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#171A1C] via-transparent to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-7">
                <p className="overline-label mb-2">{project.location}</p>
                <h3 className="font-display text-xl font-semibold text-[#F7F5F0]">{project.name}</h3>
                <div className="mt-4 h-px bg-[#E9E4DA]/20">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${project.progress}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.2 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full bg-[#B77A45]"
                  />
                </div>
                <p className="mt-2 text-[0.65rem] tracking-[0.2em] uppercase text-[#E9E4DA]/60">{project.progress}% complete</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function CompletedPreview() {
  const { data: projects } = useProjects({ status: "completed" });
  if (!projects?.length) return null;
  return (
    <section className="py-24 lg:py-32 bg-[#F7F5F0]" data-testid="completed-section">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-14">
          <SectionHead overline="Delivered" title="Completed Projects" copy="Finished buildings, handed over and performing — the proof of the practice." />
          <Reveal delay={0.2}>
            <Link to="/projects/completed" data-testid="completed-view-all" className="inline-flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.2em] uppercase text-[#202427] hover:text-[#B77A45] transition-colors">
              All Completed <ArrowUpRight size={14} />
            </Link>
          </Reveal>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.slice(0, 3).map((project, i) => (
            <ProjectCard key={project.id} project={project} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  return (
    <section className="py-24 lg:py-32 bg-[#E9E4DA]" data-testid="process-section">
      <div className="container-x grid grid-cols-1 lg:grid-cols-12 gap-14">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <SectionHead overline="The Method" title="How We Build" copy="Six stages. Zero improvisation. A documented path from first conversation to final key." />
            <Reveal delay={0.2} className="mt-8">
              <Link to="/process" data-testid="process-explore" className="inline-flex items-center gap-2 text-[0.7rem] font-semibold tracking-[0.2em] uppercase text-[#B77A45] border-b border-[#B77A45]/40 pb-1 hover:gap-3 transition-all">
                Explore The Process <ArrowRight size={14} />
              </Link>
            </Reveal>
          </div>
        </div>
        <div className="lg:col-span-8 flex flex-col">
          {PROCESS_STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 0.05}>
              <div className="group flex items-baseline gap-6 sm:gap-12 py-7 border-t border-[#202427]/10 last:border-b" data-testid={`process-step-${step.n}`}>
                <span className="font-editorial text-4xl sm:text-5xl text-[#202427]/25 group-hover:text-[#B77A45] transition-colors leading-none w-14 sm:w-20 shrink-0">
                  {step.n}
                </span>
                <div>
                  <h3 className="font-display text-lg sm:text-xl font-semibold tracking-tight text-[#202427]">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-[#667078] leading-relaxed max-w-xl">{step.copy}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhySection() {
  return (
    <section className="py-24 lg:py-32 bg-[#171A1C]" data-testid="why-section">
      <div className="container-x">
        <SectionHead dark overline="The Standard" title="Why TwinStone" copy="The disciplines behind every project we deliver." />
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#E9E4DA]/10 border border-[#E9E4DA]/10">
          {WHY_POINTS.map((point, i) => (
            <Reveal key={point.title} delay={(i % 4) * 0.06} className="bg-[#171A1C]">
              <div className="group p-7 lg:p-8 h-full hover:bg-[#252A2D] transition-colors duration-500" data-testid={`why-${point.title.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
                <span className="font-editorial italic text-2xl text-[#B77A45]">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 font-display text-base font-semibold text-[#F7F5F0] tracking-tight">{point.title}</h3>
                <p className="mt-2 text-xs sm:text-sm text-[#E9E4DA]/55 leading-relaxed">{point.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function BrochureCta() {
  return (
    <section className="py-20 lg:py-28 bg-[#F7F5F0]" data-testid="brochure-cta-section">
      <div className="container-x">
        <Reveal>
          <div className="relative overflow-hidden bg-[#E9E4DA] border border-[#202427]/10 px-8 py-14 lg:px-16 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="absolute -right-10 -bottom-16 w-64 h-64 border border-[#B77A45]/20 rotate-12 pointer-events-none" aria-hidden="true" />
            <div className="lg:col-span-8">
              <p className="overline-label mb-4">Documentation</p>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#202427]">
                Explore TwinStone in Detail
              </h2>
              <p className="mt-4 text-sm sm:text-base text-[#667078] max-w-xl leading-relaxed">
                Download our company profile and project brochures — scope, specifications and delivery standards in print-ready form.
              </p>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <Link
                to="/download"
                data-testid="brochure-cta-button"
                className="inline-flex items-center gap-2 bg-[#171A1C] text-[#F7F5F0] px-8 py-4 text-[0.7rem] font-semibold tracking-[0.2em] uppercase transition-colors duration-300 hover:bg-[#B77A45] hover:text-[#171A1C]"
              >
                Download Brochure <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ContactCta() {
  return (
    <section className="relative py-28 lg:py-40 bg-[#171A1C] overflow-hidden" data-testid="contact-cta-section">
      <div className="absolute inset-0 blueprint-grid opacity-60" aria-hidden="true" />
      <div className="relative container-x text-center flex flex-col items-center gap-8">
        <Reveal>
          <p className="overline-label">Begin</p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-editorial italic text-4xl sm:text-5xl lg:text-6xl text-[#F7F5F0] leading-tight max-w-3xl">
            Let&rsquo;s Build Something That Lasts.
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <Link
            to="/contact"
            data-testid="contact-cta-button"
            className="inline-flex items-center gap-2 bg-[#B77A45] text-[#171A1C] px-9 py-4 text-[0.7rem] font-bold tracking-[0.2em] uppercase transition-colors duration-300 hover:bg-[#F7F5F0]"
          >
            Start Your Project <ArrowUpRight size={15} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  const { data: settings } = useSettings();
  const ogImage = settings?.branding?.og_image ? fileUrl(settings.branding.og_image) : undefined;
  return (
    <>
      <SEO title="TwinStone Constructions — Building Excellence. Creating Landmarks." path="/" image={ogImage} />
      <Hero />
      <Marquee items={MARQUEE_ITEMS} />
      <Intro />
      <FeaturedProjects />
      <ServicesSection />
      <OngoingPreview />
      <CompletedPreview />
      <ProcessSection />
      <WhySection />
      <BrochureCta />
      <ContactCta />
    </>
  );
}

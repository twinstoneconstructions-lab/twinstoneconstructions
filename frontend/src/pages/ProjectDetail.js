import { lazy, Suspense, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Download as DownloadIcon, MapPin } from "lucide-react";
import SEO from "@/components/SEO";
import Reveal from "@/components/Reveal";
import KineticLines from "@/components/KineticLines";
import Lightbox from "@/components/Lightbox";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import ProjectCard from "@/components/ProjectCard";
import { useProject, useProjects } from "@/lib/hooks";
import { fileUrl, mediaSrc } from "@/lib/api";
import { track } from "@/lib/analytics";
import { coverOf } from "@/components/ProjectCard";
import ResponsiveImage from "@/components/ResponsiveImage";

const PanoViewer = lazy(() => import("@/components/three/PanoViewer"));
const ModelViewer = lazy(() => import("@/components/three/ModelViewer"));

export default function ProjectDetail() {
  const { slug } = useParams();
  const { data: project, isLoading, isError } = useProject(slug);
  const { data: all } = useProjects({});
  const [lightbox, setLightbox] = useState(-1);
  const [tab, setTab] = useState("photos");
  const [panoIndex, setPanoIndex] = useState(0);

  const groups = useMemo(() => {
    const media = project?.media || [];
    return {
      photos: media.filter((m) => ["image", "floorplan"].includes(m.kind)),
      videos: media.filter((m) => m.kind === "video"),
      panos: media.filter((m) => m.kind === "pano"),
      models: media.filter((m) => m.kind === "model"),
    };
  }, [project]);

  const related = useMemo(() => {
    if (!all || !project) return [];
    return all.filter((p) => p.id !== project.id && p.category === project.category).slice(0, 3);
  }, [all, project]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#171A1C] flex items-center justify-center">
        <span className="text-[0.65rem] tracking-[0.4em] uppercase text-[#E9E4DA]/50 animate-pulse">Loading Project</span>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="min-h-screen bg-[#171A1C] flex flex-col items-center justify-center gap-6 text-center px-6">
        <h1 className="font-display text-3xl font-bold text-[#F7F5F0]">Project not found</h1>
        <Link to="/projects/completed" data-testid="project-notfound-back" className="text-[#B77A45] text-xs tracking-[0.25em] uppercase">
          Browse Projects
        </Link>
      </div>
    );
  }

  const cover = coverOf(project);
  const tabs = [
    groups.photos.length && { id: "photos", label: "Photography" },
    groups.videos.length && { id: "videos", label: "Film" },
    groups.panos.length && { id: "panos", label: "360° View" },
    groups.models.length && { id: "models", label: "3D Model" },
  ].filter(Boolean);

  const specs = [
    project.location && { label: "Location", value: project.location },
    project.category && { label: "Category", value: project.category },
    project.year && { label: project.status === "ongoing" ? "Target" : "Completed", value: project.year },
    project.area && { label: "Area", value: project.area },
    ...(project.specs || []),
  ].filter(Boolean);

  return (
    <>
      <SEO
        title={project.seo?.title || `${project.name} — TwinStone Constructions`}
        description={project.seo?.description || project.description?.slice(0, 155)}
        path={`/projects/${project.slug}`}
        image={project.seo?.og_image || (cover ? mediaSrc(cover) : undefined)}
      />

      <section className="relative min-h-[85vh] bg-[#171A1C] flex items-end overflow-hidden" data-testid="project-hero">
        {cover && (
          <motion.div
            initial={{ scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <ResponsiveImage
              media={cover}
              alt={cover.alt || project.name}
              eager
              sizes="100vw"
              className="w-full h-full object-cover opacity-55"
            />
          </motion.div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#171A1C] via-[#171A1C]/30 to-[#171A1C]/60" aria-hidden="true" />
        <div className="relative container-x pb-16 pt-44 w-full">
          <Link
            to={project.status === "ongoing" ? "/projects/ongoing" : "/projects/completed"}
            data-testid="project-back-link"
            className="inline-flex items-center gap-2 text-[0.65rem] tracking-[0.25em] uppercase text-[#E9E4DA]/60 hover:text-[#B77A45] transition-colors mb-8"
          >
            <ArrowLeft size={14} /> {project.status === "ongoing" ? "Ongoing Projects" : "Completed Projects"}
          </Link>
          <p className="overline-label mb-4">{project.category} — {project.status === "ongoing" ? "Under Construction" : "Delivered"}</p>
          <KineticLines
            lines={[project.name]}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F7F5F0] leading-[1.05]"
          />
          {project.location && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 flex items-center gap-2 text-sm text-[#E9E4DA]/70"
            >
              <MapPin size={15} className="text-[#B77A45]" /> {project.location}
            </motion.p>
          )}
        </div>
      </section>

      {specs.length > 0 && (
        <section className="bg-[#E9E4DA] border-b border-[#202427]/10">
          <div className="container-x py-10 grid grid-cols-2 md:grid-cols-4 gap-8" data-testid="project-specs">
            {specs.slice(0, 8).map((spec) => (
              <div key={spec.label}>
                <p className="text-[0.6rem] font-semibold tracking-[0.25em] uppercase text-[#B77A45]">{spec.label}</p>
                <p className="mt-1.5 text-sm font-medium text-[#202427]">{spec.value}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="py-20 lg:py-28 bg-[#F7F5F0]">
        <div className="container-x grid grid-cols-1 lg:grid-cols-12 gap-14">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="overline-label mb-4">The Project</p>
              <p className="font-editorial text-2xl sm:text-3xl leading-relaxed text-[#202427]">{project.description}</p>
            </Reveal>
            {project.scope && (
              <Reveal delay={0.1}>
                <div className="mt-10 border-l-2 border-[#B77A45] pl-6">
                  <p className="text-[0.65rem] font-semibold tracking-[0.25em] uppercase text-[#B77A45] mb-2">Scope</p>
                  <p className="text-sm sm:text-base text-[#667078] leading-relaxed">{project.scope}</p>
                </div>
              </Reveal>
            )}
            {project.status === "ongoing" && project.progress > 0 && (
              <Reveal delay={0.15}>
                <div className="mt-10">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[0.65rem] font-semibold tracking-[0.25em] uppercase text-[#B77A45]">Construction Progress</p>
                    <p className="text-sm font-semibold text-[#202427]" data-testid="project-progress">{project.progress}%</p>
                  </div>
                  <div className="h-1 bg-[#202427]/10">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${project.progress}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full bg-[#B77A45]"
                    />
                  </div>
                </div>
              </Reveal>
            )}
          </div>
          <div className="lg:col-span-5">
            <Reveal delay={0.1}>
              <div className="bg-[#171A1C] p-8 lg:p-10">
                <p className="overline-label mb-5">Commission A Project</p>
                <p className="font-editorial italic text-2xl text-[#F7F5F0] leading-snug">
                  Planning something with the same ambition?
                </p>
                <Link
                  to="/contact"
                  data-testid="project-cta"
                  className="mt-6 inline-flex items-center gap-2 text-[0.68rem] font-semibold tracking-[0.2em] uppercase text-[#B77A45] hover:text-[#F7F5F0] transition-colors"
                >
                  Request a Consultation <ArrowUpRight size={14} />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {project.comparisons?.some((c) => c.before && c.after) && (
        <section className="py-20 lg:py-28 bg-[#F7F5F0] border-t border-[#202427]/10" data-testid="before-after-section">
          <div className="container-x">
            <Reveal>
              <p className="overline-label mb-3">Transformation</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#202427] mb-10">Before & After</h2>
            </Reveal>
            <div className="flex flex-col gap-16">
              {project.comparisons
                .filter((c) => c.before && c.after)
                .map((c, i) => (
                  <Reveal key={i} delay={0.05}>
                    <BeforeAfterSlider before={c.before} after={c.after} caption={c.caption} />
                  </Reveal>
                ))}
            </div>
          </div>
        </section>
      )}

      {tabs.length > 0 && (
        <section className="py-20 lg:py-28 bg-[#E9E4DA]" data-testid="project-media-section">
          <div className="container-x">
            {tabs.length > 1 && (
              <div className="flex flex-wrap gap-3 mb-12" role="tablist" aria-label="Project media">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={tab === t.id}
                    data-testid={`media-tab-${t.id}`}
                    onClick={() => setTab(t.id)}
                    className={`px-5 py-2.5 text-[0.68rem] font-semibold tracking-[0.18em] uppercase border transition-colors duration-300 ${
                      tab === t.id
                        ? "bg-[#171A1C] text-[#F7F5F0] border-[#171A1C]"
                        : "border-[#202427]/20 text-[#667078] hover:border-[#B77A45] hover:text-[#B77A45]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}

            {tab === "photos" && groups.photos.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5" data-testid="project-gallery">
                {groups.photos.map((item, i) => (
                  <button
                    key={item.id || i}
                    onClick={() => setLightbox(i)}
                    data-testid={`gallery-item-${i}`}
                    className="group relative overflow-hidden focus-visible:ring-2 focus-visible:ring-[#B77A45]"
                    aria-label={`Open image: ${item.caption || item.alt || i + 1}`}
                  >
                    <ResponsiveImage
                      media={item}
                      alt={item.alt || item.caption || `${project.name} image ${i + 1}`}
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {item.caption && (
                      <span className="absolute bottom-0 left-0 bg-[#171A1C]/85 backdrop-blur text-[#E9E4DA] text-[0.6rem] tracking-[0.2em] uppercase px-4 py-2.5">
                        {item.caption}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {tab === "videos" && groups.videos.length > 0 && (
              <div className="flex flex-col gap-8">
                {groups.videos.map((item, i) => (
                  <video
                    key={item.id || i}
                    src={item.webm_path ? fileUrl(item.webm_path) : mediaSrc(item)}
                    poster={item.poster_path ? fileUrl(item.poster_path) : undefined}
                    controls
                    preload="metadata"
                    playsInline
                    className="w-full aspect-video bg-[#171A1C]"
                    data-testid={`project-video-${i}`}
                  />
                ))}
              </div>
            )}

            {tab === "panos" && groups.panos.length > 0 && (
              <div>
                {groups.panos.length > 1 && (
                  <div className="flex flex-wrap gap-2 mb-5" role="tablist" aria-label="Panorama scenes">
                    {groups.panos.map((p, i) => (
                      <button
                        key={p.id || i}
                        role="tab"
                        aria-selected={panoIndex === i}
                        data-testid={`pano-select-${i}`}
                        onClick={() => setPanoIndex(i)}
                        className={`px-4 py-2 text-[0.62rem] font-semibold tracking-[0.18em] uppercase border transition-colors duration-300 ${
                          panoIndex === i
                            ? "bg-[#B77A45] text-[#171A1C] border-[#B77A45]"
                            : "border-[#202427]/20 text-[#667078] hover:border-[#B77A45] hover:text-[#B77A45]"
                        }`}
                      >
                        {p.caption ? p.caption.split("—")[0].trim() : `View ${i + 1}`}
                      </button>
                    ))}
                  </div>
                )}
                <Suspense fallback={<div className="aspect-[16/9] bg-[#171A1C] animate-pulse" />}>
                  <PanoViewer key={panoIndex} url={mediaSrc(groups.panos[panoIndex] || groups.panos[0])} />
                </Suspense>
              </div>
            )}

            {tab === "models" && groups.models.length > 0 && (
              <Suspense fallback={<div className="aspect-[16/10] bg-[#171A1C] animate-pulse" />}>
                <ModelViewer url={mediaSrc(groups.models[0])} />
              </Suspense>
            )}
          </div>
        </section>
      )}

      {project.brochure_path && (
        <section className="py-16 bg-[#F7F5F0] border-t border-[#202427]/10">
          <div className="container-x flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="overline-label mb-2">Documentation</p>
              <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#202427]">Project Brochure</h2>
            </div>
            <a
              href={fileUrl(project.brochure_path)}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="project-brochure-download"
              onClick={() => track("brochure_download", { project: project.slug })}
              className="inline-flex items-center gap-2 bg-[#171A1C] text-[#F7F5F0] px-7 py-4 text-[0.7rem] font-semibold tracking-[0.2em] uppercase transition-colors hover:bg-[#B77A45] hover:text-[#171A1C]"
            >
              <DownloadIcon size={15} /> Download Brochure
            </a>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="py-20 lg:py-28 bg-[#F7F5F0] border-t border-[#202427]/10">
          <div className="container-x">
            <Reveal>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#202427] mb-12">Related Projects</h2>
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {related.map((p, i) => (
                <ProjectCard key={p.id} project={p} delay={i * 0.08} />
              ))}
            </div>
          </div>
        </section>
      )}

      {lightbox >= 0 && (
        <Lightbox items={groups.photos} index={lightbox} onClose={() => setLightbox(-1)} onNav={setLightbox} />
      )}
    </>
  );
}

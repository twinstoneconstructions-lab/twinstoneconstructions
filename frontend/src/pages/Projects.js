import { useMemo, useState } from "react";
import SEO from "@/components/SEO";
import Reveal from "@/components/Reveal";
import ProjectCard from "@/components/ProjectCard";
import { useProjects } from "@/lib/hooks";

const CATEGORIES = ["All", "Residential", "Commercial", "Renovation", "Other"];

export default function Projects({ status }) {
  const isOngoing = status === "ongoing";
  const { data: projects, isLoading } = useProjects({ status });
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    if (!projects) return [];
    if (category === "All") return projects;
    return projects.filter((p) => p.category === category);
  }, [projects, category]);

  return (
    <>
      <SEO
        title={isOngoing ? "Ongoing Projects — TwinStone Constructions" : "Completed Projects — TwinStone Constructions"}
        description={
          isOngoing
            ? "Active TwinStone construction sites with documented progress."
            : "Delivered TwinStone buildings — residential, commercial and renovation."
        }
        path={isOngoing ? "/projects/ongoing" : "/projects/completed"}
      />
      <section className="bg-[#171A1C] pt-40 pb-20 lg:pt-52 lg:pb-28 relative overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-50" aria-hidden="true" />
        <div className="container-x relative">
          <Reveal>
            <p className="overline-label mb-5">{isOngoing ? "Live Sites" : "Delivered"}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F7F5F0] leading-[1.08]">
              {isOngoing ? "Ongoing Projects" : "Completed Projects"}
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-xl text-base text-[#E9E4DA]/65 leading-relaxed">
              {isOngoing
                ? "Construction in motion — each site documented, each milestone verified."
                : "Finished buildings, handed over and performing."}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-[#F7F5F0] min-h-[50vh]">
        <div className="container-x">
          <div className="flex flex-wrap gap-3 mb-12" role="tablist" aria-label="Project categories">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                role="tab"
                aria-selected={category === cat}
                data-testid={`filter-${cat.toLowerCase()}`}
                onClick={() => setCategory(cat)}
                className={`px-5 py-2.5 text-[0.68rem] font-semibold tracking-[0.18em] uppercase border transition-colors duration-300 ${
                  category === cat
                    ? "bg-[#171A1C] text-[#F7F5F0] border-[#171A1C]"
                    : "border-[#202427]/20 text-[#667078] hover:border-[#B77A45] hover:text-[#B77A45]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="aspect-[4/5] bg-[#E9E4DA] animate-pulse" />
              ))}
            </div>
          ) : filtered.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="projects-grid">
              {filtered.map((project, i) => (
                <ProjectCard key={project.id} project={project} delay={(i % 3) * 0.08} />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center" data-testid="projects-empty">
              <p className="font-editorial italic text-3xl text-[#202427]/60">No projects in this category yet.</p>
              <p className="mt-3 text-sm text-[#667078]">New work is added as it is documented.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

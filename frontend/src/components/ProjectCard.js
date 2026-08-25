import { Link } from "react-router-dom";
import { MapPin, ArrowUpRight } from "lucide-react";
import ResponsiveImage from "./ResponsiveImage";
import Reveal from "./Reveal";

export function coverOf(project) {
  if (!project?.media?.length) return null;
  return project.media[project.cover_index] || project.media[0];
}

export default function ProjectCard({ project, delay = 0 }) {
  const cover = coverOf(project);
  return (
    <Reveal delay={delay}>
      <Link
        to={`/projects/${project.slug}`}
        data-testid={`project-card-${project.slug}`}
        className="group block bg-white border border-[#202427]/10 overflow-hidden transition-[box-shadow,transform,border-color] duration-500 hover:shadow-2xl hover:-translate-y-1 hover:border-[#B77A45]/40"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-[#252A2D]">
          {cover && (
            <ResponsiveImage
              media={cover}
              alt={cover.alt || project.name}
              sizes="(max-width: 768px) 100vw, 33vw"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          )}
          <span
            className={`absolute top-4 left-4 text-[0.6rem] font-semibold tracking-[0.2em] uppercase px-3 py-1.5 ${
              project.status === "ongoing" ? "bg-[#B77A45] text-[#F7F5F0]" : "bg-[#171A1C]/85 text-[#E9E4DA] backdrop-blur"
            }`}
          >
            {project.status === "ongoing" ? "Under Construction" : "Completed"}
          </span>
          {project.status === "ongoing" && project.progress > 0 && (
            <div className="absolute bottom-0 inset-x-0 h-1 bg-[#171A1C]/50">
              <div className="h-full bg-[#B77A45]" style={{ width: `${project.progress}%` }} />
            </div>
          )}
        </div>
        <div className="p-6 lg:p-7">
          <p className="overline-label mb-2">{project.category}</p>
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-display text-lg sm:text-xl font-semibold tracking-tight text-[#202427] group-hover:text-[#B77A45] transition-colors">
              {project.name}
            </h3>
            <ArrowUpRight size={18} className="shrink-0 text-[#667078] group-hover:text-[#B77A45] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-[#667078]">
            {project.location && (
              <span className="flex items-center gap-1.5">
                <MapPin size={12} className="text-[#B77A45]" /> {project.location}
              </span>
            )}
            {project.year && <span>{project.year}</span>}
            {project.status === "ongoing" && project.progress > 0 && <span>{project.progress}% complete</span>}
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

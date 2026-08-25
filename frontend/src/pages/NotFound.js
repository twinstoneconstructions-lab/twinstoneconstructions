import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import KineticLines from "@/components/KineticLines";

export default function NotFound() {
  return (
    <>
      <SEO title="Page Not Found — TwinStone Constructions" noindex path="/404" />
      <section className="min-h-[85vh] bg-[#171A1C] flex items-center relative overflow-hidden" data-testid="not-found-page">
        <div className="absolute inset-0 blueprint-grid opacity-50" aria-hidden="true" />
        <div className="container-x relative flex flex-col items-start gap-8 pt-24">
          <p className="overline-label">Error 404</p>
          <KineticLines
            lines={["This floor", "doesn't exist."]}
            className="font-editorial italic text-5xl sm:text-6xl lg:text-7xl text-[#F7F5F0] leading-[1.05]"
          />
          <p className="max-w-md text-sm sm:text-base text-[#E9E4DA]/60 leading-relaxed">
            The page you are looking for has been moved, renamed or never built. Let us guide you back to solid ground.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/"
              data-testid="notfound-home"
              className="inline-flex items-center gap-2 bg-[#B77A45] text-[#171A1C] px-7 py-4 text-[0.7rem] font-bold tracking-[0.2em] uppercase transition-colors hover:bg-[#F7F5F0]"
            >
              Return Home <ArrowRight size={15} />
            </Link>
            <Link
              to="/projects/completed"
              data-testid="notfound-projects"
              className="inline-flex items-center gap-2 border border-[#E9E4DA]/30 text-[#F7F5F0] px-7 py-4 text-[0.7rem] font-semibold tracking-[0.2em] uppercase transition-colors hover:border-[#B77A45] hover:text-[#B77A45]"
            >
              Explore Projects
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

import Reveal from "./Reveal";

export default function SectionHead({ overline, title, copy, dark = false, align = "left" }) {
  const alignCls = align === "center" ? "text-center mx-auto items-center" : "text-left items-start";
  return (
    <div className={`flex flex-col gap-4 max-w-3xl ${alignCls}`}>
      {overline && (
        <Reveal>
          <p className="overline-label" data-testid={`overline-${overline.toLowerCase().replace(/\s+/g, "-")}`}>
            {overline}
          </p>
        </Reveal>
      )}
      <Reveal delay={0.08}>
        <h2
          className={`font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-snug ${
            dark ? "text-[#F7F5F0]" : "text-[#202427]"
          }`}
        >
          {title}
        </h2>
      </Reveal>
      {copy && (
        <Reveal delay={0.16}>
          <p className={`text-base leading-relaxed ${dark ? "text-[#E9E4DA]/70" : "text-[#667078]"}`}>{copy}</p>
        </Reveal>
      )}
    </div>
  );
}

export default function Marquee({ items = [], className = "" }) {
  const row = (
    <>
      {items.map((item, i) => (
        <span key={i} className="flex items-center shrink-0">
          <span className="font-editorial italic text-2xl sm:text-3xl text-[#202427]/80 whitespace-nowrap px-6">
            {item}
          </span>
          <span className="w-2 h-2 rotate-45 bg-[#B77A45]/70 shrink-0" aria-hidden="true" />
        </span>
      ))}
    </>
  );
  return (
    <div
      className={`overflow-hidden border-y border-[#202427]/10 bg-[#E9E4DA] py-5 select-none ${className}`}
      aria-hidden="true"
      data-testid="editorial-marquee"
    >
      <div className="marquee-track">
        <div className="flex shrink-0">{row}</div>
        <div className="flex shrink-0">{row}</div>
      </div>
    </div>
  );
}

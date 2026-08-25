import { derivativeUrl, fileUrl } from "@/lib/api";

const WIDTHS = [480, 960, 1600];

export default function ResponsiveImage({ media, alt, className = "", sizes = "100vw", eager = false, style }) {
  if (!media) return null;
  if (media.external_url || !media.storage_path) {
    return (
      <img
        src={media.external_url || fileUrl(media.storage_path)}
        alt={alt || media.alt || ""}
        loading={eager ? "eager" : "lazy"}
        className={className}
        style={style}
      />
    );
  }
  const srcSetFor = (fmt) => WIDTHS.map((w) => `${derivativeUrl(media.storage_path, w, fmt)} ${w}w`).join(", ");
  return (
    <picture>
      <source type="image/avif" srcSet={srcSetFor("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSetFor("webp")} sizes={sizes} />
      <img
        src={fileUrl(media.storage_path)}
        alt={alt || media.alt || ""}
        loading={eager ? "eager" : "lazy"}
        className={className}
        style={style}
      />
    </picture>
  );
}

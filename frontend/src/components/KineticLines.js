import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1];

export default function KineticLines({ lines = [], as: Tag = "h1", className = "", lineClassName = "", accentLast = false, delay = 0 }) {
  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <motion.span
            className={`block ${accentLast && i === lines.length - 1 ? "text-[#B77A45]" : ""} ${lineClassName}`}
            initial={{ y: "112%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 1.05, delay: delay + i * 0.15, ease: EASE }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

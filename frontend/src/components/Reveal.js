import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1];

export function Reveal({ children, delay = 0, y = 32, className = "", once = true }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export default Reveal;

import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { useSettings } from "@/lib/hooks";
import { fileUrl } from "@/lib/api";

const NAV = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Ongoing Projects", to: "/projects/ongoing" },
  { label: "Completed Projects", to: "/projects/completed" },
  { label: "Download", to: "/download" },
  { label: "Contact", to: "/contact" },
];

export function Logo({ dark = false }) {
  const { data: settings } = useSettings();
  const custom = dark ? settings?.branding?.logo_light : settings?.branding?.logo_dark;
  return (
    <Link to="/" className="flex items-center gap-3" data-testid="brand-logo" aria-label="TwinStone Constructions home">
      {custom ? (
        <img src={fileUrl(custom)} alt="TwinStone Constructions emblem" className="h-10 w-auto object-contain" />
      ) : (
        <span className="relative flex h-9 w-9 shrink-0 overflow-hidden bg-[#171A1C]" aria-hidden="true">
          <span className="absolute left-1.5 top-1.5 bottom-1.5 w-2.5 bg-[#E9E4DA]" />
          <span className="absolute right-1.5 top-3.5 bottom-1.5 w-2.5 bg-[#B77A45]" />
        </span>
      )}
      <span className="leading-none">
        <span className={`block font-display font-extrabold tracking-[0.18em] text-sm ${dark ? "text-[#F7F5F0]" : "text-[#171A1C]"}`}>
          TWINSTONE
        </span>
        <span className={`block text-[0.55rem] tracking-[0.42em] mt-1 ${dark ? "text-[#E9E4DA]/60" : "text-[#667078]"}`}>
          CONSTRUCTIONS
        </span>
      </span>
    </Link>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const overDark = (pathname === "/" || /^\/projects\/[^/]+$/.test(pathname)) && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <header
        data-testid="site-header"
        className={`fixed top-0 inset-x-0 z-50 transition-[background-color,color,box-shadow,border-color] duration-500 ${
          overDark
            ? "bg-transparent text-[#F7F5F0]"
            : "bg-[#F7F5F0]/85 backdrop-blur-xl text-[#171A1C] border-b border-[#202427]/10"
        }`}
      >
        <div className="container-x flex items-center justify-between h-20">
          <Logo dark={overDark} />
          <nav className="hidden lg:flex items-center gap-8" aria-label="Primary">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                className={({ isActive }) =>
                  `relative text-[0.68rem] font-semibold tracking-[0.2em] uppercase transition-colors duration-300 hover:text-[#B77A45] ${
                    isActive ? "text-[#B77A45]" : ""
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <Link
              to="/contact"
              data-testid="header-cta"
              className="hidden lg:inline-flex items-center gap-2 bg-[#B77A45] text-[#F7F5F0] px-5 py-2.5 text-[0.68rem] font-semibold tracking-[0.2em] uppercase transition-colors duration-300 hover:bg-[#96633a]"
            >
              Start Your Project <ArrowUpRight size={14} />
            </Link>
            <button
              onClick={() => setOpen(true)}
              data-testid="mobile-menu-button"
              aria-label="Open menu"
              className="lg:hidden p-2"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[90] bg-[#171A1C] text-[#F7F5F0] flex flex-col"
            data-testid="mobile-menu"
          >
            <div className="container-x flex items-center justify-between h-20">
              <Logo dark />
              <button onClick={() => setOpen(false)} data-testid="mobile-menu-close" aria-label="Close menu" className="p-2">
                <X size={26} />
              </button>
            </div>
            <nav className="flex-1 container-x flex flex-col justify-center gap-2" aria-label="Mobile">
              {NAV.map((item, i) => (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <NavLink
                    to={item.to}
                    end={item.to === "/"}
                    data-testid={`mobile-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                    className="block font-display text-3xl sm:text-4xl font-bold tracking-tight py-2 hover:text-[#B77A45] transition-colors"
                  >
                    {item.label}
                  </NavLink>
                </motion.div>
              ))}
            </nav>
            <p className="container-x pb-10 text-xs tracking-[0.2em] sm:tracking-[0.3em] uppercase text-[#E9E4DA]/40">
              Building Excellence. Creating Landmarks.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, ArrowUpRight, Instagram, Linkedin, Facebook } from "lucide-react";
import { Logo } from "./Header";
import { useSettings } from "@/lib/hooks";
import { track } from "@/lib/analytics";

const NAV = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Ongoing Projects", to: "/projects/ongoing" },
  { label: "Completed Projects", to: "/projects/completed" },
  { label: "Download", to: "/download" },
];

const LEGAL = [
  { label: "Contact", to: "/contact" },
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms & Conditions", to: "/terms" },
  { label: "Cookie Policy", to: "/cookies" },
];

export default function Footer() {
  const { data: settings } = useSettings();
  const company = settings?.company || {};
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#171A1C] text-[#E9E4DA]" data-testid="site-footer">
      <div className="container-x py-16 lg:py-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Logo dark />
          <p className="text-sm text-[#E9E4DA]/60 leading-relaxed max-w-xs">
            {settings?.footer?.description || "Building With Purpose. Built To Last."}
          </p>
          {company.phone && (
            <a href={`tel:${company.phone}`} data-testid="footer-phone" className="flex items-center gap-3 text-sm hover:text-[#B77A45] transition-colors">
              <Phone size={15} className="text-[#B77A45]" /> {company.phone}
            </a>
          )}
          {company.phone_alt && (
            <a href={`tel:${company.phone_alt}`} data-testid="footer-phone-alt" className="flex items-center gap-3 text-sm hover:text-[#B77A45] transition-colors">
              <Phone size={15} className="text-[#B77A45]" /> {company.phone_alt}
            </a>
          )}
          {company.email && (
            <a href={`mailto:${company.email}`} data-testid="footer-email" className="flex items-center gap-3 text-sm hover:text-[#B77A45] transition-colors">
              <Mail size={15} className="text-[#B77A45]" /> {company.email}
            </a>
          )}
          {company.address && (
            <p className="flex items-center gap-3 text-sm text-[#E9E4DA]/60">
              <MapPin size={15} className="text-[#B77A45]" /> {company.address}
            </p>
          )}
          {(() => {
            const socials = company.socials || {};
            const links = [
              { key: "instagram", label: "Instagram", Icon: Instagram },
              { key: "linkedin", label: "LinkedIn", Icon: Linkedin },
              { key: "facebook", label: "Facebook", Icon: Facebook },
            ].filter((s) => socials[s.key]);
            if (!links.length) return null;
            return (
              <div className="flex items-center gap-3 pt-2" data-testid="footer-socials">
                {links.map(({ key, label, Icon }) => (
                  <a
                    key={key}
                    href={socials[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`TwinStone on ${label}`}
                    data-testid={`footer-social-${key}`}
                    onClick={() => track("social_click", { network: key })}
                    className="flex items-center justify-center w-9 h-9 border border-[#E9E4DA]/20 text-[#E9E4DA]/70 transition-colors hover:border-[#B77A45] hover:text-[#B77A45]"
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            );
          })()}
        </div>

        <div className="lg:col-span-2">
          <h4 className="text-xs font-semibold tracking-[0.25em] uppercase text-[#E9E4DA]/40 mb-6">Navigate</h4>
          <ul className="space-y-3">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to} data-testid={`footer-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`} className="text-sm text-[#E9E4DA]/75 hover:text-[#B77A45] transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h4 className="text-xs font-semibold tracking-[0.25em] uppercase text-[#E9E4DA]/40 mb-6">Download</h4>
          <Link
            to="/download"
            data-testid="footer-brochure-link"
            className="inline-flex items-center gap-2 text-sm text-[#E9E4DA]/75 hover:text-[#B77A45] transition-colors"
          >
            Brochure <ArrowUpRight size={14} />
          </Link>
          <h4 className="text-xs font-semibold tracking-[0.25em] uppercase text-[#E9E4DA]/40 mt-10 mb-6">Legal</h4>
          <ul className="space-y-3">
            {LEGAL.map((item) => (
              <li key={item.to}>
                <Link to={item.to} data-testid={`footer-legal-${item.label.toLowerCase().replace(/[^a-z]+/g, "-")}`} className="text-sm text-[#E9E4DA]/75 hover:text-[#B77A45] transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-4 flex flex-col justify-between gap-8">
          <p className="font-editorial italic text-3xl leading-snug text-[#E9E4DA]/85">
            Building Excellence.
            <br />
            Creating Landmarks.
          </p>
          <Link
            to="/contact"
            data-testid="footer-cta"
            className="inline-flex w-fit items-center gap-2 border border-[#B77A45] text-[#B77A45] px-6 py-3 text-[0.68rem] font-semibold tracking-[0.2em] uppercase transition-colors duration-300 hover:bg-[#B77A45] hover:text-[#171A1C]"
          >
            Start Your Project <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
      <div className="border-t border-[#E9E4DA]/10">
        <div className="container-x py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#E9E4DA]/40">© {year} TwinStone Constructions. All Rights Reserved.</p>
          <p className="text-[0.65rem] tracking-[0.3em] uppercase text-[#E9E4DA]/30">Residential · Commercial · Renovation · Project Management</p>
        </div>
      </div>
    </footer>
  );
}

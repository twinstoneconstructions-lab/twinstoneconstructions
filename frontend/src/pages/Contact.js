import { useState } from "react";
import { toast } from "sonner";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import SEO from "@/components/SEO";
import Reveal from "@/components/Reveal";
import { api, apiError } from "@/lib/api";
import { useSettings } from "@/lib/hooks";
import { track } from "@/lib/analytics";

const inputCls =
  "w-full bg-transparent border border-[#202427]/20 px-4 py-3.5 text-sm text-[#202427] placeholder:text-[#667078]/60 focus:border-[#B77A45] focus:outline-none transition-colors";

export default function Contact() {
  const { data: settings } = useSettings();
  const company = settings?.company || {};
  const [form, setForm] = useState({
    name: "", email: "", phone: "", project_type: "", location: "", budget: "", message: "",
  });
  const [sending, setSending] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/contact", form);
      track("contact_submit", { project_type: form.project_type });
      toast.success("Request received. TwinStone will respond shortly.");
      setForm({ name: "", email: "", phone: "", project_type: "", location: "", budget: "", message: "" });
    } catch (err) {
      toast.error(apiError(err, "Could not send your request. Please try again."));
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <SEO
        title="Contact — TwinStone Constructions"
        description="Request a consultation with TwinStone Constructions for residential, commercial and renovation projects."
        path="/contact"
      />
      <section className="bg-[#171A1C] pt-40 pb-20 lg:pt-52 lg:pb-28 relative overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-50" aria-hidden="true" />
        <div className="container-x relative">
          <Reveal>
            <p className="overline-label mb-5">Contact</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F7F5F0] leading-[1.08]">
              Let&rsquo;s Build Something That Lasts.
            </h1>
          </Reveal>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-[#F7F5F0]">
        <div className="container-x grid grid-cols-1 lg:grid-cols-12 gap-14">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="overline-label mb-3">Commission Inquiry</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#202427] mb-10">
                Request a Consultation
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5" data-testid="contact-form">
                <input required minLength={2} value={form.name} onChange={set("name")} placeholder="Full Name *" aria-label="Full name" data-testid="contact-name" className={inputCls} />
                <input required type="email" value={form.email} onChange={set("email")} placeholder="Email *" aria-label="Email" data-testid="contact-email" className={inputCls} />
                <input value={form.phone} onChange={set("phone")} placeholder="Phone Number" aria-label="Phone number" data-testid="contact-phone" className={inputCls} />
                <select value={form.project_type} onChange={set("project_type")} aria-label="Project type" data-testid="contact-type" className={inputCls}>
                  <option value="">Project Type</option>
                  <option>Residential</option>
                  <option>Commercial</option>
                  <option>Renovation</option>
                  <option>Other</option>
                </select>
                <input value={form.location} onChange={set("location")} placeholder="Project Location" aria-label="Project location" data-testid="contact-location" className={inputCls} />
                <select value={form.budget} onChange={set("budget")} aria-label="Approximate budget" data-testid="contact-budget" className={inputCls}>
                  <option value="">Approximate Budget</option>
                  <option>Under ₹50 Lakh</option>
                  <option>₹50 Lakh – ₹2 Crore</option>
                  <option>₹2 Crore – ₹10 Crore</option>
                  <option>Above ₹10 Crore</option>
                </select>
                <textarea
                  required
                  minLength={10}
                  value={form.message}
                  onChange={set("message")}
                  placeholder="Tell us about your project *"
                  aria-label="Project message"
                  rows={5}
                  data-testid="contact-message"
                  className={`${inputCls} sm:col-span-2 resize-y`}
                />
                <button
                  type="submit"
                  disabled={sending}
                  data-testid="contact-submit"
                  className="sm:col-span-2 inline-flex items-center justify-center gap-2 bg-[#B77A45] text-[#171A1C] px-8 py-4 text-[0.7rem] font-bold tracking-[0.2em] uppercase transition-colors hover:bg-[#171A1C] hover:text-[#F7F5F0] disabled:opacity-60"
                >
                  {sending ? "Sending…" : "Request a Consultation"}
                </button>
              </form>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <Reveal delay={0.15}>
              <div className="bg-[#171A1C] p-8 lg:p-12 flex flex-col gap-8">
                <p className="overline-label">Direct</p>
                {company.phone && (
                  <a href={`tel:${company.phone}`} data-testid="contact-direct-phone" className="flex items-center gap-4 text-[#E9E4DA] hover:text-[#B77A45] transition-colors">
                    <Phone size={18} className="text-[#B77A45] shrink-0" />
                    <span className="text-sm">{company.phone}</span>
                  </a>
                )}
                {company.phone_alt && (
                  <a href={`tel:${company.phone_alt}`} data-testid="contact-direct-phone-alt" className="flex items-center gap-4 text-[#E9E4DA] hover:text-[#B77A45] transition-colors">
                    <Phone size={18} className="text-[#B77A45] shrink-0" />
                    <span className="text-sm">{company.phone_alt}</span>
                  </a>
                )}
                {company.email && (
                  <a href={`mailto:${company.email}`} data-testid="contact-direct-email" className="flex items-center gap-4 text-[#E9E4DA] hover:text-[#B77A45] transition-colors">
                    <Mail size={18} className="text-[#B77A45] shrink-0" />
                    <span className="text-sm">{company.email}</span>
                  </a>
                )}
                {company.address && (
                  <p className="flex items-center gap-4 text-[#E9E4DA]/70">
                    <MapPin size={18} className="text-[#B77A45] shrink-0" />
                    <span className="text-sm">{company.address}</span>
                  </p>
                )}
                {company.hours && (
                  <p className="flex items-center gap-4 text-[#E9E4DA]/70">
                    <Clock size={18} className="text-[#B77A45] shrink-0" />
                    <span className="text-sm">{company.hours}</span>
                  </p>
                )}
                <div className="border-t border-[#E9E4DA]/10 pt-6">
                  <p className="font-editorial italic text-xl text-[#E9E4DA]/70 leading-snug">
                    “Every landmark began as a conversation.”
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}

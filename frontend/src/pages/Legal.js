import SEO from "@/components/SEO";
import Reveal from "@/components/Reveal";

const CONTENT = {
  privacy: {
    title: "Privacy Policy",
    path: "/privacy",
    intro: "TwinStone Constructions collects only the information required to respond to project inquiries and operate this website responsibly.",
    sections: [
      { h: "Information We Collect", p: "When you submit a consultation request, we collect your name, contact details and project information. If analytics are enabled, anonymised usage data may be collected to improve the website experience." },
      { h: "How We Use It", p: "Inquiry information is used solely to respond to your request and, where relevant, to prepare project proposals. We do not sell, trade or share personal information with third parties for marketing purposes." },
      { h: "Data Security", p: "Submitted information is stored securely with access restricted to authorised personnel. Administrative access to this website is protected by multi-factor authentication, rate limiting and audit logging." },
      { h: "Your Rights", p: "You may request access to, correction of, or deletion of your personal information at any time by contacting us through the details published on this website." },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    path: "/terms",
    intro: "These terms govern the use of the TwinStone Constructions website. By using this site you accept these terms in full.",
    sections: [
      { h: "Website Content", p: "Content on this website is provided for general information about TwinStone Constructions and its services. Project imagery, renders and documentation remain the property of TwinStone Constructions and may not be reproduced without written permission." },
      { h: "No Professional Advice", p: "Nothing on this website constitutes engineering, architectural or contractual advice. Project-specific guidance is provided only through formal consultation and written agreement." },
      { h: "Accuracy", p: "We make reasonable efforts to keep information accurate and current, but project details, availability and specifications may change without notice." },
      { h: "Liability", p: "TwinStone Constructions is not liable for any loss arising from the use of this website or reliance on its content, to the fullest extent permitted by law." },
    ],
  },
  cookies: {
    title: "Cookie Policy",
    path: "/cookies",
    intro: "This website is designed to operate with minimal cookies. Where analytics are enabled, cookies may be used to understand aggregate site usage.",
    sections: [
      { h: "Essential Operation", p: "The core website does not require cookies to function. Administrative areas use short-lived, secure session tokens that are never accessible to third-party scripts." },
      { h: "Analytics", p: "If Google Analytics is enabled, it may set cookies to measure aggregate usage such as page views and project interactions. No advertising profiles are built from this data." },
      { h: "Managing Cookies", p: "You can control or delete cookies through your browser settings at any time. The website remains fully usable with cookies disabled." },
    ],
  },
};

export default function Legal({ type }) {
  const doc = CONTENT[type] || CONTENT.privacy;
  return (
    <>
      <SEO title={`${doc.title} — TwinStone Constructions`} description={doc.intro} path={doc.path} />
      <section className="bg-[#171A1C] pt-40 pb-20 lg:pt-52 lg:pb-24 relative overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-50" aria-hidden="true" />
        <div className="container-x relative">
          <Reveal>
            <p className="overline-label mb-5">Legal</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-[#F7F5F0]">{doc.title}</h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-2xl text-base text-[#E9E4DA]/65 leading-relaxed">{doc.intro}</p>
          </Reveal>
        </div>
      </section>
      <section className="py-20 lg:py-28 bg-[#F7F5F0]">
        <div className="container-x max-w-3xl flex flex-col">
          {doc.sections.map((s, i) => (
            <Reveal key={s.h} delay={i * 0.05}>
              <div className="py-8 border-t border-[#202427]/10 last:border-b">
                <h2 className="font-display text-xl font-semibold tracking-tight text-[#202427]">{s.h}</h2>
                <p className="mt-3 text-sm sm:text-base text-[#667078] leading-relaxed">{s.p}</p>
              </div>
            </Reveal>
          ))}
          <p className="mt-10 text-xs text-[#667078]">Last updated: {new Date().getFullYear()} · TwinStone Constructions</p>
        </div>
      </section>
    </>
  );
}

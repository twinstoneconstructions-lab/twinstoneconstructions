import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Lenis from "lenis";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import Process from "@/pages/Process";
import Download from "@/pages/Download";
import Contact from "@/pages/Contact";
import Legal from "@/pages/Legal";
import NotFound from "@/pages/NotFound";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import WhatsAppButton from "@/components/WhatsAppButton";
import { initAnalytics } from "@/lib/analytics";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Marketing({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default function App() {
  useEffect(() => {
    initAnalytics();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    let rafId;
    const loop = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <HelmetProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Toaster position="top-right" richColors closeButton />
        <Routes>
          <Route path="/" element={<Marketing><Home /></Marketing>} />
          <Route path="/about" element={<Marketing><About /></Marketing>} />
          <Route path="/services" element={<Marketing><Services /></Marketing>} />
          <Route path="/projects/ongoing" element={<Marketing><Projects key="ongoing" status="ongoing" /></Marketing>} />
          <Route path="/projects/completed" element={<Marketing><Projects key="completed" status="completed" /></Marketing>} />
          <Route path="/projects/:slug" element={<Marketing><ProjectDetail /></Marketing>} />
          <Route path="/process" element={<Marketing><Process /></Marketing>} />
          <Route path="/download" element={<Marketing><Download /></Marketing>} />
          <Route path="/contact" element={<Marketing><Contact /></Marketing>} />
          <Route path="/privacy" element={<Marketing><Legal key="privacy" type="privacy" /></Marketing>} />
          <Route path="/terms" element={<Marketing><Legal key="terms" type="terms" /></Marketing>} />
          <Route path="/cookies" element={<Marketing><Legal key="cookies" type="cookies" /></Marketing>} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="*" element={<Marketing><NotFound /></Marketing>} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}

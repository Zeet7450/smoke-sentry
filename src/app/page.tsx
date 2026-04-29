'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Hero3D } from '@/components/3d';
import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const StorySection = dynamic(
  () => import('@/components/sections/StorySection'),
  { ssr: false }
);

const ComingSoonSection = dynamic(
  () => import('@/components/sections/ComingSoonSection'),
  { ssr: false }
);

const SensorShowcase = dynamic(
  () => import('@/components/SensorShowcase'),
  { ssr: false }
);

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const problemRef = useRef<HTMLDivElement>(null);
  const showcaseRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sectionIds = ['features', 'how-it-works', 'about'];
    const NAVBAR_HEIGHT = 90;

    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
      
      // Reset jika di paling atas
      if (window.scrollY < 100) {
        setActiveSection('');
        window.history.replaceState(null, '', '/');
        return;
      }

      // Cari section yang paling dekat dengan top navbar
      let current = '';
      let minDistance = Infinity;

      sectionIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const distanceFromNavbar = Math.abs(rect.top - NAVBAR_HEIGHT);

        // Section dianggap aktif kalau top-nya sudah lewat navbar dan belum habis
        if (rect.top <= NAVBAR_HEIGHT + 10 && rect.bottom > NAVBAR_HEIGHT) {
          if (distanceFromNavbar < minDistance) {
            minDistance = distanceFromNavbar;
            current = id;
          }
        }
      });

      if (current && current !== activeSection) {
        setActiveSection(current);
        window.history.replaceState(null, '', `#${current}`);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // jalankan sekali saat mount

    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    
    const navbarHeight = 80;
    const top = el.getBoundingClientRect().top + window.scrollY - navbarHeight;
    
    window.scrollTo({ top, behavior: 'smooth' });
  };

  useEffect(() => {
    // Problem Section animations
    if (problemRef.current) {
      gsap.fromTo(
        problemRef.current.children,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          scrollTrigger: {
            trigger: problemRef.current,
            start: 'top 80%',
          },
        }
      );
    }

    // Product Showcase animations
    if (showcaseRef.current) {
      const model = showcaseRef.current.querySelector('.showcase-model');
      const specs = showcaseRef.current.querySelector('.showcase-specs');
      
      if (model) {
        gsap.fromTo(
          model,
          { x: -80, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            scrollTrigger: {
              trigger: showcaseRef.current,
              start: 'top 75%',
            },
          }
        );
      }
      
      if (specs) {
        gsap.fromTo(
          specs.children,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.1,
            scrollTrigger: {
              trigger: showcaseRef.current,
              start: 'top 70%',
            },
          }
        );
      }
    }

    // How It Works animations
    if (howItWorksRef.current) {
      gsap.fromTo(
        howItWorksRef.current.children,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.2,
          scrollTrigger: {
            trigger: howItWorksRef.current,
            start: 'top 75%',
          },
        }
      );
    }

    // Features animations
    if (featuresRef.current) {
      gsap.fromTo(
        featuresRef.current.children,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 80%',
          },
        }
      );
    }

    // Footer animation
    if (footerRef.current) {
      gsap.fromTo(
        footerRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 90%',
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-[rgba(10,10,15,0.85)] backdrop-blur-md border-b border-border' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-2xl">
            <span className="font-light text-text">Smoke</span>
            <span className="text-primary">Sentry</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              onClick={(e) => handleNavClick(e, 'features')}
              className={`text-sm transition-colors duration-200 pb-0.5 border-b-2 ${
                activeSection === 'features'
                  ? 'text-[#E8FF47] border-[#E8FF47]'
                  : 'text-[#6B6B7A] border-transparent hover:text-[#F0F0F0]'
              }`}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => handleNavClick(e, 'how-it-works')}
              className={`text-sm transition-colors duration-200 pb-0.5 border-b-2 ${
                activeSection === 'how-it-works'
                  ? 'text-[#E8FF47] border-[#E8FF47]'
                  : 'text-[#6B6B7A] border-transparent hover:text-[#F0F0F0]'
              }`}
            >
              How It Works
            </a>
            <a
              href="#about"
              onClick={(e) => handleNavClick(e, 'about')}
              className={`text-sm transition-colors duration-200 pb-0.5 border-b-2 ${
                activeSection === 'about'
                  ? 'text-[#E8FF47] border-[#E8FF47]'
                  : 'text-[#6B6B7A] border-transparent hover:text-[#F0F0F0]'
              }`}
            >
              About
            </a>
          </div>
          <Link href="/login">
            <Button variant="outline" size="sm">
              Login
            </Button>
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center pt-20 px-6">
        <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
          <div>
            <motion.h1
              className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="font-light text-text">Because Five Minutes</span>
              <br />
              <span className="text-primary">Can Save Everything.</span>
            </motion.h1>
            <motion.p
              className="text-text-muted text-lg mb-8 max-w-md"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              Detektor asap & api pintar yang langsung ngabarin kamu.
            </motion.p>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <Link href="#features">
                <Button variant="outline" size="lg">
                  Pelajari Lebih Lanjut
                </Button>
              </Link>
            </motion.div>
          </div>
          <motion.div
            className="relative h-96 md:h-[500px]"
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <Hero3D />
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 px-6 bg-[#0F0F17]">
        <div ref={problemRef} className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <Card glow="none" className="text-center">
              <p className="text-5xl font-bold text-primary mb-2">2 menit</p>
              <p className="text-text-muted">Rata-rata waktu deteksi kebakaran tradisional</p>
            </Card>
            <Card glow="none" className="text-center">
              <p className="text-5xl font-bold text-secondary mb-2">60%</p>
              <p className="text-text-muted">Kebakaran rumah terjadi saat penghuni tidur</p>
            </Card>
            <Card glow="none" className="text-center">
              <p className="text-5xl font-bold text-primary mb-2">3 sensor</p>
              <p className="text-text-muted">Yang SmokeSentry pakai untuk deteksi akurat</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Product Showcase Section */}
      <section ref={showcaseRef} id="product" className="py-24 px-6 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-white mb-4">
          Satu perangkat. Tiga sensor. <br/>
          <span className="text-[#E8FF47]">Nol kompromi.</span>
        </h2>
        <p className="text-center text-[#6B6B7A] mb-16">
          Dirancang untuk deteksi dini yang cepat dan akurat
        </p>

        <SensorShowcase />
      </section>

      {/* Features Section */}
      <section ref={featuresRef} id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-4xl font-bold text-center mb-16">
            Fitur Unggulan
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card glow="primary" className="hover:shadow-[0_0_30px_rgba(232,255,71,0.3)] transition-all">
              <div className="text-primary mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Notifikasi Telegram Real-time</h3>
              <p className="text-text-muted text-sm">Alert langsung ke HP kamu saat terdeteksi bahaya</p>
            </Card>
            <Card glow="primary" className="hover:shadow-[0_0_30px_rgba(232,255,71,0.3)] transition-all">
              <div className="text-primary mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Pantau dari Mana Saja</h3>
              <p className="text-text-muted text-sm">Akses dashboard dari browser manapun</p>
            </Card>
            <Card glow="primary" className="hover:shadow-[0_0_30px_rgba(232,255,71,0.3)] transition-all">
              <div className="text-primary mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">3 Sensor Sekaligus</h3>
              <p className="text-text-muted text-sm">MQ-2, MQ-135, dan Flame sensor untuk deteksi akurat</p>
            </Card>
            <Card glow="primary" className="hover:shadow-[0_0_30px_rgba(232,255,71,0.3)] transition-all">
              <div className="text-primary mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Riwayat Kejadian Tersimpan</h3>
              <p className="text-text-muted text-sm">Lihat history alert di dashboard</p>
            </Card>
            <Card glow="primary" className="hover:shadow-[0_0_30px_rgba(232,255,71,0.3)] transition-all">
              <div className="text-primary mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Bisa Dibagikan ke Keluarga</h3>
              <p className="text-text-muted text-sm">Multi-user support untuk satu device</p>
            </Card>
            <Card glow="primary" className="hover:shadow-[0_0_30px_rgba(232,255,71,0.3)] transition-all">
              <div className="text-primary mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Setup Mudah lewat Bot</h3>
              <p className="text-text-muted text-sm">Konfigurasi device hanya dengan Telegram</p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={howItWorksRef} id="how-it-works" className="py-24 px-6 bg-[#0F0F17]">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-4xl font-bold text-center mb-16">
            Cara Kerja
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card glow="none" className="text-center">
              <div className="text-6xl font-bold text-primary mb-4">01</div>
              <h3 className="font-bold text-xl mb-2">Pasang & Nyalakan</h3>
              <p className="text-text-muted">
                Colok SmokeSentry, konek ke WiFi lewat Telegram Bot
              </p>
            </Card>
            <Card glow="none" className="text-center">
              <div className="text-6xl font-bold text-secondary mb-4">02</div>
              <h3 className="font-bold text-xl mb-2">Aktifkan Bot</h3>
              <p className="text-text-muted">
                Chat @SmokeSentryBot, kirim /aktivasi [PRODUCT_ID]
              </p>
            </Card>
            <Card glow="none" className="text-center">
              <div className="text-6xl font-bold text-primary mb-4">03</div>
              <h3 className="font-bold text-xl mb-2">Tenang & Terpantau</h3>
              <p className="text-text-muted">
                Dapat notif Telegram real-time kalau ada asap atau api
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Story Section - Scrolltelling */}
      <StorySection />

      {/* Coming Soon Section */}
      <ComingSoonSection />

      {/* Footer */}
      <footer ref={footerRef} className="py-12 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display font-bold text-xl mb-2">
                <span className="font-light text-text">Smoke</span>
                <span className="text-primary">Sentry</span>
              </h3>
              <p className="text-text-muted text-sm">Because Five Minutes Can Save Everything.</p>
            </div>
            <div className="flex gap-6 text-sm text-text-muted">
              <Link href="#features" className="hover:text-primary">Features</Link>
              <Link href="#how-it-works" className="hover:text-primary">How It Works</Link>
              <Link href="/login" className="hover:text-primary">Login</Link>
            </div>
            <p className="text-text-muted text-sm">
              Made with ❤️ in Indonesia
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

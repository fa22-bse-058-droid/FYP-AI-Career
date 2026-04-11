import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? 'rgba(8,11,20,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-syne font-bold text-xl tracking-tight">
          <Zap size={20} className="text-[#5B5BD6]" />
          <span className="text-white">CareerAI</span>
        </Link>

        {/* Center nav */}
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'How It Works', 'About'].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-sm text-white/50 hover:text-white transition-colors duration-200 tracking-wide"
            >
              {label}
            </a>
          ))}
        </div>

        {/* Right CTAs */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden sm:inline-block text-sm text-white/50 hover:text-white transition-colors duration-200 px-3 py-2"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center gap-1.5 text-sm font-medium bg-[#5B5BD6] hover:bg-[#4a4abf] text-white px-5 py-2.5 rounded-full transition-all duration-200 hover:shadow-[0_0_20px_rgba(91,91,214,0.4)]"
          >
            Get Started <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

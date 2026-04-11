import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const avatarSeeds = ['AK', 'SR', 'MH', 'FA'];

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
      style={{ background: '#080B14' }}
    >
      {/* Aurora / horizon glow — pure CSS radial gradients */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 right-0"
        style={{ height: '55%' }}
      >
        {/* Primary deep-blue blob */}
        <div
          style={{
            position: 'absolute',
            bottom: '-10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '120vw',
            height: '420px',
            borderRadius: '50%',
            background:
              'radial-gradient(ellipse at 50% 100%, rgba(59,76,214,0.28) 0%, rgba(91,91,214,0.10) 35%, transparent 70%)',
            filter: 'blur(32px)',
          }}
        />
        {/* Secondary violet accent */}
        <div
          style={{
            position: 'absolute',
            bottom: '-15%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90vw',
            height: '360px',
            borderRadius: '50%',
            background:
              'radial-gradient(ellipse at 50% 100%, rgba(124,58,237,0.18) 0%, transparent 65%)',
            filter: 'blur(48px)',
          }}
        />
        {/* Subtle horizon line shimmer */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background:
              'linear-gradient(90deg, transparent 0%, rgba(91,91,214,0.3) 30%, rgba(124,58,237,0.4) 50%, rgba(91,91,214,0.3) 70%, transparent 100%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-28 pb-20">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="max-w-3xl"
        >
          {/* Label */}
          <motion.div variants={fadeUp} className="mb-8">
            <span
              className="inline-block font-mono text-xs tracking-[0.2em] uppercase text-white/40 border border-white/10 px-4 py-2 rounded-full"
            >
              AI-POWERED · CAREER PLATFORM
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="font-syne font-bold leading-[1.05] mb-6 text-white"
            style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)' }}
          >
            Build the career<br />
            <em className="font-serif not-italic" style={{ fontStyle: 'italic', fontFamily: "'DM Serif Display', serif" }}>
              you actually
            </em>{' '}
            want.
          </motion.h1>

          {/* Sub-text */}
          <motion.p
            variants={fadeUp}
            className="text-white/40 text-lg leading-relaxed mb-10 max-w-lg"
          >
            AI-driven CV analysis, skill gap detection, and smart job matching — built for Pakistani graduates.
          </motion.p>

          {/* Buttons */}
          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4 mb-12">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-[#5B5BD6] hover:bg-[#4a4abf] text-white text-sm font-medium px-6 py-3.5 rounded-full transition-all duration-200 hover:shadow-[0_0_24px_rgba(91,91,214,0.45)]"
            >
              Get Started Free <span aria-hidden>→</span>
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white border-b border-white/20 hover:border-white/60 pb-0.5 transition-all duration-200"
            >
              See How It Works
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.div variants={fadeUp} className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {avatarSeeds.map((initials) => (
                <div
                  key={initials}
                  className="w-8 h-8 rounded-full border-2 border-[#080B14] flex items-center justify-center text-[10px] font-semibold bg-[#1a1d2e] text-white/70"
                >
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-white/30 text-sm">
              Trusted by <span className="text-white/60 font-medium">500+ students</span> across Pakistan
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

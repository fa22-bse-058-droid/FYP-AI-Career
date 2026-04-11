import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function CTASection() {
  return (
    <section
      id="about"
      className="py-32 border-t border-white/[0.06]"
      style={{ background: '#080B14' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-3xl overflow-hidden border border-white/[0.08] px-8 py-20 text-center"
          style={{
            background:
              'radial-gradient(ellipse at 50% 120%, rgba(91,91,214,0.18) 0%, rgba(8,11,20,1) 60%)',
          }}
        >
          {/* Subtle inner glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-40"
            style={{
              background:
                'radial-gradient(ellipse at 50% 100%, rgba(91,91,214,0.2) 0%, transparent 70%)',
              filter: 'blur(24px)',
            }}
          />

          <p className="font-mono text-xs tracking-[0.2em] uppercase text-white/30 mb-5">
            GET STARTED TODAY
          </p>

          <h2
            className="font-syne font-bold text-white mx-auto mb-8"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', lineHeight: 1.05, maxWidth: '16ch' }}
          >
            Your dream role is one upload away.
          </h2>

          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-[#5B5BD6] hover:bg-[#4a4abf] text-white font-medium px-8 py-4 rounded-full text-sm transition-all duration-200 hover:shadow-[0_0_32px_rgba(91,91,214,0.5)]"
          >
            Start for Free <span aria-hidden>→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

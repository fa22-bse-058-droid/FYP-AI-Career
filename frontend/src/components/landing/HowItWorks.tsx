import { motion } from 'framer-motion';

interface Step {
  number: string;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: '01',
    title: 'Upload Your CV',
    description:
      'Drop your PDF or Word resume. Our parser extracts skills, experience, and education in seconds.',
  },
  {
    number: '02',
    title: 'Get AI Insights',
    description:
      'Receive a detailed score, skill gap report, and personalised recommendations tailored to your target role.',
  },
  {
    number: '03',
    title: 'Apply Smarter',
    description:
      'Browse matched jobs, auto-apply with smart filters, and track every application from one dashboard.',
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-32 border-t border-white/[0.06]"
      style={{ background: '#080B14' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="font-mono text-xs tracking-[0.2em] uppercase text-white/30 mb-4"
        >
          HOW IT WORKS
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="font-syne font-bold text-white mb-20 max-w-sm"
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.1 }}
        >
          Three steps to your next role.
        </motion.h2>

        {/* Steps */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-0">
          {/* Horizontal connector line (desktop only) */}
          <div className="hidden md:block absolute top-[2.4rem] left-0 right-0 h-px bg-white/[0.06]" aria-hidden />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="relative pt-0 pb-12 md:pb-0 md:pr-12"
            >
              {/* Number — large muted background label */}
              <div
                className="font-syne font-bold leading-none text-white/[0.05] select-none mb-4"
                style={{ fontSize: 'clamp(4rem, 8vw, 7rem)' }}
                aria-hidden
              >
                {step.number}
              </div>

              {/* Dot on connector line */}
              <div className="hidden md:block absolute top-[2.1rem] left-0 w-3 h-3 rounded-full bg-[#5B5BD6] border-2 border-[#080B14] shadow-[0_0_8px_rgba(91,91,214,0.6)]" aria-hidden />

              <h3 className="font-syne font-bold text-white text-lg mb-3">{step.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed max-w-xs">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

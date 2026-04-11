import { motion } from 'framer-motion';
import { FileText, BrainCircuit, Briefcase } from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  large?: boolean;
}

const features: Feature[] = [
  {
    icon: <FileText size={22} />,
    title: 'CV Analysis & Scoring',
    description:
      'Upload your resume and receive an instant AI-generated score with section-level feedback on formatting, language, and impact — so you know exactly what to fix.',
    large: true,
  },
  {
    icon: <BrainCircuit size={22} />,
    title: 'Skill Gap Detection',
    description:
      'Identify missing high-demand skills for your target role and get a prioritised learning roadmap.',
  },
  {
    icon: <Briefcase size={22} />,
    title: 'Smart Job Matching',
    description:
      'Semantic similarity matching between your CV and live job postings surfaces the roles most likely to call you back.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export default function Features() {
  return (
    <section
      id="features"
      className="py-32"
      style={{ background: '#080B14' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section label */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="font-mono text-xs tracking-[0.2em] uppercase text-white/30 mb-4"
        >
          WHAT WE DO
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="font-syne font-bold text-white mb-16 max-w-md"
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.1 }}
        >
          Tools that move your career forward.
        </motion.h2>

        {/* Asymmetric grid: large first card, two smaller cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Large card */}
          <motion.div
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="md:row-span-2 flex flex-col justify-between rounded-2xl p-8 border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-300"
          >
            <div>
              <div className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-[#5B5BD6] mb-6">
                {features[0].icon}
              </div>
              <h3 className="font-syne font-bold text-white text-xl mb-3">{features[0].title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{features[0].description}</p>
            </div>
            {/* Decorative accent bar */}
            <div className="mt-8 h-px w-24 bg-[#5B5BD6] opacity-40 rounded-full" />
          </motion.div>

          {/* Two smaller cards */}
          {features.slice(1).map((f, i) => (
            <motion.div
              key={f.title}
              custom={i + 1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="flex flex-col rounded-2xl p-7 border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-300"
            >
              <div className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-[#5B5BD6] mb-5">
                {f.icon}
              </div>
              <h3 className="font-syne font-bold text-white text-lg mb-2">{f.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

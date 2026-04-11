import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ParticleBackground from '../components/ParticleBackground';
import Navbar from '../components/Navbar';
import { FileText, Target, BarChart2, Lightbulb, Search, Rocket } from 'lucide-react';

const features = [
  { icon: <FileText size={28} color="#00D4FF" />, title: 'CV Analysis', desc: 'AI-powered CV scoring with detailed feedback and section-level insights.' },
  { icon: <Target size={28} color="#7C3AED" />, title: 'Skill Extraction', desc: 'Automatically extract technical and soft skills from your resume.' },
  { icon: <BarChart2 size={28} color="#EC4899" />, title: 'Gap Analysis', desc: 'Identify missing high-demand skills for your target role in the market.' },
  { icon: <Lightbulb size={28} color="#00D4FF" />, title: 'Smart Suggestions', desc: 'Get personalized, prioritized improvement recommendations.' },
  { icon: <Search size={28} color="#7C3AED" />, title: 'Job Matching', desc: 'Semantic similarity matching between your CV and live job descriptions.' },
  { icon: <Rocket size={28} color="#EC4899" />, title: 'Auto Apply', desc: 'Automated job application submission with smart filters and logs.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

export default function LandingPage() {
  return (
    <div style={{ background: '#0A0F1E', minHeight: '100vh' }}>
      <Navbar variant="landing" />

      {/* Hero */}
      <section
        style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}
      >
        <ParticleBackground />

        {/* Background glow blobs */}
        <div
          style={{
            position: 'absolute', top: '20%', left: '10%', width: 400, height: 400,
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute', top: '30%', right: '10%', width: 350, height: 350,
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="max-w-7xl mx-auto px-6 w-full" style={{ position: 'relative', zIndex: 1, paddingTop: 100 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Copy */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)' }}
              >
                <span style={{ fontSize: 12, color: '#00D4FF', fontWeight: 600, letterSpacing: 1 }}>
                  ✨ AI-POWERED CAREER PLATFORM
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: 24 }}
              >
                Supercharge Your<br />
                <span className="gradient-text">Career with AI</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 480, marginBottom: 40 }}
              >
                Upload your CV, get instant AI-powered analysis, skill gap detection, and automated job applications.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-wrap gap-4"
              >
                <Link to="/signup">
                  <button className="btn-glow" style={{ fontSize: '1rem' }}>
                    Get Started Free →
                  </button>
                </Link>
                <a href="#features">
                  <button
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 12,
                      color: 'white',
                      cursor: 'pointer',
                      fontWeight: 600,
                      padding: '12px 28px',
                      transition: 'all 0.3s',
                      fontSize: '1rem',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.borderColor = 'rgba(0,212,255,0.5)')}
                    onMouseOut={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
                  >
                    See Features
                  </button>
                </a>
              </motion.div>
            </div>

            {/* Right: Floating stat cards */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              style={{ position: 'relative', height: 400 }}
              className="hidden lg:block"
            >
              {[
                { label: 'CV Score', value: '94/100', color: '#00D4FF', top: '0%', left: '20%' },
                { label: 'Skills Found', value: '23', color: '#7C3AED', top: '30%', left: '0%' },
                { label: 'Gap Filled', value: '78%', color: '#EC4899', top: '55%', left: '30%' },
                { label: 'Jobs Matched', value: '12', color: '#00D4FF', top: '10%', left: '55%' },
              ].map((card, i) => (
                <motion.div
                  key={card.label}
                  className="glass"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3 + i * 0.5, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute',
                    top: card.top,
                    left: card.left,
                    padding: '16px 24px',
                    minWidth: 150,
                  }}
                >
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
                    {card.label}
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: card.color }}>
                    {card.value}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '100px 0', background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 16 }}>
              Everything You Need to{' '}
              <span className="gradient-text">Land the Job</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', maxWidth: 540, margin: '0 auto' }}>
              Our AI-powered platform handles every step of your job search journey.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="glass p-6"
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                style={{ cursor: 'default' }}
              >
                <div className="mb-4">{f.icon}</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="about" style={{ padding: '100px 0' }}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass"
            style={{
              padding: '80px 40px',
              background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(124,58,237,0.08))',
            }}
          >
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 16 }}>
              Ready to Land Your{' '}
              <span className="gradient-text">Dream Job?</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1.1rem', marginBottom: 40 }}>
              Join thousands of professionals who use AI Career to supercharge their job search.
            </p>
            <Link to="/signup">
              <button className="btn-glow" style={{ fontSize: '1.1rem', padding: '16px 40px' }}>
                Get Started Free — It's Free
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: '32px 0',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.3)',
          fontSize: 14,
        }}
      >
        © {new Date().getFullYear()} AI Career. All rights reserved.
      </footer>
    </div>
  );
}

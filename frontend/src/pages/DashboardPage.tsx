import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { FileText, Briefcase, User, ArrowRight } from 'lucide-react';

const cards = [
  {
    icon: <FileText size={36} color="#00D4FF" />,
    title: 'CV Analyzer',
    desc: 'Upload your CV for instant AI-powered analysis, scoring, skill extraction, and gap detection.',
    link: '/analyzer',
    color: '#00D4FF',
    bg: 'rgba(0,212,255,0.08)',
  },
  {
    icon: <Briefcase size={36} color="#7C3AED" />,
    title: 'Job Auto-Apply',
    desc: 'Set filters, scrape matched jobs, and trigger intelligent automated applications.',
    link: '/jobs',
    color: '#7C3AED',
    bg: 'rgba(124,58,237,0.08)',
  },
  {
    icon: <User size={36} color="#EC4899" />,
    title: 'Profile',
    desc: 'Manage your account settings, preferences, and application history.',
    link: '/dashboard',
    color: '#EC4899',
    bg: 'rgba(236,72,153,0.08)',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: '#0A0F1E' }}>
      <Navbar variant="dashboard" />

      <div className="max-w-7xl mx-auto px-6" style={{ paddingTop: 120, paddingBottom: 60 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: 8 }}>
            Welcome back,{' '}
            <span className="gradient-text">{user?.username ?? 'there'}</span> 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>
            Your AI-powered career dashboard — everything in one place.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
            >
              <Link to={card.link}>
                <div
                  className="glass p-8"
                  style={{
                    background: card.bg,
                    border: `1px solid ${card.color}30`,
                    cursor: 'pointer',
                    height: '100%',
                  }}
                >
                  <div className="mb-6">{card.icon}</div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 12 }}>
                    {card.title}
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 24 }}>
                    {card.desc}
                  </p>
                  <div
                    className="flex items-center gap-2"
                    style={{ color: card.color, fontWeight: 600, fontSize: '0.9rem' }}
                  >
                    Open <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
        >
          {[
            { label: 'CVs Analyzed', value: '—', color: '#00D4FF' },
            { label: 'Jobs Matched', value: '—', color: '#7C3AED' },
            { label: 'Applications Sent', value: '—', color: '#EC4899' },
            { label: 'Profile Score', value: '—', color: '#00D4FF' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass p-5 text-center"
            >
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

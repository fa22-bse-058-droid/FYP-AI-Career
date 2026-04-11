import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Zap, LogOut, User, LayoutDashboard, FileText, Briefcase } from 'lucide-react';

interface NavbarProps {
  variant?: 'landing' | 'dashboard';
}

export default function Navbar({ variant = 'landing' }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(10,15,30,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Zap size={24} color="#00D4FF" />
          <span className="gradient-text text-xl font-bold">AI Career</span>
        </Link>

        {variant === 'landing' ? (
          <div className="flex items-center gap-6">
            <a href="#features" className="text-white/70 hover:text-white transition-colors text-sm">
              Features
            </a>
            <a href="#about" className="text-white/70 hover:text-white transition-colors text-sm">
              About
            </a>
            {user ? (
              <Link
                to="/dashboard"
                className="btn-glow text-sm"
                style={{ padding: '8px 20px' }}
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-white/70 hover:text-white transition-colors text-sm">
                  Sign In
                </Link>
                <Link to="/signup" className="btn-glow text-sm" style={{ padding: '8px 20px' }}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm"
            >
              <LayoutDashboard size={16} /> Dashboard
            </Link>
            <Link
              to="/analyzer"
              className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm"
            >
              <FileText size={16} /> Analyzer
            </Link>
            <Link
              to="/jobs"
              className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm"
            >
              <Briefcase size={16} /> Jobs
            </Link>
            <div className="flex items-center gap-2 ml-4">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)' }}
              >
                <User size={14} color="#7C3AED" />
                <span className="text-sm text-white/80">{user?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white/60 hover:text-white transition-colors text-sm"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

import LandingNavbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import HowItWorks from '../components/landing/HowItWorks';
import CTASection from '../components/landing/CTASection';

export default function LandingPage() {
  return (
    <div style={{ background: '#080B14', minHeight: '100vh' }}>
      <LandingNavbar />
      <Hero />
      <Features />
      <HowItWorks />
      <CTASection />

      {/* Footer */}
      <footer
        className="py-8 border-t border-white/[0.06] text-center text-white/20 text-sm"
        style={{ background: '#080B14' }}
      >
        © {new Date().getFullYear()} CareerAI. All rights reserved.
      </footer>
    </div>
  );
}


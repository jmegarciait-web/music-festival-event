import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Hero from './components/Hero';
import Lineup from './components/Lineup';
import TicketWidget from './components/TicketWidget';
import NeonIntro from './components/NeonIntro';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { BookingProvider } from './context/BookingContext';

export default function FestivalApp() {
  const [introVisible, setIntroVisible] = useState(true);
  const [hasToken, setHasToken] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setHasToken(!!localStorage.getItem('token'));
  }, []);

  return (
    <div className="neon-theme">
      <BookingProvider>
        <div className="relative w-full">
          <AnimatePresence>
            {introVisible && (
              <NeonIntro onComplete={() => setIntroVisible(false)} />
            )}
          </AnimatePresence>
          
          <div className="absolute top-6 right-6 z-50">
            <button 
              onClick={() => {
                if (hasToken) navigate('/portal');
                else setShowAuth(true);
              }}
              className="text-xs uppercase tracking-widest font-bold border border-white/20 bg-black/50 backdrop-blur-md text-white py-2 px-6 rounded-full hover:border-neon-cyan hover:shadow-[0_0_15px_rgba(0,249,255,0.3)] transition-all"
            >
              {hasToken ? 'My Passes' : 'Log In'}
            </button>
          </div>

          <Hero />

          <Lineup />
          
          {/* Ticket Booking Section */}
          <section className="relative py-32 px-6 min-h-screen flex items-center justify-center">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-neon-purple/10 blur-[150px] -z-10" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-neon-cyan/5 blur-[150px] -z-10" />
            
            <div className="container mx-auto w-full relative z-10">
              <TicketWidget />
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-white/10 py-10 text-center text-gray-500 font-sans text-sm relative z-10">
            <p className="uppercase tracking-widest font-bold">© 2024 Project 5 Festival. Embrace the Noise.</p>
          </footer>
        </div>
      </BookingProvider>
      <CustomerAuthModal 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)} 
        onSuccess={() => {
          setHasToken(true);
          setShowAuth(false);
          navigate('/portal');
        }} 
      />
    </div>
  );
}

import { useState } from 'react';
import { FESTIVAL_START_DATE, FESTIVAL_END_DATE, TICKETS, isValidDateSequence } from '../utils/bookingLogic';
import { useBookingViewModel } from '../viewmodels/useBookingViewModel';
import { isBefore, isEqual, isAfter, format } from 'date-fns';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AnimatedPrice } from './AnimatedPrice';
import { MagneticWrapper } from './MagneticWrapper';
import { CustomerAuthModal } from './CustomerAuthModal';

const TicketWidget = () => {
  const navigate = useNavigate();
  const { state, actions } = useBookingViewModel();
  const { startDate, endDate, tier, guests, serverPrice, isAvailable, isLoading, errorStatus } = state;
  const { handleDateSelect, setTier, setGuests, handleCheckout } = actions;
  
  const [showAuth, setShowAuth] = useState(false);

  // Generate an array of dates from start to end for selection
  const festivalDates = [
    FESTIVAL_START_DATE,
    new Date('2024-09-21T00:00:00'),
    FESTIVAL_END_DATE
  ];

  const isSelected = (date: Date) => {
    if (startDate && isEqual(date, startDate)) return true;
    if (endDate && isEqual(date, endDate)) return true;
    if (startDate && endDate && isAfter(date, startDate) && isBefore(date, endDate)) return true;
    return false;
  };

  const executeCheckout = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setShowAuth(true);
      return;
    }
    const success = await handleCheckout();
    if (success) {
      navigate('/portal');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-panel p-8 max-w-2xl mx-auto neon-glow-border relative z-10"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-neon-pink/5 block pointer-events-none rounded-2xl" />
      
      <h2 className="text-4xl font-display font-black mb-8 text-center tracking-tighter uppercase">
        Secure Your <span className="text-neon-cyan">Pass</span>
      </h2>

      {/* Date Selection */}
      <div className="mb-8">
        <h3 className="text-sm uppercase tracking-widest text-gray-400 mb-4 font-bold">1. Select Dates</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          {festivalDates.map((date, i) => {
            const selected = isSelected(date);
            return (
              <button
                key={i}
                onClick={() => handleDateSelect(date)}
                className={`flex-1 p-4 rounded-xl transition-all duration-300 border-2 font-display uppercase
                  ${selected 
                    ? 'border-neon-cyan bg-neon-cyan/10 text-white shadow-[0_0_15px_rgba(0,249,255,0.3)]' 
                    : 'border-white/10 hover:border-neon-cyan/50 text-gray-400 hover:text-white'}`}
              >
                <div className="text-2xl font-black">{format(date, 'MMM')}</div>
                <div className="text-4xl font-bold my-1">{format(date, 'dd')}</div>
                <div className="text-xs tracking-widest">{format(date, 'EEEE')}</div>
              </button>
            )
          })}
        </div>
        {!isValidDateSequence(startDate, endDate) && (
          <p className="text-neon-pink text-xs mt-2 font-bold tracking-wider uppercase">End date must be after start date.</p>
        )}
      </div>

      {/* Tier Selection */}
      <div className="mb-8">
        <h3 className="text-sm uppercase tracking-widest text-gray-400 mb-4 font-bold">2. Select Tier</h3>
        <div className="flex gap-4">
          {(Object.keys(TICKETS) as Array<keyof typeof TICKETS>).map(key => {
            const t = TICKETS[key as keyof typeof TICKETS];
            const active = tier === key;
            return (
              <button
                key={key}
                onClick={() => setTier(key as any)}
                className={`flex-1 p-4 rounded-xl border-2 transition-all duration-300 font-display
                  ${active
                    ? 'border-neon-pink bg-neon-pink/10 text-white shadow-[0_0_15px_rgba(249,0,255,0.3)]'
                    : 'border-white/10 hover:border-neon-pink/50 text-gray-400 hover:text-white'}`}
              >
                <div className="font-bold uppercase tracking-widest">{t.name}</div>
                <div className="text-2xl mt-2 font-black">${t.pricePerDay}<span className="text-sm font-sans font-normal text-gray-400">/day</span></div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Guests */}
      <div className="mb-10">
        <h3 className="text-sm uppercase tracking-widest text-gray-400 mb-4 font-bold">3. Guests</h3>
        <div className="flex items-center gap-6 glass-panel rounded-xl p-2 w-max mx-auto md:mx-0">
          <button 
            disabled={guests <= 1}
            onClick={() => setGuests(guests - 1)}
            className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-white/10 text-2xl font-display disabled:opacity-50 transition-colors"
          >-</button>
          <div className="font-display text-2xl font-bold w-8 text-center">{guests}</div>
          <button 
            disabled={guests >= 10}
            onClick={() => setGuests(guests + 1)}
            className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-white/10 text-2xl font-display transition-colors"
          >+</button>
        </div>
      </div>

      {/* Error & Warning States */}
      {errorStatus && (
        <div className="mb-6 p-4 rounded-xl bg-neon-pink/10 border border-neon-pink text-neon-pink font-bold text-center tracking-widest uppercase">
          {errorStatus}
        </div>
      )}
      {!isAvailable && (
        <div className="mb-6 p-4 rounded-xl bg-neon-pink/10 border border-neon-pink text-neon-pink font-bold text-center tracking-widest uppercase">
          Tickets Sold Out for Selected Period / Tier.
        </div>
      )}

      {/* Total & Checkout */}
      <div className="mt-8 border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="text-gray-400 text-sm uppercase tracking-widest font-bold mb-1">Total Estimated</div>
          <div className="text-5xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-pink">
            $<AnimatedPrice value={serverPrice} /> {isLoading && <span className="text-sm opacity-50 animate-pulse">...</span>}
          </div>
          <div className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">
            {guests} passes ({tier})
          </div>
        </div>
        
        <MagneticWrapper>
          <button 
            disabled={!startDate || !endDate || !isAvailable || !!errorStatus || isLoading}
            onClick={executeCheckout}
            className="neon-button disabled:opacity-50 w-full sm:w-auto"
          >
            {(!startDate || !endDate) ? 'Select Dates' : (isLoading ? 'Processing' : 'Checkout')}
          </button>
        </MagneticWrapper>
      </div>
      
      <CustomerAuthModal 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)} 
        onSuccess={() => {
          setShowAuth(false);
          executeCheckout();
        }} 
      />
    </motion.div>
  );
};

export default TicketWidget;

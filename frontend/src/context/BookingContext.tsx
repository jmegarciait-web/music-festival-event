import { createContext, useContext, useState } from 'react';
import { calculatePrice, calculateTotalDays } from '../utils/bookingLogic';
import type { TicketTier } from '../utils/bookingLogic';

interface BookingState {
  startDate: Date | null;
  endDate: Date | null;
  tier: TicketTier;
  guests: number;
  totalDays: number;
  totalPrice: number;
  isSoldOut: boolean;
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
  setTier: (tier: TicketTier) => void;
  setGuests: (guests: number) => void;
}

const BookingContext = createContext<BookingState | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [tier, setTier] = useState<TicketTier>('GA');
  const [guests, setGuests] = useState<number>(1);

  const totalDays = calculateTotalDays(startDate, endDate);
  const totalPrice = calculatePrice(tier, totalDays, guests);
  
  // Mock availability tracking
  // In a real app this would query the backend when dates/tier change
  const isSoldOut = false; 

  return (
    <BookingContext.Provider
      value={{
        startDate,
        endDate,
        tier,
        guests,
        totalDays,
        totalPrice,
        isSoldOut,
        setStartDate,
        setEndDate,
        setTier,
        setGuests,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

import { useEffect, useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { ApiModel } from '../models/api';
import { isBefore, format } from 'date-fns';

export const useBookingViewModel = () => {
  const { startDate, endDate, tier, guests, setStartDate, setEndDate, setTier, setGuests } = useBooking();
  
  // ViewModel specific states (derived or loading states)
  const [serverPrice, setServerPrice] = useState<number>(0);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Re-calculate math and availability on backend whenever dependencies change
  useEffect(() => {
    if (!startDate || !endDate) {
      setServerPrice(0);
      return;
    }

    const payload = {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      tier,
      guests
    };

    let isMounted = true;
    (async () => {
      try {
        setErrorStatus(null);
        setIsLoading(true);
        // Run validations simultaneously
        const [price, availability] = await Promise.all([
          ApiModel.calculatePrice(payload),
          ApiModel.checkAvailability(payload)
        ]);

        if (isMounted) {
          setServerPrice(price);
          setIsAvailable(availability);
        }
      } catch (err: any) {
        if (isMounted) setErrorStatus(err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => { isMounted = false; };
  }, [startDate, endDate, tier, guests]);

  // Actions
  const handleDateSelect = (date: Date) => {
    if (!startDate || (startDate && endDate) || isBefore(date, startDate)) {
      setStartDate(date);
      setEndDate(null);
    } else {
      setEndDate(date);
    }
  };

  const handleCheckout = async (): Promise<boolean> => {
    if (!startDate || !endDate || !isAvailable) return false;
    
    try {
      setIsLoading(true);
      const res = await ApiModel.reserve({
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        tier,
        guests
      });
      // Removing old alert logic since we migrate entirely to digital portal
      return true;
    } catch (err: any) {
      alert(`Checkout failed: ${err.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    state: {
      startDate,
      endDate,
      tier,
      guests,
      serverPrice,
      isAvailable,
      isLoading,
      errorStatus
    },
    actions: {
      handleDateSelect,
      setTier,
      setGuests,
      handleCheckout
    }
  };
};

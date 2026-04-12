import { isAfter, isBefore, isEqual, differenceInDays } from 'date-fns';

// 3-day neon music festival
export const FESTIVAL_START_DATE = new Date('2024-09-20T00:00:00');
export const FESTIVAL_END_DATE = new Date('2024-09-22T23:59:59');

export const TICKETS = {
  GA: {
    id: 'GA',
    name: 'General Admission',
    pricePerDay: 150,
  },
  VIP: {
    id: 'VIP',
    name: 'VIP Experience',
    pricePerDay: 350,
  }
};

export type TicketTier = keyof typeof TICKETS;

export const isValidFestivalDate = (date: Date) => {
  return (isEqual(date, FESTIVAL_START_DATE) || isAfter(date, FESTIVAL_START_DATE)) &&
         (isEqual(date, FESTIVAL_END_DATE) || isBefore(date, FESTIVAL_END_DATE));
};

export const isValidDateSequence = (start: Date | null, end: Date | null) => {
  if (!start || !end) return true;
  return isBefore(start, end) || isEqual(start, end);
};

export const calculateTotalDays = (start: Date | null, end: Date | null) => {
  if (!start || !end) return 0;
  if (isAfter(start, end)) return 0;
  // +1 because if start and end are the same day, it's 1 day of festival
  return differenceInDays(end, start) + 1;
};

export const calculatePrice = (
  tier: TicketTier,
  days: number,
  guests: number
) => {
  const basePrice = TICKETS[tier].pricePerDay;
  return basePrice * days * guests;
};

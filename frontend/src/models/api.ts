const BASE_URL = 'http://localhost:3001/api';

export interface BookingPayload {
  startDate: string;
  endDate: string;
  tier: string;
  guests: number;
}

export class ApiModel {
  static async calculatePrice(payload: BookingPayload): Promise<number> {
    const res = await fetch(`${BASE_URL}/calculate-price`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data.totalPrice;
  }

  static async checkAvailability(payload: BookingPayload): Promise<boolean> {
    const res = await fetch(`${BASE_URL}/availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data.isAvailable;
  }

  static async reserve(payload: BookingPayload): Promise<{ reservationId: number, totalPrice: number }> {
    const res = await fetch(`${BASE_URL}/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return { reservationId: data.reservationId, totalPrice: data.totalPrice };
  }
}

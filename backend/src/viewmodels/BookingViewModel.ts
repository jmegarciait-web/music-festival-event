

const TICKETS: Record<string, number> = {
  GA: 150,
  VIP: 350,
};

export class BookingViewModel {
  static getPrice(tier: string, days: number, guests: number): number {
    const basePrice = TICKETS[tier];
    if (!basePrice) throw new Error("Invalid tier");
    return basePrice * days * guests;
  }

  static getDatesArray(startStr: string, endStr: string): string[] {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const dates = [];
    
    // Festival bounds
    const minD = new Date('2024-09-20T00:00:00Z');
    const maxD = new Date('2024-09-22T23:59:59Z');

    if (start < minD || end > maxD) throw new Error("Dates outside festival bounds");
    if (start > end) throw new Error("Start date must be before end date");

    const current = new Date(start);
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }

  static createResponsePayload(success: boolean, message: string, data?: any) {
    return { success, message, ...data };
  }
}

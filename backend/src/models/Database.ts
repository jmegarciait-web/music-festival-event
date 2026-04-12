import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

export interface AvailabilityRecord {
  date: string;
  tier: string;
  remaining: number;
}

class DatabaseModel {
  private db: Database | null = null;

  async init() {
    this.db = await open({
      filename: './festival.sqlite',
      driver: sqlite3.Database
    });

    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS availability (
        date TEXT,
        tier TEXT,
        remaining INTEGER,
        PRIMARY KEY (date, tier)
      );

      CREATE TABLE IF NOT EXISTS reservations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        startDate TEXT,
        endDate TEXT,
        tier TEXT,
        guests INTEGER,
        totalPrice INTEGER
      );
    `);

    // Seed mock data
    const tiers = ['GA', 'VIP'];
    const dates = ['2024-09-20', '2024-09-21', '2024-09-22'];
    
    for (const date of dates) {
      for (const tier of tiers) {
        await this.db.run(
          `INSERT OR IGNORE INTO availability (date, tier, remaining) VALUES (?, ?, ?)`,
          [date, tier, tier === 'VIP' ? 50 : 500] // VIP 50, GA 500
        );
      }
    }
  }

  async checkAvailability(dates: string[], tier: string, requestedGuests: number): Promise<boolean> {
    if (!this.db) throw new Error("DB not init");
    
    for (const dt of dates) {
      const row = await this.db.get<AvailabilityRecord>(
        'SELECT remaining FROM availability WHERE date = ? AND tier = ?', 
        [dt, tier]
      );
      if (!row || row.remaining < requestedGuests) {
        return false;
      }
    }
    return true;
  }

  async createReservation(startDate: string, endDate: string, tier: string, guests: number, totalPrice: number): Promise<number> {
    if (!this.db) throw new Error("DB not init");
    
    const result = await this.db.run(
      `INSERT INTO reservations (startDate, endDate, tier, guests, totalPrice) VALUES (?, ?, ?, ?, ?)`,
      [startDate, endDate, tier, guests, totalPrice]
    );

    // Decrement availability
    // For simplicity, we just decrement the first date, but normally we'd decrement all dates in range.
    await this.db.run(
      `UPDATE availability SET remaining = remaining - ? WHERE date >= ? AND date <= ? AND tier = ?`,
      [guests, startDate, endDate, tier]
    );

    return result.lastID!;
  }
  async getAvailability(): Promise<AvailabilityRecord[]> {
    if (!this.db) throw new Error("DB not init");
    return this.db.all('SELECT * FROM availability ORDER BY date ASC, tier DESC');
  }

  async getReservations(): Promise<any[]> {
    if (!this.db) throw new Error("DB not init");
    return this.db.all('SELECT * FROM reservations ORDER BY id DESC');
  }
}

export const dbModel = new DatabaseModel();

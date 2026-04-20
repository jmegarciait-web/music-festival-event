import sqlite3 from 'sqlite3';
import { open, Database as SQLiteDatabase } from 'sqlite';
import * as bcrypt from 'bcrypt';

export interface AvailabilityRecord {
  date: string;
  tier: string;
  remaining: number;
}

class DatabaseModel {
  private db: SQLiteDatabase | null = null;

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
        totalPrice INTEGER,
        userId INTEGER
      );

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT
      );
    `);

    // Handle migration for existing schema
    try {
      await this.db.exec(`ALTER TABLE reservations ADD COLUMN userId INTEGER`);
    } catch (e) {
      // Ignore if column already exists
    }

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
    // Seed default Super Admin
    const userCount = await this.db.get<{count: number}>('SELECT COUNT(*) as count FROM users');
    if (userCount && userCount.count === 0) {
      const hash = await bcrypt.hash('superadmin123', 10);
      await this.db.run(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        ['superadmin', hash, 'super_admin']
      );
      console.log('Seeded default superadmin account.');
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

  async createReservation(startDate: string, endDate: string, tier: string, guests: number, totalPrice: number, userId: number | null): Promise<number> {
    if (!this.db) throw new Error("DB not init");
    
    // Only process checkout if auth is validated properly at endpoints
    const result = await this.db.run(
      `INSERT INTO reservations (startDate, endDate, tier, guests, totalPrice, userId) VALUES (?, ?, ?, ?, ?, ?)`,
      [startDate, endDate, tier, guests, totalPrice, userId]
    );

    // Decrement availability
    await this.db.run(
      `UPDATE availability SET remaining = remaining - ? WHERE date >= ? AND date <= ? AND tier = ?`,
      [guests, startDate, endDate, tier]
    );

    return result.lastID!;
  }
  
  async getUserReservations(userId: number): Promise<any[]> {
    if (!this.db) throw new Error("DB not init");
    return this.db.all('SELECT * FROM reservations WHERE userId = ? ORDER BY id DESC', [userId]);
  }

  async getAvailability(): Promise<AvailabilityRecord[]> {
    if (!this.db) throw new Error("DB not init");
    return this.db.all('SELECT * FROM availability ORDER BY date ASC, tier DESC');
  }

  async getReservations(): Promise<any[]> {
    if (!this.db) throw new Error("DB not init");
    return this.db.all('SELECT * FROM reservations ORDER BY id DESC');
  }

  // --- Users Modules ---

  async getUserByUsername(username: string): Promise<any> {
    if (!this.db) throw new Error("DB not init");
    return this.db.get('SELECT * FROM users WHERE username = ?', [username]);
  }

  async getAllUsers(): Promise<any[]> {
    if (!this.db) throw new Error("DB not init");
    return this.db.all('SELECT id, username, role FROM users ORDER BY id ASC');
  }

  async createUser(username: string, passwordHash: string, role: string): Promise<void> {
    if (!this.db) throw new Error("DB not init");
    await this.db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, passwordHash, role]);
  }
}

export const dbModel = new DatabaseModel();

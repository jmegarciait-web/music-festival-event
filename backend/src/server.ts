import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { dbModel } from './models/Database';
import { BookingViewModel } from './viewmodels/BookingViewModel';
import { authenticateJWT, authorizeRoles, AuthRequest } from './middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'music-festival-super-secret-key';
const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/calculate-price', (req, res) => {
  try {
    const { startDate, endDate, tier, guests } = req.body;
    const dates = BookingViewModel.getDatesArray(startDate, endDate);
    const totalPrice = BookingViewModel.getPrice(tier, dates.length, guests);
    
    res.json(BookingViewModel.createResponsePayload(true, "Price calculated", { totalPrice }));
  } catch (error: any) {
    res.status(400).json(BookingViewModel.createResponsePayload(false, error.message));
  }
});

app.post('/api/availability', async (req, res) => {
  try {
    const { startDate, endDate, tier, guests } = req.body;
    const dates = BookingViewModel.getDatesArray(startDate, endDate);
    const isAvailable = await dbModel.checkAvailability(dates, tier, guests);
    
    res.json(BookingViewModel.createResponsePayload(true, "Availability checked", { isAvailable }));
  } catch (error: any) {
    res.status(400).json(BookingViewModel.createResponsePayload(false, error.message));
  }
});

app.post('/api/reserve', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate, tier, guests } = req.body;
    const dates = BookingViewModel.getDatesArray(startDate, endDate);
    
    // Server-side double checks
    const isAvailable = await dbModel.checkAvailability(dates, tier, guests);
    if (!isAvailable) throw new Error("Tickets are sold out for these dates");

    const totalPrice = BookingViewModel.getPrice(tier, dates.length, guests);
    const userId = req.user?.id || null;

    const reservationId = await dbModel.createReservation(startDate, endDate, tier, guests, totalPrice, userId);
    
    res.json(BookingViewModel.createResponsePayload(true, "Reservation complete", { reservationId, totalPrice }));
  } catch (error: any) {
    res.status(400).json(BookingViewModel.createResponsePayload(false, error.message));
  }
});

// ======== AUTHENTICATION ========
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    
    await dbModel.createUser(username, hash, 'user');
    const user = await dbModel.getUserByUsername(username);

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ success: true, token, role: user.role, username: user.username });
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ success: false, message: 'Username already exists' });
    } else {
      res.status(400).json({ success: false, message: error.message });
    }
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await dbModel.getUserByUsername(username);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ success: true, token, role: user.role, username: user.username });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ======== ADMIN SECURED ROUTES ========
app.get('/api/user/reservations', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const reservations = await dbModel.getUserReservations(req.user!.id);
    res.json({ success: true, reservations });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.get('/api/admin/availability', authenticateJWT, authorizeRoles('super_admin', 'admin'), async (req, res) => {
  try {
    const availability = await dbModel.getAvailability();
    res.json({ success: true, availability });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.get('/api/admin/reservations', authenticateJWT, authorizeRoles('super_admin', 'admin'), async (req, res) => {
  try {
    const reservations = await dbModel.getReservations();
    res.json({ success: true, reservations });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.get('/api/admin/users', authenticateJWT, authorizeRoles('super_admin', 'admin'), async (req, res) => {
  try {
    const users = await dbModel.getAllUsers();
    res.json({ success: true, users });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/api/admin/users', authenticateJWT, authorizeRoles('super_admin', 'admin'), async (req: AuthRequest, res) => {
  try {
    const { username, password, role } = req.body;
    
    // RBAC rules for creation
    const requestingRole = req.user?.role;
    
    if (role === 'admin' || role === 'super_admin') {
      if (requestingRole !== 'super_admin') {
        return res.status(403).json({ success: false, message: 'Forbidden: Only Super Admins can create administrative accounts.' });
      }
    }

    const hash = await bcrypt.hash(password, 10);
    await dbModel.createUser(username, hash, role);
    
    res.json({ success: true, message: 'User created' });
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ success: false, message: 'Username already exists' });
    } else {
      res.status(400).json({ success: false, message: error.message });
    }
  }
});

app.post('/api/admin/reservations/:id/scan', authenticateJWT, authorizeRoles('super_admin', 'admin'), async (req, res) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const success = await dbModel.scanTicket(id);
    if (success) {
      res.json({ success: true, message: 'Ticket Scanned Valid' });
    } else {
      res.status(400).json({ success: false, message: 'Ticket already scanned or refunded' });
    }
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/api/admin/reservations/:id/refund', authenticateJWT, authorizeRoles('super_admin', 'admin'), async (req, res) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    await dbModel.refundTicket(id);
    res.json({ success: true, message: 'Ticket refunded and availability restored' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  await dbModel.init();
  console.log(`Backend server running on http://localhost:${PORT}`);
});

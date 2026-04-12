import express from 'express';
import cors from 'cors';
import { dbModel } from './models/Database';
import { BookingViewModel } from './viewmodels/BookingViewModel';

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

app.post('/api/reserve', async (req, res) => {
  try {
    const { startDate, endDate, tier, guests } = req.body;
    const dates = BookingViewModel.getDatesArray(startDate, endDate);
    
    // Server-side double checks
    const isAvailable = await dbModel.checkAvailability(dates, tier, guests);
    if (!isAvailable) throw new Error("Tickets are sold out for these dates");

    const totalPrice = BookingViewModel.getPrice(tier, dates.length, guests);

    const reservationId = await dbModel.createReservation(startDate, endDate, tier, guests, totalPrice);
    
    res.json(BookingViewModel.createResponsePayload(true, "Reservation complete", { reservationId, totalPrice }));
  } catch (error: any) {
    res.status(400).json(BookingViewModel.createResponsePayload(false, error.message));
  }
});

app.get('/api/admin/availability', async (req, res) => {
  try {
    const availability = await dbModel.getAvailability();
    res.json({ success: true, availability });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.get('/api/admin/reservations', async (req, res) => {
  try {
    const reservations = await dbModel.getReservations();
    res.json({ success: true, reservations });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, async () => {
  await dbModel.init();
  console.log(`Backend server running on http://localhost:${PORT}`);
});

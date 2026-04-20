import { useEffect, useState } from 'react';
import { 
  Typography, Grid, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, CircularProgress, Alert
} from '@mui/material';

interface AvailabilityRecord {
  date: string;
  tier: string;
  remaining: number;
}

interface ReservationRecord {
  id: number;
  startDate: string;
  endDate: string;
  tier: string;
  guests: number;
  totalPrice: number;
}

const BASE_URL = 'http://localhost:3001/api/admin';

export default function AdminDashboard() {
  const [availability, setAvailability] = useState<AvailabilityRecord[]>([]);
  const [reservations, setReservations] = useState<ReservationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const [availRes, resRes] = await Promise.all([
          fetch(`${BASE_URL}/availability`, { headers }),
          fetch(`${BASE_URL}/reservations`, { headers })
        ]);

        const availData = await availRes.json();
        const resData = await resRes.json();

        if (availData.success && resData.success) {
          setAvailability(availData.availability);
          setReservations(resData.reservations);
        } else {
          throw new Error('Failed to fetch metrics');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Grid container spacing={3}>
      {/* @ts-ignore MUI Type definition flaw in strict mode */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            Availability Monitor
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Tier</TableCell>
                  <TableCell align="right">Remaining</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {availability.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.tier}</TableCell>
                    <TableCell align="right">{row.remaining}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>

      {/* @ts-ignore */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            Recent Reservations
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Dates</TableCell>
                  <TableCell>Tier</TableCell>
                  <TableCell align="right">Guests</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reservations.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>#{row.id}</TableCell>
                    <TableCell>{row.startDate} to {row.endDate}</TableCell>
                    <TableCell>{row.tier}</TableCell>
                    <TableCell align="right">{row.guests}</TableCell>
                    <TableCell align="right">${row.totalPrice}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );
}

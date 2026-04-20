import { useEffect, useState, useRef } from 'react';
import { 
  Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, CircularProgress, Alert,
  Button, TextField, Box, Chip
} from '@mui/material';

const BASE_URL = 'http://localhost:3001/api/admin';

export default function TicketsManager() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Scanner state
  const [scanInput, setScanInput] = useState('');
  const [scanStatus, setScanStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const scannerInputRef = useRef<HTMLInputElement>(null);

  const fetchReservations = async () => {
    try {
      const res = await fetch(`${BASE_URL}/reservations`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setReservations(data.reservations);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
    // Auto-focus scanner on load
    if (scannerInputRef.current) scannerInputRef.current.focus();
  }, []);

  const handleScanSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!scanInput.trim()) return;

    let targetId: number;
    try {
      // Hardware QR scanners act like keyboards. We parse the incoming JSON payload.
      const payload = JSON.parse(scanInput);
      if (payload.role !== 'ticket' || !payload.id) throw new Error("Invalid payload");
      targetId = payload.id;
    } catch (e) {
      // Fallback: If it's just a raw number being typed manually
      targetId = parseInt(scanInput, 10);
      if (isNaN(targetId)) {
        setScanStatus({ type: 'error', message: 'Invalid Barcode Input' });
        setScanInput('');
        return;
      }
    }

    try {
      const res = await fetch(`${BASE_URL}/reservations/${targetId}/scan`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });
      const data = await res.json();
      if (data.success) {
        setScanStatus({ type: 'success', message: `VALID TICKETS: ID #${targetId} accepted.` });
      } else {
        setScanStatus({ type: 'error', message: `ERROR: ${data.message}` });
      }
      fetchReservations(); // Refresh grid
    } catch (err) {
      setScanStatus({ type: 'error', message: 'Server connection failed.' });
    }
    
    setScanInput('');
    if (scannerInputRef.current) scannerInputRef.current.focus();
  };

  const handleRefund = async (id: number) => {
    if (!window.confirm(`Are you sure you want to void and refund Reservation #${id}?`)) return;

    try {
      const res = await fetch(`${BASE_URL}/reservations/${id}/refund`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });
      const data = await res.json();
      if (data.success) {
        fetchReservations();
        setScanStatus({ type: 'success', message: `Refund processed for Reservation #${id}. Availability restored.` });
      } else {
        setScanStatus({ type: 'error', message: `Refund ERROR: ${data.message}` });
      }
    } catch (err) {
      setScanStatus({ type: 'error', message: 'Refund request failed.' });
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ pb: 6 }}>
      <Typography component="h1" variant="h4" color="primary" gutterBottom>
        Gate Operations & Ticketing
      </Typography>

      <Paper sx={{ p: 4, mb: 4, display: 'flex', flexDirection: 'column', gap: 2, borderLeft: '4px solid #f900ff' }}>
        <Typography variant="h6">Hardware Scanner Mode</Typography>
        <Typography variant="body2" color="text.secondary">
          Click the input field below and shoot the barcode scanner. It is compatible with raw IDs or encoded JSON arrays.
        </Typography>

        <form onSubmit={handleScanSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <TextField
            inputRef={scannerInputRef}
            variant="outlined"
            placeholder="Awaiting scanner input..."
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            sx={{ flexGrow: 1 }}
            autoFocus
          />
          <Button type="submit" variant="contained" color="primary" size="large" sx={{ py: 1.5 }}>
            Process Scan
          </Button>
        </form>

        {scanStatus && (
          <Alert 
            severity={scanStatus.type} 
            sx={{ 
              mt: 2, 
              fontSize: '1.2rem', 
              p: 2, 
              border: '1px solid',
              borderColor: scanStatus.type === 'success' ? 'success.main' : 'error.main'
            }}
          >
            {scanStatus.message}
          </Alert>
        )}
      </Paper>

      <Typography variant="h5" color="text.primary" gutterBottom sx={{ mt: 2 }}>
        Master Reservations List
      </Typography>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Dates</TableCell>
                <TableCell>Tier</TableCell>
                <TableCell>Guests</TableCell>
                <TableCell>Financial</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reservations.map((res) => (
                <TableRow key={res.id} hover>
                  <TableCell>#{res.id}</TableCell>
                  <TableCell>{res.startDate} to {res.endDate}</TableCell>
                  <TableCell>
                    <Chip label={res.tier} size="small" color={res.tier === 'VIP' ? 'secondary' : 'primary'} variant="outlined" />
                  </TableCell>
                  <TableCell>{res.guests}</TableCell>
                  <TableCell>${res.totalPrice}</TableCell>
                  <TableCell>
                    <Chip 
                      label={res.status.toUpperCase()} 
                      size="small" 
                      color={
                        res.status === 'scanned' ? 'success' : 
                        res.status === 'refunded' ? 'error' : 'default'
                      } 
                    />
                  </TableCell>
                  <TableCell align="right">
                    {res.status === 'active' && (
                      <Button size="small" color="error" variant="outlined" onClick={() => handleRefund(res.id)}>
                        Refund & Void
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

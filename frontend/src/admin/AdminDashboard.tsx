import { useEffect, useState } from 'react';
import { 
  Typography, Grid, Paper, CircularProgress, Alert
} from '@mui/material';
import ReactECharts from 'echarts-for-react';

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

  // ---- Data Aggregations ---- //
  const availDates = Array.from(new Set(availability.map(a => a.date))).sort();
  const gaAvail = availDates.map(d => availability.find(a => a.date === d && a.tier === 'GA')?.remaining || 0);
  const vipAvail = availDates.map(d => availability.find(a => a.date === d && a.tier === 'VIP')?.remaining || 0);

  const availChartOptions = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { textStyle: { color: '#ccc' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: availDates, axisLabel: { color: '#888' } },
    yAxis: { type: 'value', axisLabel: { color: '#888' } },
    color: ['#00f9ff', '#f900ff'],
    series: [
      { name: 'GA Remaining', type: 'bar', stack: 'total', data: gaAvail },
      { name: 'VIP Remaining', type: 'bar', stack: 'total', data: vipAvail }
    ]
  };

  const revenueAggregation: Record<string, number> = {};
  reservations.forEach(r => {
    // If ticket spans multiple days, we attribute revenue to the start date for simplicity
    if (!revenueAggregation[r.startDate]) revenueAggregation[r.startDate] = 0;
    revenueAggregation[r.startDate] += r.totalPrice;
  });

  const revKeys = Object.keys(revenueAggregation).sort();
  const revValues = revKeys.map(k => revenueAggregation[k]);

  const revChartOptions = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: revKeys, axisLabel: { color: '#888' } },
    yAxis: { type: 'value', axisLabel: { color: '#888' } },
    color: ['#00f9ff'],
    series: [
      {
        name: 'Daily Revenue',
        type: 'line',
        areaStyle: { opacity: 0.1 },
        smooth: true,
        data: revValues
      }
    ]
  };

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} lg={6}>
        <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%', borderTop: '4px solid #00f9ff' }}>
          <Typography component="h2" variant="h5" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
            Inventory Trajectory
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Tracks remaining supply across tiers by specific event entry-date.
          </Typography>
          <ReactECharts option={availChartOptions} style={{ height: '350px', width: '100%' }} />
        </Paper>
      </Grid>

      <Grid item xs={12} lg={6}>
        <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%', borderTop: '4px solid #f900ff' }}>
          <Typography component="h2" variant="h5" color="secondary" gutterBottom sx={{ fontWeight: 'bold' }}>
            Revenue Momentum
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Financial distribution attributed by ticket reservation start date.
          </Typography>
          <ReactECharts option={revChartOptions} style={{ height: '350px', width: '100%' }} />
        </Paper>
      </Grid>
    </Grid>
  );
}

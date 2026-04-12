
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FestivalApp from './FestivalApp';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FestivalApp />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

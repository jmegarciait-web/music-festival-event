
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FestivalApp from './FestivalApp';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import UserManagement from './admin/UserManagement';
import TicketsManager from './admin/TicketsManager';
import { CustomerPortal } from './components/CustomerPortal';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FestivalApp />} />
        <Route path="/portal" element={<CustomerPortal />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="tickets" element={<TicketsManager />} />
        </Route>
      </Routes>
    </Router>
  );
}

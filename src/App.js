import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GarageSetup from './pages/GarageSetup';
import Services from './pages/Services';
import Bookings from './pages/Bookings';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('owner_token');
  return token ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/garage-setup" element={<PrivateRoute><GarageSetup /></PrivateRoute>} />
        <Route path="/services" element={<PrivateRoute><Services /></PrivateRoute>} />
        <Route path="/bookings" element={<PrivateRoute><Bookings /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

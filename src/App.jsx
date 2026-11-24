import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './components/AdminLayout.jsx';
import AppLayout from './components/AppLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminReservations from './pages/admin/AdminReservations.jsx';
import AdminRooms from './pages/admin/AdminRooms.jsx';
import Checkout from './pages/Checkout.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import MyReservations from './pages/MyReservations.jsx';
import NotFound from './pages/NotFound.jsx';
import Profile from './pages/Profile.jsx';
import Rooms from './pages/Rooms.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute role="cliente" />}>
        <Route element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="habitaciones" element={<Rooms />} />
          <Route path="reservar/:roomId" element={<Checkout />} />
          <Route path="mis-reservas" element={<MyReservations />} />
          <Route path="perfil" element={<Profile />} />
        </Route>
      </Route>

      <Route path="admin" element={<ProtectedRoute role="administrador" />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminReservations />} />
          <Route path="habitaciones" element={<AdminRooms />} />
          <Route path="perfil" element={<Profile />} />
        </Route>
      </Route>

      <Route path="inicio" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

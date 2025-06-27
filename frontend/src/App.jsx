// src/App.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { setUser } from './redux/slices/authSlice';
import { connectSocket } from './sockets/socket';

import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import DriverDashboard from './pages/DriverDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import 'leaflet/dist/leaflet.css';
import VehicleReportForm from './pages/Form';

// import TripDetails from './pages/TripDetails';

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Reconnect socket and restore user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      dispatch(setUser(parsed));
      connectSocket(parsed.id);
    }
  }, [dispatch]);

  return (
    <Router>
      <Navbar />
      <VehicleReportForm/>

      <Routes>
        <Route path="/" element={
          user
            ? (user.role === 'operator'
                ? <Navigate to="/driver/dashboard" />
                : <Navigate to="/manager/dashboard" />)
            : <Navigate to="/login" />
        } />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Role-Based Dashboards */}
        <Route path="/driver/dashboard" element={
          user?.role === 'operator' ? <DriverDashboard /> : <Navigate to="/" />
        } />

        <Route path="/manager/dashboard" element={
          user?.role === 'manager' ? <ManagerDashboard /> : <Navigate to="/" />
        } />

        {/* <Route path="/trip/:id" element={<TripDetails />} /> */}
      </Routes>
    </Router>
  );
}

export default App;

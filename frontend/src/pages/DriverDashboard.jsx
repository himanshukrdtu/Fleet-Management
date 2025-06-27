 // src/pages/DriverDashboard.jsx
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { setDriverTrips } from '../redux/slices/tripSlice';
import LiveMap from '../components/LiveMap';
import { getSocket } from '../sockets/socket';

const DriverDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { driverTrips } = useSelector((state) => state.trip);

  const [vehicleNumber, setVehicleNumber] = useState('');
  const [path, setPath] = useState([]);
  const [currentTrip, setCurrentTrip] = useState(null);
  const intervalRef = useRef(null);

  const fetchDriverTrips = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/trips/filterTrips?userId=${user.id}`);
      const all = res.data;
       
      dispatch(setDriverTrips(all));

      const live = all.find(t => t.status === 'running');
      setCurrentTrip(live || null);
      setPath((live || all[all.length - 1])?.path || []);
    } catch (err) {
      console.error('Failed to fetch driver trips:', err);
    }
  };

  const startTrip = async () => {
    if (!vehicleNumber.trim()) {
      alert("Please enter vehicle number");
      return;
    }

    try {
      const res = await axios.post(`http://localhost:5000/api/trips/start`, {
        userId: user.id,
        vehicleNumber
      });

      setCurrentTrip(res.data.trip);
      setPath([]);
      fetchDriverTrips();
    } catch (err) {
      alert('Error starting trip');
      console.error(err);
    }
  };

  const endTrip = async () => {
    try {
      await axios.put(`http://localhost:5000/api/trips/end/${currentTrip._id}`);
      clearInterval(intervalRef.current);
      setCurrentTrip(null);
      setVehicleNumber('');
      fetchDriverTrips();
    } catch (err) {
      alert('Failed to end trip');
      console.error(err);
    }
  };

  useEffect(() => {
    if (!currentTrip) return;

    const socket = getSocket();

    intervalRef.current = setInterval(() => {
      if ('geolocation' in navigator) {
        try {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                time: new Date(),
              };

              socket.emit('locationUpdate', {
                userId: user.id,
                tripId: currentTrip._id,
                location,
              });
            },
            (error) => {
              console.warn('Geolocation error:', error.message);
            }
          );
        } catch (error) {
          console.error('Geolocation fetch error:', error.message);
        }
      }
    }, 5000);

    return () => clearInterval(intervalRef.current);
  }, [currentTrip]);

  useEffect(() => {
    const socket = getSocket();

    const handleLocation = ({ userId, location }) => {
      if (userId === user.id) {
        setPath(prev => [...prev, location]);
      }
    };

    socket.on('newLocation', handleLocation);
    return () => socket.off('newLocation', handleLocation);
  }, [user.id]);

  useEffect(() => {
    fetchDriverTrips();
  }, []);

  const previousTrips = driverTrips.filter(t => t.status === 'completed');

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
      <div style={{ flex: 1 }}>
        <h2>Welcome, {user.username}</h2>

        {!currentTrip ? (
          <>
            <input
              type="text"
              placeholder="Enter Vehicle Number"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              style={{ padding: '10px', marginRight: '10px' }}
            />
            <button onClick={startTrip}>Start Trip</button>
          </>
        ) : (
          <>
            <p><strong>Trip ID:</strong> {currentTrip._id}</p>
            <p><strong>Vehicle:</strong> {currentTrip.vehicleNumber}</p>
            <button onClick={endTrip}>End Trip</button>
          </>
        )}

        <h3>Previous Trips</h3>
        <ul>
          {previousTrips.map((trip) => (
            <li key={trip._id}>
              ID: {trip._id} | Vehicle: {trip.vehicleNumber} | Status: {trip.status}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ flex: 1, border: '1px solid #ccc', height: '400px' }}>
        <h3 style={{ textAlign: 'center' }}>
          {currentTrip ? 'Live Trip Map' : 'Last Trip Path'}
        </h3>
        <LiveMap path={Array.isArray(path) ? path : []} />
      </div>
    </div>
  );
};

export default DriverDashboard;

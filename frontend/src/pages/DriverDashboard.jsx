import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { setDriverTrips } from '../redux/slices/tripSlice';
import LiveMap from '../components/LiveMap';
import { getSocket } from '../sockets/socket';
import VehicleReportForm from './StartForm';
import EndTripForm from './EndTripForm';

const BASE_URL = "https://fleet-management-bn9l.onrender.com";
// const BASE_URL = "https://http://localhost:5000";

const DriverDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { driverTrips } = useSelector((state) => state.trip);

  const [vehicleNumber, setVehicleNumber] = useState('');
  const [path, setPath] = useState([]);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [formId, setFormId] = useState(null);
  const [showStartForm, setShowStartForm] = useState(false);
  const [showEndForm, setShowEndForm] = useState(false);
  const [isEndFormSubmitted, setIsEndFormSubmitted] = useState(false);
  const intervalRef = useRef(null);

  const fetchDriverTrips = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/trips/filterTrips?userId=${user.id}`);
      const all = res.data;

      dispatch(setDriverTrips(all));

      const live = all.find(t => t.status === 'running');
      setCurrentTrip(live || null);
      setFormId(live?.formId || null); // ✅ extract formId from live trip
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

    if (!formId) {
      alert("Please fill trip start form first.");
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/api/trips/start`, {
        userId: user.id,
        vehicleNumber,
        formId,
      });

      setCurrentTrip(res.data.trip);
      setFormId(res.data.trip.formId); // ✅ store returned formId (redundant but safe)
      setPath([]);
      setIsEndFormSubmitted(false);
      fetchDriverTrips();
    } catch (err) {
      alert('Error starting trip');
      console.error(err);
    }
  };

  const endTrip = async () => {
    try {
      await axios.put(`${BASE_URL}/api/trips/end/${currentTrip._id}`);
      clearInterval(intervalRef.current);
      setCurrentTrip(null);
      setVehicleNumber('');
      setFormId(null);
      setIsEndFormSubmitted(false);
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
            {!formId ? (
              <>
                <button onClick={() => setShowStartForm(true)}>📝 Fill Trip Start Form</button>
                {showStartForm && (
                  <VehicleReportForm
                    onClose={() => setShowStartForm(false)}
                    onFormSubmit={(id) => {
                      setFormId(id);
                      setShowStartForm(false);
                    }}
                  />
                )}
              </>
            ) : (
              <>
                <p><strong>Form ID:</strong> {formId}</p>
                <input
                  type="text"
                  placeholder="Enter Vehicle Number"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  style={{ padding: '10px', marginRight: '10px' }}
                />
                <button onClick={startTrip}>🚚 Start Trip</button>
              </>
            )}
          </>
        ) : (
          <>
            <p><strong>Trip ID:</strong> {currentTrip._id}</p>
            <p><strong>Vehicle:</strong> {currentTrip.vehicleNumber}</p>

            {!isEndFormSubmitted ? (
              <>
                <button onClick={() => setShowEndForm(true)}>📋 Fill Trip End Form</button>
                {showEndForm && (
                  <EndTripForm
                    formId={formId}
                    onClose={() => setShowEndForm(false)}
                    onSubmitSuccess={() => {
                      setIsEndFormSubmitted(true);
                      setShowEndForm(false);
                    }}
                  />
                )}
              </>
            ) : (
              <button onClick={endTrip}>⛔ End Trip</button>
            )}
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

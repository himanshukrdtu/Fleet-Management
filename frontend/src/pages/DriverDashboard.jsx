import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import {
  setDriverTrips,
  setSelectedTrip,
  updateLiveTripPath,
  updateSelectedTripPath,
} from '../redux/slices/tripSlice';
import LiveMap from '../components/LiveMap';
import VehicleReportForm from './StartForm';
import EndTripForm from './EndTripForm';
import { formatDistanceStrict } from 'date-fns';
import { getSocket } from '../sockets/socket';
import { BASE_URL } from '../config';

 

const DriverDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { driverTrips, selectedTrip } = useSelector((state) => state.trip);

  const [formId, setFormId] = useState(null);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [showStartForm, setShowStartForm] = useState(false);
  const [showEndForm, setShowEndForm] = useState(false);
  const [isEndFormSubmitted, setIsEndFormSubmitted] = useState(false);
  const [formDetails, setFormDetails] = useState(null);
  const intervalRef = useRef(null);

  const fetchDriverTrips = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/trips/filterTrips?userId=${user.id}`);
      dispatch(setDriverTrips(res.data));
      const live = res.data.find((t) => t.status === 'running');
      setFormId(live?.formId || null);
    } catch (err) {
      console.error('Failed to fetch driver trips:', err);
    }
  };

  const currentTrip = driverTrips.find((t) => t.status === 'running');

  const startTrip = async () => {
    if (!vehicleNumber.trim()) return alert('Enter vehicle number');
    if (!formId) return alert('Please fill start form');

    try {
      await axios.post(`${BASE_URL}/api/trips/start`, {
        userId: user.id,
        vehicleNumber,
        formId,
      });
      setIsEndFormSubmitted(false);
      fetchDriverTrips();
    } catch (err) {
      console.error(err);
      alert('Failed to start trip');
    }
  };

  const endTrip = async () => {
    try {
      await axios.put(`${BASE_URL}/api/trips/end/${currentTrip._id}`);
      clearInterval(intervalRef.current);
      setFormId(null);
      setVehicleNumber('');
      setIsEndFormSubmitted(false);
      fetchDriverTrips();
    } catch (err) {
      console.error(err);
      alert('Failed to end trip');
    }
  };

  const handleViewDetail = async (trip) => {
    dispatch(setSelectedTrip(trip));
    try {
      const res = await axios.get(`${BASE_URL}/api/vehicle-report/${trip.formId}`);
      setFormDetails(res.data);
    } catch (err) {
      console.error('Failed to fetch form details:', err);
      setFormDetails(null);
    }
  };

  useEffect(() => {
    if (!currentTrip) return;
    const socket = getSocket();

    intervalRef.current = setInterval(() => {
      if ('geolocation' in navigator) {
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
      }
    }, 5000);

    return () => clearInterval(intervalRef.current);
  }, [currentTrip]);

  useEffect(() => {
    const socket = getSocket();

    const handleLocation = ({ userId: incomingUserId, tripId, location }) => {
      if (incomingUserId === user.id) {
        dispatch(updateLiveTripPath({ tripId, location }));
        dispatch(updateSelectedTripPath({ tripId, location }));
      }
    };

    socket.on('liveLocation', handleLocation);
    return () => socket.off('liveLocation', handleLocation);
  }, [user.id, selectedTrip]);

  useEffect(() => {
    fetchDriverTrips();
  }, []);

  return (
    <div style={{  gap: '30px', padding: '20px' }}>
      <div style={{ flex: 1, borderRight: '1px solid #ccc', paddingRight: '20px' }}>
        <h2>Welcome, {user.username}</h2>

        {!currentTrip ? (
          !formId ? (
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
          )
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

        <h3>Your Previous Trips</h3>
        <ul>
          {driverTrips.map((trip) => (
            <li key={trip._id}>
              📦 {trip.vehicleNumber} | {trip.status}
              <button onClick={() => handleViewDetail(trip)} style={{ marginLeft: '10px' }}>
                View Detail
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ flex: 2 }}>
        {selectedTrip && (
          <div style={{ padding: '20px', border: '1px solid gray' }}>
            <h3>📍 Trip Path Info</h3>
            <p><strong>Vehicle:</strong> {selectedTrip.vehicleNumber}</p>
            <p><strong>Start:</strong> {new Date(selectedTrip.startedAt).toLocaleString()}</p>
            <p><strong>End:</strong> {selectedTrip.endedAt
              ? new Date(selectedTrip.endedAt).toLocaleString()
              : 'Running...'}</p>
            <p><strong>Duration:</strong>
              {selectedTrip.endedAt
                ? formatDistanceStrict(new Date(selectedTrip.startedAt), new Date(selectedTrip.endedAt))
                : formatDistanceStrict(new Date(selectedTrip.startedAt), new Date()) + ' (ongoing)'}
            </p>
            <div style={{ height: '400px', marginTop: '20px' }}>
              <LiveMap path={selectedTrip.path || []} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;

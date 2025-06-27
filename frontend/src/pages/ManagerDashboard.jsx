import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import {
  setLiveTrips,
  addLiveTrip,
  removeLiveTrip,
  setSelectedTrip
} from '../redux/slices/tripSlice';
import { formatDistanceStrict } from 'date-fns';
import LiveMap from '../components/LiveMap';
import { getSocket } from '../sockets/socket'; // make sure this exists

const ManagerDashboard = () => {
  const dispatch = useDispatch();
  const { liveTrips, selectedTrip } = useSelector(state => state.trip);

  const [filters, setFilters] = useState({
    userId: '',
    vehicleNumber: '',
    status: '',
    start: '',
    end: ''
  });

  const [filteredTrips, setFilteredTrips] = useState([]);

  // Load initial running trips
  useEffect(() => {
    const fetchRunningTrips = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/trips/filterTrips?status=running');
        dispatch(setLiveTrips(res.data));
      } catch (err) {
        console.error('Error fetching running trips:', err);
      }
    };

    fetchRunningTrips();
  }, [dispatch]);

  // Setup socket listeners for live updates
  useEffect(() => {
    const socket = getSocket();

    socket.on('tripStarted', (trip) => {
        console.log(trip);
      dispatch(addLiveTrip(trip));
    });

    socket.on('tripEnded', (tripId) => {
      dispatch(removeLiveTrip(tripId));
    });

    return () => {
      socket.off('tripStarted');
      socket.off('tripEnded');
    };
  }, [dispatch]);

  // Filter submission
  const handleFilterSubmit = async (e) => {
    e.preventDefault();
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await axios.get(`http://localhost:5000/api/trips/filterTrips?${params}`);
      setFilteredTrips(res.data);
    } catch (err) {
      console.error('Failed to filter trips:', err);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '30px', padding: '20px' }}>
      {/* Left Column - Running Trips */}
      <div style={{ flex: 1, borderRight: '1px solid #ccc', paddingRight: '20px' }}>
        <h2>Running Trips</h2>
        {liveTrips.length === 0 ? (
          <p>No running trips.</p>
        ) : (
          <ul>
            {liveTrips.map(trip => (
              <li key={trip._id} style={{ marginBottom: '10px' }}>
                🚚 <strong>{trip.vehicleNumber}</strong> | 👤 {trip.name}
                <button
                  style={{ marginLeft: '10px' }}
                  onClick={() => dispatch(setSelectedTrip(trip))}
                >
                  View Detail
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Right Column - Filter + Trip Detail */}
      <div style={{ flex: 2 }}>
        <h2>Search Trips</h2>
        <form onSubmit={handleFilterSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
          <input type="text" placeholder="User ID" value={filters.userId} onChange={(e) => setFilters({ ...filters, userId: e.target.value })} />
          <input type="text" placeholder="Vehicle Number" value={filters.vehicleNumber} onChange={(e) => setFilters({ ...filters, vehicleNumber: e.target.value })} />
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All Status</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
          </select>
          <input type="date" value={filters.start} onChange={(e) => setFilters({ ...filters, start: e.target.value })} />
          <input type="date" value={filters.end} onChange={(e) => setFilters({ ...filters, end: e.target.value })} />
          <button type="submit">Search</button>
        </form>

        {filteredTrips.length > 0 && (
          <ul>
            {filteredTrips.map(trip => (
              <li key={trip._id}>
                📌 {trip.vehicleNumber} - {trip.name} ({trip.status})
                <button
                  onClick={() => dispatch(setSelectedTrip(trip))}
                  style={{ marginLeft: '10px' }}
                >
                  View Detail
                </button>
              </li>
            ))}
          </ul>
        )}

        {selectedTrip && (
          <div style={{ marginTop: '30px', padding: '20px', border: '1px solid gray' }}>
            <h3>Trip Detail</h3>
            <p><strong>Operator:</strong> {selectedTrip.name}</p>
            <p><strong>Vehicle:</strong> {selectedTrip.vehicleNumber}</p>
            <p><strong>Start:</strong> {new Date(selectedTrip.startedAt).toLocaleString()}</p>
            <p><strong>End:</strong> {selectedTrip.endedAt ? new Date(selectedTrip.endedAt).toLocaleString() : 'Running...'}</p>
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

export default ManagerDashboard;

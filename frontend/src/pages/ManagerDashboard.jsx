import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import {
  setLiveTrips,
  addLiveTrip,
  removeLiveTrip,
  setSelectedTrip,
  updateLiveTripPathInLiveTrips,
  updateSelectedTripPath,
} from '../redux/slices/tripSlice';
import { formatDistanceStrict } from 'date-fns';
import LiveMap from '../components/LiveMap';
import { getSocket } from '../sockets/socket';
import FullVehicleReportView from '../components/FullVehicleReportView';
import { BASE_URL } from '../config';

 

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
  const [formDetails, setFormDetails] = useState(null);

  useEffect(() => {
    const fetchRunningTrips = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/trips/filterTrips?status=running`);
        dispatch(setLiveTrips(res.data));
      } catch (err) {
        console.error('Error fetching running trips:', err);
      }
    };

    fetchRunningTrips();
  }, [dispatch]);

  useEffect(() => {
    const socket = getSocket();

    socket.on('tripStarted', (trip) => {
      dispatch(addLiveTrip(trip));
    });

    socket.on('tripEnded', (tripId) => {
      dispatch(removeLiveTrip(tripId));
    });

    socket.on('liveLocation', ({ userId, tripId, location }) => {
      dispatch(updateLiveTripPathInLiveTrips({ tripId, location }));
      dispatch(updateSelectedTripPath({ tripId, location }));
    });

    return () => {
      socket.off('tripStarted');
      socket.off('tripEnded');
      socket.off('liveLocation');
    };
  }, [dispatch]);

  const handleFilterSubmit = async (e) => {
    e.preventDefault();
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await axios.get(`${BASE_URL}/api/trips/filterTrips?${params}`);
      setFilteredTrips(res.data);
    } catch (err) {
      console.error('Failed to filter trips:', err);
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

  return (
    <div style={{ display: 'flex', gap: '30px', padding: '20px' }}>
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
                  onClick={() => handleViewDetail(trip)}
                >
                  View Detail
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

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
                  onClick={() => handleViewDetail(trip)}
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
            <h3>📝 Trip Form Details</h3>
            {formDetails ? (
              <FullVehicleReportView form={formDetails} readOnly />
            ) : (
              <p>No form details available.</p>
            )}

            <h3>📍 Trip Live Path Info</h3>
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

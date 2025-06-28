// EndTripForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const BASE_URL = "https://fleet-management-bn9l.onrender.com";
// const BASE_URL = "https://http://localhost:5000";

const EndTripForm = ({ onClose, onSubmitSuccess }) => {
  const { driverTrips } = useSelector((state) => state.trip);
  const runningTrip = driverTrips.find((trip) => trip.status === 'running');
  const formId = runningTrip?.formId;

  const [closeHMR, setCloseHMR] = useState('');
  const [closeKM, setCloseKM] = useState('');

  const handleSubmit = async () => {
    if (!closeHMR.trim() || !closeKM.trim()) {
      alert('Please fill both Close HMR and Close KM');
      return;
    }

    if (!formId) {
      alert('Form ID not found. Cannot update end details.');
      return;
    }

    try {
      await axios.put(`${BASE_URL}/api/vehicle-report/update/${formId}`, {
        closeHMR,
        closeKM
      });

      alert('End trip data updated successfully');
      onSubmitSuccess?.(); // Notify parent to show "End Trip" button
      onClose?.(); // Close the form popup/modal
    } catch (err) {
      console.error('Error updating end trip data:', err);
      alert('Failed to update end trip data');
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', marginTop: '20px' }}>
      <h3>🔚 End Trip Details</h3>

      <div style={{ marginBottom: '10px' }}>
        <label>Close HMR: </label>
        <input
          type="text"
          value={closeHMR}
          onChange={(e) => setCloseHMR(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>Close KM: </label>
        <input
          type="text"
          value={closeKM}
          onChange={(e) => setCloseKM(e.target.value)}
        />
      </div>

      <button onClick={handleSubmit} style={{ marginRight: '10px' }}>✅ Submit</button>
      <button onClick={onClose}>❌ Cancel</button>
    </div>
  );
};

export default EndTripForm;

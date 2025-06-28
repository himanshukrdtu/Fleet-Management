import React, { useState } from 'react';
import axios from 'axios';

const EndTripForm = ({ formId, onClose }) => {
  const [closeHMR, setCloseHMR] = useState('');
  const [closeKM, setCloseKM] = useState('');

  const handleSubmit = async () => {
    if (!closeHMR.trim() || !closeKM.trim()) {
      alert("Please fill both Close HMR and Close KM");
      return;
    }

    try {
      const res = await axios.put(`http://localhost:5000/api/vehicle-report/update/685f9b7365c2b91466133f89`, {
        closeHMR,
        closeKM 
      });

      alert("End trip data updated successfully");
      onClose?.(); // Close the form if onClose prop exists
    } catch (err) {
      console.error("Error updating end trip data:", err);
      alert("Failed to update end trip data");
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

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './StartForm.css';
import axios from 'axios';
const checklistItems = [
  'पार्किंग ब्रेक', 'लाइट्स और हॉर्न', 'डैशबोर्ड',
  'लाइट्स वाइपर', 'साइंट बोर्ड', 'बैठक सीट/सुरक्षा बेल्ट',
  'हॉपर', 'स्टेप्स / हैंड रेल्स', 'इंजन आवाज',
  'साइरन', 'टायर / व्हील नट्स / रिम्स', 'स्टीयरिंग',
  'टूल बॉक्स', 'दरवाजा / शीशा / गेट्स', 'रेडिएटर',
  'बैटरी', 'फायर एक्स्टिंगुशर', 'मिरर',
];

const worksiteOptions = [
  'माइंस से OB डंप',
  'माइंस से COAL डंप',
  'माइंस से क्रशर',
  'COAL स्टॉक से क्रशर',
  'क्रशर COAL शिपिंग',
  'बैलिंग प्लांट',
  'अन्य स्थल'
];

const VehicleReportForm = ({ onFormSubmit, onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const [username] = useState(user ? user.username : 'him');
  const today = new Date().toLocaleDateString('en-GB').split('/').join('-');

  const [note, setNote] = useState('');
  const [breakdownNote, setBreakdownNote] = useState('');
  const [checkedValues, setCheckedValues] = useState({});
  const [repairReported, setRepairReported] = useState('');
  const [mechanicPin, setMechanicPin] = useState('');
  const [driverPin, setDriverPin] = useState('');
  const [footerPins, setFooterPins] = useState({ driver: '', supervisor: '', incharge: '' });
  const [tripRows, setTripRows] = useState([
    { tipper: '', time: '', machine: '', material: '', site: '' },
    { tipper: '', time: '', machine: '', material: '', site: '' }
  ]);

  const [tripDetails, setTripDetails] = useState({
    tripDate: today,
    shift: '',
    relay: '',
    driverName: username || '',
    dumperNumber: '',
    operatorId: '',
    startHMR: '',
    closeHMR: '',
    startKM: '',
    closeKM: ''
  });

  const handleTripChange = (e) => {
    const { id, value } = e.target;
    setTripDetails(prev => ({ ...prev, [id]: value }));
  };

  const handleChange = (idx, value) => {
    setCheckedValues((prev) => ({ ...prev, [idx]: value }));
  };

  const handleSelectAllOk = () => {
    const allOk = {};
    checklistItems.forEach((_, idx) => (allOk[idx] = 'OK'));
    setCheckedValues(allOk);
  };

  const handleClearAll = () => setCheckedValues({});

  const startListening = (callback, type = "text") => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'hi-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let transcript = event.results[0][0].transcript;

      if (type === "number") {
        transcript = transcript.replace(/[^\d]/g, '');
      } else if (type === "alphanumeric") {
        transcript = transcript.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      }

      callback(prev => prev + ' ' + transcript);
    };

    recognition.onerror = (event) => alert('माइक से इनपुट नहीं हो पाया: ' + event.error);
    recognition.start();
  };

  const handleSubmit = async () => {
    const payload = {
      checklist: checkedValues,
      notes: note,
      breakdownNote,
      repairReported,
      mechanicPin,
      driverPin,
      tripRows,
      footerPins,
      tripDetails,
    };

    try {
      const response = await axios.post('http://localhost:5000/api/vehicle-report/submit', payload);
      const formId = response.data.formId;

      alert(`Form submitted! Form ID: ${formId}`);

      if (onFormSubmit) {
        onFormSubmit(formId); // ✅ inform parent
      }
    } catch (err) {
      console.error("Submission error", err);
      alert("Error submitting form");
    }
  };

  const updateTripRow = (index, field, value) => {
    const updated = [...tripRows];
    updated[index][field] = value;
    setTripRows(updated);
  };
  return (
    <div className="form-wrapper">
      <div className="a4-form">
        <button type="button" onClick={onClose}>❌ Close Form</button>
        <div className="form-header">
          <h2>थ्रिवेणी सैनिक़ माइंस प्राइवेट लिमिटेड</h2>
          <h3>पचमी बोकारो कोल माइंस प्रोजेक्ट</h3>
          <h4>प्रारंभिक प्री-स्टार्ट चेक लिस्ट</h4>
        </div>

        <div className="checklist-buttons">
          <button onClick={handleSelectAllOk}>✅ Select All OK</button>
          <button onClick={handleClearAll}>❌ Clear All</button>
        </div>

        <div className="checklist-grid">
          {checklistItems.map((label, idx) => (
            <div key={idx} className="checklist-item">
              <span>{label}</span>
              <span>
                <label><input type="radio" name={`check-${idx}`} checked={checkedValues[idx] === 'OK'} onChange={() => handleChange(idx, 'OK')} /> OK</label>
                <label><input type="radio" name={`check-${idx}`} checked={checkedValues[idx] === 'Not OK'} onChange={() => handleChange(idx, 'Not OK')} /> Not OK</label>
              </span>
            </div>
          ))}
        </div>

        <div className="info-section">
          <label>अन्य सूचना:</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="यहां लिखें या माइक का उपयोग करें" />
          <button type="button" onClick={() => startListening(setNote)}>🎤 माइक से बोले</button>
        </div>

        <div className="checkbox-line">
          <span>आवश्यक रिपेरिंग की सूचना सुपरवाइज़र को दी:</span>
          <label><input type="radio" name="repairReported" value="yes" checked={repairReported === 'yes'} onChange={() => setRepairReported('yes')} /> हां</label>
          <label><input type="radio" name="repairReported" value="no" checked={repairReported === 'no'} onChange={() => setRepairReported('no')} /> नहीं</label>
          <label>मैकेनिकल डिपार्टमेंट PIN: <input type="password" maxLength="6" inputMode="numeric" value={mechanicPin} onChange={(e) => setMechanicPin(e.target.value)} /></label>
          <label>ड्राइवर PIN: <input type="password" maxLength="6" inputMode="numeric" value={driverPin} onChange={(e) => setDriverPin(e.target.value)} /></label>
        </div>
<div className="dumper-trip-report">
  <div className="section-title">डम्पर ट्रिप रिपोर्ट</div>
  <div className="input-grid">

    <div>
      <label htmlFor="tripDate">दिनांक:</label>
      <input id="tripDate" type="text" value={tripDetails.tripDate} onChange={handleTripChange} placeholder="dd-mm-yy" />
      <button type="button" onClick={() =>
        startListening(update =>
          setTripDetails(prev => ({ ...prev, tripDate: update(prev.tripDate) })), "alphanumeric")
      }>🎤</button>
    </div>

    <div>
      <label htmlFor="shift">शिफ्ट:</label>
      <select id="shift" value={tripDetails.shift} onChange={handleTripChange}>
        <option value="">-- चुनें --</option>
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
      </select>
    </div>

    <div>
      <label htmlFor="relay">रिले:</label>
      <input id="relay" type="text" value={tripDetails.relay} onChange={handleTripChange} />
      <button type="button" onClick={() =>
        startListening(update =>
          setTripDetails(prev => ({ ...prev, relay: update(prev.relay) })), "text")
      }>🎤</button>
    </div>

    <div>
      <label htmlFor="driverName">ड्राइवर का नाम:</label>
      <input id="driverName" type="text" value={tripDetails.driverName} onChange={handleTripChange} readOnly />
    </div>

    <div>
      <label htmlFor="dumperNumber">डंपर संख्या:</label>
      <input id="dumperNumber" type="text" value={tripDetails.dumperNumber} onChange={handleTripChange} />
      <button type="button" onClick={() =>
        startListening(update =>
          setTripDetails(prev => ({ ...prev, dumperNumber: update(prev.dumperNumber) })), "alphanumeric")
      }>🎤</button>
     

    </div>

    <div>
      <label htmlFor="operatorId">ऑपरेटर ID:</label>
      <input id="operatorId" type="text" value={tripDetails.operatorId} onChange={handleTripChange} />
      <button type="button" onClick={() =>
        startListening(update =>
          setTripDetails(prev => ({ ...prev, operatorId: update(prev.operatorId) })), "alphanumeric")
      }>🎤</button>
    </div>

    <div>
      <label htmlFor="startHMR">स्टार्टिंग HMR:</label>
      <input id="startHMR" type="text" value={tripDetails.startHMR} onChange={handleTripChange} />
      <button type="button" onClick={() =>
        startListening(update =>
          setTripDetails(prev => ({ ...prev, startHMR: update(prev.startHMR) })), "number")
      }>🎤</button>
    </div>

    <div>
      <label htmlFor="closeHMR">क्लोजिंग HMR:</label>
      <input id="closeHMR" type="text" value={tripDetails.closeHMR} onChange={handleTripChange} />
      <button type="button" onClick={() =>
        startListening(update =>
          setTripDetails(prev => ({ ...prev, closeHMR: update(prev.closeHMR) })), "number")
      }>🎤</button>
    </div>

    <div>
      <label htmlFor="startKM">स्टार्टिंग किलोमीटर:</label>
      <input id="startKM" type="text" value={tripDetails.startKM} onChange={handleTripChange} />
      <button type="button" onClick={() =>
        startListening(update =>
          setTripDetails(prev => ({ ...prev, startKM: update(prev.startKM) })), "number")
      }>🎤</button>
    </div>

    <div>
      <label htmlFor="closeKM">क्लोजिंग किलोमीटर:</label>
      <input id="closeKM" type="text" value={tripDetails.closeKM} onChange={handleTripChange} />
      <button type="button" onClick={() =>
        startListening(update =>
          setTripDetails(prev => ({ ...prev, closeKM: update(prev.closeKM) })), "number")
      }>🎤</button>
    </div>

  </div>
</div>



       <table className="details-table">
  <thead>
    <tr>
      <th>टिपर संख्या</th>
      <th>समय</th>
      <th>Machine Number</th>
      <th>माल</th>
      <th>कार्य स्थल</th>
    </tr>
  </thead>
  <tbody>
    {tripRows.map((row, i) => (
      <tr key={i}>
        {/* Fixed tipper number */}
        <td style={{ textAlign: 'center' }}>{i + 1}</td>

        {/* Time input with Set button */}
        <td style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <input
            value={row.time}
            onChange={(e) => updateTripRow(i, 'time', e.target.value)}
            placeholder="HH:MM"
            style={{ flex: '1' }}
          />
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
              updateTripRow(i, 'time', timeStr);
            }}
            style={{ padding: '2px 6px' }}
          >
            Set
          </button>
        </td>

        {/* Other fields */}
        <td>
          <input
            value={row.machine}
            onChange={(e) => updateTripRow(i, 'machine', e.target.value)}
          />
        </td>
        <td>
          <label>
            <input
              type="radio"
              name={`material-${i}`}
              value="OB"
              checked={row.material === 'OB'}
              onChange={() => updateTripRow(i, 'material', 'OB')}
            /> OB
          </label>
          <label style={{ marginLeft: '10px' }}>
            <input
              type="radio"
              name={`material-${i}`}
              value="Coal"
              checked={row.material === 'Coal'}
              onChange={() => updateTripRow(i, 'material', 'Coal')}
            /> Coal
          </label>
        </td>
        <td>
          <select
            value={row.site}
            onChange={(e) => updateTripRow(i, 'site', e.target.value)}
          >
            <option value="">-- कार्य स्थल चुनें --</option>
            {worksiteOptions.map((opt, idx) => (
              <option key={idx} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </td>
      </tr>
    ))}
  </tbody>
</table>



        <div className="footer-section">
          <label>ब्रेकडाउन रिपोर्ट व टिप्पणियाँ:</label>
          <textarea value={breakdownNote} onChange={(e) => setBreakdownNote(e.target.value)} placeholder="यहाँ विवरण लिखें या माइक का उपयोग करें" />
          <button type="button" onClick={() => startListening(setBreakdownNote)}>🎤 माइक से बोले</button>
          <div className="pin-grid">
            <label>ड्राइवर Pin: <input type="password" maxLength="6" value={footerPins.driver} onChange={(e) => setFooterPins({ ...footerPins, driver: e.target.value })} /></label>
            <label>शिफ्ट सुपरवाइजर Pin: <input type="password" maxLength="6" value={footerPins.supervisor} onChange={(e) => setFooterPins({ ...footerPins, supervisor: e.target.value })} /></label>
            <label>शिफ्ट इन्चार्ज Pin: <input type="password" maxLength="6" value={footerPins.incharge} onChange={(e) => setFooterPins({ ...footerPins, incharge: e.target.value })} /></label>
          </div>
        </div>

        <button className="submit-btn" onClick={handleSubmit}>सबमिट करें</button>
         
      </div>
    </div>
  );
};

export default VehicleReportForm;

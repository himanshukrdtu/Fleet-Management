// VehicleReportForm.jsx
import React from 'react';
import { useState } from 'react';
import './VehicleReportForm.css';

const VehicleReportForm = () => {
    const [note, setNote] = useState('');
    const today = new Date().toLocaleDateString('en-GB').split('/').join('-');

  const startListening = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'hi-IN'; // for Hindi
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      setNote(prev => prev + ' ' + event.results[0][0].transcript);
    };

    recognition.onerror = (event) => {
      alert('माइक से इनपुट नहीं हो पाया: ' + event.error);
    };

    recognition.start();
};
  return (
    <div className="form-wrapper">
      <div className="a4-form">
        <div className="form-header">
          <h2>थ्रिवेणी सैनिक़ माइंस प्राइवेट लिमिटेड</h2>
          <h3>पचमी बोकारो कोल माइंस प्रोजेक्ट</h3>
          <h4>प्रारंभिक प्री-स्टार्ट चेक लिस्ट</h4>
        </div>

        <div className="checklist-grid">
          {[
            'पार्किंग ब्रेक', 'लाइट्स और हॉर्न', 'डैशबोर्ड',
            'लाइट्स वाइपर', 'साइंट बोर्ड', 'बैठक सीट/सुरक्षा बेल्ट',
            'हॉपर', 'स्टेप्स / हैंड रेल्स', 'इंजन आवाज',
            'साइरन', 'टायर / व्हील नट्स / रिम्स', 'स्टीयरिंग',
            'टूल बॉक्स', 'दरवाजा / शीशा / गेट्स', 'रेडिएटर',
            'बैटरी', 'फायर एक्स्टिंगुशर', 'मिरर',
          ].map((label, idx) => (
            <div key={idx} className="checklist-item">
              <span>{label}</span>
              <span className="checklist-input">
                <label><input type="radio" name={label + idx} /> OK</label>
                <label><input type="radio" name={label + idx} /> Not OK</label>
              </span>
            </div>
          ))}
        </div>

       <div className="info-section">
  <label htmlFor="notes">अन्य सूचना:</label>
  <textarea
    id="notes"
    rows="3"
    placeholder="यहां लिखें या माइक का उपयोग करें"
    value={note}
    onChange={(e) => setNote(e.target.value)}
    style={{ width: '100%', marginTop: '5px' }}
  />
  <button type="button" onClick={startListening} style={{ marginTop: '5px' }}>
    🎤 माइक से बोले
  </button>
</div>


        <div className="checkbox-line">
          <label><input type="checkbox" /> रिपोर्टिंग की सूचना सुपरवाइजर को दी: हां</label>
          <label><input type="checkbox" /> नहीं</label>
          <span className="ml-auto">ड्राइवर हस्ताक्षर: ____________</span>
        </div>

        <div className="report-grid">
          <div>
            <p>दिनांक: <input defaultValue={today} /></p>
            <p>शिफ्ट: <input type="text" /></p>
            <p>लोडिंग नंबर: <input type="text" /></p>
          </div>
          <div>
            <p>यूनिट का नाम: <input type="text" /></p>
            <p>ड्राइवर का नाम: <input type="text" /></p>
            <p>टिपर संख्या: <input type="text" /></p>
          </div>
          <div>
            <p>स्पीडो HMR: <input type="text" /></p>
            <p>स्पीडो किलोमीटर: <input type="text" /></p>
          </div>
        </div>

        <table className="details-table">
          <thead>
            <tr>
              <th>क्रम</th>
              <th>समय</th>
              <th>माल</th>
              <th>टिपर संख्या</th>
              <th>क्रम</th>
              <th>समय</th>
              <th>माल</th>
              <th>टिपर संख्या</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, i) => (
              <tr key={i}>
                {[...Array(2)].map((_, j) => (
                  <>
                    <td>{i * 2 + j + 1}</td>
                    <td><input type="text" /></td>
                    <td><input type="text" /></td>
                    <td><input type="text" /></td>
                  </>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="footer-section">
          <div className="loading-line">
            <span>लोडिंग: <input type="text" /></span>
            <span>COAL टिप:</span>
          </div>
          <p>टिप्पणी / रिपोर्टिंग / दिशा-निर्देश:</p>
          <div className="signature-line">
            <span>ड्राइवर के हस्ताक्षर: ____________</span>
            <span>सुपरवाइजर के हस्ताक्षर: ____________</span>
            <span>शिफ्ट इंचार्ज: ____________</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleReportForm;

import React, { useState } from 'react';
import { MapContainer, TileLayer, Polygon } from 'react-leaflet';

const mapCenter = [18.5204, 73.8567];
const mockPolygon = [
  [18.5204, 73.8567],
  [18.5214, 73.8567],
  [18.5214, 73.8577],
  [18.5204, 73.8577]
];

function AdminDashboard({ onDataExtracted }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/extract-data', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Image extraction failed');
      }

      const data = await response.json();
      
      // data contains extracted_data, confidence_scores, processed_image (base64)
      onDataExtracted(data);
    } catch (error) {
      console.error(error);
      alert('Failed to process and extract document data');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container-fluid mt-4">
      {/* Upload Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Upload Land Record Scan</h5>
              <input 
                type="file" 
                className="form-control mb-3" 
                accept="image/*" 
                onChange={handleFileUpload} 
                disabled={isProcessing}
              />
              {isProcessing && <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-muted">Total Processed</h5>
              <h2 className="card-text fw-bold">1,245</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-muted">Pending Verification</h5>
              <h2 className="card-text fw-bold text-warning">84</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-muted">Accuracy Rate</h5>
              <h2 className="card-text fw-bold text-success">96.5%</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Cadastral Map View</h5>
            </div>
            <div className="card-body p-0">
              <MapContainer center={mapCenter} zoom={13} style={{ height: '500px', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Polygon positions={mockPolygon} color="blue" />
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VerificationWorkspace({ liveData, liveScores, processedImage }) {
  const renderInput = (label, value, score) => {
    // Treat invalid or missing scores as requires verification, or < 85
    const numScore = parseFloat(score);
    const requiresVerification = isNaN(numScore) || numScore < 85;
    
    return (
      <div className="mb-3">
        <label className="form-label fw-bold">{label}</label>
        <input
          type="text"
          className={`form-control ${requiresVerification ? 'border-danger' : ''}`}
          value={value || ''}
          readOnly
        />
        {requiresVerification && (
          <div className="form-text text-danger">Requires Manual Verification (Score: {numScore ? numScore.toFixed(1) : 'N/A'})</div>
        )}
      </div>
    );
  };

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        {/* Left Column: Document Viewer */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">Processed Document</h5>
            </div>
            <div className="card-body d-flex align-items-center justify-content-center bg-secondary bg-opacity-25" style={{ minHeight: '500px' }}>
              {processedImage ? (
                <img 
                  src={`data:image/jpeg;base64,${processedImage}`} 
                  alt="Cleaned Document" 
                  className="img-fluid shadow-sm rounded border" 
                  style={{ maxHeight: '420px', width: '100%', objectFit: 'contain' }}
                />
              ) : (
                <h3 className="text-muted">No Document Uploaded</h3>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Extraction Form */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">Extracted Data</h5>
            </div>
            <div className="card-body">
              {liveData ? (
                <form>
                  {renderInput('Owner Name', liveData.owner, liveScores?.owner)}
                  {renderInput('Khasra No.', liveData.khasra_no, liveScores?.khasra_no)}
                  {renderInput('Plot Area (sqm)', liveData.plot_area_sqm, liveScores?.plot_area_sqm)}
                  
                  <div className="mt-4 pt-3 border-top">
                    <button type="button" className="btn btn-success me-2">Approve</button>
                    <button type="button" className="btn btn-danger">Reject</button>
                  </div>
                </form>
              ) : (
                <p className="text-muted">Upload a document in the Dashboard to see extracted data.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  
  // Lifted State for OCR Extraction
  const [liveData, setLiveData] = useState(null);
  const [liveScores, setLiveScores] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);

  const handleDataExtracted = (data) => {
    setLiveData(data.extracted_data);
    setLiveScores(data.confidence_scores);
    setProcessedImage(data.processed_image);
    
    // Auto-switch to verification view to show the result
    setCurrentView('verification');
  };

  return (
    <div className="App bg-light min-vh-100 pb-5">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold" href="#">Intelligent Land Record System</a>
          
          <div className="d-flex">
            <div className="btn-group" role="group">
              <button 
                type="button" 
                className={`btn ${currentView === 'dashboard' ? 'btn-light' : 'btn-outline-light'}`}
                onClick={() => setCurrentView('dashboard')}
              >
                Dashboard
              </button>
              <button 
                type="button" 
                className={`btn ${currentView === 'verification' ? 'btn-light' : 'btn-outline-light'}`}
                onClick={() => setCurrentView('verification')}
              >
                Verification Workspace
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      {currentView === 'dashboard' ? (
        <AdminDashboard onDataExtracted={handleDataExtracted} />
      ) : (
        <VerificationWorkspace 
          liveData={liveData} 
          liveScores={liveScores} 
          processedImage={processedImage} 
        />
      )}
    </div>
  );
}

export default App;

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  UploadCloud,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  FileText,
  Database,
  User,
  Calendar,
  MapPin,
  Terminal,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon
} from 'lucide-react';

interface AadhaarData {
  id?: string;
  aadhaarNumber: string;
  name: string;
  dob: string;
  gender: string;
  address: string;
  pincode: string;
  frontImage: string;
  backImage: string;
  rawTextFront?: string;
  rawTextBack?: string;
  createdAt?: string;
}

const API_BASE_URL = 'http://localhost:5000/api/aadhaar';
const BACKEND_URL = 'http://localhost:5000';

export default function App() {
  // File upload states
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);

  // Core application states
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AadhaarData | null>(null);
  const [history, setHistory] = useState<AadhaarData[]>([]);
  
  // Collapsible section states
  const [showRawJSON, setShowRawJSON] = useState<boolean>(false);

  // File input refs
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  // Fetch past OCR results on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/history`);
      if (response.data && response.data.status) {
        setHistory(response.data.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch OCR history:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
      setError('Please select a valid image file (PNG, JPG, JPEG, or WEBP).');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'front') {
        setFrontFile(file);
        setFrontPreview(reader.result as string);
      } else {
        setBackFile(file);
        setBackPreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, type: 'front' | 'back') => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
      setError('Please drop a valid image file (PNG, JPG, JPEG, or WEBP).');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'front') {
        setFrontFile(file);
        setFrontPreview(reader.result as string);
      } else {
        setBackFile(file);
        setBackPreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleParse = async () => {
    if (!frontFile || !backFile) {
      setError('Please upload both the front and back images of your Aadhaar card.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('frontImage', frontFile);
    formData.append('backImage', backFile);

    try {
      const response = await axios.post(`${API_BASE_URL}/ocr`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.status) {
        setResult(response.data.data);
        // Refresh past history logs
        fetchHistory();
      } else {
        setError(response.data.message || 'An error occurred during parsing.');
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Failed to connect to backend server. Make sure the server is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = (item: AadhaarData) => {
    setResult(item);
    // Set previews to the historical static file links
    setFrontPreview(`${BACKEND_URL}/${item.frontImage}`);
    setBackPreview(`${BACKEND_URL}/${item.backImage}`);
    // Reset file states so user knows they are viewing history
    setFrontFile(null);
    setBackFile(null);
    // Scroll smoothly to results
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleReset = () => {
    setFrontFile(null);
    setBackFile(null);
    setFrontPreview(null);
    setBackPreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <h1 className="app-title">Aadhaar OCR System</h1>
        <p className="app-subtitle">
          Extract fields from front & back Aadhaar card images using local OCR intelligence
        </p>
      </header>

      {/* Main Grid */}
      <main className="main-grid">
        
        {/* Left Column: Uploaders */}
        <section className="upload-card-container">
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UploadCloud size={22} className="text-cyan-400" />
              Upload Aadhaar Card
            </h2>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem', color: '#fca5a5', fontSize: '0.9rem' }}>
                <AlertCircle size={20} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Front Uploader */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Aadhaar Front Side</label>
              
              {frontPreview ? (
                <div className={`upload-preview ${loading ? 'scanner-container' : ''}`}>
                  {loading && <div className="scanner-line"></div>}
                  <img src={frontPreview} alt="Aadhaar Front Preview" />
                  <button
                    onClick={() => { setFrontFile(null); setFrontPreview(null); }}
                    disabled={loading}
                    style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(15, 23, 42, 0.85)', color: '#f8fafc', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div
                  className="upload-zone"
                  onClick={() => frontInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'front')}
                >
                  <input
                    type="file"
                    ref={frontInputRef}
                    onChange={(e) => handleFileChange(e, 'front')}
                    style={{ display: 'none' }}
                    accept="image/*"
                  />
                  <ImageIcon size={36} style={{ color: '#94a3b8', marginBottom: '0.75rem' }} />
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>Click or Drag front image here</p>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.8rem' }}>Supports PNG, JPG, JPEG, WEBP</p>
                </div>
              )}
            </div>

            {/* Back Uploader */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Aadhaar Back Side</label>
              
              {backPreview ? (
                <div className={`upload-preview ${loading ? 'scanner-container' : ''}`}>
                  {loading && <div className="scanner-line"></div>}
                  <img src={backPreview} alt="Aadhaar Back Preview" />
                  <button
                    onClick={() => { setBackFile(null); setBackPreview(null); }}
                    disabled={loading}
                    style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(15, 23, 42, 0.85)', color: '#f8fafc', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div
                  className="upload-zone"
                  onClick={() => backInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'back')}
                >
                  <input
                    type="file"
                    ref={backInputRef}
                    onChange={(e) => handleFileChange(e, 'back')}
                    style={{ display: 'none' }}
                    accept="image/*"
                  />
                  <ImageIcon size={36} style={{ color: '#94a3b8', marginBottom: '0.75rem' }} />
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>Click or Drag back image here</p>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.8rem' }}>Supports PNG, JPG, JPEG, WEBP</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                className="btn-cyan-glow"
                style={{ flex: 1, padding: '0.85rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                disabled={loading || !frontPreview || !backPreview}
                onClick={handleParse}
              >
                {loading ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>PARSING TEXT...</span>
                  </>
                ) : (
                  <span>PARSE AADHAAR</span>
                )}
              </button>
              
              <button
                onClick={handleReset}
                disabled={loading || (!frontPreview && !backPreview && !result)}
                style={{ background: 'rgba(31, 41, 55, 0.4)', color: '#f8fafc', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '0.85rem 1.2rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', opacity: (loading || (!frontPreview && !backPreview && !result)) ? 0.5 : 1 }}
              >
                Reset
              </button>
            </div>
          </div>
        </section>

        {/* Right Column: Results */}
        <section>
          {loading ? (
            <div className="glass-panel-glow" style={{ padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
              <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '2rem' }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '4px solid rgba(6, 182, 212, 0.1)', borderTopColor: '#06b6d4', animation: 'spin 1.2s infinite linear' }}></div>
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem', color: '#06b6d4' }}>Running Character Recognition</h3>
              <p style={{ color: '#94a3b8', maxWidth: '350px', margin: 0, fontSize: '0.95rem' }}>
                Extracting textual datasets from Aadhaar front & back images. This may take up to 15-20 seconds...
              </p>
            </div>
          ) : result ? (
            <div className="glass-panel-glow">
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={20} className="text-emerald-400" />
                  <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1.1rem' }}>Extracted Data</span>
                </div>
                <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.25rem 0.6rem', borderRadius: '20px', fontWeight: 700 }}>
                  PARSED
                </span>
              </div>

              {/* Editable Form Fields */}
              <div className="result-form">
                
                {/* Aadhaar Number */}
                <div className="form-group">
                  <label className="form-label">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FileText size={14} /> Aadhaar Number
                    </span>
                  </label>
                  <input
                    type="text"
                    className="form-input code-font"
                    value={result.aadhaarNumber}
                    readOnly
                  />
                </div>

                {/* Name */}
                <div className="form-group">
                  <label className="form-label">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <User size={14} /> Name
                    </span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={result.name}
                    readOnly
                  />
                </div>

                {/* Date of Birth */}
                <div className="form-group">
                  <label className="form-label">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={14} /> Date of Birth
                    </span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={result.dob}
                    readOnly
                  />
                </div>

                {/* Gender */}
                <div className="form-group">
                  <label className="form-label">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <User size={14} /> Gender
                    </span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={result.gender}
                    readOnly
                  />
                </div>

                {/* Address */}
                <div className="form-group form-full-width">
                  <label className="form-label">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={14} /> Address
                    </span>
                  </label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={result.address}
                    readOnly
                    style={{ resize: 'none' }}
                  />
                </div>

                {/* Pincode */}
                <div className="form-group">
                  <label className="form-label">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={14} /> Pincode
                    </span>
                  </label>
                  <input
                    type="text"
                    className="form-input code-font"
                    value={result.pincode}
                    readOnly
                  />
                </div>
              </div>

              {/* API JSON Response collapser */}
              <div style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
                <button
                  onClick={() => setShowRawJSON(!showRawJSON)}
                  style={{ width: '100%', background: 'rgba(31, 41, 55, 0.3)', border: '1px solid rgba(255, 255, 255, 0.05)', color: '#94a3b8', padding: '0.65rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.85rem' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Terminal size={14} />
                    View Raw API Response
                  </span>
                  {showRawJSON ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {showRawJSON && (
                  <div className="terminal-container">
                    <div className="terminal-header">
                      <div className="terminal-dots">
                        <div className="terminal-dot" style={{ backgroundColor: '#ef4444' }}></div>
                        <div className="terminal-dot" style={{ backgroundColor: '#eab308' }}></div>
                        <div className="terminal-dot" style={{ backgroundColor: '#22c55e' }}></div>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }} className="code-font">response.json</span>
                    </div>
                    <pre className="terminal-body code-font" style={{ fontSize: '0.85rem', color: '#a7f3d0', margin: 0 }}>
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', borderStyle: 'dashed' }}>
              <FileText size={48} style={{ color: '#475569', marginBottom: '1.25rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>Awaiting OCR Input</h3>
              <p style={{ color: '#64748b', maxWidth: '320px', margin: 0, fontSize: '0.9rem' }}>
                Upload both front and back images on the left side, then click "Parse Aadhaar" to run Optical Character Recognition.
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Database History Section */}
      <section className="history-section">
        <h2 className="history-title">
          <Database size={24} className="text-cyan-400" />
          OCR Audit History Logs
        </h2>

        {history.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
            No past OCR records found. Upload a card to create the first audit record in MongoDB.
          </div>
        ) : (
          <div className="history-grid">
            {history.map((item) => (
              <div
                key={item.id || item.aadhaarNumber + item.createdAt}
                className="glass-panel history-card"
                onClick={() => handleHistoryClick(item)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#e2e8f0' }}>{item.name}</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>UID:</span>
                    <span className="code-font" style={{ color: '#67e8f9', fontWeight: 500 }}>
                      {item.aadhaarNumber.replace(/(\d{4})/g, '$1 ').trim()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>DOB:</span>
                    <span>{item.dob}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Gender:</span>
                    <span>{item.gender}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

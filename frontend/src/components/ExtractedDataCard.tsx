import React from 'react';
import { CheckCircle, FileText, User, Calendar, MapPin, Terminal, ChevronUp, ChevronDown } from 'lucide-react';
import type { AadhaarData } from '../types';

interface ExtractedDataCardProps {
  result: AadhaarData | null;
  loading: boolean;
  showRawJSON: boolean;
  onToggleRawJSON: () => void;
}

export const ExtractedDataCard: React.FC<ExtractedDataCardProps> = ({
  result,
  loading,
  showRawJSON,
  onToggleRawJSON,
}) => {
  if (loading) {
    return (
      <div className="glass-panel-glow" style={{ padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '2rem' }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '4px solid rgba(6, 182, 212, 0.1)', borderTopColor: '#06b6d4', animation: 'spin 1.2s infinite linear' }}></div>
        </div>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem', color: '#06b6d4' }}>Running Character Recognition</h3>
        <p style={{ color: '#94a3b8', maxWidth: '350px', margin: 0, fontSize: '0.95rem' }}>
          Extracting textual datasets from Aadhaar front & back images. This may take up to 15-20 seconds...
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', borderStyle: 'dashed' }}>
        <FileText size={48} style={{ color: '#475569', marginBottom: '1.25rem' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>Awaiting OCR Input</h3>
        <p style={{ color: '#64748b', maxWidth: '320px', margin: 0, fontSize: '0.9rem' }}>
          Upload both front and back images on the left side, then click "Parse Aadhaar" to run Optical Character Recognition.
        </p>
      </div>
    );
  }

  return (
    <section>
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
            <div className="form-input" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {(() => {
                const normalizedGender = (result.gender || '').trim().toUpperCase();
                if (normalizedGender === 'MALE') {
                  return (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                      background: 'rgba(59,130,246,0.18)', color: '#60a5fa',
                      border: '1px solid rgba(59,130,246,0.35)',
                      borderRadius: '20px', padding: '0.2rem 0.8rem', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.04em'
                    }}>
                      ♂ MALE
                    </span>
                  );
                }
                if (normalizedGender === 'FEMALE') {
                  return (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                      background: 'rgba(236,72,153,0.18)', color: '#f472b6',
                      border: '1px solid rgba(236,72,153,0.35)',
                      borderRadius: '20px', padding: '0.2rem 0.8rem', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.04em'
                    }}>
                      ♀ FEMALE
                    </span>
                  );
                }
                if (normalizedGender === 'TRANSGENDER') {
                  return (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                      background: 'rgba(139,92,246,0.18)', color: '#a78bfa',
                      border: '1px solid rgba(139,92,246,0.35)',
                      borderRadius: '20px', padding: '0.2rem 0.8rem', fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.04em'
                    }}>
                      ⚧ TRANSGENDER
                    </span>
                  );
                }
                return (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    background: 'rgba(100,116,139,0.18)', color: '#94a3b8',
                    border: '1px solid rgba(100,116,139,0.3)',
                    borderRadius: '20px', padding: '0.2rem 0.8rem', fontWeight: 600, fontSize: '0.88rem'
                  }}>
                    {result.gender || 'Not Found'}
                  </span>
                );
              })()}
            </div>
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
            type="button"
            onClick={onToggleRawJSON}
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
    </section>
  );
};

import React from 'react';
import { Database } from 'lucide-react';
import type { AadhaarData } from '../types';

interface HistoryLogsProps {
  history: AadhaarData[];
  onHistoryClick: (item: AadhaarData) => void;
}

export const HistoryLogs: React.FC<HistoryLogsProps> = ({ history, onHistoryClick }) => {
  return (
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
              key={item.id || item.aadhaarNumber + (item.createdAt || '')}
              className="glass-panel history-card"
              onClick={() => onHistoryClick(item)}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Gender:</span>
                  {(() => {
                    const normalizedGender = (item.gender || '').trim().toUpperCase();
                    return (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center',
                        background: normalizedGender === 'MALE'
                          ? 'rgba(59,130,246,0.18)'
                          : normalizedGender === 'FEMALE'
                          ? 'rgba(236,72,153,0.18)'
                          : normalizedGender === 'TRANSGENDER'
                          ? 'rgba(139,92,246,0.18)'
                          : 'rgba(100,116,139,0.18)',
                        color: normalizedGender === 'MALE'
                          ? '#60a5fa'
                          : normalizedGender === 'FEMALE'
                          ? '#f472b6'
                          : normalizedGender === 'TRANSGENDER'
                          ? '#a78bfa'
                          : '#94a3b8',
                        border: normalizedGender === 'MALE'
                          ? '1px solid rgba(59,130,246,0.35)'
                          : normalizedGender === 'FEMALE'
                          ? '1px solid rgba(236,72,153,0.35)'
                          : normalizedGender === 'TRANSGENDER'
                          ? '1px solid rgba(139,92,246,0.35)'
                          : '1px solid rgba(100,116,139,0.3)',
                        borderRadius: '20px', padding: '0.1rem 0.6rem',
                        fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.03em'
                      }}>
                        {normalizedGender === 'MALE' ? '♂ MALE'
                          : normalizedGender === 'FEMALE' ? '♀ FEMALE'
                          : normalizedGender === 'TRANSGENDER' ? '⚧ TRANSGENDER'
                          : item.gender || 'Not Found'}
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

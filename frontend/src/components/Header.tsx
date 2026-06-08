import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="app-header">
      <h1 className="app-title">Aadhaar OCR System</h1>
      <p className="app-subtitle">
        Extract fields from front & back Aadhaar card images using local OCR intelligence
      </p>
    </header>
  );
};

import { useState, useEffect, useCallback } from 'react';
import { aadhaarService } from './api/aadhaarService';
import { Header } from './components/Header';
import { UploadCard } from './components/UploadCard';
import { ExtractedDataCard } from './components/ExtractedDataCard';
import { HistoryLogs } from './components/HistoryLogs';
import { useToast } from './components/useToast';
import type { AadhaarData } from './types';

// Safely extract an error message from an unknown catch value
const getErrorMessage = (err: unknown, fallback: string): string => {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return fallback;
};

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:5000';

export default function App() {
  const { showError, showSuccess } = useToast();

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

  const fetchHistory = useCallback(async () => {
    try {
      const data = await aadhaarService.getHistory();
      setHistory(data);
    } catch (err: unknown) {
      console.error('Failed to fetch OCR history:', err);
      showError(getErrorMessage(err, 'Failed to retrieve OCR history logs.'));
    }
  }, [showError]);

  // Fetch past OCR results on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHistory();
  }, [fetchHistory]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
      const msg = 'Please select a valid image file (PNG, JPG, JPEG, or WEBP).';
      setError(msg);
      showError(msg);
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
      const msg = 'Please drop a valid image file (PNG, JPG, JPEG, or WEBP).';
      setError(msg);
      showError(msg);
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
      const msg = 'Please upload both the front and back images of your Aadhaar card.';
      setError(msg);
      showError(msg);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await aadhaarService.performOCR(frontFile, backFile);
      setResult(data);
      showSuccess('Aadhaar card parsed successfully!');
      // Refresh past history logs
      fetchHistory();
    } catch (err: unknown) {
      console.error(err);
      setError(getErrorMessage(err, 'Failed to connect to backend server. Make sure the server is running.'));
      showError(getErrorMessage(err, 'Failed to connect to backend server.'));
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = (item: AadhaarData) => {
    setResult(item);
    // Set previews to the historical static file links
    setFrontPreview(item.frontImage.startsWith('data:') ? item.frontImage : `${BACKEND_URL}/${item.frontImage}`);
    setBackPreview(item.backImage.startsWith('data:') ? item.backImage : `${BACKEND_URL}/${item.backImage}`);
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

  const handleRemovePreview = (type: 'front' | 'back') => {
    if (type === 'front') {
      setFrontFile(null);
      setFrontPreview(null);
    } else {
      setBackFile(null);
      setBackPreview(null);
    }
  };

  return (
    <div className="app-container">
      <Header />

      <main className="main-grid">
        <UploadCard
          frontPreview={frontPreview}
          backPreview={backPreview}
          loading={loading}
          error={error}
          onFileChange={handleFileChange}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onParse={handleParse}
          onReset={handleReset}
          onRemovePreview={handleRemovePreview}
          hasResult={!!result}
        />

        <ExtractedDataCard
          result={result}
          loading={loading}
          showRawJSON={showRawJSON}
          onToggleRawJSON={() => setShowRawJSON(!showRawJSON)}
        />
      </main>

      <HistoryLogs
        history={history}
        onHistoryClick={handleHistoryClick}
      />
    </div>
  );
}

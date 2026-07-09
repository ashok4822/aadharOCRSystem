import React, { useRef, useState, useEffect } from "react";
import {
  UploadCloud,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";

interface UploadCardProps {
  frontPreview: string | null;
  backPreview: string | null;
  loading: boolean;
  error: string | null;
  onFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "front" | "back",
  ) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, type: "front" | "back") => void;
  onParse: () => void;
  onReset: () => void;
  onRemovePreview: (type: "front" | "back") => void;
  hasResult: boolean;
}

export const UploadCard: React.FC<UploadCardProps> = ({
  frontPreview,
  backPreview,
  loading,
  error,
  onFileChange,
  onDragOver,
  onDrop,
  onParse,
  onReset,
  onRemovePreview,
  hasResult,
}) => {
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  // Elapsed time counter: derive elapsed from a startTime ref to avoid
  // synchronous setState in the effect body (react-hooks/set-state-in-effect).
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startTimeRef = useRef<number>(0);
  useEffect(() => {
    if (!loading) return;
    startTimeRef.current = Date.now();
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [loading]);

  return (
    <section className="upload-card-container">
      <div className="glass-panel" style={{ padding: "1.75rem" }}>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <UploadCloud size={22} className="text-cyan-400" />
          Upload Aadhaar Card
        </h2>

        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              padding: "1rem",
              borderRadius: "8px",
              marginBottom: "1.25rem",
              color: "#fca5a5",
              fontSize: "0.9rem",
            }}
          >
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Front Uploader */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            className="form-label"
            style={{ display: "block", marginBottom: "0.5rem" }}
          >
            Aadhaar Front Side
          </label>

          {frontPreview ? (
            <div
              className={`upload-preview ${loading ? "scanner-container" : ""}`}
            >
              {loading && <div className="scanner-line"></div>}
              <img src={frontPreview} alt="Aadhaar Front Preview" />
              <button
                type="button"
                onClick={() => onRemovePreview("front")}
                disabled={loading}
                style={{
                  position: "absolute",
                  top: "0.5rem",
                  right: "0.5rem",
                  background: "rgba(15, 23, 42, 0.85)",
                  color: "#f8fafc",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  padding: "0.4rem 0.8rem",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                Change
              </button>
            </div>
          ) : (
            <div
              className="upload-zone"
              onClick={() => frontInputRef.current?.click()}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, "front")}
            >
              <input
                type="file"
                ref={frontInputRef}
                onChange={(e) => onFileChange(e, "front")}
                style={{ display: "none" }}
                accept="image/*"
              />
              <ImageIcon
                size={36}
                style={{ color: "#94a3b8", marginBottom: "0.75rem" }}
              />
              <p style={{ margin: 0, fontWeight: 600, fontSize: "0.95rem" }}>
                Click or Drag front image here
              </p>
              <p
                style={{
                  margin: "0.25rem 0 0 0",
                  color: "#64748b",
                  fontSize: "0.8rem",
                }}
              >
                Supports PNG, JPG, JPEG, WEBP
              </p>
            </div>
          )}
        </div>

        {/* Back Uploader */}
        <div style={{ marginBottom: "1.75rem" }}>
          <label
            className="form-label"
            style={{ display: "block", marginBottom: "0.5rem" }}
          >
            Aadhaar Back Side
          </label>

          {backPreview ? (
            <div
              className={`upload-preview ${loading ? "scanner-container" : ""}`}
            >
              {loading && <div className="scanner-line"></div>}
              <img src={backPreview} alt="Aadhaar Back Preview" />
              <button
                type="button"
                onClick={() => onRemovePreview("back")}
                disabled={loading}
                style={{
                  position: "absolute",
                  top: "0.5rem",
                  right: "0.5rem",
                  background: "rgba(15, 23, 42, 0.85)",
                  color: "#f8fafc",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  padding: "0.4rem 0.8rem",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                Change
              </button>
            </div>
          ) : (
            <div
              className="upload-zone"
              onClick={() => backInputRef.current?.click()}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, "back")}
            >
              <input
                type="file"
                ref={backInputRef}
                onChange={(e) => onFileChange(e, "back")}
                style={{ display: "none" }}
                accept="image/*"
              />
              <ImageIcon
                size={36}
                style={{ color: "#94a3b8", marginBottom: "0.75rem" }}
              />
              <p style={{ margin: 0, fontWeight: 600, fontSize: "0.95rem" }}>
                Click or Drag back image here
              </p>
              <p
                style={{
                  margin: "0.25rem 0 0 0",
                  color: "#64748b",
                  fontSize: "0.8rem",
                }}
              >
                Supports PNG, JPG, JPEG, WEBP
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            type="button"
            className="btn-cyan-glow"
            style={{
              flex: 1,
              padding: "0.85rem",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
            disabled={loading || !frontPreview || !backPreview}
            onClick={onParse}
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>PARSING TEXT... ({elapsedSeconds}s)</span>
              </>
            ) : (
              <span>PARSE AADHAAR</span>
            )}
          </button>

          <button
            type="button"
            onClick={onReset}
            disabled={loading || (!frontPreview && !backPreview && !hasResult)}
            style={{
              background: "rgba(31, 41, 55, 0.4)",
              color: "#f8fafc",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              padding: "0.85rem 1.2rem",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: "pointer",
              opacity:
                loading || (!frontPreview && !backPreview && !hasResult)
                  ? 0.5
                  : 1,
            }}
          >
            Reset
          </button>
        </div>
      </div>
    </section>
  );
};

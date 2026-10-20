import { useEffect } from "react";
import "./Toast.css";

export default function Toast({ message, onClose, duration = 2500 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  if (!message) return null;

  return (
    <div className="toast-message" role="status">
      <p>{message}</p>
      <button type="button" aria-label="Dismiss" onClick={() => onClose?.()}>
        ×
      </button>
    </div>
  );
}

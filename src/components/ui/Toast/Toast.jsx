import { useEffect, useRef } from "react";
import "./Toast.css";

export default function Toast({ message, onClose, duration = 2500 }) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onCloseRef.current?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration]);

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

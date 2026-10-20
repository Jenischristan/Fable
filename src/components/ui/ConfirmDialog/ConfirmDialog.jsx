import { useId, useState } from "react";
import Modal from "../Modal/Modal";
import "./ConfirmDialog.css";

export default function ConfirmDialog({
  open,
  title,
  message,
  options,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onClose,
}) {
  const groupName = useId();
  const [selected, setSelected] = useState("");

  const handleClose = () => {
    setSelected("");
    onClose?.();
  };

  const handleConfirm = () => {
    if (options && !selected) return;
    const value = options ? selected : true;
    setSelected("");
    onConfirm?.(value);
    onClose?.();
  };

  return (
    <Modal open={open} onClose={handleClose} title={title}>
      {message && <p className="confirm-dialog-message">{message}</p>}

      {options && (
        <div className="confirm-dialog-options" role="radiogroup" aria-label={title}>
          {options.map((option) => (
            <label
              key={option}
              className={`confirm-dialog-option ${
                selected === option ? "confirm-dialog-option-selected" : ""
              }`}
            >
              <input
                type="radio"
                name={groupName}
                value={option}
                checked={selected === option}
                onChange={() => setSelected(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      )}

      <div className="confirm-dialog-actions">
        <button
          type="button"
          className="confirm-dialog-cancel"
          onClick={handleClose}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          className={`confirm-dialog-confirm ${
            danger ? "confirm-dialog-confirm-danger" : ""
          }`}
          onClick={handleConfirm}
          disabled={options && !selected}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

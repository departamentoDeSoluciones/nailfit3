import { createPortal } from "react-dom";
import "./Modal.css";
import { Button } from "./Button";
interface ModalProps {
  message: string | null | undefined;
  onClose: () => void;
  buttonText?: string;
  onButtonClick?: () => void;
}
export const Modal = ({ message, onClose, buttonText, onButtonClick }: ModalProps) => {
  if (!message) return null;
  const handleAction = onButtonClick ? onButtonClick : onClose;
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>
        <p>{message}</p>
        {buttonText && (
          <div style={{ marginTop: "15px" }}>
            <Button onClick={handleAction}>{buttonText}</Button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

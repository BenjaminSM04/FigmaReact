import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon.jsx';

/**
 * Diálogo accesible. En pantallas grandes es un cuadro centrado y en móvil una hoja inferior.
 * Cierra con Escape o al pulsar el fondo, atrapa el foco y bloquea el scroll del fondo.
 */
export default function Modal({ title, icon = 'alert', tone = 'danger', onClose, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const previous = document.activeElement;
    const dialog = dialogRef.current;
    const focusable = () => dialog.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
    (focusable()[0] ?? dialog).focus();
    document.body.style.overflow = 'hidden';

    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const items = [...focusable()];
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [onClose]);

  return createPortal(
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" ref={dialogRef} tabIndex={-1}>
        <span className="modal__handle" aria-hidden="true" />
        <button type="button" className="modal__close" onClick={onClose} aria-label="Cerrar">
          <Icon name="x" size={20} />
        </button>
        <div className={`modal__icon modal__icon--${tone}`}>
          <Icon name={icon} size={28} />
        </div>
        <h2 id="modal-title" className="modal__title">
          {title}
        </h2>
        {children}
      </div>
    </div>,
    document.body,
  );
}

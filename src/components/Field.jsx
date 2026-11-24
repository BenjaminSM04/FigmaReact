import { useId } from 'react';

/** Campo de formulario con etiqueta, ayuda y mensaje de error accesibles. */
export default function Field({ label, error, hint, as: Tag = 'input', id, className = '', children, ...props }) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const describedBy = [error && `${fieldId}-error`, hint && `${fieldId}-hint`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`field${className ? ` ${className}` : ''}`}>
      <label htmlFor={fieldId} className="field__label">
        {label}
      </label>
      <Tag id={fieldId} className={`field__control${error ? ' is-invalid' : ''}`} aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...props}>
        {children}
      </Tag>
      {hint && !error && (
        <p id={`${fieldId}-hint`} className="field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${fieldId}-error`} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}

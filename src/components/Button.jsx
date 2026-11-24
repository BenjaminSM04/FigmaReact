import { Link } from 'react-router-dom';

/**
 * Botón. variant: primary (ámbar) | secondary | outline | danger.
 * Si recibe `to` se renderiza como enlace.
 */
export default function Button({ variant = 'primary', block = false, to, className = '', children, ...rest }) {
  const cls = `btn btn--${variant}${block ? ' btn--block' : ''}${className ? ` ${className}` : ''}`;
  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}

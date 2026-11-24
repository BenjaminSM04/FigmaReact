import { initials } from '../lib/user.js';

export default function Avatar({ nombre, size = 36 }) {
  return (
    <span className="avatar" style={{ width: size, height: size }} aria-hidden="true">
      {initials(nombre)}
    </span>
  );
}

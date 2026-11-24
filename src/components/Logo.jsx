import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';

export default function Logo({ to = '/', light = false }) {
  return (
    <Link to={to} className={`logo${light ? ' logo--light' : ''}`} aria-label="Sistemas, ir al inicio">
      <span className="logo__mark">
        <Icon name="hotel" size={20} />
      </span>
      <span className="logo__name">Sistemas</span>
    </Link>
  );
}

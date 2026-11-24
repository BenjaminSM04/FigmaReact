import { Link } from 'react-router-dom';
import { formatBs } from '../lib/format.js';
import Icon from './Icon.jsx';

export default function HotelCard({ hotel, priceFrom, to }) {
  return (
    <Link to={to} className="hotel-card">
      <div className="hotel-card__image" aria-hidden="true">
        <Icon name="hotel" size={44} />
      </div>
      <div className="hotel-card__body">
        <h3 className="hotel-card__name">{hotel.name}</h3>
        <p className="hotel-card__zone">
          <Icon name="pin" size={14} />
          {hotel.zone}
        </p>
        <p className="hotel-card__price">{priceFrom ? `Desde ${formatBs(priceFrom)} / noche` : 'Sin habitaciones disponibles'}</p>
      </div>
    </Link>
  );
}

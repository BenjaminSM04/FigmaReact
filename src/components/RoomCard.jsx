import { formatBs, pluralize } from '../lib/format.js';
import Button from './Button.jsx';
import Icon from './Icon.jsx';

const AMENITY_ICON = { 'Desayuno incluido': 'coffee', 'Wi-Fi': 'wifi', 'Vista a la ciudad': 'mountain' };

/** Horizontal en pantallas grandes, vertical en móvil (se resuelve con CSS). */
export default function RoomCard({ room, hotel, nights, to }) {
  return (
    <article className="room-card">
      <div className="room-card__image" aria-hidden="true">
        <Icon name="bed" size={44} />
      </div>
      <div className="room-card__body">
        <p className="room-card__hotel">
          {hotel.name} · Hab. {room.number}
        </p>
        <h3 className="room-card__title">{room.type === 'Suite' ? 'Suite Panorámica' : `Habitación ${room.type}`}</h3>
        <p className="room-card__desc">{room.description}</p>
        <ul className="room-card__meta">
          <li>
            <Icon name="user" size={16} />
            {pluralize(room.capacity, 'huésped', 'huéspedes')}
          </li>
          <li>
            <Icon name="bed" size={16} />
            {room.beds}
          </li>
          {room.amenities.map((a) => (
            <li key={a} className="room-card__amenity">
              <Icon name={AMENITY_ICON[a] ?? 'check'} size={16} />
              {a}
            </li>
          ))}
        </ul>
      </div>
      <div className="room-card__side">
        <div className="room-card__price">
          <strong>{formatBs(room.price)}</strong>
          <span>por noche</span>
          <span className="room-card__total">
            {formatBs(room.price * nights)} · {pluralize(nights, 'noche', 'noches')}
          </span>
        </div>
        <Button to={to} aria-label={`Reservar ${room.type} ${room.number} en ${hotel.name}`}>
          Reservar
        </Button>
      </div>
    </article>
  );
}

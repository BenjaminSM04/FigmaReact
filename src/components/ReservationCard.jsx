import { useStore } from '../context/StoreContext.jsx';
import { displayStatus, canClientCancel } from '../lib/reservations.js';
import { formatBs, formatDate, formatRange, pluralize } from '../lib/format.js';
import Button from './Button.jsx';
import Icon from './Icon.jsx';
import StatusChip from './StatusChip.jsx';

/** Tarjeta de una reserva en "Mis reservas". */
export default function ReservationCard({ reservation, onCancel }) {
  const { getHotel, getRoom } = useStore();
  const room = getRoom(reservation.roomId);
  const hotel = getHotel(reservation.hotelId);
  const status = displayStatus(reservation);
  const cancellable = canClientCancel(reservation);

  return (
    <article className="res-card">
      <div className={`res-card__icon res-card__icon--${status === 'Cancelada' ? 'bad' : 'ok'}`} aria-hidden="true">
        <Icon name="bed" size={26} />
      </div>
      <div className="res-card__main">
        <p className="res-card__code">Reserva {reservation.code}</p>
        <h3 className="res-card__title">
          {room ? `Habitación ${room.type}` : 'Habitación eliminada'} <span>· {hotel?.name}</span>
        </h3>
        <p className="res-card__dates">
          <Icon name="calendar" size={14} />
          {formatRange(reservation.checkIn, reservation.checkOut)} · {pluralize(reservation.nights, 'noche', 'noches')}
        </p>
      </div>
      <div className="res-card__total">
        <span>Total</span>
        <strong>{formatBs(reservation.total)}</strong>
      </div>
      <div className="res-card__status">
        <StatusChip status={status} />
      </div>
      <div className="res-card__action">
        {cancellable && (
          <Button variant="danger" onClick={() => onCancel(reservation)} aria-label={`Cancelar reserva ${reservation.code}`}>
            Cancelar reserva
          </Button>
        )}
        {status === 'Confirmada' && !cancellable && <p className="res-card__hint">Solo se cancela hasta 24 h antes de la llegada. Contacta al hotel.</p>}
        {status === 'Cancelada' && reservation.cancelledAt && <p className="res-card__hint">Cancelada el {formatDate(reservation.cancelledAt.slice(0, 10))}</p>}
      </div>
    </article>
  );
}

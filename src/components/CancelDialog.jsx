import { useStore } from '../context/StoreContext.jsx';
import { formatBs, formatRange } from '../lib/format.js';
import Button from './Button.jsx';
import Icon from './Icon.jsx';
import Modal from './Modal.jsx';

/** Confirmación de cancelación, compartida por el cliente y el administrador. */
export default function CancelDialog({ reservation, asAdmin = false, onConfirm, onClose }) {
  const { getHotel, getRoom } = useStore();
  const room = getRoom(reservation.roomId);
  const hotel = getHotel(reservation.hotelId);

  return (
    <Modal title="¿Cancelar esta reserva?" onClose={onClose}>
      <p className="modal__text">Esta acción liberará la habitación para otros huéspedes. No podrás deshacerla.</p>
      <dl className="summary-box">
        <div>
          <dt>Reserva</dt>
          <dd className="strong">{reservation.code}</dd>
        </div>
        {asAdmin && (
          <div>
            <dt>Huésped</dt>
            <dd>{reservation.guest.nombre}</dd>
          </div>
        )}
        <div>
          <dt>Habitación</dt>
          <dd>{room ? `${room.type} · ${hotel?.name.replace('Sistemas ', '')}` : 'Habitación eliminada'}</dd>
        </div>
        <div>
          <dt>Fechas</dt>
          <dd>{formatRange(reservation.checkIn, reservation.checkOut)}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd>{formatBs(reservation.total)}</dd>
        </div>
      </dl>
      <p className="modal__note">
        <Icon name="check" size={16} />
        {asAdmin ? 'Cancelas como administrador. La habitación quedará libre en esas fechas.' : 'Cancelación gratuita: faltan más de 24 horas para la llegada.'}
      </p>
      <div className="modal__actions">
        <Button variant="outline" onClick={onClose}>
          Mantener reserva
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Sí, cancelar reserva
        </Button>
      </div>
    </Modal>
  );
}

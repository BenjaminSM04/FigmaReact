import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Field from '../components/Field.jsx';
import Icon from '../components/Icon.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { formatBs, formatDateLong, pluralize } from '../lib/format.js';
import { isRoomFree } from '../lib/reservations.js';
import { readSearch, searchToQuery } from '../lib/search.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s-]{7,}$/;

function Steps({ current }) {
  const items = ['Habitación', 'Tus datos', 'Confirmación'];
  return (
    <ol className="stepper" aria-label="Progreso de la reserva">
      {items.map((label, i) => {
        const n = i + 1;
        const state = n < current ? 'done' : n === current ? 'on' : 'off';
        return (
          <li key={label} className={`stepper__item stepper__item--${state}`} aria-current={state === 'on' ? 'step' : undefined}>
            <span className="stepper__dot">{state === 'done' ? <Icon name="check" size={14} /> : n}</span>
            {label}
          </li>
        );
      })}
    </ol>
  );
}

export default function Checkout() {
  const { roomId } = useParams();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const { hotels, rooms, reservations, getRoom, getHotel, addReservation } = useStore();
  const navigate = useNavigate();
  const search = readSearch(params, hotels);
  const room = getRoom(roomId);

  const [guest, setGuest] = useState({ nombre: user.nombre, ci: '', correo: user.email, telefono: '', notas: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [confirmed, setConfirmed] = useState(null);

  if (!room) {
    return (
      <div className="container page">
        <div className="empty">
          <Icon name="alert" size={40} />
          <h1>Esa habitación ya no existe</h1>
          <Button to="/habitaciones">Ver habitaciones</Button>
        </div>
      </div>
    );
  }

  const hotel = getHotel(room.hotelId);
  const total = room.price * search.noches;
  const backTo = `/habitaciones?${searchToQuery({ ...search, hotel: room.hotelId })}`;
  const tooManyGuests = search.huespedes > room.capacity;
  const unavailable = !confirmed && !isRoomFree(room, reservations, search.desde, search.hasta);

  const set = (key) => (e) => {
    setGuest((g) => ({ ...g, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
    setFormError('');
  };

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (guest.nombre.trim().length < 2) next.nombre = 'Escribe el nombre completo.';
    if (guest.ci.trim().length < 5) next.ci = 'Escribe tu carnet de identidad.';
    if (!EMAIL_RE.test(guest.correo.trim())) next.correo = 'Escribe un correo válido.';
    if (!PHONE_RE.test(guest.telefono.trim())) next.telefono = 'Escribe un teléfono válido.';
    setErrors(next);
    if (Object.keys(next).length) return;
    if (tooManyGuests || unavailable) return;

    const result = addReservation({
      userId: user.id,
      roomId: room.id,
      hotelId: room.hotelId,
      checkIn: search.desde,
      checkOut: search.hasta,
      guests: search.huespedes,
      nights: search.noches,
      pricePerNight: room.price,
      total,
      guest: { ...guest, nombre: guest.nombre.trim(), correo: guest.correo.trim(), telefono: guest.telefono.trim(), ci: guest.ci.trim(), notas: guest.notas.trim() },
    });
    if (!result.ok) return setFormError(result.error);
    setConfirmed(result.reservation);
    window.scrollTo({ top: 0 });
  };

  const blocked = tooManyGuests || unavailable;
  const roomTitle = room.type === 'Suite' ? 'Suite Panorámica' : `Habitación ${room.type}`;

  if (confirmed) {
    return (
      <div className="container page">
        <Steps current={4} />
        <div className="success">
          <span className="success__icon">
            <Icon name="check" size={32} />
          </span>
          <h1>¡Reserva confirmada!</h1>
          <p>
            Tu código es <strong>{confirmed.code}</strong>. Te esperamos en {hotel.name}.
          </p>
          <dl className="summary-box">
            <div>
              <dt>Habitación</dt>
              <dd>{roomTitle}</dd>
            </div>
            <div>
              <dt>Llegada</dt>
              <dd>{formatDateLong(confirmed.checkIn)} · desde 14:00</dd>
            </div>
            <div>
              <dt>Salida</dt>
              <dd>{formatDateLong(confirmed.checkOut)} · hasta 12:00</dd>
            </div>
            <div>
              <dt>Total a pagar en el hotel</dt>
              <dd className="strong">{formatBs(confirmed.total)}</dd>
            </div>
          </dl>
          <div className="success__actions">
            <Button onClick={() => navigate('/mis-reservas')}>Ver mis reservas</Button>
            <Button variant="outline" to="/">
              Volver al inicio
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container page">
      <header className="page__head page__head--stack">
        <Link to={backTo} className="back-link">
          <Icon name="back" size={18} />
          Volver a habitaciones
        </Link>
        <h1 className="page__title">Confirma tu reserva</h1>
        <Steps current={2} />
      </header>

      {(tooManyGuests || unavailable) && (
        <p className="form-error" role="alert">
          {tooManyGuests ? `Esta habitación admite hasta ${pluralize(room.capacity, 'huésped', 'huéspedes')}. Cambia la búsqueda.` : 'Esta habitación ya no está disponible en esas fechas.'}{' '}
          <Link to={backTo}>Elegir otra habitación</Link>
        </p>
      )}

      <div className="checkout">
        <form id="checkout-form" className="card checkout__form" onSubmit={submit} noValidate>
          <h2 className="card__title">Datos del huésped</h2>
          <div className="form-grid">
            <Field label="Nombre completo" autoComplete="name" value={guest.nombre} onChange={set('nombre')} error={errors.nombre} />
            <Field label="Carnet de identidad" autoComplete="off" value={guest.ci} onChange={set('ci')} error={errors.ci} placeholder="6543210 LP" />
            <Field label="Correo electrónico" type="email" autoComplete="email" value={guest.correo} onChange={set('correo')} error={errors.correo} />
            <Field label="Teléfono" type="tel" autoComplete="tel" value={guest.telefono} onChange={set('telefono')} error={errors.telefono} placeholder="+591 7 123 4567" />
          </div>
          <Field as="textarea" rows="3" label="Solicitudes especiales (opcional)" value={guest.notas} onChange={set('notas')} placeholder="Ej.: llegada tardía, después de las 22:00" />
          <div className="note note--warm">
            <Icon name="clock" size={20} />
            <div>
              <strong>Cancelación gratuita</strong>
              <p>Puedes cancelar sin costo hasta 24 horas antes de la llegada, desde Mis reservas.</p>
            </div>
          </div>
          {formError && (
            <p className="form-error" role="alert">
              {formError}
            </p>
          )}
        </form>

        <aside className="card summary" aria-label="Resumen de la reserva">
          <div className="summary__image" aria-hidden="true">
            <Icon name="bed" size={40} />
          </div>
          <div className="summary__body">
            <div>
              <h2 className="summary__title">{roomTitle}</h2>
              <p className="summary__hotel">
                {hotel.name} · {hotel.zone}
              </p>
            </div>
            <dl className="rows">
              <div>
                <dt>Llegada</dt>
                <dd>{formatDateLong(search.desde)}</dd>
              </div>
              <div>
                <dt>Salida</dt>
                <dd>{formatDateLong(search.hasta)}</dd>
              </div>
              <div>
                <dt>Huéspedes</dt>
                <dd>{pluralize(search.huespedes, 'adulto', 'adultos')}</dd>
              </div>
            </dl>
            <dl className="rows">
              <div>
                <dt>
                  {formatBs(room.price)} × {pluralize(search.noches, 'noche', 'noches')}
                </dt>
                <dd>{formatBs(total)}</dd>
              </div>
            </dl>
            <div className="summary__total">
              <span>Total</span>
              <strong>{formatBs(total)}</strong>
            </div>
            <Button type="submit" form="checkout-form" block className="summary__cta" disabled={blocked}>
              Confirmar reserva
            </Button>
            <Button variant="outline" block to={backTo} className="summary__back">
              Volver a habitaciones
            </Button>
            <p className="summary__foot">El pago se realiza directamente en el hotel.</p>
          </div>
        </aside>
      </div>

      <div className="sticky-cta">
        <div>
          <span>Total</span>
          <strong>{formatBs(total)}</strong>
        </div>
        <Button type="submit" form="checkout-form" disabled={blocked}>
          Confirmar reserva
        </Button>
      </div>
    </div>
  );
}

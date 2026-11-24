import { useMemo, useState } from 'react';
import Button from '../../components/Button.jsx';
import Field from '../../components/Field.jsx';
import Icon from '../../components/Icon.jsx';
import Modal from '../../components/Modal.jsx';
import StatusChip from '../../components/StatusChip.jsx';
import { useStore } from '../../context/StoreContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { AMENITIES, ROOM_TYPES } from '../../data/seed.js';
import { formatBs, pluralize } from '../../lib/format.js';

const TYPES = Object.keys(ROOM_TYPES);

function blankRoom(hotelId) {
  const t = ROOM_TYPES.Doble;
  return { hotelId, number: '', type: 'Doble', capacity: t.capacity, beds: t.beds, price: t.price, description: t.description, amenities: ['Wi-Fi'], status: 'Disponible' };
}

/** Formulario para crear o editar una habitación. */
function RoomForm({ initial, hotels, onSave, onClose }) {
  const isNew = !initial.id;
  const [room, setRoom] = useState({ ...initial, capacity: String(initial.capacity), price: String(initial.price) });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const set = (key) => (e) => {
    setRoom((r) => ({ ...r, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
    setFormError('');
  };

  // Al cambiar el tipo en una habitación nueva se sugieren sus valores habituales.
  const setType = (e) => {
    const type = e.target.value;
    const t = ROOM_TYPES[type];
    setRoom((r) => (isNew ? { ...r, type, capacity: String(t.capacity), beds: t.beds, price: String(t.price), description: t.description } : { ...r, type }));
  };

  const toggleAmenity = (a) =>
    setRoom((r) => ({ ...r, amenities: r.amenities.includes(a) ? r.amenities.filter((x) => x !== a) : [...r.amenities, a] }));

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!room.number.trim()) next.number = 'Escribe el número de habitación.';
    const capacity = Number(room.capacity);
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 6) next.capacity = 'Entre 1 y 6 huéspedes.';
    const price = Number(room.price);
    if (!Number.isFinite(price) || price < 1) next.price = 'Escribe una tarifa mayor a 0.';
    if (!room.beds.trim()) next.beds = 'Describe las camas.';
    setErrors(next);
    if (Object.keys(next).length) return;
    const result = onSave({ ...room, number: room.number.trim(), beds: room.beds.trim(), description: room.description.trim(), capacity, price: Math.round(price) });
    if (!result.ok) setFormError(result.error);
  };

  return (
    <Modal title={isNew ? 'Nueva habitación' : 'Editar habitación'} icon={isNew ? 'plus' : 'edit'} tone="info" onClose={onClose}>
      <form className="room-form" onSubmit={submit} noValidate>
        <div className="form-grid">
          <Field as="select" label="Hotel" value={room.hotelId} onChange={set('hotelId')}>
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </Field>
          <Field label="Número" value={room.number} onChange={set('number')} error={errors.number} placeholder="204" />
          <Field as="select" label="Tipo" value={room.type} onChange={setType}>
            {TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Field>
          <Field label="Capacidad (huéspedes)" type="number" min="1" max="6" value={room.capacity} onChange={set('capacity')} error={errors.capacity} />
          <Field label="Camas" value={room.beds} onChange={set('beds')} error={errors.beds} />
          <Field label="Tarifa por noche (Bs)" type="number" min="1" value={room.price} onChange={set('price')} error={errors.price} />
          <Field as="select" label="Estado" value={room.status} onChange={set('status')}>
            <option>Disponible</option>
            <option>Mantenimiento</option>
          </Field>
        </div>
        <Field as="textarea" rows="2" label="Descripción" value={room.description} onChange={set('description')} />
        <fieldset className="room-form__amenities">
          <legend>Servicios</legend>
          {AMENITIES.map((a) => (
            <label key={a} className="check">
              <input type="checkbox" checked={room.amenities.includes(a)} onChange={() => toggleAmenity(a)} />
              <span className="check__box" aria-hidden="true">
                <Icon name="check" size={12} />
              </span>
              {a}
            </label>
          ))}
        </fieldset>
        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}
        <div className="modal__actions">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">{isNew ? 'Crear habitación' : 'Guardar cambios'}</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminRooms() {
  const { hotels, rooms, getHotel, saveRoom, deleteRoom } = useStore();
  const toast = useToast();
  const [hotelFilter, setHotelFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);

  const list = useMemo(
    () =>
      rooms
        .filter((r) => !hotelFilter || r.hotelId === hotelFilter)
        .sort((a, b) => a.hotelId.localeCompare(b.hotelId) || a.number.localeCompare(b.number, 'es', { numeric: true })),
    [rooms, hotelFilter],
  );

  const save = (room) => {
    const result = saveRoom(room);
    if (result.ok) {
      toast(room.id ? 'Habitación actualizada.' : 'Habitación creada.');
      setEditing(null);
    }
    return result;
  };

  const confirmDelete = () => {
    const result = deleteRoom(removing.id);
    toast(result.ok ? 'Habitación eliminada.' : result.error, result.ok ? 'success' : 'error');
    setRemoving(null);
  };

  const label = (r) => `${r.type} ${r.number}`;
  const actions = (r) => (
    <div className="row-actions">
      <button type="button" className="text-action" onClick={() => setEditing(r)} aria-label={`Editar ${label(r)} en ${getHotel(r.hotelId).name}`}>
        <Icon name="edit" size={14} />
        Editar
      </button>
      <button type="button" className="text-action text-action--danger" onClick={() => setRemoving(r)} aria-label={`Eliminar ${label(r)} en ${getHotel(r.hotelId).name}`}>
        <Icon name="trash" size={14} />
        Eliminar
      </button>
    </div>
  );

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <h1 className="page__title">Habitaciones</h1>
          <p className="page__lead">Gestiona tipos, tarifas y disponibilidad por hotel.</p>
        </div>
        <div className="admin-filters admin-filters--rooms">
          <Field as="select" label="Hotel" value={hotelFilter} onChange={(e) => setHotelFilter(e.target.value)}>
            <option value="">Todos</option>
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name.replace('Sistemas ', '')}
              </option>
            ))}
          </Field>
          <Button onClick={() => setEditing(blankRoom(hotelFilter || hotels[0].id))}>
            <Icon name="plus" size={18} />
            Nueva habitación
          </Button>
        </div>
      </header>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Habitación</th>
              <th scope="col">Hotel</th>
              <th scope="col">Capacidad</th>
              <th scope="col">Tarifa por noche</th>
              <th scope="col">Estado</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id}>
                <th scope="row">{label(r)}</th>
                <td>{getHotel(r.hotelId).name.replace('Sistemas ', '')}</td>
                <td>{pluralize(r.capacity, 'huésped', 'huéspedes')}</td>
                <td>{formatBs(r.price)}</td>
                <td>
                  <StatusChip status={r.status} />
                </td>
                <td>{actions(r)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="card-list">
        {list.map((r) => (
          <li key={r.id} className="mini-card">
            <div className="mini-card__top">
              <strong>{label(r)}</strong>
              <StatusChip status={r.status} />
            </div>
            <p className="muted">
              {getHotel(r.hotelId).name.replace('Sistemas ', '')} · {pluralize(r.capacity, 'huésped', 'huéspedes')}
            </p>
            <p className="price">{formatBs(r.price)} por noche</p>
            <div className="mini-card__bottom">{actions(r)}</div>
          </li>
        ))}
      </ul>

      {editing && <RoomForm initial={editing} hotels={hotels} onSave={save} onClose={() => setEditing(null)} />}

      {removing && (
        <Modal title="¿Eliminar esta habitación?" icon="trash" onClose={() => setRemoving(null)}>
          <p className="modal__text">
            Se eliminará {label(removing)} de {getHotel(removing.hotelId).name}. Las reservas pasadas conservan su historial. No se puede deshacer.
          </p>
          <div className="modal__actions">
            <Button variant="outline" onClick={() => setRemoving(null)}>
              Conservar
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Sí, eliminar
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

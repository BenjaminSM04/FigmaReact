import { useMemo, useState } from 'react';
import CancelDialog from '../../components/CancelDialog.jsx';
import Field from '../../components/Field.jsx';
import Icon from '../../components/Icon.jsx';
import StatusChip from '../../components/StatusChip.jsx';
import { useStore } from '../../context/StoreContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { formatBs, formatRange } from '../../lib/format.js';
import { adminStats, canAdminCancel, displayStatus } from '../../lib/reservations.js';

function Stat({ icon, tone, label, value }) {
  return (
    <div className="stat">
      <span className={`stat__icon stat__icon--${tone}`}>
        <Icon name={icon} size={22} />
      </span>
      <div>
        <p className="stat__label">{label}</p>
        <p className="stat__value">{value}</p>
      </div>
    </div>
  );
}

export default function AdminReservations() {
  const { hotels, rooms, reservations, getHotel, getRoom, cancelReservation } = useStore();
  const toast = useToast();
  const [filters, setFilters] = useState({ hotel: '', estado: '', q: '' });
  const [target, setTarget] = useState(null);

  const stats = useMemo(() => adminStats(reservations, rooms), [reservations, rooms]);

  const list = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return reservations
      .filter((r) => !filters.hotel || r.hotelId === filters.hotel)
      .filter((r) => !filters.estado || displayStatus(r) === filters.estado)
      .filter((r) => !q || r.code.toLowerCase().includes(q) || r.guest.nombre.toLowerCase().includes(q))
      .sort((a, b) => b.checkIn.localeCompare(a.checkIn));
  }, [reservations, filters]);

  const set = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }));

  const confirmCancel = () => {
    cancelReservation(target.id, 'administrador');
    toast(`Reserva ${target.code} cancelada.`);
    setTarget(null);
  };

  const describe = (r) => {
    const room = getRoom(r.roomId);
    const hotel = getHotel(r.hotelId);
    return `${hotel?.name.replace('Sistemas ', '')} · ${room ? room.type : 'Habitación eliminada'}`;
  };

  const action = (r) =>
    canAdminCancel(r) ? (
      <button type="button" className="text-action text-action--danger" onClick={() => setTarget(r)} aria-label={`Cancelar reserva ${r.code}`}>
        <Icon name="x" size={14} />
        Cancelar
      </button>
    ) : (
      <span className="muted" aria-label="Sin acciones">
        —
      </span>
    );

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <h1 className="page__title">Reservas</h1>
          <p className="page__lead">Todas las reservas de la cadena. Puedes cancelar cualquiera.</p>
        </div>
        <div className="admin-filters">
          <Field as="select" label="Hotel" value={filters.hotel} onChange={set('hotel')}>
            <option value="">Todos</option>
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name.replace('Sistemas ', '')}
              </option>
            ))}
          </Field>
          <Field as="select" label="Estado" value={filters.estado} onChange={set('estado')}>
            <option value="">Todos</option>
            <option>Confirmada</option>
            <option>Cancelada</option>
            <option>Finalizada</option>
          </Field>
          <Field label="Buscar" type="search" placeholder="Código o cliente" value={filters.q} onChange={set('q')} />
        </div>
      </header>

      <div className="stats">
        <Stat icon="calendar" tone="teal" label="Reservas activas" value={stats.active} />
        <Stat icon="chart" tone="green" label="Ocupación hoy" value={`${stats.occupancy}%`} />
        <Stat icon="bed" tone="amber" label="Habitaciones libres" value={stats.freeToday} />
        <Stat icon="x" tone="red" label="Canceladas (mes)" value={stats.cancelledMonth} />
      </div>

      {list.length === 0 ? (
        <div className="empty">
          <Icon name="search" size={40} />
          <h2>Sin resultados</h2>
          <p>Ninguna reserva coincide con los filtros.</p>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Código</th>
                  <th scope="col">Cliente</th>
                  <th scope="col">Hotel y habitación</th>
                  <th scope="col">Fechas</th>
                  <th scope="col">Total</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Acción</th>
                </tr>
              </thead>
              <tbody>
                {list.map((r) => (
                  <tr key={r.id}>
                    <th scope="row">{r.code}</th>
                    <td>{r.guest.nombre}</td>
                    <td>{describe(r)}</td>
                    <td>{formatRange(r.checkIn, r.checkOut)}</td>
                    <td>{formatBs(r.total)}</td>
                    <td>
                      <StatusChip status={displayStatus(r)} />
                    </td>
                    <td>{action(r)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="card-list">
            {list.map((r) => (
              <li key={r.id} className="mini-card">
                <div className="mini-card__top">
                  <strong>{r.code}</strong>
                  <StatusChip status={displayStatus(r)} />
                </div>
                <p>{r.guest.nombre}</p>
                <p className="muted">
                  {describe(r)} · {formatRange(r.checkIn, r.checkOut)}
                </p>
                <div className="mini-card__bottom">
                  <strong className="price">{formatBs(r.total)}</strong>
                  {action(r)}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {target && <CancelDialog reservation={target} asAdmin onConfirm={confirmCancel} onClose={() => setTarget(null)} />}
    </div>
  );
}

import { useState } from 'react';
import Button from '../components/Button.jsx';
import CancelDialog from '../components/CancelDialog.jsx';
import Icon from '../components/Icon.jsx';
import ReservationCard from '../components/ReservationCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { displayStatus } from '../lib/reservations.js';

const TABS = ['Todas', 'Confirmadas', 'Canceladas', 'Finalizadas'];
const TAB_STATUS = { Confirmadas: 'Confirmada', Canceladas: 'Cancelada', Finalizadas: 'Finalizada' };

/** Próximas primero (la más cercana arriba); el resto, de la más reciente a la más antigua. */
function sortReservations(list) {
  const upcoming = list.filter((r) => displayStatus(r) === 'Confirmada').sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  const rest = list.filter((r) => displayStatus(r) !== 'Confirmada').sort((a, b) => b.checkIn.localeCompare(a.checkIn));
  return [...upcoming, ...rest];
}

export default function MyReservations() {
  const { user } = useAuth();
  const { reservations, cancelReservation } = useStore();
  const toast = useToast();
  const [tab, setTab] = useState('Todas');
  const [target, setTarget] = useState(null);

  const mine = sortReservations(reservations.filter((r) => r.userId === user.id));
  const count = (t) => (t === 'Todas' ? mine.length : mine.filter((r) => displayStatus(r) === TAB_STATUS[t]).length);
  const visible = tab === 'Todas' ? mine : mine.filter((r) => displayStatus(r) === TAB_STATUS[tab]);

  const confirmCancel = () => {
    cancelReservation(target.id, 'cliente');
    toast(`Reserva ${target.code} cancelada.`);
    setTarget(null);
  };

  return (
    <div className="container page">
      <header className="page__head">
        <div>
          <h1 className="page__title">Mis reservas</h1>
          <p className="page__lead">Consulta y cancela tus reservas.</p>
        </div>
        <Button to="/habitaciones">Nueva reserva</Button>
      </header>

      <div className="tabs" role="tablist" aria-label="Filtrar reservas">
        {TABS.map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} className={`tabs__tab${tab === t ? ' is-active' : ''}`} onClick={() => setTab(t)}>
            {t} <span>({count(t)})</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="empty">
          <Icon name="calendar" size={40} />
          <h2>{mine.length === 0 ? 'Aún no tienes reservas' : 'No hay reservas en esta categoría'}</h2>
          <p>{mine.length === 0 ? 'Busca una habitación y reserva en pocos pasos.' : 'Prueba con otra pestaña.'}</p>
          {mine.length === 0 && <Button to="/habitaciones">Buscar habitaciones</Button>}
        </div>
      ) : (
        <div className="res-list stagger">
          {visible.map((r) => (
            <ReservationCard key={r.id} reservation={r} onCancel={setTarget} />
          ))}
        </div>
      )}

      {target && <CancelDialog reservation={target} onConfirm={confirmCancel} onClose={() => setTarget(null)} />}
    </div>
  );
}

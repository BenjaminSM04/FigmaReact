const TONES = { Confirmada: 'ok', Cancelada: 'bad', Finalizada: 'muted', Disponible: 'ok', Mantenimiento: 'warn' };

export default function StatusChip({ status }) {
  return (
    <span className={`chip chip--${TONES[status] ?? 'muted'}`}>
      <span className="chip__dot" aria-hidden="true" />
      {status}
    </span>
  );
}

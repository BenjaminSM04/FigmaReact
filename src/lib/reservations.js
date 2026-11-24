import { nightsBetween, parseDate, toISO } from './format.js';

/** Horas mínimas de anticipación para cancelar sin intervención del administrador. */
export const CANCEL_WINDOW_HOURS = 24;
/** Hora de llegada (check-in) usada para calcular la ventana de cancelación. */
export const CHECK_IN_HOUR = 14;

/** Dos rangos [in, out) se cruzan. Las fechas ISO se comparan como texto. */
export function rangesOverlap(aIn, aOut, bIn, bOut) {
  return aIn < bOut && bIn < aOut;
}

export function isRoomFree(room, reservations, checkIn, checkOut) {
  if (room.status !== 'Disponible') return false;
  return !reservations.some(
    (r) => r.roomId === room.id && r.status === 'Confirmada' && rangesOverlap(r.checkIn, r.checkOut, checkIn, checkOut),
  );
}

/** Estado que se muestra al usuario: una reserva confirmada ya terminada es "Finalizada". */
export function displayStatus(res, now = new Date()) {
  if (res.status === 'Cancelada') return 'Cancelada';
  return res.checkOut <= toISO(now) ? 'Finalizada' : 'Confirmada';
}

export function hoursUntilCheckIn(res, now = new Date()) {
  const arrival = parseDate(res.checkIn);
  arrival.setHours(CHECK_IN_HOUR, 0, 0, 0);
  return (arrival - now) / 3600000;
}

/** El cliente solo cancela hasta 24 horas antes de la llegada. */
export function canClientCancel(res, now = new Date()) {
  return displayStatus(res, now) === 'Confirmada' && hoursUntilCheckIn(res, now) >= CANCEL_WINDOW_HOURS;
}

/** El administrador puede cancelar cualquier reserva vigente. */
export function canAdminCancel(res, now = new Date()) {
  return displayStatus(res, now) === 'Confirmada';
}

export function nextCode(reservations) {
  const max = reservations.reduce((acc, r) => Math.max(acc, Number(r.code.replace(/\D/g, '')) || 0), 1000);
  return `SIS-${max + 1}`;
}

export function priceFrom(rooms, hotelId) {
  const prices = rooms.filter((r) => r.hotelId === hotelId && r.status === 'Disponible').map((r) => r.price);
  return prices.length ? Math.min(...prices) : null;
}

export function bookingTotal(room, checkIn, checkOut) {
  const nights = nightsBetween(checkIn, checkOut);
  return { nights, total: nights * room.price };
}

/** Indicadores del panel de administración. */
export function adminStats(reservations, rooms, now = new Date()) {
  const today = toISO(now);
  const month = today.slice(0, 7);
  const active = reservations.filter((r) => displayStatus(r, now) === 'Confirmada');
  const occupiedIds = new Set(active.filter((r) => r.checkIn <= today && today < r.checkOut).map((r) => r.roomId));
  const operative = rooms.filter((r) => r.status === 'Disponible');
  const occupied = operative.filter((r) => occupiedIds.has(r.id)).length;
  return {
    active: active.length,
    occupancy: operative.length ? Math.round((occupied / operative.length) * 100) : 0,
    freeToday: operative.length - occupied,
    cancelledMonth: reservations.filter((r) => r.status === 'Cancelada' && (r.cancelledAt || '').slice(0, 7) === month).length,
  };
}

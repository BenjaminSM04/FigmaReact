import { addDays, isValidISO, nightsBetween, todayISO } from './format.js';

export const MAX_GUESTS = 4;

/** Lee y corrige los parámetros de búsqueda de la URL. */
export function readSearch(params, hotels) {
  const today = todayISO();
  let desde = params.get('desde');
  if (!isValidISO(desde) || desde < today) desde = addDays(today, 3);
  let hasta = params.get('hasta');
  if (!isValidISO(hasta) || hasta <= desde) hasta = addDays(desde, 3);
  const huespedes = Math.min(MAX_GUESTS, Math.max(1, Number(params.get('huespedes')) || 2));
  const hotelParam = params.get('hotel');
  const hotel = hotels.some((h) => h.id === hotelParam) ? hotelParam : '';
  return { hotel, desde, hasta, huespedes, noches: nightsBetween(desde, hasta) };
}

export function searchToQuery({ hotel, desde, hasta, huespedes }) {
  const q = new URLSearchParams({ desde, hasta, huespedes: String(huespedes) });
  if (hotel) q.set('hotel', hotel);
  return q.toString();
}

/** Valida el formulario de búsqueda y devuelve un mensaje de error, o '' si todo está bien. */
export function validateSearch({ desde, hasta }) {
  const today = todayISO();
  if (!isValidISO(desde) || !isValidISO(hasta)) return 'Elige las fechas de llegada y salida.';
  if (desde < today) return 'La fecha de llegada no puede ser anterior a hoy.';
  if (hasta <= desde) return 'La salida debe ser posterior a la llegada.';
  return '';
}

import { addDays, todayISO } from '../lib/format.js';

export const DATA_VERSION = 1;

export const HOTELS = [
  { id: 'sopocachi', name: 'Sistemas Sopocachi', zone: 'Sopocachi, La Paz' },
  { id: 'centro', name: 'Sistemas Centro', zone: 'Av. 16 de Julio, El Prado' },
  { id: 'zona-sur', name: 'Sistemas Zona Sur', zone: 'Calacoto, La Paz' },
];

export const ROOM_TYPES = {
  Individual: { capacity: 1, beds: '1 cama individual', price: 220, description: 'Ideal para viajes de trabajo. Escritorio, baño privado y Wi-Fi.' },
  Doble: { capacity: 2, beds: '1 cama queen', price: 380, description: 'Vista a la ciudad, baño privado, desayuno incluido.' },
  Triple: { capacity: 3, beds: '1 queen + 1 individual', price: 480, description: 'Espacio para familias o grupos pequeños, con sala de estar.' },
  Suite: { capacity: 4, beds: '2 camas queen', price: 690, description: 'Sala independiente, vista al Illimani y desayuno incluido.' },
};

export const AMENITIES = ['Desayuno incluido', 'Wi-Fi', 'Vista a la ciudad'];

const room = (hotelId, number, type, price, amenities, status = 'Disponible') => ({
  id: `${hotelId}-${number}`,
  hotelId,
  number,
  type,
  capacity: ROOM_TYPES[type].capacity,
  beds: ROOM_TYPES[type].beds,
  description: ROOM_TYPES[type].description,
  price,
  amenities,
  status,
});

const SEED_ROOMS = [
  room('sopocachi', '101', 'Individual', 220, ['Wi-Fi']),
  room('sopocachi', '204', 'Doble', 380, ['Desayuno incluido', 'Wi-Fi', 'Vista a la ciudad']),
  room('sopocachi', '206', 'Doble', 360, ['Desayuno incluido', 'Wi-Fi']),
  room('sopocachi', '305', 'Triple', 480, ['Desayuno incluido', 'Wi-Fi']),
  room('sopocachi', '401', 'Suite', 690, ['Desayuno incluido', 'Wi-Fi', 'Vista a la ciudad']),
  room('centro', '102', 'Individual', 200, ['Wi-Fi']),
  room('centro', '112', 'Individual', 220, ['Wi-Fi'], 'Mantenimiento'),
  room('centro', '210', 'Doble', 340, ['Desayuno incluido', 'Wi-Fi']),
  room('centro', '305', 'Triple', 440, ['Wi-Fi']),
  room('centro', '402', 'Suite', 620, ['Desayuno incluido', 'Wi-Fi', 'Vista a la ciudad']),
  room('zona-sur', '112', 'Individual', 260, ['Wi-Fi'], 'Mantenimiento'),
  room('zona-sur', '208', 'Doble', 420, ['Desayuno incluido', 'Wi-Fi']),
  room('zona-sur', '212', 'Doble', 410, ['Desayuno incluido', 'Wi-Fi', 'Vista a la ciudad']),
  room('zona-sur', '310', 'Triple', 520, ['Desayuno incluido', 'Wi-Fi']),
  room('zona-sur', '501', 'Suite', 760, ['Desayuno incluido', 'Wi-Fi', 'Vista a la ciudad']),
];

// Cuentas de demostración. Las contraseñas se guardan en texto plano porque el
// proyecto es solo frontend y de demostración: NO usar en producción.
const SEED_USERS = [
  { id: 'u-maria', nombre: 'María Quispe Rojas', email: 'maria.quispe@correo.com', password: 'cliente123', role: 'cliente' },
  { id: 'u-admin', nombre: 'Admin Sistemas', email: 'admin@sistemas.bo', password: 'admin123', role: 'administrador' },
];

export const DEMO_ACCOUNTS = {
  cliente: { email: SEED_USERS[0].email, password: SEED_USERS[0].password },
  administrador: { email: SEED_USERS[1].email, password: SEED_USERS[1].password },
};

function reservation(n, userId, guestName, roomObj, from, to, status = 'Confirmada', extra = {}) {
  const nights = Math.max(1, Math.round((new Date(to) - new Date(from)) / 86400000));
  return {
    id: `r-${n}`,
    code: `SIS-${n}`,
    userId,
    roomId: roomObj.id,
    hotelId: roomObj.hotelId,
    checkIn: from,
    checkOut: to,
    guests: Math.min(2, roomObj.capacity),
    nights,
    pricePerNight: roomObj.price,
    total: nights * roomObj.price,
    status,
    guest: { nombre: guestName, ci: '', correo: '', telefono: '', notas: '' },
    createdAt: new Date().toISOString(),
    ...extra,
  };
}

/** Datos iniciales. Las fechas son relativas a hoy para que la demo siempre tenga sentido. */
export function createSeed(today = todayISO()) {
  const byId = (id) => SEED_ROOMS.find((r) => r.id === id);
  const d = (n) => addDays(today, n);
  const maria = 'María Quispe Rojas';
  return {
    version: DATA_VERSION,
    users: SEED_USERS,
    rooms: SEED_ROOMS,
    reservations: [
      reservation(1060, 'u-seed-1', 'Carlos Mamani', byId('zona-sur-310'), d(-1), d(2)),
      reservation(1051, 'u-maria', maria, byId('zona-sur-501'), d(16), d(18)),
      reservation(1045, 'u-seed-2', 'Rosa Limachi', byId('centro-210'), d(-1), d(1)),
      reservation(1042, 'u-maria', maria, byId('sopocachi-204'), d(7), d(10)),
      reservation(1038, 'u-seed-3', 'Lucía Condori', byId('centro-102'), d(1), d(2)),
      reservation(955, 'u-seed-4', 'Ana Flores', byId('sopocachi-305'), d(4), d(6)),
      reservation(987, 'u-maria', maria, byId('centro-102'), d(3), d(5), 'Cancelada', { cancelledAt: new Date().toISOString(), cancelledBy: 'cliente' }),
      reservation(902, 'u-maria', maria, byId('sopocachi-305'), d(-12), d(-10)),
    ],
  };
}

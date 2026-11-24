import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { createSeed, DATA_VERSION, HOTELS } from '../data/seed.js';
import { isRoomFree, nextCode } from '../lib/reservations.js';

/**
 * Almacén de datos de toda la aplicación. No hay base de datos ni servidor:
 * el estado vive en memoria y se guarda en localStorage del navegador.
 */
const STORAGE_KEY = 'sistemas:v1:data';

function load() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data && data.version === DATA_VERSION) return data;
    }
  } catch {
    // localStorage bloqueado o datos corruptos: se usan los datos de ejemplo.
  }
  return createSeed();
}

function reducer(state, action) {
  switch (action.type) {
    case 'replace':
      return action.state;
    case 'reset':
      return createSeed();
    case 'reservation/add':
      return { ...state, reservations: [action.reservation, ...state.reservations] };
    case 'reservation/cancel':
      return {
        ...state,
        reservations: state.reservations.map((r) =>
          r.id === action.id ? { ...r, status: 'Cancelada', cancelledAt: new Date().toISOString(), cancelledBy: action.by } : r,
        ),
      };
    case 'room/add':
      return { ...state, rooms: [...state.rooms, action.room] };
    case 'room/update':
      return { ...state, rooms: state.rooms.map((r) => (r.id === action.room.id ? action.room : r)) };
    case 'room/delete':
      return { ...state, rooms: state.rooms.filter((r) => r.id !== action.id) };
    case 'user/add':
      return { ...state, users: [...state.users, action.user] };
    default:
      return state;
  }
}

const StoreContext = createContext(null);

const newId = (prefix) => `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Guarda cada cambio en el navegador.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Sin espacio o bloqueado: la app sigue funcionando solo en memoria.
    }
  }, [state]);

  // Sincroniza varias pestañas abiertas.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          dispatch({ type: 'replace', state: JSON.parse(e.newValue) });
        } catch {
          /* ignorar */
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addReservation = useCallback((data) => {
    const s = stateRef.current;
    const room = s.rooms.find((r) => r.id === data.roomId);
    if (!room) return { ok: false, error: 'La habitación ya no existe.' };
    if (!isRoomFree(room, s.reservations, data.checkIn, data.checkOut)) {
      return { ok: false, error: 'La habitación ya no está disponible en esas fechas. Elige otra.' };
    }
    const reservation = {
      ...data,
      id: newId('r'),
      code: nextCode(s.reservations),
      status: 'Confirmada',
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'reservation/add', reservation });
    return { ok: true, reservation };
  }, []);

  const cancelReservation = useCallback((id, by) => dispatch({ type: 'reservation/cancel', id, by }), []);

  const saveRoom = useCallback((room) => {
    const s = stateRef.current;
    const duplicated = s.rooms.some((r) => r.id !== room.id && r.hotelId === room.hotelId && r.number.toLowerCase() === room.number.toLowerCase());
    if (duplicated) return { ok: false, error: 'Ya existe una habitación con ese número en este hotel.' };
    if (room.id && s.rooms.some((r) => r.id === room.id)) {
      dispatch({ type: 'room/update', room });
    } else {
      dispatch({ type: 'room/add', room: { ...room, id: newId('room') } });
    }
    return { ok: true };
  }, []);

  const deleteRoom = useCallback((id) => {
    const s = stateRef.current;
    const hasActive = s.reservations.some((r) => r.roomId === id && r.status === 'Confirmada' && r.checkOut > new Date().toISOString().slice(0, 10));
    if (hasActive) return { ok: false, error: 'La habitación tiene reservas vigentes. Cancélalas primero.' };
    dispatch({ type: 'room/delete', id });
    return { ok: true };
  }, []);

  const registerUser = useCallback((user) => {
    const s = stateRef.current;
    if (s.users.some((u) => u.email.toLowerCase() === user.email.toLowerCase())) {
      return { ok: false, error: 'Ya existe una cuenta con ese correo.' };
    }
    const created = { ...user, id: newId('u'), role: 'cliente' };
    dispatch({ type: 'user/add', user: created });
    return { ok: true, user: created };
  }, []);

  const resetDemo = useCallback(() => dispatch({ type: 'reset' }), []);

  const value = useMemo(
    () => ({
      hotels: HOTELS,
      rooms: state.rooms,
      reservations: state.reservations,
      users: state.users,
      getHotel: (id) => HOTELS.find((h) => h.id === id),
      getRoom: (id) => state.rooms.find((r) => r.id === id),
      addReservation,
      cancelReservation,
      saveRoom,
      deleteRoom,
      registerUser,
      resetDemo,
    }),
    [state, addReservation, cancelReservation, saveRoom, deleteRoom, registerUser, resetDemo],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore debe usarse dentro de <StoreProvider>');
  return ctx;
}

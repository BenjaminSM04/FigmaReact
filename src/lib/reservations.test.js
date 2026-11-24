import { describe, expect, it } from 'vitest';
import { adminStats, bookingTotal, canAdminCancel, canClientCancel, displayStatus, isRoomFree, nextCode, priceFrom, rangesOverlap } from './reservations.js';

const room = { id: 'a-1', hotelId: 'a', status: 'Disponible', price: 380 };
const res = (over = {}) => ({ id: 'r', code: 'SIS-1042', roomId: 'a-1', checkIn: '2026-12-12', checkOut: '2026-12-15', status: 'Confirmada', ...over });

describe('rangesOverlap', () => {
  it('detecta cruces', () => {
    expect(rangesOverlap('2026-12-12', '2026-12-15', '2026-12-14', '2026-12-16')).toBe(true);
  });
  it('permite salir y entrar el mismo día', () => {
    expect(rangesOverlap('2026-12-12', '2026-12-15', '2026-12-15', '2026-12-17')).toBe(false);
  });
});

describe('isRoomFree', () => {
  it('rechaza habitaciones en mantenimiento', () => {
    expect(isRoomFree({ ...room, status: 'Mantenimiento' }, [], '2026-12-01', '2026-12-02')).toBe(false);
  });
  it('rechaza fechas ocupadas por una reserva confirmada', () => {
    expect(isRoomFree(room, [res()], '2026-12-13', '2026-12-14')).toBe(false);
  });
  it('libera la habitación cuando la reserva fue cancelada', () => {
    expect(isRoomFree(room, [res({ status: 'Cancelada' })], '2026-12-13', '2026-12-14')).toBe(true);
  });
});

describe('estados y cancelación', () => {
  const now = new Date(2026, 10, 24, 16, 0); // 24 nov 2026, 16:00 (faltan 22 h para el check-in del 25 a las 14:00)
  it('marca como finalizada una reserva que ya terminó', () => {
    expect(displayStatus(res({ checkOut: '2026-11-20' }), now)).toBe('Finalizada');
    expect(displayStatus(res({ status: 'Cancelada', checkOut: '2026-11-20' }), now)).toBe('Cancelada');
  });
  it('el cliente cancela con más de 24 horas de anticipación', () => {
    expect(canClientCancel(res({ checkIn: '2026-12-12' }), now)).toBe(true);
  });
  it('el cliente no cancela dentro de las 24 horas previas', () => {
    expect(canClientCancel(res({ checkIn: '2026-11-25', checkOut: '2026-11-26' }), now)).toBe(false);
  });
  it('el administrador cancela aunque falte menos de 24 horas', () => {
    expect(canAdminCancel(res({ checkIn: '2026-11-25', checkOut: '2026-11-26' }), now)).toBe(true);
  });
  it('nadie cancela reservas canceladas o finalizadas', () => {
    expect(canAdminCancel(res({ status: 'Cancelada' }), now)).toBe(false);
    expect(canAdminCancel(res({ checkIn: '2026-11-10', checkOut: '2026-11-12' }), now)).toBe(false);
  });
});

describe('utilidades', () => {
  it('calcula noches y total', () => {
    expect(bookingTotal(room, '2026-12-12', '2026-12-15')).toEqual({ nights: 3, total: 1140 });
  });
  it('genera el siguiente código', () => {
    expect(nextCode([res({ code: 'SIS-1051' }), res({ code: 'SIS-0987' })])).toBe('SIS-1052');
    expect(nextCode([])).toBe('SIS-1001');
  });
  it('calcula el precio "desde" ignorando habitaciones en mantenimiento', () => {
    const rooms = [room, { ...room, id: 'a-2', price: 200, status: 'Mantenimiento' }, { ...room, id: 'a-3', price: 300 }];
    expect(priceFrom(rooms, 'a')).toBe(300);
    expect(priceFrom(rooms, 'otro')).toBeNull();
  });
  it('calcula indicadores del panel', () => {
    const now = new Date(2026, 11, 13, 10, 0);
    const rooms = [room, { ...room, id: 'a-2' }, { ...room, id: 'a-3', status: 'Mantenimiento' }];
    const stats = adminStats([res(), res({ id: 'x', status: 'Cancelada', cancelledAt: '2026-12-01T10:00:00.000Z' })], rooms, now);
    expect(stats).toEqual({ active: 1, occupancy: 50, freeToday: 1, cancelledMonth: 1 });
  });
});

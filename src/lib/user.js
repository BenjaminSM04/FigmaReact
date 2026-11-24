export function initials(nombre = '') {
  return (
    nombre
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join('') || '?'
  );
}

export const firstName = (nombre = '') => nombre.split(/\s+/)[0] ?? '';

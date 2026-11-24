import { useState } from 'react';
import { addDays, todayISO } from '../lib/format.js';
import { MAX_GUESTS, validateSearch } from '../lib/search.js';
import Button from './Button.jsx';
import Field from './Field.jsx';

/** Buscador de fechas, hotel y huéspedes (inicio y página de habitaciones). */
export default function SearchForm({ hotels, initial, submitLabel = 'Buscar habitaciones', onSubmit, className = '' }) {
  const [values, setValues] = useState(initial);
  const [error, setError] = useState('');
  const today = todayISO();

  const set = (key) => (e) => {
    const value = key === 'huespedes' ? Number(e.target.value) : e.target.value;
    setValues((v) => {
      const next = { ...v, [key]: value };
      // Si la salida deja de ser posterior a la llegada, se ajusta sola.
      if (key === 'desde' && next.hasta <= value) next.hasta = addDays(value, 1);
      return next;
    });
    setError('');
  };

  const submit = (e) => {
    e.preventDefault();
    const message = validateSearch(values);
    if (message) return setError(message);
    onSubmit(values);
  };

  return (
    <form className={`search-form ${className}`} onSubmit={submit} noValidate>
      <div className="search-form__fields">
        <Field as="select" label="Hotel" value={values.hotel} onChange={set('hotel')}>
          <option value="">Todos los hoteles</option>
          {hotels.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </Field>
        <Field label="Llegada" type="date" min={today} value={values.desde} onChange={set('desde')} />
        <Field label="Salida" type="date" min={addDays(values.desde || today, 1)} value={values.hasta} onChange={set('hasta')} />
        <Field as="select" label="Huéspedes" value={values.huespedes} onChange={set('huespedes')}>
          {Array.from({ length: MAX_GUESTS }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? 'huésped' : 'huéspedes'}
            </option>
          ))}
        </Field>
        <Button type="submit" className="search-form__submit">
          {submitLabel}
        </Button>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Icon from '../components/Icon.jsx';
import RoomCard from '../components/RoomCard.jsx';
import SearchForm from '../components/SearchForm.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { ROOM_TYPES, AMENITIES } from '../data/seed.js';
import { formatBs, formatRange, pluralize } from '../lib/format.js';
import { isRoomFree } from '../lib/reservations.js';
import { readSearch, searchToQuery } from '../lib/search.js';

const TYPES = Object.keys(ROOM_TYPES);

export default function Rooms() {
  const { hotels, rooms, reservations, getHotel } = useStore();
  const [params, setParams] = useSearchParams();
  const search = readSearch(params, hotels);

  const priceBound = useMemo(() => Math.ceil(Math.max(...rooms.map((r) => r.price), 100) / 50) * 50, [rooms]);
  const [types, setTypes] = useState(() => new Set(TYPES));
  const [maxPrice, setMaxPrice] = useState(priceBound);
  const [amenities, setAmenities] = useState(() => new Set());
  const [editing, setEditing] = useState(false);

  const effectiveMax = Math.min(maxPrice, priceBound);
  const filtersActive = types.size !== TYPES.length || effectiveMax < priceBound || amenities.size > 0;

  const available = useMemo(
    () =>
      rooms.filter(
        (r) => (!search.hotel || r.hotelId === search.hotel) && r.capacity >= search.huespedes && isRoomFree(r, reservations, search.desde, search.hasta),
      ),
    [rooms, reservations, search.hotel, search.huespedes, search.desde, search.hasta],
  );

  const results = useMemo(
    () =>
      available
        .filter((r) => types.has(r.type) && r.price <= effectiveMax && [...amenities].every((a) => r.amenities.includes(a)))
        .sort((a, b) => a.price - b.price),
    [available, types, effectiveMax, amenities],
  );

  const toggle = (set, setSet, value) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setSet(next);
  };

  const clearFilters = () => {
    setTypes(new Set(TYPES));
    setMaxPrice(priceBound);
    setAmenities(new Set());
  };

  const chipValue = types.size === TYPES.length ? 'Todas' : types.size === 1 ? [...types][0] : null;
  const pickChip = (value) => setTypes(new Set(value === 'Todas' ? TYPES : [value]));

  const applySearch = (values) => {
    setParams(new URLSearchParams(searchToQuery(values)));
    setEditing(false);
  };

  const hotelName = search.hotel ? getHotel(search.hotel).name : 'Todos los hoteles';

  return (
    <div className="container page">
      <header className="page__head">
        <div>
          <h1 className="page__title">Habitaciones disponibles</h1>
          <ul className="meta-list">
            <li>
              <Icon name="pin" size={16} />
              {hotelName}
            </li>
            <li>
              <Icon name="calendar" size={16} />
              {formatRange(search.desde, search.hasta)} · {pluralize(search.noches, 'noche', 'noches')}
            </li>
            <li>
              <Icon name="user" size={16} />
              {pluralize(search.huespedes, 'huésped', 'huéspedes')}
            </li>
          </ul>
        </div>
        <Button variant="outline" onClick={() => setEditing((v) => !v)} aria-expanded={editing}>
          {editing ? 'Cerrar búsqueda' : 'Editar búsqueda'}
        </Button>
      </header>

      {editing && (
        <div className="panel">
          <SearchForm hotels={hotels} initial={search} submitLabel="Actualizar" onSubmit={applySearch} />
        </div>
      )}

      <div className="chips" role="group" aria-label="Tipo de habitación">
        {['Todas', ...TYPES].map((t) => (
          <button key={t} type="button" className={`chip-filter${chipValue === t ? ' is-active' : ''}`} aria-pressed={chipValue === t} onClick={() => pickChip(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className="rooms-layout">
        <aside className="filters" aria-label="Filtros">
          <h2 className="filters__title">Filtros</h2>
          <fieldset>
            <legend>Tipo de habitación</legend>
            {TYPES.map((t) => (
              <label key={t} className="check">
                <input type="checkbox" checked={types.has(t)} onChange={() => toggle(types, setTypes, t)} />
                <span className="check__box" aria-hidden="true">
                  <Icon name="check" size={12} />
                </span>
                {t}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Precio por noche</legend>
            <input type="range" className="range" min="100" max={priceBound} step="10" value={effectiveMax} onChange={(e) => setMaxPrice(Number(e.target.value))} aria-label="Precio máximo por noche" />
            <p className="range__label">Hasta {formatBs(effectiveMax)}</p>
          </fieldset>
          <fieldset>
            <legend>Servicios</legend>
            {AMENITIES.map((a) => (
              <label key={a} className="check">
                <input type="checkbox" checked={amenities.has(a)} onChange={() => toggle(amenities, setAmenities, a)} />
                <span className="check__box" aria-hidden="true">
                  <Icon name="check" size={12} />
                </span>
                {a}
              </label>
            ))}
          </fieldset>
          {filtersActive && (
            <button type="button" className="link-button" onClick={clearFilters}>
              Quitar filtros
            </button>
          )}
        </aside>

        <section className="results" aria-live="polite">
          <p className="results__count">{pluralize(results.length, 'habitación disponible', 'habitaciones disponibles')}</p>
          {results.length === 0 ? (
            <div className="empty">
              <Icon name="bed" size={40} />
              <h2>No encontramos habitaciones</h2>
              <p>{available.length > 0 ? 'Ningún resultado coincide con tus filtros.' : 'No hay habitaciones libres para esas fechas y cantidad de huéspedes. Prueba con otras fechas u otro hotel.'}</p>
              {available.length > 0 ? (
                <Button variant="outline" onClick={clearFilters}>
                  Quitar filtros
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setEditing(true)}>
                  Editar búsqueda
                </Button>
              )}
            </div>
          ) : (
            <div className="results__list">
              {results.map((room) => (
                <RoomCard key={room.id} room={room} hotel={getHotel(room.hotelId)} nights={search.noches} to={`/reservar/${room.id}?${searchToQuery({ ...search, hotel: room.hotelId })}`} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

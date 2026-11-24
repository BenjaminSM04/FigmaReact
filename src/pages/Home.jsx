import { useNavigate } from 'react-router-dom';
import HotelCard from '../components/HotelCard.jsx';
import SearchForm from '../components/SearchForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { priceFrom } from '../lib/reservations.js';
import { readSearch, searchToQuery } from '../lib/search.js';
import { firstName } from '../lib/user.js';

const STEPS = [
  ['1', 'Elige fechas y hotel', 'Indica cuándo llegas, cuándo sales y cuántas personas viajan.'],
  ['2', 'Selecciona tu habitación', 'Compara tipos, capacidad y tarifa por noche en bolivianos.'],
  ['3', 'Confirma y gestiona', 'Revisa tus reservas y cancélalas desde tu cuenta cuando lo necesites.'],
];

export default function Home() {
  const { hotels, rooms } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const initial = readSearch(new URLSearchParams(), hotels);

  return (
    <>
      <section className="hero">
        <div className="hero__inner container">
          <p className="hero__eyebrow">Hola, {firstName(user.nombre)} · La Paz, Bolivia</p>
          <h1 className="hero__title">Encuentra tu habitación ideal en La Paz</h1>
          <p className="hero__sub">Elige fechas, compara habitaciones y reserva en pocos pasos.</p>
          <SearchForm hotels={hotels} initial={initial} className="search-form--hero" onSubmit={(v) => navigate(`/habitaciones?${searchToQuery(v)}`)} />
        </div>
      </section>

      <section className="section container" aria-labelledby="hoteles-titulo">
        <div className="section__head">
          <h2 id="hoteles-titulo" className="section__title">
            Nuestros hoteles
          </h2>
          <p className="section__sub">Tres sedes pensadas para tu visita a La Paz.</p>
        </div>
        <div className="grid grid--3">
          {hotels.map((h) => (
            <HotelCard key={h.id} hotel={h} priceFrom={priceFrom(rooms, h.id)} to={`/habitaciones?${searchToQuery({ ...initial, hotel: h.id })}`} />
          ))}
        </div>
      </section>

      <section className="section section--steps container" aria-labelledby="pasos-titulo">
        <h2 id="pasos-titulo" className="section__title">
          Reserva en tres pasos
        </h2>
        <ol className="steps">
          {STEPS.map(([n, title, text]) => (
            <li key={n} className="step-card">
              <span className="step-card__num">{n}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

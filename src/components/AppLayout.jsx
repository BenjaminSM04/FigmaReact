import { Outlet, useLocation } from 'react-router-dom';
import Footer from './Footer.jsx';
import Navbar from './Navbar.jsx';
import TabBar from './TabBar.jsx';

const TABS = [
  { to: '/', icon: 'home', label: 'Inicio', end: true },
  { to: '/mis-reservas', icon: 'calendar', label: 'Mis reservas' },
  { to: '/perfil', icon: 'user', label: 'Perfil' },
];

/** Estructura del área de cliente: barra superior, contenido, pie y pestañas móviles. */
export default function AppLayout() {
  const { pathname } = useLocation();
  return (
    <div className="app-layout">
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <Navbar />
      <main id="contenido" className="app-layout__main">
        <div key={pathname} className="page-enter">
          <Outlet />
        </div>
      </main>
      <Footer />
      <TabBar items={TABS} label="Navegación móvil" />
    </div>
  );
}

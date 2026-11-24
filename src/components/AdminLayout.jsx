import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Avatar from './Avatar.jsx';
import Icon from './Icon.jsx';
import Logo from './Logo.jsx';
import TabBar from './TabBar.jsx';

const MENU = [
  { to: '/admin', icon: 'calendar', label: 'Reservas', end: true },
  { to: '/admin/habitaciones', icon: 'bed', label: 'Habitaciones' },
];

const TABS = [...MENU, { to: '/admin/perfil', icon: 'user', label: 'Perfil' }];

/** Panel de administración: barra lateral en escritorio, pestañas inferiores en móvil. */
export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const exit = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="admin-layout">
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <aside className="sidebar">
        <Logo to="/admin" light />
        <nav className="sidebar__nav" aria-label="Administración">
          <p className="sidebar__heading">Administración</p>
          {MENU.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `sidebar__link${isActive ? ' is-active' : ''}`}>
              <Icon name={item.icon} size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__footer">
          <div className="sidebar__user">
            <Avatar nombre={user.nombre} />
            <div>
              <p className="sidebar__user-name">{user.nombre}</p>
              <p className="sidebar__user-role">Administrador</p>
            </div>
          </div>
          <button type="button" className="sidebar__exit" onClick={exit}>
            <Icon name="logout" size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>
      <div className="admin-layout__content">
        <header className="admin-topbar">
          <Logo to="/admin" />
          <span className="badge">Administrador</span>
        </header>
        <main id="contenido" className="admin-layout__main">
          <Outlet />
        </main>
      </div>
      <TabBar items={TABS} label="Navegación móvil de administración" />
    </div>
  );
}

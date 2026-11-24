import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Avatar from './Avatar.jsx';
import Icon from './Icon.jsx';
import Logo from './Logo.jsx';

const LINKS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/habitaciones', label: 'Hoteles' },
  { to: '/mis-reservas', label: 'Mis reservas' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const exit = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="navbar">
      <div className="navbar__inner container">
        <div className="navbar__left">
          <Logo />
          <nav className="navbar__links" aria-label="Principal">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `navbar__link${isActive ? ' is-active' : ''}`}>
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="navbar__user">
          <Link to="/perfil" className="navbar__profile" aria-label="Mi perfil">
            <Avatar nombre={user.nombre} />
            <span className="navbar__name">{user.nombre.split(' ').slice(0, 2).join(' ')}</span>
          </Link>
          <button type="button" className="navbar__exit" onClick={exit}>
            <Icon name="logout" size={16} />
            <span>Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
}

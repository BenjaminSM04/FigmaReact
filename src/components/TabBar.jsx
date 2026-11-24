import { NavLink } from 'react-router-dom';
import Icon from './Icon.jsx';

/** Barra de pestañas inferior (solo se ve en móvil). */
export default function TabBar({ items, label }) {
  return (
    <nav className="tabbar" aria-label={label}>
      {items.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `tabbar__item${isActive ? ' is-active' : ''}`}>
          <Icon name={item.icon} size={22} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

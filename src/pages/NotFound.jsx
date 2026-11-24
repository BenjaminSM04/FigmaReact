import Button from '../components/Button.jsx';
import Icon from '../components/Icon.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function NotFound() {
  const { user } = useAuth();
  return (
    <div className="container page">
      <div className="empty">
        <Icon name="alert" size={40} />
        <h1>Página no encontrada</h1>
        <p>La dirección que buscas no existe.</p>
        <Button to={user?.role === 'administrador' ? '/admin' : user ? '/' : '/login'}>Ir al inicio</Button>
      </div>
    </div>
  );
}

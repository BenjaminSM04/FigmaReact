import { useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import Button from '../components/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Profile() {
  const { user, logout } = useAuth();
  const { resetDemo } = useStore();
  const toast = useToast();
  const navigate = useNavigate();

  const exit = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const reset = () => {
    if (window.confirm('Se borrarán tus cambios y se restablecerán los datos de ejemplo. ¿Continuar?')) {
      resetDemo();
      toast('Datos de demostración restablecidos.');
    }
  };

  return (
    <div className="container page page--narrow">
      <h1 className="page__title">Mi perfil</h1>
      <section className="card profile">
        <Avatar nombre={user.nombre} size={64} />
        <div>
          <h2 className="profile__name">{user.nombre}</h2>
          <p className="profile__mail">{user.email}</p>
          <p className="profile__role">{user.role === 'administrador' ? 'Administrador' : 'Cliente'}</p>
        </div>
      </section>
      <section className="card">
        <h2 className="card__title">Datos de demostración</h2>
        <p className="muted">Esta versión no usa servidor ni base de datos: reservas, habitaciones y cuentas se guardan en este navegador.</p>
        <div className="profile__actions">
          <Button variant="outline" onClick={reset}>
            Restablecer datos de ejemplo
          </Button>
          <Button variant="secondary" onClick={exit}>
            Cerrar sesión
          </Button>
        </div>
      </section>
    </div>
  );
}

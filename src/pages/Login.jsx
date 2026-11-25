import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Button from '../components/Button.jsx';
import Field from '../components/Field.jsx';
import Icon from '../components/Icon.jsx';
import Logo from '../components/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { DEMO_ACCOUNTS } from '../data/seed.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = [
  { value: 'cliente', label: 'Cliente' },
  { value: 'administrador', label: 'Administrador' },
];

export default function Login() {
  const { user, login, register } = useAuth();
  const location = useLocation();
  const [role, setRole] = useState('cliente');
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  if (user) {
    const fallback = user.role === 'administrador' ? '/admin' : '/';
    return <Navigate to={location.state?.from?.pathname ?? fallback} replace />;
  }

  const registering = mode === 'register' && role === 'cliente';
  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
    setFormError('');
  };

  const chooseRole = (value) => {
    setRole(value);
    if (value === 'administrador') setMode('login');
    setErrors({});
    setFormError('');
  };

  const useDemo = () => {
    setMode('login');
    setForm((f) => ({ ...f, ...DEMO_ACCOUNTS[role] }));
    setErrors({});
    setFormError('');
  };

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (registering && form.nombre.trim().length < 2) next.nombre = 'Escribe tu nombre completo.';
    if (!EMAIL_RE.test(form.email.trim())) next.email = 'Escribe un correo válido.';
    if (registering ? form.password.length < 6 : !form.password) next.password = registering ? 'Usa al menos 6 caracteres.' : 'Escribe tu contraseña.';
    setErrors(next);
    if (Object.keys(next).length) return;
    const result = registering ? register(form) : login(form.email, form.password, role);
    if (!result.ok) setFormError(result.error);
  };

  return (
    <div className="login">
      <section className="login__brand">
        <Logo light />
        <h1 className="login__headline">Tu estadía en La Paz, a un clic.</h1>
        <p className="login__sub">Reserva y cancela habitaciones en nuestros hoteles de Sopocachi, el Centro y la Zona Sur.</p>
        <ul className="login__benefits stagger">
          {['Reserva en menos de un minuto', 'Cancela cuando lo necesites', 'Un solo acceso para toda la cadena'].map((t) => (
            <li key={t}>
              <span className="login__check">
                <Icon name="check" size={14} />
              </span>
              {t}
            </li>
          ))}
        </ul>
      </section>

      <section className="login__panel">
        <form className="login__form" onSubmit={submit} noValidate>
          <h2 className="login__title">{registering ? 'Crear cuenta' : 'Iniciar sesión'}</h2>
          <p className="login__lead">{registering ? 'Regístrate para reservar tu habitación.' : 'Ingresa para reservar o gestionar tus reservas.'}</p>

          <fieldset className="segmented">
            <legend className="sr-only">Tipo de cuenta</legend>
            {ROLES.map((r) => (
              <label key={r.value} className={`segmented__option${role === r.value ? ' is-active' : ''}`}>
                <input type="radio" name="rol" value={r.value} checked={role === r.value} onChange={() => chooseRole(r.value)} />
                {r.label}
              </label>
            ))}
          </fieldset>

          {registering && <Field label="Nombre completo" autoComplete="name" value={form.nombre} onChange={set('nombre')} error={errors.nombre} />}
          <Field label="Correo electrónico" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
          <Field label="Contraseña" type="password" autoComplete={registering ? 'new-password' : 'current-password'} value={form.password} onChange={set('password')} error={errors.password} hint={registering ? 'Mínimo 6 caracteres.' : undefined} />

          {formError && (
            <p className="form-error" role="alert">
              {formError}
            </p>
          )}

          <Button type="submit" block>
            {registering ? 'Crear cuenta' : 'Ingresar'}
          </Button>

          {role === 'cliente' && (
            <p className="login__switch">
              {registering ? '¿Ya tienes cuenta?' : '¿Aún no tienes cuenta?'}{' '}
              <button type="button" className="link-button" onClick={() => { setMode(registering ? 'login' : 'register'); setErrors({}); setFormError(''); }}>
                {registering ? 'Iniciar sesión' : 'Crear cuenta'}
              </button>
            </p>
          )}

          <div className="demo-note">
            <Icon name="info" size={18} />
            <div>
              <p>Versión de demostración: los datos se guardan solo en este navegador.</p>
              <button type="button" className="link-button" onClick={useDemo}>
                Usar cuenta de {role === 'cliente' ? 'cliente' : 'administrador'} de ejemplo
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}

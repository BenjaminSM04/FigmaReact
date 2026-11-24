import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useStore } from './StoreContext.jsx';

const SESSION_KEY = 'sistemas:v1:session';

function readSession() {
  try {
    return window.localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { users, registerUser } = useStore();
  const [userId, setUserId] = useState(readSession);

  const persist = (id) => {
    setUserId(id);
    try {
      if (id) window.localStorage.setItem(SESSION_KEY, id);
      else window.localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignorar */
    }
  };

  const login = useCallback(
    (email, password, role) => {
      const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!user || user.password !== password) return { ok: false, error: 'Correo o contraseña incorrectos.' };
      if (user.role !== role) {
        return {
          ok: false,
          error: role === 'administrador' ? 'Esta cuenta no tiene permisos de administrador.' : 'Esta cuenta es de administrador. Elige el rol "Administrador".',
        };
      }
      persist(user.id);
      return { ok: true, user };
    },
    [users],
  );

  const register = useCallback(
    ({ nombre, email, password }) => {
      const result = registerUser({ nombre: nombre.trim(), email: email.trim(), password });
      if (result.ok) persist(result.user.id);
      return result;
    },
    [registerUser],
  );

  const logout = useCallback(() => persist(null), []);

  // Si la cuenta ya no existe (por ejemplo tras restablecer los datos), se cierra la sesión.
  const user = useMemo(() => users.find((u) => u.id === userId) ?? null, [users, userId]);

  const value = useMemo(() => ({ user, login, register, logout }), [user, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}

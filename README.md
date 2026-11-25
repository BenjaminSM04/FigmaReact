# Sistemas · Reservas de hoteles en La Paz

Aplicación web (escritorio y móvil) para una cadena de hoteles de La Paz, Bolivia.
Está hecha con **React + JavaScript** (sin TypeScript) y es **solo frontend**: no hay servidor
ni base de datos. Todos los datos (reservas, habitaciones y cuentas) se guardan en el
`localStorage` del navegador.

El diseño sale del archivo de Figma "Sistemas – Interfaz web y móvil" y usa su paleta de colores.

## Funciones

**Cliente**
- Crear cuenta e iniciar sesión.
- Buscar habitaciones por hotel, fechas y número de huéspedes (solo aparecen las libres).
- Filtrar por tipo, precio y servicios.
- Reservar una habitación (formulario con validación) y ver su confirmación.
- Ver "Mis reservas" y **cancelarlas** (hasta 24 horas antes de la llegada).

**Administrador**
- Ver todas las reservas de la cadena, con indicadores y filtros (hotel, estado, búsqueda).
- **Cancelar cualquier reserva** vigente.
- Gestionar habitaciones: crear, editar (tarifa, estado, servicios) y eliminar.

## Cómo ejecutarlo

```bash
npm install
npm run dev      # servidor de desarrollo en http://localhost:5173
npm run build    # compilación de producción en dist/
npm run preview  # sirve la compilación
npm test         # pruebas de las reglas de reservas
```

## Cuentas de demostración

| Rol           | Correo                     | Contraseña   |
| ------------- | -------------------------- | ------------ |
| Cliente       | maria.quispe@correo.com    | cliente123   |
| Administrador | admin@sistemas.bo          | admin123     |

En la pantalla de ingreso hay un botón para rellenar estas cuentas. Los clientes también
pueden registrarse. Desde **Perfil** se pueden restablecer los datos de ejemplo.

> Las contraseñas se guardan en texto plano en el navegador porque es una demostración sin
> servidor. No usar este esquema en producción.

## Reglas de negocio

- Una habitación no se puede reservar si está en mantenimiento o ya tiene una reserva confirmada
  que se cruza con las fechas (se puede salir y entrar el mismo día).
- El **cliente** cancela hasta 24 horas antes del check-in (14:00). El **administrador** puede
  cancelar cualquier reserva vigente.
- Una reserva cancelada libera la habitación. Una reserva confirmada cuya salida ya pasó se
  muestra como "Finalizada".
- Precios en bolivianos (Bs). El pago se hace en el hotel.

## Animaciones

Los estilos de movimiento están en `src/styles/motion.css`: entrada de cada pantalla, listas que
aparecen de forma escalonada, diálogos (cuadro en escritorio y hoja deslizante en móvil), avisos,
confirmación de reserva con marca animada y efectos al pasar el cursor o pulsar. Si el sistema
tiene activado "reducir movimiento", todas las animaciones se desactivan.

## Prototipo en Figma

El archivo de Figma incluye un prototipo con las pantallas conectadas (flujos de cliente y de
administrador, en web y móvil): <https://www.figma.com/design/X69QM8yvl0IxEEvuPVTdwr>

## Estructura

```
src/
  components/   Piezas reutilizables (botón, campo, diálogo, tarjetas, navegación, layouts)
  context/      Datos (StoreContext), sesión (AuthContext) y avisos (ToastContext)
  data/         Hoteles, habitaciones y datos de ejemplo (las fechas son relativas a hoy)
  lib/          Formato de fechas y precios, reglas de reservas (con pruebas), búsqueda
  pages/        Pantallas del cliente y, en pages/admin, las del administrador
  styles/       Tokens de diseño (colores de Figma), estilos y animaciones
```

## Diseño adaptable

Un solo código sirve para web y móvil. En pantallas de hasta 767 px la barra superior se
simplifica, aparece una barra de pestañas inferior, las tablas pasan a tarjetas y los diálogos
se muestran como hoja inferior.

# ✈️ Sistema de Vuelos en Tiempo Real 🌍

## ✨ Funcionalidades especiales:

1. **Trayectorias de aviones cruzando el meridiano:**
   - Cuando un avión cruza de un extremo a otro del mapa (superando el meridiano de 180°), la trayectoria anterior desaparece para evitar que el mapa dibuje líneas largas y poco estéticas, y se muestra la nueva trayectoria por donde apareció el avión.

2. **Aviones que han tenido un accidente (`CRASHED`):**
   - Al registrarse un accidente, el avión se muestra durante 1 minuto con un ícono especial. La trayectoria anterior del vuelo también se elimina automáticamente por motivos estéticos.

3. **Eventos de despegue y aterrizaje (`TAKE-OFF` y `LANDING`):**
   - Los íconos especiales de despegue y aterrizaje aparecen sobre el avión por **3 segundos** antes de volver a mostrar el ícono estándar del vuelo.

## 💻 Funcionamiento básico del código:

1. **Conexión a WebSocket**: 
   - La aplicación se conecta a un servidor WebSocket, recibe eventos en tiempo real relacionados con vuelos (`FLIGHTS`, `PLANE`, `TAKE-OFF`, `LANDING`, y `CRASHED`) y actualiza la interfaz del usuario.

2. **Mapa con Leaflet**: 
   - Se utiliza Leaflet para visualizar el mapa y los vuelos, dibujando las trayectorias y actualizando la posición de los aviones.

3. **Interacción con el usuario**:
   - Un chat en tiempo real permite la comunicación entre usuarios, con mensajes de advertencia (`warn`) mostrados en rojo para mayor visibilidad.

4. **Tabla de vuelos activos**: 
   - La tabla muestra la información de los vuelos activos, actualizándose dinámicamente conforme llegan nuevos datos o se eliminan vuelos que ya no están en el aire.

## 📂 Estructura del Proyecto:

- **`index.html`**: Estructura principal de la página.
- **`styles.css`**: Estilos personalizados para el diseño y la disposición de la página.
- **`app2.js`**: Lógica principal del proyecto (conexión WebSocket, actualización de mapa, eventos de vuelo).

🌍✈️

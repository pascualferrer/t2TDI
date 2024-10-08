const map = L.map('mapa').setView([51.505, -0.09], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


function agregarMarcador(aeropuerto, tipo) {
    const { lat, long } = aeropuerto.location;

    const color = tipo === 'departure' ? 'green' : 'blue';

    const marker = L.circleMarker([lat, long], {
        radius: 8,
        color: color,
        fillColor: color,
        fillOpacity: 0.8
    }).addTo(map);

    marker.bindPopup(`
        <strong>${aeropuerto.name}</strong><br>
        Ciudad: ${aeropuerto.city.name}, ${aeropuerto.city.country.name}
    `);
}

let rutasEnMapa = [];

function dibujarRuta(salida, destino) {
    const points = [
        [salida.lat, salida.long],
        [destino.lat, destino.long]
    ];

    const ruta = L.polyline(points, {
        color: '#3399FF',
        opacity: 0.7,
        weight: 2
    }).addTo(map);
    rutasEnMapa.push(ruta);
}

function limpiarRutas() {
    rutasEnMapa.forEach(ruta => {
        map.removeLayer(ruta);
    });
    rutasEnMapa = [];
}


function crearIconoAvion() {
    return L.icon({
        iconUrl: 'assets/plane3.png',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
    });
}


///////////////////////////////
/// TRAYECTORIAS DE AVIONES ///
///////////////////////////////

const avionesEnMapa = {};
const trayectoriasAviones = {};

function mostrarAvion(avion) {
    const { flight_id, position, airline, captain, ETA, status } = avion;
    const { lat, long } = position;

    if (avionesEnMapa[flight_id]) {
        avionesEnMapa[flight_id].setLatLng([lat, long]);

        avionesEnMapa[flight_id].setPopupContent(`
            <strong>Vuelo ID: ${flight_id}</strong><br>
            Aerolínea: ${airline.name}<br>
            Capitán: ${captain}<br>
            Estado: ${status}<br>
            ETA: ${new Date(ETA * 1000).toLocaleTimeString()}
        `);

        trayectoriasAviones[flight_id].push([lat, long]);
        actualizarTrayectoria(flight_id);
    } else {
        trayectoriasAviones[flight_id] = [[lat, long]];

        const marker = L.marker([lat, long], { icon: crearIconoAvion() })
            .addTo(map)
            .bindPopup(`
                <strong>Vuelo ID: ${flight_id}</strong><br>
                Aerolínea: ${airline.name}<br>
                Capitán: ${captain}<br>
                Estado: ${status}<br>
                ETA: ${new Date(ETA * 1000).toLocaleTimeString()}
            `);

        avionesEnMapa[flight_id] = marker;
    }
}



function actualizarTrayectoria(flight_id) {
    if (trayectoriasAviones[flight_id]) {
        const puntos = trayectoriasAviones[flight_id];
        const nuevosPuntos = [puntos[0]];

        for (let i = 1; i < puntos.length; i++) {
            const [prevLat, prevLng] = puntos[i - 1];
            const [currLat, currLng] = puntos[i];

            if (Math.abs(prevLng - currLng) > 180) {
                nuevosPuntos.length = 0;
            }

            nuevosPuntos.push([currLat, currLng]);
        }

        if (avionesEnMapa[flight_id].trayectoria) {
            map.removeLayer(avionesEnMapa[flight_id].trayectoria);
        }
        avionesEnMapa[flight_id].trayectoria = L.polyline(nuevosPuntos, { color: 'orange' }).addTo(map);
    }
}



/////////////////////
/// EVENTOS VUELO ///
////////////////////

function mostrarAccidente(flight_id) {
    const avion = avionesEnMapa[flight_id];
    
    if (avion) {
        map.removeLayer(avion);

        if (avionesEnMapa[flight_id].trayectoria) {
            map.removeLayer(avionesEnMapa[flight_id].trayectoria);
            delete trayectoriasAviones[flight_id];
        }

        const markerAccidente = L.marker(avion.getLatLng(), {
            icon: L.icon({
                iconUrl: 'assets/crashed2.png',
                iconSize: [40, 40],
                iconAnchor: [20, 20],
                popupAnchor: [0, -15]
            })
        }).addTo(map)
        .bindPopup(`
            <strong>Accidente del vuelo: ${flight_id}</strong><br>
            Última posición registrada.<br>
        `).openPopup();

        setTimeout(() => {
            map.removeLayer(markerAccidente);
        }, 60000);
    }
}


function mostrarEventoVuelo(flight_id, tipo) {
    const avion = avionesEnMapa[flight_id];
    
    if (avion) {
        const iconoEvento = tipo === 'take-off' ? 'assets/take-off1.png' : 'assets/landing1.png';

        const iconoTemporal = L.icon({
            iconUrl: iconoEvento,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15]
        });

        const popupTemporal = L.popup()
            .setLatLng(avion.getLatLng())
            .setContent(`
                <strong>Vuelo ID: ${flight_id}</strong><br>
                Evento: ${tipo === 'take-off' ? 'Despegue' : 'Aterrizaje'}
            `).openOn(map);

        avion.setIcon(iconoTemporal);

        setTimeout(() => {
            avion.setIcon(crearIconoAvion());
            map.closePopup(popupTemporal);
        }, 3000);
    }
}


//////////////////////
/// FUNCIONES CHAT ///
//////////////////////

let idMensajeEnviado = null;

function mostrarMensajeChat(remitente, mensaje, fecha, nivel) {
    const chatBox = document.getElementById('chat-mensajes');
    const nuevoMensaje = document.createElement('div');
    
    if (nivel === 'warn') {
        nuevoMensaje.style.color = 'red';
    }
    
    const fechaMensaje = new Date(fecha);
    const horaFormateada = fechaMensaje.toLocaleTimeString();
    const fechaFormateada = fechaMensaje.toLocaleDateString();

    nuevoMensaje.innerHTML = `
        <strong>${remitente}</strong> [${fechaFormateada} ${horaFormateada}]: ${mensaje}
    `;
    
    chatBox.appendChild(nuevoMensaje);
    chatBox.scrollTop = chatBox.scrollHeight;
}

document.getElementById('form-chat').addEventListener('submit', function(e) {
    e.preventDefault();
    const mensajeInput = document.getElementById('mensaje');
    const mensaje = mensajeInput.value.trim();

    if (mensaje) {
        const eventoChat = {
            type: 'chat',
            content: mensaje
        };
        socket.send(JSON.stringify(eventoChat));

        mensajeInput.value = ''; 
    }
});

///////////////////////
/// Tabla de vuelos ///
///////////////////////

let vuelos = {};

function agregarFilaVuelo(vuelo) {
    const tablaVuelos = document.getElementById('tabla-vuelos').getElementsByTagName('tbody')[0];

    const fila = document.createElement('tr');
    fila.id = `fila-${vuelo.id}`;

    const celdaVuelo = document.createElement('td');
    celdaVuelo.textContent = vuelo.id || 'N/A';

    const celdaOrigen = document.createElement('td');
    celdaOrigen.textContent = vuelo.departure.city.name || 'N/A';

    const celdaDestino = document.createElement('td');
    celdaDestino.textContent = vuelo.destination.city.name || 'N/A';

    const celdaETA = document.createElement('td');
    celdaETA.id = `eta-${vuelo.id}`;
    celdaETA.textContent = vuelo.departure_date ? new Date(vuelo.departure_date).toLocaleTimeString() : 'N/A';

    const celdaCapitan = document.createElement('td');
    celdaCapitan.id = `capitan-${vuelo.id}`;
    celdaCapitan.textContent = 'N/A';

    fila.appendChild(celdaVuelo);
    fila.appendChild(celdaOrigen);
    fila.appendChild(celdaDestino);
    fila.appendChild(celdaETA);
    fila.appendChild(celdaCapitan);

    tablaVuelos.appendChild(fila);

    vuelos[vuelo.id] = vuelo;
}



function actualizarFilaVuelo(plane) {
    const { flight_id, captain, ETA } = plane;

    const filaExistente = document.getElementById(`fila-${flight_id}`);

    if (filaExistente) {
        const celdaETA = document.getElementById(`eta-${flight_id}`);
        const nuevaETA = new Date(ETA * 1000).toLocaleTimeString();
        if (celdaETA.textContent !== nuevaETA) {
            celdaETA.textContent = nuevaETA;
        }

        const celdaCapitan = document.getElementById(`capitan-${flight_id}`);
        if (celdaCapitan.textContent !== captain) {
            celdaCapitan.textContent = captain || 'N/A';
        }
    }
}


function actualizarEstadoVuelo(flight_id, estado) {
    const fila = document.getElementById(`fila-${flight_id}`);
    if (fila) {
        const celdaEstado = fila.querySelector('.estado');
        if (celdaEstado) {
            celdaEstado.textContent = estado;
        }
    }
}

//////////////////////////////
/// COMUNICACIÓN WEBSOCKET ///
//////////////////////////////

let socket;

function conectarWebSocket() {
    // conexión WebSocket
    socket = new WebSocket("wss://tarea-2.2024-2.tallerdeintegracion.cl/connect");

    socket.onopen = function() {
        console.log("Conexión WebSocket abierta");
        const joinEvent = {
            type: "join",
            id: "19623585",
            username: "Pascual"
        };
        socket.send(JSON.stringify(joinEvent));
        console.log("Evento JOIN enviado:", joinEvent);
    };

    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        
        if (data.type === "flights") {
            const vuelosActivos = Object.keys(data.flights);
    
            const filasEnTabla = Array.from(document.querySelectorAll('tbody tr'));
            const idsEnTabla = filasEnTabla.map(fila => fila.id.replace('fila-', ''));
    
            idsEnTabla.forEach(vueloId => {
                if (!vuelosActivos.includes(vueloId)) {
                    const fila = document.getElementById(`fila-${vueloId}`);
                    if (fila) {
                        fila.remove();
                    }
                }
            });
    
            vuelosActivos.forEach(flightId => {
                const flight = data.flights[flightId];
    
                if (!document.getElementById(`fila-${flightId}`)) {
                    agregarFilaVuelo(flight);
                } else {
                    actualizarFilaVuelo(flight);
                }
    
                const departure = flight.departure;
                const destination = flight.destination;
    
                agregarMarcador(departure, 'departure');
                agregarMarcador(destination, 'destination');
    
                dibujarRuta(departure.location, destination.location);
            });
        } else if (data.type === "plane") {
            const plane = data.plane;
            mostrarAvion(plane);
    
            actualizarFilaVuelo(plane);
        } else if (data.type === "take-off") {
            mostrarEventoVuelo(data.flight_id, 'take-off');
        } else if (data.type === "landing") {
            mostrarEventoVuelo(data.flight_id, 'landing');
        } else if (data.type === "crashed") {
            mostrarAccidente(data.flight_id);
        } else if (data.type === 'message') {
            const { name, content, date, level } = data.message;
            mostrarMensajeChat(name, content, date, level);
        }
    };
    
    
    

    socket.onclose = function(event) {
        console.log("Conexión WebSocket cerrada:", event.reason);
        setTimeout(function() {
            console.log("Intentando reconectar...");
            conectarWebSocket();
        }, 5000);
    };

    socket.onerror = function(error) {
        console.error("Error en la conexión WebSocket:", error);
    };
}

conectarWebSocket();


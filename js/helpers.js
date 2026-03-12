import { intervalosActivos, gameState } from './constants.js';

export const Creador = (etiqueta, propiedades) => {
    const crear = document.createElement(etiqueta);
    Object.entries(propiedades).forEach(([ticket, valor]) => {
        if (ticket === "classList") crear.classList.add(valor);
        else crear[ticket] = valor;
    });
    return crear;
};

// Usamos el setInterval original para trackearlos
const originalSetInterval = window.setInterval;

export const trackedSetInterval = (fn, delay) => {
    const id = originalSetInterval(fn, delay);
    intervalosActivos.push(id);
    return id;
};

export const detenerTodo = () => {
    gameState.juegoFinalizado = true;
    intervalosActivos.forEach(id => clearInterval(id));
    console.log("Juego detenido.");
};

export const mostrarOverlay = ({ titulo, subTitulo = "", botonTexto, accion, esGameOver = false }) => {
    const overlay = Creador("div", { classList: "game-over-overlay" });
    if (esGameOver) overlay.classList.add("game-over-final");
    
    const tituloEl = Creador("h1", { classList: "game-over-title", innerText: titulo });
    
    overlay.appendChild(tituloEl);

    if (subTitulo) {
        const sub = Creador("p", { classList: "game-over-score", innerText: subTitulo });
        overlay.appendChild(sub);
    }

    const boton = Creador("button", { classList: "restart-button", innerText: botonTexto });
    boton.onclick = () => {
        overlay.remove();
        accion();
    };
    
    overlay.appendChild(boton);
    document.body.appendChild(overlay);
    return overlay;
};

export const mostrarGameOver = () => {
    mostrarOverlay({
        titulo: "GAME OVER",
        subTitulo: `Puntuación Final: ${gameState.puntuacion}`,
        botonTexto: "Reiniciar",
        accion: () => location.reload(),
        esGameOver: true
    });
};

export const pausarJuego = () => {
    if (gameState.juegoFinalizado || gameState.juegoPausado) return;
    gameState.juegoPausado = true;
    
    mostrarOverlay({
        titulo: "PAUSA",
        subTitulo: `Puntuación Actual: ${gameState.puntuacion}`,
        botonTexto: "Reanudar",
        accion: () => {
            gameState.juegoPausado = false;
        }
    });
};

export const mostrarWin = () => {
    detenerTodo();
    mostrarOverlay({
        titulo: "¡VICTORIA!",
        subTitulo: `¡Has alcanzado la gloria con ${gameState.puntuacion} puntos!`,
        botonTexto: "Jugar de Nuevo",
        accion: () => location.reload(),
        esGameOver: true
    });
};

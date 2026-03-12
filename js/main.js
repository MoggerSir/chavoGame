import { Personaje } from './Personaje.js';
import { Enemigo } from './Enemigo.js';
import { Consumible } from './Consumible.js';
import { gameState } from './constants.js';
import { trackedSetInterval, pausarJuego } from './helpers.js';

(() => {
    // Inicializar el personaje
    const personaje = new Personaje(0, 0);

    // Botón de Pausa
    const btnPause = document.getElementById("btnPause");
    if (btnPause) {
        btnPause.onclick = () => pausarJuego();
    }

    // Disparo automático del personaje
    trackedSetInterval(() => {
        if (gameState.juegoFinalizado || gameState.juegoPausado) return;
        personaje.disparar();
    }, 500);

    // Generar enemigos en intervalos
    trackedSetInterval(() => {
        if (gameState.juegoFinalizado || gameState.juegoPausado) return;
        const randomTop = Math.random() * (window.innerHeight - 150);
        const enemigo = new Enemigo(window.innerWidth, randomTop);
        enemigo.generarEnemigo();
    }, 1000);

    // Generar Tortas (Curación y Puntos) cada 5 segundos
    trackedSetInterval(() => {
        if (gameState.juegoFinalizado || gameState.juegoPausado) return;
        const randomTop = Math.random() * (window.innerHeight - 100);
        const torta = new Consumible(window.innerWidth, randomTop);
        torta.generarConsumible();
    }, 5000);
})();

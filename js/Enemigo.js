import { listaEnemigos, gameState } from './constants.js';
import { Creador, trackedSetInterval } from './helpers.js';

export class Enemigo {
    container = Creador("div", { classList: "enemigo-container" });
    element = Creador("img", {
        src: "/assets/obstaculos/nonoGiratorio.gif",
        classList: "enemigo"
    });

    conteinerGlobal = document.querySelector(".conteiner");
    
    #daño = 30;
    #HP = 50;
    #HPMax = 50;
    
    valorPuntuacion = 100;
    posLeft = window.innerWidth; 
    posTop = 0;
    speed = 5; 
    intervalo = null;
    healthBarFill = null;
    
    constructor(posLeft, posTop) {
        this.posLeft = posLeft;
        this.posTop = posTop;
        this.crearBarraVida();
    }

    get daño() { return this.#daño; }

    recibirDanio(cantidad) {
        this.#HP -= cantidad;
        this.actualizarBarra();
    }

    estaMuerto() {
        return this.#HP <= 0;
    }

    crearBarraVida() {
        const barContainer = Creador("div", { classList: "health-bar-mini" });
        this.healthBarFill = Creador("div", { classList: "health-bar-fill-mini" });
        barContainer.appendChild(this.healthBarFill);
        this.container.appendChild(barContainer);
        this.container.appendChild(this.element);
    }

    actualizarBarra() {
        const porcentaje = Math.max(0, (this.#HP / this.#HPMax) * 100);
        this.healthBarFill.style.width = porcentaje + "%";
    }

    generarEnemigo(){
        this.container.style.left = this.posLeft + "px";
        this.container.style.top = this.posTop + "px";
        this.conteinerGlobal.appendChild(this.container);
        listaEnemigos.push(this);
        this.movimiento();
    }

    movimiento() {
        this.intervalo = trackedSetInterval(() => {
            if (gameState.juegoFinalizado) {
                clearInterval(this.intervalo);
                return;
            }
            if (gameState.juegoPausado) return;

            this.posLeft -= this.speed; 
            this.container.style.left = this.posLeft + "px";

            if (this.posLeft <= -200) {
                this.destruir();
            }
        }, 20);
    }

    destruir() {
        clearInterval(this.intervalo);
        if (this.container.parentNode) {
            this.container.remove();
        }
        const index = listaEnemigos.indexOf(this);
        if (index > -1) listaEnemigos.splice(index, 1);
    }
}

import { listaConsumibles, gameState } from './constants.js';
import { Creador, trackedSetInterval } from './helpers.js';

export class Consumible {
    container = Creador("div", { classList: "consumible-container" });
    element = Creador("img", {
        src: "/assets/general/torta.png",
        classList: "consumible"
    });

    conteinerGlobal = document.querySelector(".conteiner");
    
    #valorCuracion = 20;
    #valorPuntuacion = 250;
    
    posLeft = window.innerWidth; 
    posTop = 0;
    speed = 4; 
    intervalo = null;
    
    constructor(posLeft, posTop) {
        this.posLeft = posLeft;
        this.posTop = posTop;
        this.container.appendChild(this.element);
    }

    get valorCuracion() { return this.#valorCuracion; }
    get valorPuntuacion() { return this.#valorPuntuacion; }

    generarConsumible(){
        this.container.style.left = this.posLeft + "px";
        this.container.style.top = this.posTop + "px";
        this.conteinerGlobal.appendChild(this.container);
        listaConsumibles.push(this);
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
        const index = listaConsumibles.indexOf(this);
        if (index > -1) listaConsumibles.splice(index, 1);
    }
}

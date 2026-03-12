import { listaEnemigos, listaProyectiles, listaConsumibles, gameState } from './constants.js';
import { Creador, trackedSetInterval, detenerTodo, mostrarGameOver, mostrarWin } from './helpers.js';
import { chackCollision } from './colisiones.js';

export class Personaje {
    container = document.querySelector(".contentPersonaje");
    personajeElement = document.querySelector(".personaje");
    conteinerGlobal = document.querySelector(".conteiner");
    
    #HP = 100;
    #daño = 10;
    
    posLeft = 0;
    posTop = 0;
    speed = 8;
    keys = {};
    
    healthBarFill = null;

    constructor(posLeft, posTop) {
        this.posLeft = posLeft;
        this.posTop = posTop;
        this.crearBarraVida();
        this.initEvents();
        this.gameLoop();
    }

    get HP() { return this.#HP; }

    crearBarraVida() {
        const container = Creador("div", { classList: "health-bar-container" });
        this.healthBarFill = Creador("div", { classList: "health-bar-fill" });
        container.appendChild(this.healthBarFill);
        this.container.insertBefore(container, this.personajeElement);
    }

    actualizarBarras() {
        const porcentaje = Math.max(0, this.#HP);
        this.healthBarFill.style.width = porcentaje + "%";
        
        if (porcentaje < 30) this.healthBarFill.style.backgroundColor = "#e74c3c";
        else if (porcentaje < 60) this.healthBarFill.style.backgroundColor = "#f1c40f";
        else this.healthBarFill.style.backgroundColor = "#2ecc71";
    }

    initEvents() {
        window.addEventListener("keydown", (e) => {
            if (gameState.juegoFinalizado || gameState.juegoPausado) return;
            this.keys[e.key.toLowerCase()] = true;
        });
        window.addEventListener("keyup", (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    movimiento() {
        if (gameState.juegoFinalizado || gameState.juegoPausado) return;
        if (this.keys["d"]) this.posLeft += this.speed;
        if (this.keys["a"]) this.posLeft -= this.speed;
        if (this.keys["w"]) this.posTop -= this.speed;
        if (this.keys["s"]) this.posTop += this.speed;

        if (this.keys["e"]) { this.posLeft += this.speed; this.posTop -= this.speed; }
        if (this.keys["q"]) { this.posLeft -= this.speed; this.posTop -= this.speed; }
        if (this.keys["z"]) { this.posLeft += this.speed; this.posTop += this.speed; }
        if (this.keys["x"]) { this.posLeft -= this.speed; this.posTop += this.speed; }

        this.posLeft = Math.max(0, Math.min(this.posLeft, window.innerWidth - 150));
        this.posTop = Math.max(0, Math.min(this.posTop, window.innerHeight - 150));

        this.container.style.left = this.posLeft + "px";
        this.container.style.top = this.posTop + "px";
    }

    chequearColisiones() {
        if (gameState.juegoFinalizado || gameState.juegoPausado) return;
        for (let i = listaEnemigos.length - 1; i >= 0; i--) {
            const enemigo = listaEnemigos[i];
            
            // Colisión Jugador vs Enemigo (más generosa)
            if (chackCollision(this.personajeElement, enemigo.element, 20)) {
                this.#HP -= enemigo.daño;
                this.actualizarBarras();
                
                // Penalización por choque (quita 50 puntos en lugar de dar)
                this.#actualizarPuntuacion(-50);
                
                enemigo.destruir();
                
                if (this.#HP <= 0) {
                    detenerTodo();
                    mostrarGameOver();
                }
                continue;
            }

            for (let j = listaProyectiles.length - 1; j >= 0; j--) {
                const proyectil = listaProyectiles[j];
                // Colisión Proyectil vs Enemigo (más precisa)
                if (chackCollision(proyectil, enemigo.element, 5)) {
                    enemigo.recibirDanio(this.#daño);
                    
                    proyectil.remove();
                    listaProyectiles.splice(j, 1);

                    if (enemigo.estaMuerto()) {
                        this.#actualizarPuntuacion(enemigo.valorPuntuacion);
                        enemigo.destruir();
                        break;
                    }
                }
            }
        }

        // Colisiones con consumibles (Tortas)
        for (let i = listaConsumibles.length - 1; i >= 0; i--) {
            if (listaConsumibles[i]) {
                const consumible = listaConsumibles[i];
                // Colisión Jugador vs Torta
                if (chackCollision(this.personajeElement, consumible.element, 10)) {
                    // Curación
                    this.#HP = Math.min(100, this.#HP + consumible.valorCuracion);
                    this.actualizarBarras();

                    // Puntos
                    this.#actualizarPuntuacion(consumible.valorPuntuacion);

                    // Contador de Tortas
                    gameState.tortasRecogidas++;
                    const tortasEl = document.getElementById("contadorTortas");
                    if (tortasEl) tortasEl.innerText = `Tortas: ${gameState.tortasRecogidas}/10`;

                    if (gameState.tortasRecogidas >= 10) {
                        mostrarWin();
                    }

                    consumible.destruir();
                }
            }
        }
    }

    #actualizarPuntuacion(puntos) {
        gameState.puntuacion = Math.max(0, gameState.puntuacion + puntos);
        const scoreEl = document.getElementById("puntuacion");
        if (scoreEl) scoreEl.innerText = `Puntuación: ${gameState.puntuacion}`;

        if (gameState.puntuacion >= 10000) {
            mostrarWin();
        }
    }

    gameLoop() {
        if (gameState.juegoFinalizado || gameState.juegoPausado) {
            requestAnimationFrame(() => this.gameLoop());
            return;
        }
        this.movimiento();
        this.chequearColisiones();
        requestAnimationFrame(() => this.gameLoop());
    }

    disparar() {
        if (gameState.juegoFinalizado || gameState.juegoPausado) return;
        const proyectil = Creador("img", {
            src: "/assets/personaje/proyectil.jpeg",
            classList: "proyectil"
        });

        let bulletLeft = this.posLeft + 150; 
        let bulletTop = this.posTop + 50;   

        proyectil.style.left = bulletLeft + "px";
        proyectil.style.top = bulletTop + "px";

        this.conteinerGlobal.appendChild(proyectil);
        listaProyectiles.push(proyectil);
        this.movimientoDisparo(proyectil, bulletLeft);
    }

    movimientoDisparo(proyectil, startPos) {
        let posicion = startPos;
        const intervalo = trackedSetInterval(() => {
            if (gameState.juegoFinalizado) {
                clearInterval(intervalo);
                return;
            }
            if (gameState.juegoPausado) return;
            
            posicion += 20;
            proyectil.style.left = posicion + "px";

            if (posicion >= window.innerWidth) {
                clearInterval(intervalo);
                if (proyectil.parentNode) {
                    proyectil.remove();
                    const index = listaProyectiles.indexOf(proyectil);
                    if (index > -1) listaProyectiles.splice(index, 1);
                }
            }
            
            if (!proyectil.parentNode) {
                clearInterval(intervalo);
            }
        }, 20);
    }
}

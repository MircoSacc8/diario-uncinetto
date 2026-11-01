// Timer del tempo di lavoro: uno solo acceso alla volta, continua anche ad app chiusa.
import { durata, ora } from "../utils/formato.js";
import { aggiorna, progetto, tempoTrascorso, fermaTimer, fermaTuttiITimer } from "../dati/stato.js";
import { conferma } from "./finestre.js";

const puntino = '<span class="acceso"></span>';

export function html(p) {
  const etichetta = p.timerStart ? "Pausa" : (p.time ? "Riprendi" : "Avvia timer");
  return `<div class="timer">
    <div><div class="tempo" id="tempo">${p.timerStart ? puntino : ""}${durata(tempoTrascorso(p))}</div>
    <div class="nota">tempo di lavoro sul progetto</div></div>
    <button class="btn ${p.timerStart ? "ghost" : ""}" data-a="timer">${etichetta}</button>
  </div>`;
}

// Aggiorna i secondi sullo schermo senza ridisegnare tutto
export function avviaTicchettio() {
  setInterval(() => {
    const p = progetto();
    const el = document.getElementById("tempo");
    if (p?.timerStart && el) el.innerHTML = puntino + durata(tempoTrascorso(p));
  }, 1000);
}

export const azioni = {
  "timer": ({ p }) => {
    if (p.timerStart) fermaTimer(p);
    else { fermaTuttiITimer(); p.timerStart = ora(); }
    p.updated = ora();
    aggiorna();
  },
  "timer-azzera": ({ p }) => conferma("Azzerare il tempo di questo progetto?", "Azzera", () => { p.time = 0; p.timerStart = null; }),
};

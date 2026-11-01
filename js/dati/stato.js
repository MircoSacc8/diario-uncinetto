// Lo stato dell'app: i dati salvati e cosa si sta guardando.
// Tutti i componenti leggono da qui e, dopo una modifica, chiamano aggiorna().
import { carica, scrivi } from "./salvataggio.js";
import { normalizzaStato } from "./migrazioni.js";
import { cardigan } from "./esempi.js";
import { ora } from "../utils/formato.js";

export const S = {
  dati: null,
  vista: { id: null, filtro: "in corso" },  // id = progetto aperto, null = lista
};

const ascoltatori = [];

export function avvia() {
  S.dati = normalizzaStato(carica() || { updatedAt: 0, projects: [cardigan()] });
}

export const progetto = () => S.dati.projects.find((p) => p.id === S.vista.id);
export const parteAttiva = (p) => p.parts.find((x) => x.id === p.active) || p.parts[0];

export function salva() {
  S.dati.updatedAt = ora();
  scrivi(S.dati);
}

export function quandoCambia(fn) { ascoltatori.push(fn); }
export function disegna() { ascoltatori.forEach((fn) => fn()); }

// Salva e ridisegna: da chiamare dopo ogni modifica
export function aggiorna() { salva(); disegna(); }

// ---- Aiuti sui progetti ----
export const grammiTotali = (p) => p.yarns.reduce((a, y) => a + (+y.grams || 0), 0);
export const tempoTrascorso = (p) => (p.time || 0) + (p.timerStart ? ora() - p.timerStart : 0);

export function fermaTimer(p) {
  if (!p.timerStart) return;
  p.time += ora() - p.timerStart;
  p.timerStart = null;
}
export const fermaTuttiITimer = () => S.dati.projects.forEach(fermaTimer);

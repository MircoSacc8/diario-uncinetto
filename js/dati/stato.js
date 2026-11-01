// Lo stato dell'app: i dati salvati e cosa si sta guardando.
// Tutti i componenti leggono da qui e, dopo una modifica, chiamano aggiorna().
import { carica, scrivi } from "./salvataggio.js";
import { normalizzaStato } from "./migrazioni.js";
import { cardigan } from "./esempi.js";
import { ora } from "../utils/formato.js";

export const S = {
  dati: null,
  // id = progetto aperto; schermata = "home" o "impostazioni" quando nessun progetto è aperto
  vista: { id: null, schermata: "home", filtro: "in corso" },
};

const ascoltatori = [];
const dopoSalvataggio = [];

// Impronta di ogni progetto (senza la data di modifica): serve a capire cosa è cambiato
const impronte = new Map();
const impronta = (p) => JSON.stringify({ ...p, updated: 0 });
export function ricordaImpronte() {
  impronte.clear();
  S.dati.projects.forEach((p) => impronte.set(p.id, impronta(p)));
}

export function avvia() {
  S.dati = normalizzaStato(carica() || { updatedAt: 0, projects: [cardigan()] });
  ricordaImpronte();
}

export const progetto = () => S.dati.projects.find((p) => p.id === S.vista.id);
export const parteAttiva = (p) => p.parts.find((x) => x.id === p.active) || p.parts[0];

// Salva sul telefono. Ogni progetto cambiato riceve la data di modifica,
// così quando si uniscono due telefoni vince sempre il più recente.
export function salva() {
  const adesso = ora();
  for (const p of S.dati.projects) {
    const nuova = impronta(p);
    if (impronte.get(p.id) !== nuova) { p.updated = adesso; impronte.set(p.id, nuova); }
  }
  S.dati.updatedAt = adesso;
  scrivi(S.dati);
  dopoSalvataggio.forEach((fn) => fn());
}

// Dati arrivati da fuori (online o backup): salva sul telefono senza toccare le date
export function salvaArrivati() {
  ricordaImpronte();
  scrivi(S.dati);
}

export function quandoCambia(fn) { ascoltatori.push(fn); }
export function quandoSalva(fn) { dopoSalvataggio.push(fn); }
export function disegna() { ascoltatori.forEach((fn) => fn()); }

// Ridisegna per un cambiamento arrivato da fuori (altro telefono). Se si sta scrivendo
// in un campo, aspetta che si finisca, per non far perdere quello che si sta scrivendo.
export function disegnaDaFuori() {
  const a = document.activeElement;
  if (a && a.closest?.("#app") && /^(INPUT|TEXTAREA)$/.test(a.tagName)) {
    a.addEventListener("blur", () => disegna(), { once: true });
    return;
  }
  disegna();
}

// Salva e ridisegna: da chiamare dopo ogni modifica
export function aggiorna() { salva(); disegna(); }

// Elimina un progetto ricordando quando, così non ricompare da un altro telefono
export function eliminaProgetto(id) {
  S.dati.projects = S.dati.projects.filter((x) => x.id !== id);
  S.dati.eliminati[id] = ora();
  impronte.delete(id);
}

// ---- Aiuti sui progetti ----
export const grammiTotali = (p) => p.yarns.reduce((a, y) => a + (+y.grams || 0), 0);
export const tempoTrascorso = (p) => (p.time || 0) + (p.timerStart ? ora() - p.timerStart : 0);

export function fermaTimer(p) {
  if (!p.timerStart) return;
  p.time += ora() - p.timerStart;
  p.timerStart = null;
}
export const fermaTuttiITimer = () => S.dati.projects.forEach(fermaTimer);

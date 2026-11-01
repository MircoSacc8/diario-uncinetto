// Come è fatto un progetto, una parte, un promemoria e un campione (vedi docs/DATI.md).
import { uid, ora } from "../utils/formato.js";

export const nuovoUncinetto = (altro = {}) => ({ tipo: "normale", mm: null, ...altro });

export const nuovaParte = (name, altro = {}) => ({
  id: uid(), name, rounds: 0,
  obiettivo: { tipo: "giri", valore: 0 },   // "arrivare a N giri" oppure "arrivare a N cm"
  start: "",                                // partenza, es. "50 cat"
  larghezza: 0,                             // cm, per proporre le catenelle
  uncinetto: null,                          // null = come il progetto
  campione: "",                             // "" = campione principale del progetto
  misure: [],                               // misure prese col metro: { giro, cm, data }
  log: [],
  ...altro,
});

// Promemoria da un giro a un altro. Se "to" manca vale solo per il giro "r"
export const nuovaNota = (r, to, t) => ({ id: uid(), r, to: Math.max(r, to ?? r), t });

// Campione: quante maglie e quanti giri stanno in 10 cm con un certo filato e uncinetto
export const nuovoCampione = (altro = {}) => ({
  id: uid(), nome: "", filato: "", uncinetto: nuovoUncinetto(), punto: "", maglie10: 0, giri10: 0, ...altro,
});

export function nuovoProgetto(altro = {}) {
  const parts = altro.parts?.length ? altro.parts : [nuovaParte("Principale")];
  return {
    id: uid(), name: "", status: "in corso", uncinetto: nuovoUncinetto(), pattern: "",
    campioni: [], campione: "",
    foto: [], ispirazioneLink: "",
    stitchCount: 0, stitches: [], yarns: [], counters: [], notes: "",
    time: 0, timerStart: null, created: ora(), updated: ora(),
    ...altro,
    parts,
    active: altro.active || parts[0].id,
  };
}

// Come è fatto un progetto, una parte, un promemoria e un campione (vedi docs/DATI.md).
import { uid, ora } from "../utils/formato.js";
import { indovinaCategoria } from "../calcoli/su-misura.js";
import { indovinaTipo } from "../calcoli/promemoria.js";

export const nuovoUncinetto = (altro = {}) => ({ tipo: "normale", mm: null, ...altro });

export const nuovaParte = (name, altro = {}) => ({
  id: uid(), name, rounds: 0,
  obiettivo: { tipo: "giri", valore: 0 },   // "arrivare a N giri" oppure "arrivare a N cm"
  start: "",                                // partenza, es. "50 cat"
  larghezza: 0,                             // cm, per proporre le catenelle
  uncinetto: null,                          // null = come il progetto
  campione: "",                             // "" = campione principale del progetto
  misure: [],                               // misure prese col metro: { giro, cm, data }
  categoria: indovinaCategoria(name),       // dietro, davanti, manica, sprone, bordo, altro
  log: [],
  ...altro,
});

// Promemoria da un giro a un altro. Se "to" manca vale solo per il giro "r".
// tipo: aumenti, diminuzioni, colore, altro (se manca si indovina dal testo)
export const nuovaNota = (r, to, t, tipo) => ({ id: uid(), r, to: Math.max(r, to ?? r), t, tipo: tipo || indovinaTipo(t) });

// Campione: quante maglie e quanti giri stanno in 10 cm con un certo filato e uncinetto
export const nuovoCampione = (altro = {}) => ({
  id: uid(), nome: "", filato: "", uncinetto: nuovoUncinetto(), punto: "", maglie10: 0, giri10: 0, ...altro,
});

export const nuovaPersona = (altro = {}) => ({ id: uid(), nome: "", tagliaBase: "", misure: {}, ...altro });

export function nuovoProgetto(altro = {}) {
  const parts = altro.parts?.length ? altro.parts : [nuovaParte("Principale")];
  return {
    id: uid(), name: "", status: "in corso", uncinetto: nuovoUncinetto(), pattern: "",
    campioni: [], campione: "",
    foto: [], ispirazioneLink: "",
    direzione: "basso", sprone: null, taglia: "",
    stitchCount: 0, stitches: [], yarns: [], counters: [], notes: "",
    time: 0, timerStart: null, created: ora(), updated: ora(),
    ...altro,
    parts,
    active: altro.active || parts[0].id,
  };
}

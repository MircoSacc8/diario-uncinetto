// Come è fatto un progetto, una parte e un promemoria (vedi docs/DATI.md).
import { uid, ora } from "../utils/formato.js";

export const nuovaParte = (name, altro = {}) => ({
  id: uid(), name, rounds: 0, target: 0, start: "", hook: "", log: [], ...altro,
});

// Promemoria da un giro a un altro. Se "to" manca vale solo per il giro "r"
export const nuovaNota = (r, to, t) => ({ id: uid(), r, to: Math.max(r, to ?? r), t });

export function nuovoProgetto(altro = {}) {
  const parts = altro.parts?.length ? altro.parts : [nuovaParte("Principale")];
  return {
    id: uid(), name: "", status: "in corso", hook: "", pattern: "", gauge: 0,
    stitchCount: 0, stitches: [], yarns: [], counters: [], notes: "",
    time: 0, timerStart: null, created: ora(), updated: ora(),
    ...altro,
    parts,
    active: altro.active || parts[0].id,
  };
}

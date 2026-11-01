// Porta i dati salvati (anche di versioni vecchie) al formato attuale, senza perdere nulla.
import { uid } from "../utils/formato.js";
import { nuovaParte, nuovaNota } from "./modelli.js";

export const VERSIONE_DATI = 1;

export function normalizzaProgetto(p) {
  p.time ??= 0;
  p.timerStart ??= null;
  p.counters ??= [];
  p.yarns ??= [];
  p.stitches ??= [];
  p.notes ??= "";
  p.gauge ??= 0;
  p.stitchCount ??= 0;
  p.status ??= "in corso";

  // Versioni prima delle "parti": giri e promemoria stavano nel progetto
  if (!Array.isArray(p.parts) || !p.parts.length) {
    p.parts = [nuovaParte("Principale", {
      rounds: p.rounds || 0,
      target: p.targetRounds || 0,
      log: (p.log || []).map((l) => nuovaNota(l.r, l.to ?? l.r, l.t)),
    })];
  }
  p.parts.forEach((x) => {
    x.log ??= [];
    x.log.forEach((l) => { l.id ??= uid(); l.to ??= l.r; });
  });
  if (!p.parts.some((x) => x.id === p.active)) p.active = p.parts[0].id;

  delete p.rounds; delete p.targetRounds; delete p.log;
  return p;
}

export function normalizzaStato(s) {
  s = s && typeof s === "object" ? s : {};
  s.settings ??= { vibrate: true };
  s.projects = Array.isArray(s.projects) ? s.projects : [];
  s.projects.forEach(normalizzaProgetto);
  s.updatedAt ??= 0;
  s.eliminati = s.eliminati && typeof s.eliminati === "object" ? s.eliminati : {};  // id → quando è stato eliminato
  s.versione = VERSIONE_DATI;
  return s;
}

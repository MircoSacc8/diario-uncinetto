// Porta i dati salvati (anche di versioni vecchie) al formato attuale, senza perdere nulla.
// Ogni passaggio si può ripetere senza danni: un progetto già aggiornato resta uguale.
import { uid } from "../utils/formato.js";
import { nuovaParte, nuovaNota, nuovoUncinetto, nuovoCampione } from "./modelli.js";
import { indovinaCategoria } from "../calcoli/su-misura.js";

export const VERSIONE_DATI = 5;

// Primo numero in un testo: "5,5" → 5.5, "5 poi 6" → 5. Nessun numero → null
export function primoNumero(testo) {
  const m = String(testo ?? "").match(/\d+(?:[.,]\d+)?/);
  return m ? parseFloat(m[0].replace(",", ".")) : null;
}

export function normalizzaProgetto(p) {
  p.time ??= 0;
  p.timerStart ??= null;
  p.counters ??= [];
  p.yarns ??= [];
  p.stitches ??= [];
  p.notes ??= "";
  p.stitchCount ??= 0;
  p.status ??= "in corso";
  // Versione 3: foto (solo id, tipo e didascalia; le immagini stanno in js/foto/archivio.js)
  p.foto = Array.isArray(p.foto) ? p.foto : [];
  p.ispirazioneLink ??= "";
  // Versione 4: direzione di lavoro ("basso" = dal basso in alto, "alto" = dal collo) e calcolo dello sprone
  p.direzione = p.direzione === "alto" ? "alto" : "basso";
  p.sprone ??= null;
  // Versione 5: taglia per cui è fatto il progetto ("donna:S", "persona:{id}"… oppure "")
  p.taglia ??= "";

  // Versione 0: prima delle "parti" giri e promemoria stavano nel progetto
  if (!Array.isArray(p.parts) || !p.parts.length) {
    p.parts = [nuovaParte("Principale", {
      rounds: p.rounds || 0,
      obiettivo: { tipo: "giri", valore: p.targetRounds || 0 },
      log: (p.log || []).map((l) => nuovaNota(l.r, l.to ?? l.r, l.t)),
    })];
  }

  // Versione 1 → 2: uncinetto come testo → tipo e mm; campione unico → elenco di campioni
  if (!p.uncinetto || typeof p.uncinetto !== "object") {
    p.uncinetto = nuovoUncinetto({ mm: primoNumero(p.hook) });
  }
  if (!Array.isArray(p.campioni)) {
    p.campioni = p.gauge
      ? [nuovoCampione({ id: `campione-${p.id}`, nome: "Campione", uncinetto: { ...p.uncinetto }, giri10: +p.gauge || 0 })]   // id fisso: ogni telefono ottiene lo stesso
      : [];
  }
  if (!p.campioni.some((c) => c.id === p.campione)) p.campione = p.campioni[0]?.id || "";

  p.parts.forEach((x) => {
    x.log ??= [];
    x.log.forEach((l) => { l.id ??= uid(); l.to ??= l.r; });
    if (!x.obiettivo || typeof x.obiettivo !== "object") x.obiettivo = { tipo: "giri", valore: +x.target || 0 };
    if (x.uncinetto === undefined) {
      x.uncinetto = x.hook ? nuovoUncinetto({ tipo: p.uncinetto.tipo, mm: primoNumero(x.hook), nota: x.hook }) : null;
    }
    x.start ??= "";
    x.larghezza ??= 0;
    x.campione ??= "";
    x.misure = Array.isArray(x.misure) ? x.misure : [];
    x.categoria ??= indovinaCategoria(x.name);   // versione 5: tipo di parte (corpo, manica, …)
    delete x.target; delete x.hook;
  });
  if (!p.parts.some((x) => x.id === p.active)) p.active = p.parts[0].id;

  delete p.rounds; delete p.targetRounds; delete p.log; delete p.hook; delete p.gauge;
  return p;
}

// Il "Cardigan Laura" era solo un esempio caricato al primo avvio (versioni fino alla 1.8.1)
// ed è finito anche negli account. Se non è mai stato toccato (data di modifica ancora 1), lo tolgo
// segnandolo come eliminato, così sparisce anche online e dagli altri telefoni.
export const ID_ESEMPIO = "cardigan-laura";
export function rimuoviEsempio(s, adesso = Date.now()) {
  const esempio = s.projects.find((p) => p.id === ID_ESEMPIO);
  if (!esempio || (esempio.updated || 0) > 1) return false;
  s.projects = s.projects.filter((p) => p.id !== ID_ESEMPIO);
  s.eliminati[ID_ESEMPIO] = adesso;
  return true;
}

export function normalizzaStato(s) {
  s = s && typeof s === "object" ? s : {};
  s.settings ??= { vibrate: true };
  s.projects = Array.isArray(s.projects) ? s.projects : [];
  s.projects.forEach(normalizzaProgetto);
  s.updatedAt ??= 0;
  s.eliminati = s.eliminati && typeof s.eliminati === "object" ? s.eliminati : {};  // id → quando è stato eliminato
  // Versione 5: misure delle persone (Laura, clienti…), sincronizzate online come un blocco unico
  s.persone = Array.isArray(s.persone) ? s.persone : [];
  s.personeUpdated ??= 0;
  s.versione = VERSIONE_DATI;
  return s;
}

// Copia online dei progetti: utenti/{id utente}/progetti/{id progetto}.
// Ogni progetto è un documento { nome, updated, eliminato, json }.
// Il telefono resta la copia principale: online va ogni modifica, e da online arriva
// ciò che è stato cambiato su un altro telefono.
import { S, salvaArrivati, disegnaDaFuori, quandoSalva } from "../dati/stato.js";
import { normalizzaProgetto } from "../dati/migrazioni.js";
import { unisciRemoti } from "../calcoli/unione.js";
import { firestore } from "./accesso.js";

const ELIMINATO = "eliminato";
let raccolta = null;          // riferimento alla raccolta online dell'utente
let docPersone = null;        // utenti/{uid}/impostazioni/persone: misure delle persone
let stopPersone = null;
let personePronte = false;
let personeInviate = 0;       // personeUpdated dell'ultima versione inviata o ricevuta
let stopAscolto = null;
const inviati = new Map();    // id → ultimo contenuto inviato o ricevuto (per non rimandare doppioni)
let attesa = null;
let pronto = false;
let collegato = false;      // ascoltatori del telefono già attivati
let statoAttuale = "spento"; // "ok" | "attesa" | "spento"
const ascoltatoriStato = [];
const ascoltatoriPronto = [];
export const quandoPronto = (fn) => ascoltatoriPronto.push(fn);

export const stato = () => statoAttuale;
export const quandoCambiaStato = (fn) => ascoltatoriStato.push(fn);
function impostaStato(s) {
  if (s === statoAttuale) return;
  statoAttuale = s;
  ascoltatoriStato.forEach((fn) => fn(s));
}

const comeTesto = (p) => JSON.stringify(p);

export function avvia(uid, giaSincronizzato) {
  const { sdk, db } = firestore();
  raccolta = sdk.collection(db, "utenti", uid, "progetti");
  pronto = false;
  inviati.clear();

  stopAscolto = sdk.onSnapshot(raccolta, { includeMetadataChanges: true }, (foto) => {
    impostaStato(foto.metadata.hasPendingWrites || foto.metadata.fromCache ? "attesa" : "ok");

    const cambiati = foto.docChanges().filter((c) => c.type !== "removed" && !c.doc.metadata.hasPendingWrites);
    if (!pronto) {
      // Su un telefono che non si è mai sincronizzato aspetto i dati veri da internet,
      // non la copia vuota in memoria: così non sovrascrivo nulla di ciò che è online.
      if (foto.metadata.fromCache && !giaSincronizzato) return;
      // Prima volta: unisce tutto ciò che c'è online con il telefono
      const remoti = foto.docs.map(leggi).filter(Boolean);
      applica(remoti);
      pronto = true;
      ascoltatoriPronto.forEach((fn) => fn());
      inviaDifferenze();
      return;
    }
    if (cambiati.length) {
      applica(cambiati.map((c) => leggi(c.doc)).filter(Boolean));
      programmaInvio();   // se qui c'era una versione più recente, la rimanda online
    }
  }, () => impostaStato("attesa"));

  // Misure delle persone: un solo documento, vince la versione più recente
  docPersone = sdk.doc(db, "utenti", uid, "impostazioni", "persone");
  personePronte = false;
  stopPersone = sdk.onSnapshot(docPersone, (foto) => {
    if (foto.metadata.fromCache && !giaSincronizzato && !personePronte) return;
    const d = foto.exists() ? foto.data() : null;
    if (d && d.updated > (S.dati.personeUpdated || 0)) {
      try {
        S.dati.persone = JSON.parse(d.json);
        S.dati.personeUpdated = d.updated;
        personeInviate = d.updated;
        salvaArrivati();
        disegnaDaFuori();
      } catch { /* documento rovinato: tengo quelle del telefono */ }
    } else if (d) {
      personeInviate = d.updated;
    }
    personePronte = true;
    programmaInvio();
  }, () => {});

  if (!collegato) {
    collegato = true;
    quandoSalva(programmaInvio);
    window.addEventListener("online", () => programmaInvio());
  }
}

export function ferma() {
  stopAscolto?.();
  stopAscolto = null;
  stopPersone?.();
  stopPersone = null;
  docPersone = null;
  personePronte = false;
  personeInviate = 0;
  raccolta = null;
  pronto = false;
  inviati.clear();
  impostaStato("spento");
}

function leggi(doc) {
  const d = doc.data();
  try {
    if (d.eliminato) {
      inviati.set(doc.id, ELIMINATO);
      return { id: doc.id, updated: d.updated || 0, eliminato: true };
    }
    const progetto = normalizzaProgetto(JSON.parse(d.json));
    inviati.set(doc.id, d.json);
    return { id: doc.id, updated: d.updated || 0, eliminato: false, progetto };
  } catch {
    return null;   // documento rovinato: lo ignoro, il telefono resta com'è
  }
}

function applica(remoti) {
  if (!remoti.length) return;
  const { progetti, eliminati } = unisciRemoti(S.dati.projects, S.dati.eliminati, remoti);
  S.dati.projects = progetti;
  S.dati.eliminati = eliminati;
  salvaArrivati();
  disegnaDaFuori();
}

function programmaInvio() {
  if (!pronto && !personePronte) return;
  clearTimeout(attesa);
  attesa = setTimeout(inviaDifferenze, 800);
}

// Manda online solo i progetti cambiati rispetto all'ultima volta
function inviaDifferenze() {
  const { sdk } = firestore();
  if (docPersone && personePronte && (S.dati.personeUpdated || 0) > personeInviate) {
    personeInviate = S.dati.personeUpdated;
    sdk.setDoc(docPersone, { updated: S.dati.personeUpdated, json: JSON.stringify(S.dati.persone || []) });
  }
  if (!raccolta || !pronto) return;
  for (const p of S.dati.projects) {
    const testo = comeTesto(p);
    if (inviati.get(p.id) === testo) continue;
    inviati.set(p.id, testo);
    sdk.setDoc(sdk.doc(raccolta, p.id), { nome: p.name, updated: p.updated || Date.now(), eliminato: false, json: testo });
  }
  for (const [id, quando] of Object.entries(S.dati.eliminati)) {
    if (inviati.get(id) === ELIMINATO) continue;
    inviati.set(id, ELIMINATO);
    sdk.setDoc(sdk.doc(raccolta, id), { nome: "", updated: quando, eliminato: true, json: "" });
  }
}

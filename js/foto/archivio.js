// Dove stanno le foto: sul telefono (IndexedDB, funziona anche offline) e online
// in utenti/{uid}/foto/{id}, un documento per foto. Nel progetto restano solo id, tipo e didascalia.
import { utenteAttuale, firestore } from "../firebase/accesso.js";

const NOME_DB = "diario-uncinetto-foto";
let db = null;
const inMemoria = new Map();   // id → { foto, miniatura } già letti in questa sessione

function apriDb() {
  db ??= new Promise((risolvi, rifiuta) => {
    const r = indexedDB.open(NOME_DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore("foto", { keyPath: "id" });
    r.onsuccess = () => risolvi(r.result);
    r.onerror = () => rifiuta(r.error);
  });
  return db;
}

async function locale(modo, fn) {
  const d = await apriDb();
  return new Promise((risolvi, rifiuta) => {
    const t = d.transaction("foto", modo);
    const r = fn(t.objectStore("foto"));
    t.oncomplete = () => risolvi(r?.result);
    t.onerror = () => rifiuta(t.error);
  });
}

function raccolta() {
  const u = utenteAttuale();
  if (!u) return null;
  const { sdk, db: fs } = firestore();
  return { sdk, rif: (id) => sdk.doc(fs, "utenti", u.uid, "foto", id) };
}

const senzaPrefisso = (dataUrl) => dataUrl.slice(dataUrl.indexOf(",") + 1);
const conPrefisso = (b64) => `data:image/jpeg;base64,${b64}`;

// Salva una foto nuova: subito sul telefono, poi online (se manca la rete parte appena c'è)
export async function salva(id, progettoId, { foto, miniatura }) {
  const voce = { id, progetto: progettoId, foto, miniatura };
  inMemoria.set(id, voce);
  await locale("readwrite", (s) => s.put(voce));
  const online = raccolta();
  online?.sdk.setDoc(online.rif(id), {
    progetto: progettoId, foto: senzaPrefisso(foto), miniatura: senzaPrefisso(miniatura), creata: Date.now(),
  }).catch(() => { /* resta sul telefono; riprova al prossimo salvataggio */ });
}

// Legge una foto: memoria → telefono → online (e la tiene sul telefono per la prossima volta)
export async function leggi(id) {
  if (inMemoria.has(id)) return inMemoria.get(id);
  let voce = await locale("readonly", (s) => s.get(id)).catch(() => null);
  if (!voce) {
    const online = raccolta();
    if (!online) return null;
    try {
      const snap = await online.sdk.getDoc(online.rif(id));
      if (!snap.exists()) return null;
      const d = snap.data();
      voce = { id, progetto: d.progetto, foto: conPrefisso(d.foto), miniatura: conPrefisso(d.miniatura) };
      await locale("readwrite", (s) => s.put(voce)).catch(() => {});
    } catch {
      return null;   // senza rete: la foto arriverà più tardi
    }
  }
  inMemoria.set(id, voce);
  return voce;
}

export async function elimina(id) {
  inMemoria.delete(id);
  await locale("readwrite", (s) => s.delete(id)).catch(() => {});
  const online = raccolta();
  online?.sdk.deleteDoc(online.rif(id)).catch(() => {});
}

// Tutte le foto di un elenco di id (per il backup su file)
export async function tutte(ids) {
  const risultato = {};
  for (const id of ids) {
    const v = await leggi(id);
    if (v) risultato[id] = { foto: v.foto, miniatura: v.miniatura, progetto: v.progetto };
  }
  return risultato;
}

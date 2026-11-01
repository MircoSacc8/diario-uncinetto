// Backup su file: esporta tutti i progetti e li reimporta (unendoli, senza cancellare nulla).
import { normalizzaStato, VERSIONE_DATI } from "./migrazioni.js";
import { unisciProgetti } from "../calcoli/unione.js";

const APP = "diario-uncinetto";

// ---- Parte pura (testata in test/backup.test.js) ----

// "foto" (facoltativo): { id: { foto, miniatura, progetto } } con le immagini in base64
export function creaBackup(dati, quando = Date.now(), foto = {}) {
  return { app: APP, versioneDati: VERSIONE_DATI, esportatoIl: new Date(quando).toISOString(), dati, foto };
}

// Legge il testo di un file di backup. Lancia un errore con un messaggio chiaro se non va bene
export function leggiBackupCompleto(testo) {
  let contenuto;
  try { contenuto = JSON.parse(testo); } catch { throw new Error("Il file non è un backup del Diario: non riesco a leggerlo."); }
  if (contenuto?.app !== APP || !contenuto.dati) throw new Error("Questo file non è un backup del Diario dell'Uncinetto.");
  const foto = contenuto.foto && typeof contenuto.foto === "object" ? contenuto.foto : {};
  return { stato: normalizzaStato(structuredClone(contenuto.dati)), foto };
}

export const leggiBackup = (testo) => leggiBackupCompleto(testo).stato;

export function nomeFile(quando = Date.now()) {
  const d = new Date(quando);
  const p = (n) => String(n).padStart(2, "0");
  return `diario-uncinetto-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}.json`;
}

// Unisce un backup ai dati attuali e restituisce quanti progetti sono cambiati
export function importaNeiDati(dati, daBackup) {
  const { progetti, aggiunti, aggiornati } = unisciProgetti(dati.projects, daBackup.projects);
  dati.projects = progetti;
  return { aggiunti, aggiornati };
}

// ---- Parte che usa il telefono ----

// Su iPhone apre il menu Condividi (Salva in File, iCloud, WhatsApp…); altrove scarica il file
export async function esportaFile(dati, foto = {}) {
  const testo = JSON.stringify(creaBackup(dati, Date.now(), foto));
  const nome = nomeFile();
  const file = new File([testo], nome, { type: "application/json" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "Backup Diario dell'Uncinetto" });
      return true;
    } catch (e) {
      if (e?.name === "AbortError") return false;   // Laura ha chiuso il menu
    }
  }
  const url = URL.createObjectURL(file);
  const a = Object.assign(document.createElement("a"), { href: url, download: nome });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return true;
}

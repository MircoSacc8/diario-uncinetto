// Schermata impostazioni: backup, installazione sulla Home, vibrazione e suono, versione.
import { S, aggiorna, salva } from "../dati/stato.js";
import { esportaFile, leggiBackupCompleto, importaNeiDati } from "../dati/backup.js";
import * as archivio from "../foto/archivio.js";
import { avviso, suona } from "../componenti/avvisi.js";
import { suHome, suIphone, aggiornamentoPronto, applicaAggiornamento } from "../pwa/installa.js";
import { VERSIONE_APP } from "../versione.js";
import { esc } from "../utils/formato.js";
import { testoStato, azioni as azioniAccount } from "../firebase/account.js";
import { conferma } from "../componenti/finestre.js";

const GIORNI_PROMEMORIA = 30;
const GIORNO = 24 * 60 * 60 * 1000;

const dataLeggibile = (ms) => new Date(ms).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });

// true se è ora di ricordare il backup (ci sono progetti e l'ultimo è vecchio o mai fatto)
export function backupDaFare() {
  const ultimo = S.dati.settings.lastBackup || 0;
  return S.dati.projects.length > 0 && Date.now() - ultimo > GIORNI_PROMEMORIA * GIORNO;
}

// Istruzioni per aggiungere l'app alla Home (solo se aperta da Safari)
export function istruzioniHome() {
  if (suHome()) return "";
  const passi = suIphone()
    ? "In Safari tocca <b>Condividi</b> (il quadrato con la freccia) → <b>Aggiungi alla schermata Home</b>."
    : "Nel menu del browser scegli <b>Installa app</b> o <b>Aggiungi a schermata Home</b>.";
  return `<section class="card evidenza"><h2>Mettila sulla schermata Home</h2>
    <p>Così si apre come un'app e il telefono non cancella i tuoi progetti.</p><p>${passi}</p></section>`;
}

export function html() {
  const { settings } = S.dati;
  const ultimo = settings.lastBackup ? `Ultimo backup: ${dataLeggibile(settings.lastBackup)}` : "Non hai ancora fatto un backup.";
  return `
    <button class="link" data-a="home" style="align-self:flex-start">← Tutti i progetti</button>
    <div class="top"><div><div class="eyebrow">Diario dell'Uncinetto</div><h1>Impostazioni</h1></div></div>
    ${aggiornamentoPronto() ? `<section class="card evidenza"><h2>Aggiornamento pronto</h2>
      <button class="btn" data-a="aggiorna-app">Aggiorna l'app</button></section>` : ""}
    ${istruzioniHome()}
    <section class="card"><h2>Account</h2>
      ${settings.email ? `<p>Account: <b>${esc(settings.email)}</b></p>` : "<p>Nessun account collegato.</p>"}
      <p class="hint" id="stato-sync">${testoStato()}</p>
      ${settings.uid ? `<button class="btn ghost" data-a="esci-chiedi">Esci dall'account</button>` : ""}
    </section>
    <section class="card"><div class="card-h"><h2>Misure delle persone</h2><button class="btn ghost piccolo" data-a="persone">Apri</button></div>
      <p class="testo-muto">${S.dati.persone.length ? `${S.dati.persone.length} ${S.dati.persone.length === 1 ? "persona salvata" : "persone salvate"}: ${S.dati.persone.map((x) => esc(x.nome)).join(", ")}.` : "Salva le misure di chi vestirai, per fare i capi su misura."}</p>
    </section>
    <section class="card"><h2>Backup dei progetti</h2>
      <p class="testo-muto">Salva un file con tutti i progetti e le foto in File o iCloud. Se cambi telefono, lo reimporti e ritrovi tutto.</p>
      <p class="${backupDaFare() ? "attenzione" : "hint"}">${ultimo}</p>
      <button class="btn" data-a="backup-esporta">Esporta backup</button>
      <label class="btn ghost carica" for="backup-file">Importa backup<input id="backup-file" type="file" accept="application/json,.json" hidden></label>
      <p class="hint">Importare aggiunge i progetti del file. Se un progetto c'è già, tiene la versione più recente: non cancella niente.</p>
    </section>
    <section class="card"><h2>Preferenze</h2>
      <label class="interruttore" for="vibrazione">Vibrazione a ogni giro<input id="vibrazione" type="checkbox" ${settings.vibrate ? "checked" : ""}></label>
      <p class="hint">Sull'iPhone la vibrazione non c'è: Apple non la permette alle app web.</p>
      <label class="interruttore" for="suono">Suono con i promemoria<input id="suono" type="checkbox" ${settings.suono !== false ? "checked" : ""}></label>
      <p class="hint">Un “din” quando inizia o finisce un promemoria. Non si sente se l'iPhone è in silenzioso.</p>
      <button class="btn ghost piccolo" data-a="suono-prova">Prova il suono</button>
    </section>
    <p class="hint">Versione ${VERSIONE_APP}</p>`;
}

export const azioni = {
  "impostazioni": () => { S.vista.id = null; S.vista.schermata = "impostazioni"; aggiorna(); scrollTo(0, 0); },
  "backup-esporta": async () => {
    const ids = S.dati.projects.flatMap((p) => (p.foto || []).map((f) => f.id));
    if (ids.length) avviso("Preparo il backup con le foto…");
    const fatto = await esportaFile(S.dati, await archivio.tutte(ids));
    if (!fatto) return;
    S.dati.settings.lastBackup = Date.now();
    aggiorna();
    avviso("Backup pronto");
  },
  "aggiorna-app": () => applicaAggiornamento(),
  "suono-prova": () => suona(true),
  "esci-chiedi": () => conferma("Uscire dall'account? I progetti restano salvati online e li ritrovi quando rientri.", "Esci",
    () => { azioniAccount.esci(); }),
};

export const cambio = {
  "vibrazione": (el) => { S.dati.settings.vibrate = el.checked; salva(); },
  "suono": (el) => { S.dati.settings.suono = el.checked; salva(); if (el.checked) suona(true); },
  "backup-file": async (el) => {
    const file = el.files?.[0];
    el.value = "";
    if (!file) return;
    try {
      const { stato, foto } = leggiBackupCompleto(await file.text());
      const { aggiunti, aggiornati } = importaNeiDati(S.dati, stato);
      // Foto del backup che su questo telefono mancano
      for (const [id, f] of Object.entries(foto)) {
        if (!(await archivio.leggi(id))) await archivio.salva(id, f.progetto, f);
      }
      aggiorna();
      avviso(aggiunti + aggiornati ? `Importati: ${aggiunti} nuovi, ${aggiornati} aggiornati` : "Nessuna novità: hai già tutto");
    } catch (e) {
      avviso(e.message);
    }
  },
};

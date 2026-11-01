// Avvio dell'app: carica i dati, sceglie la schermata e smista tocchi e digitazione ai componenti.
import { S, avvia, progetto, parteAttiva, quandoCambia, disegna } from "./dati/stato.js";
import * as home from "./schermate/home.js";
import * as scheda from "./schermate/progetto.js";
import * as impostazioni from "./schermate/impostazioni.js";
import * as pwa from "./pwa/installa.js";
import * as finestre from "./componenti/finestre.js";
import * as parti from "./componenti/parti.js";
import * as contagiri from "./componenti/contagiri.js";
import * as promemoria from "./componenti/promemoria.js";
import * as timer from "./componenti/timer.js";
import * as convertitore from "./componenti/convertitore.js";
import * as contatori from "./componenti/contatori.js";
import * as punti from "./componenti/punti.js";
import * as filati from "./componenti/filati.js";

const moduli = [home, scheda, impostazioni, finestre, parti, contagiri, promemoria, timer, convertitore, contatori, punti, filati];
const azioni = Object.assign({}, ...moduli.map((m) => m.azioni || {}));
const suInput = Object.assign({}, ...moduli.map((m) => m.input || {}));
const suCambio = Object.assign({}, ...moduli.map((m) => m.cambio || {}));

// Contesto passato a ogni azione: progetto aperto, parte attiva, valore del pulsante
function contesto(el) {
  const p = progetto();
  return { el, v: el?.dataset.v, p, a: p && parteAttiva(p) };
}

function mostra() {
  const app = document.getElementById("app");
  const p = progetto();
  if (!p) S.vista.id = null;
  app.innerHTML = p ? scheda.html(p) : S.vista.schermata === "impostazioni" ? impostazioni.html() : home.html();
  document.body.classList.toggle("con-barra", !!p);
  if (p) parti.dopoDisegno();
}

document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-a]");
  if (!el) return;
  const fn = azioni[el.dataset.a];
  if (fn) fn(contesto(el));
});
document.addEventListener("input", (e) => suInput[e.target.id]?.(e.target, contesto(e.target)));
document.addEventListener("change", (e) => suCambio[e.target.id]?.(e.target, contesto(e.target)));

// Schermo sempre acceso mentre è aperto un progetto
let blocco = null;
async function schermoAcceso() {
  try {
    if (progetto() && !blocco && navigator.wakeLock) {
      blocco = await navigator.wakeLock.request("screen");
      blocco.addEventListener("release", () => { blocco = null; });
    }
  } catch { /* non disponibile */ }
}
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") schermoAcceso(); });

async function inizia() {
  avvia();
  finestre.collega();
  quandoCambia(mostra);
  quandoCambia(schermoAcceso);
  await punti.caricaElenco();
  disegna();
  timer.avviaTicchettio();
  pwa.quandoAggiornamento(disegna);
  pwa.registra();
  pwa.datiPermanenti();
}

inizia();

// Avvio dell'app: carica i dati, sceglie la schermata e smista tocchi e digitazione ai componenti.
import { S, avvia, progetto, parteAttiva, quandoCambia, disegna } from "./dati/stato.js";
import * as home from "./schermate/home.js";
import * as scheda from "./schermate/progetto.js";
import * as impostazioni from "./schermate/impostazioni.js";
import * as pwa from "./pwa/installa.js";
import * as schermataAccesso from "./schermate/accesso.js";
import * as account from "./firebase/account.js";
import * as finestre from "./componenti/finestre.js";
import * as parti from "./componenti/parti.js";
import * as contagiri from "./componenti/contagiri.js";
import * as promemoria from "./componenti/promemoria.js";
import * as timer from "./componenti/timer.js";
import * as convertitore from "./componenti/convertitore.js";
import * as contatori from "./componenti/contatori.js";
import * as punti from "./componenti/punti.js";
import * as filati from "./componenti/filati.js";
import * as campioni from "./componenti/campioni.js";
import * as misura from "./componenti/misura.js";
import * as uncinetto from "./componenti/uncinetto.js";
import * as foto from "./componenti/foto.js";
import * as topdown from "./componenti/topdown.js";
import * as sorgenti from "./componenti/sorgenti-misure.js";
import * as nuovaTaglia from "./componenti/nuova-taglia.js";
import * as persone from "./schermate/persone.js";

const moduli = [account, schermataAccesso, home, scheda, impostazioni, finestre, parti, contagiri, promemoria, timer, convertitore, contatori, punti, filati, campioni, misura, foto, topdown, nuovaTaglia, persone];
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
  const schermate = {
    caricamento: schermataAccesso.caricamento,
    accesso: schermataAccesso.html,
    "senza-rete": schermataAccesso.senzaRete,
    impostazioni: impostazioni.html,
    persone: persone.html,
    home: home.html,
  };
  app.innerHTML = p ? scheda.html(p) : (schermate[S.vista.schermata] || home.html)();
  document.body.classList.toggle("con-barra", !!p);
  if (p) parti.dopoDisegno();
  foto.riempi(app);
}

document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-a]");
  if (!el) return;
  const fn = azioni[el.dataset.a];
  if (fn) fn(contesto(el));
});
// Tasto "Vai" della tastiera nel modulo di accesso
document.addEventListener("submit", (e) => {
  if (e.target.id !== "modulo-accesso") return;
  e.preventDefault();
  azioni["entra-email"]?.(contesto(e.target));
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
  await Promise.all([punti.caricaElenco(), uncinetto.caricaElenco(), sorgenti.caricaTaglie(), persone.caricaGuida()]);
  nuovaTaglia.collegaModo();
  timer.avviaTicchettio();
  pwa.quandoAggiornamento(disegna);
  pwa.registra();
  pwa.datiPermanenti();
  await account.avvia();
}

inizia();

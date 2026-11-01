// Contagiri della parte attiva: numero grande, obiettivo, cm, maglie, e barra in basso con −/+1 giro.
import { esc, virgola, ora } from "../utils/formato.js";
import { aggiorna } from "../dati/stato.js";
import { cmDaGiri } from "../calcoli/campione.js";
import { conferma, chiediNumero } from "./finestre.js";
import { riquadroAttivi, cheIniziano } from "./promemoria.js";
import { avviso, vibra } from "./avvisi.js";
import * as timer from "./timer.js";

export function html(p, a) {
  const cm = cmDaGiri(a.rounds, p.gauge);
  const dettagli = [a.start && `Partenza: ${esc(a.start)}`, a.hook && `Uncinetto ${esc(a.hook)}`].filter(Boolean).join(" · ");
  return `<section class="contagiri" aria-label="Contagiri ${esc(a.name)}">
    <div class="testa"><h2>${esc(a.name)}</h2><button class="link" data-a="parte-modifica">Modifica parte</button></div>
    ${dettagli ? `<div class="info">${dettagli}</div>` : ""}
    <button class="numero" id="numero" data-a="giro-imposta" aria-label="Giro ${a.rounds}, tocca per scrivere il numero">${a.rounds}</button>
    <div class="di">${a.target ? `di ${a.target} giri · mancano ${Math.max(0, a.target - a.rounds)}` : "giri fatti"}${cm !== null ? ` · circa ${virgola(cm)} cm` : ""}</div>
    ${riquadroAttivi(a)}
    <div class="sotto"><span class="etichetta">Maglie</span><span class="n">${p.stitchCount}</span>
      <button class="tondo" data-a="maglia-meno" aria-label="Togli una maglia">−</button>
      <button class="tondo" data-a="maglia-piu" aria-label="Aggiungi una maglia">+</button></div>
    ${timer.html(p)}
    <div class="collegamenti">
      <button class="link" data-a="nota-nuova">+ Promemoria</button>
      <button class="link" data-a="maglie-azzera">Azzera maglie</button>
      <button class="link" data-a="giri-azzera">Azzera giri</button>
      <button class="link" data-a="timer-azzera">Azzera tempo</button>
    </div>
  </section>`;
}

// Barra fissa in basso, sempre a portata di pollice
export const barra = () => `<div class="barra">
  <button class="meno" data-a="giro-meno" aria-label="Togli un giro">−</button>
  <button class="piu" data-a="giro-piu">+1 giro</button>
</div>`;

function salto() {
  const n = document.getElementById("numero");
  if (!n) return;
  n.classList.remove("salto"); void n.offsetWidth; n.classList.add("salto");
}

export const azioni = {
  "giro-piu": ({ p, a }) => {
    a.rounds++; p.updated = ora(); aggiorna(); salto(); vibra();
    const nuovi = cheIniziano(a);
    if (nuovi.length) avviso("⏰ " + nuovi.map((l) => l.t).join(" · "));
    else if (a.target && a.rounds === a.target) avviso(`${a.name}: giri finiti!`);
  },
  "giro-meno": ({ p, a }) => { if (a.rounds > 0) { a.rounds--; p.updated = ora(); aggiorna(); } },
  "giro-imposta": ({ p, a }) => chiediNumero(`Giro attuale · ${esc(a.name)}`, a.rounds, (n) => { a.rounds = n; p.updated = ora(); }),
  "giri-azzera": ({ a }) => conferma(`Azzerare i giri di “${esc(a.name)}”?`, "Azzera", () => { a.rounds = 0; }),
  "maglia-piu": ({ p }) => { p.stitchCount++; aggiorna(); },
  "maglia-meno": ({ p }) => { if (p.stitchCount > 0) { p.stitchCount--; aggiorna(); } },
  "maglie-azzera": ({ p }) => { p.stitchCount = 0; aggiorna(); avviso("Maglie azzerate"); },
};

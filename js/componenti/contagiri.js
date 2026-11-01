// Contagiri della parte attiva: numero grande, obiettivo (giri o cm), maglie, timer,
// e barra in basso con −/+1 giro.
import { esc, virgola, ora } from "../utils/formato.js";
import { aggiorna } from "../dati/stato.js";
import { campioneDi, uncinettoDi, cmAttuali, giriMancanti, uncinettoTesto } from "../calcoli/misure.js";
import { conferma, chiediNumero } from "./finestre.js";
import { riquadroAttivi, annuncia } from "./promemoria.js";
import { avviso, vibra } from "./avvisi.js";
import * as timer from "./timer.js";
import * as misura from "./misura.js";

// Riga sotto il numero: a che punto si è rispetto all'obiettivo
function avanzamento(a, c) {
  const { tipo, valore } = a.obiettivo;
  const ora = cmAttuali(a, c);
  const mancano = giriMancanti(a, c);
  const cmTesto = ora ? `${ora.daMisura ? "" : "circa "}${virgola(ora.cm)} cm` : "";
  if (tipo === "cm" && valore) {
    if (!ora) return `obiettivo ${virgola(valore)} cm · aggiungi un campione o una misura per la stima`;
    return `${cmTesto} di ${virgola(valore)}${mancano !== null ? ` · mancano circa ${mancano} giri` : ""}`;
  }
  if (valore) return `di ${valore} giri · mancano ${mancano}${cmTesto ? ` · ${cmTesto}` : ""}`;
  return `giri fatti${cmTesto ? ` · ${cmTesto}` : ""}`;
}

export function html(p, a) {
  const c = campioneDi(p, a);
  const dettagli = [
    a.start && `Partenza: ${esc(a.start)}`,
    a.uncinetto && esc(uncinettoTesto(uncinettoDi(p, a))),
    p.campioni.length > 1 && c && `Campione: ${esc(c.nome || "—")}`,
  ].filter(Boolean).join(" · ");
  return `<section class="contagiri" aria-label="Contagiri ${esc(a.name)}">
    <div class="testa"><h2>${esc(a.name)}</h2><button class="link" data-a="parte-modifica">Modifica parte</button></div>
    ${dettagli ? `<div class="info">${dettagli}</div>` : ""}
    <button class="numero" id="numero" data-a="giro-imposta" aria-label="Giro ${a.rounds}, tocca per scrivere il numero">${a.rounds}</button>
    <div class="di">${avanzamento(a, c)}</div>
    ${misura.riga(a)}
    ${riquadroAttivi(a)}
    <div class="sotto"><span class="etichetta">Maglie</span><span class="n">${p.stitchCount}</span>
      <button class="tondo" data-a="maglia-meno" aria-label="Togli una maglia">−</button>
      <button class="tondo" data-a="maglia-piu" aria-label="Aggiungi una maglia">+</button></div>
    ${timer.html(p)}
    <div class="collegamenti">
      <button class="link" data-a="misura">📏 Misura</button>
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
    const c = campioneDi(p, a);
    const primaMancavano = giriMancanti(a, c);
    a.rounds++; p.updated = ora(); aggiorna(); salto(); vibra();
    const { tipo, valore } = a.obiettivo;
    if (annuncia(a, a.rounds - 1, a.rounds)) return;   // promemoria che iniziano o finiscono qui
    if (valore && primaMancavano > 0 && giriMancanti(a, c) === 0) {
      avviso(tipo === "cm" ? `Dovresti essere a ${virgola(valore)} cm: misura col metro` : `${a.name}: giri finiti!`);
    }
  },
  "giro-meno": ({ p, a }) => { if (a.rounds > 0) { a.rounds--; p.updated = ora(); aggiorna(); } },
  "giro-imposta": ({ p, a }) => chiediNumero(`Giro attuale · ${esc(a.name)}`, a.rounds, (n) => {
    const prima = a.rounds;
    a.rounds = n; p.updated = ora();
    setTimeout(() => annuncia(a, prima, n), 0);   // dopo la chiusura della finestra del numero
  }),
  "giri-azzera": ({ a }) => conferma(`Azzerare i giri di “${esc(a.name)}”?`, "Azzera", () => { a.rounds = 0; }),
  "maglia-piu": ({ p }) => { p.stitchCount++; aggiorna(); },
  "maglia-meno": ({ p }) => { if (p.stitchCount > 0) { p.stitchCount--; aggiorna(); } },
  "maglie-azzera": ({ p }) => { p.stitchCount = 0; aggiorna(); avviso("Maglie azzerate"); },
};

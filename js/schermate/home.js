// Lista dei progetti con i filtri in corso / finito / tutti.
import { esc, durata } from "../utils/formato.js";
import { S, aggiorna, parteAttiva, tempoTrascorso } from "../dati/stato.js";
import { moduloProgetto } from "./progetto.js";
import { backupDaFare, istruzioniHome } from "./impostazioni.js";
import { aggiornamentoPronto } from "../pwa/installa.js";
import { testoStato } from "../firebase/account.js";
import { campioneDi, percentuale, uncinettoTesto } from "../calcoli/misure.js";

const FILTRI = ["in corso", "finito", "tutti"];

function scheda(p) {
  const a = parteAttiva(p);
  const percento = percentuale(a, campioneDi(p, a));
  const tempo = tempoTrascorso(p);
  const meta = [
    p.parts.length > 1 && esc(a.name),
    esc(uncinettoTesto(p.uncinetto, true)),
    tempo > 59999 && durata(tempo, false),
    p.timerStart && '<span class="acceso"></span>timer acceso',
  ].filter(Boolean).join(" · ");
  return `<button class="proj" data-a="apri" data-v="${p.id}">
    <span class="nome">${esc(p.name)}${p.status === "finito" ? '<span class="tag">finito</span>' : ""}</span>
    <span class="conta">${a.rounds}<small>giri</small></span>
    <span class="meta">${meta}</span>
    ${percento !== null ? `<span class="barretta"><i style="width:${percento}%"></i></span>` : ""}
  </button>`;
}

export function html() {
  const { filtro } = S.vista;
  const lista = S.dati.projects
    .filter((p) => filtro === "tutti" || p.status === filtro)
    .sort((a, b) => b.updated - a.updated);
  return `
    <div class="top">
      <div><div class="eyebrow">Progetti all'uncinetto</div><h1>Diario dell'Uncinetto</h1></div>
      <button class="tondo ingranaggio" data-a="impostazioni" aria-label="Impostazioni">⚙︎</button>
    </div>
    ${aggiornamentoPronto() ? `<button class="striscia" data-a="aggiorna-app">Aggiornamento pronto · tocca per aggiornare</button>` : ""}
    ${backupDaFare() ? `<button class="striscia attenzione" data-a="impostazioni">È ora di fare un backup dei progetti · apri</button>` : ""}
    <button class="btn" data-a="progetto-nuovo">+ Nuovo progetto</button>
    <div class="filtri">${FILTRI.map((f) =>
      `<button class="filtro" data-a="filtro" data-v="${f}" aria-pressed="${filtro === f}">${f[0].toUpperCase() + f.slice(1)}</button>`).join("")}</div>
    <div class="lista">${lista.length ? lista.map(scheda).join("")
      : `<div class="vuoto">Nessun progetto qui.<br>Tocca “Nuovo progetto” per iniziare a contare.</div>`}</div>
    ${istruzioniHome()}
    <p class="hint" id="stato-sync">${testoStato()}</p>`;
}

export const azioni = {
  "progetto-nuovo": () => moduloProgetto(),
  "filtro": ({ v }) => { S.vista.filtro = v; aggiorna(); },
  "apri": ({ v }) => { S.vista.id = v; aggiorna(); scrollTo(0, 0); },
};

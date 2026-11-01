// Promemoria legati a un giro o a un intervallo di giri (es. "dal 18 al 44: diminuzioni").
import { esc } from "../utils/formato.js";
import { aggiorna } from "../dati/stato.js";
import { nuovaNota } from "../dati/modelli.js";
import { apri, chiudi, pulsanti } from "./finestre.js";

export const intervallo = (l) => (l.to > l.r ? `Giri ${l.r}–${l.to}` : `Giro ${l.r}`);

// Promemoria validi al giro attuale della parte
export const attivi = (a) => a.log.filter((l) => a.rounds >= l.r && a.rounds <= l.to);

// Promemoria che iniziano esattamente a questo giro (per l'avviso)
export const cheIniziano = (a) => a.log.filter((l) => l.r === a.rounds);

// Riquadro verde dentro il contagiri
export function riquadroAttivi(a) {
  const qui = attivi(a);
  if (!qui.length) return "";
  return `<div class="promemoria-ora" role="status">${qui.map((l) => `<span>${esc(l.t)}</span><small>${intervallo(l)}</small>`).join("")}</div>`;
}

// Scheda con tutti i promemoria della parte
export function html(a) {
  if (!a.log.length) return "";
  const righe = [...a.log].sort((x, y) => x.r - y.r).map((l) => {
    const stato = a.rounds >= l.r && a.rounds <= l.to ? "ora" : a.rounds > l.to ? "passato" : "";
    return `<button class="${stato}" data-a="nota-modifica" data-v="${l.id}"><b>${intervallo(l)}</b><span>${esc(l.t)}</span></button>`;
  }).join("");
  return `<section class="card"><h2>Promemoria · ${esc(a.name)}</h2><div class="registro">${righe}</div></section>`;
}

function modulo(a, l) {
  apri(`<h2>${l ? "Modifica promemoria" : "Nuovo promemoria"} · ${esc(a.name)}</h2>
    <label for="n-testo">Cosa fare<input id="n-testo" name="t" required value="${esc(l?.t)}" placeholder="Es. due dim"></label>
    <div class="griglia2">
      <label for="n-dal">Dal giro<input id="n-dal" name="r" type="number" min="0" inputmode="numeric" required value="${l?.r ?? a.rounds}"></label>
      <label for="n-al">Al giro (facoltativo)<input id="n-al" name="to" type="number" min="0" inputmode="numeric" value="${l && l.to > l.r ? l.to : ""}"></label>
    </div>
    <div class="hint">Il promemoria compare in evidenza quando arrivi a quei giri.</div>
    ${pulsanti("Salva", l ? `<button type="button" class="pericolo" data-a="nota-rimuovi" data-v="${l.id}">Rimuovi</button>` : "")}`,
  (d) => {
    const r = +d.get("r") || 0;
    const to = Math.max(r, +d.get("to") || r);
    const t = d.get("t").trim();
    if (l) Object.assign(l, { r, to, t });
    else a.log.push(nuovaNota(r, to, t));
  });
}

export const azioni = {
  "nota-nuova": ({ a }) => modulo(a),
  "nota-modifica": ({ a, v }) => modulo(a, a.log.find((l) => l.id === v)),
  "nota-rimuovi": ({ a, v }) => { a.log = a.log.filter((l) => l.id !== v); chiudi(); aggiorna(); },
};

// Promemoria legati a un giro o a un intervallo di giri (es. "dal 18 al 44: diminuzioni").
// Ogni promemoria ha un tipo (aumenti, diminuzioni, cambio colore, altro) con icona e colore.
import { esc } from "../utils/formato.js";
import { aggiorna } from "../dati/stato.js";
import { nuovaNota } from "../dati/modelli.js";
import { TIPI, tipoDi, indovinaTipo, eventiGiro } from "../calcoli/promemoria.js";
import { apri, chiudi, pulsanti } from "./finestre.js";
import { suona, vibra } from "./avvisi.js";

export const intervallo = (l) => (l.to > l.r ? `Giri ${l.r}–${l.to}` : `Giro ${l.r}`);
const icona = (l) => TIPI[tipoDi(l)].icona;

// Promemoria validi al giro attuale della parte
export const attivi = (a) => a.log.filter((l) => a.rounds >= l.r && a.rounds <= l.to);

// Riquadro colorato dentro il contagiri, uno per promemoria attivo
export function riquadroAttivi(a) {
  const qui = attivi(a);
  if (!qui.length) return "";
  return `<div class="promemoria-ora" role="status">${qui.map((l) => {
    const ultimo = l.to > l.r && a.rounds === l.to;
    return `<div class="pm tipo-${tipoDi(l)}"><span class="pm-icona" aria-hidden="true">${icona(l)}</span>
      <span class="pm-testo"><b>${esc(l.t)}</b><small>${TIPI[tipoDi(l)].nome} · ${intervallo(l)}${ultimo ? " · ultimo giro" : ""}</small></span></div>`;
  }).join("")}</div>`;
}

// Scheda con tutti i promemoria della parte
export function html(a) {
  if (!a.log.length) return "";
  const righe = [...a.log].sort((x, y) => x.r - y.r).map((l) => {
    const stato = a.rounds >= l.r && a.rounds <= l.to ? "ora" : a.rounds > l.to ? "passato" : "";
    return `<button class="${stato} tipo-${tipoDi(l)}" data-a="nota-modifica" data-v="${l.id}"><b>${intervallo(l)}</b><span><span aria-hidden="true">${icona(l)}</span> ${esc(l.t)}</span></button>`;
  }).join("");
  return `<section class="card"><h2>Promemoria · ${esc(a.name)}</h2><div class="registro">${righe}</div></section>`;
}

function modulo(a, l) {
  const tipo = l ? tipoDi(l) : "";
  apri(`<h2>${l ? "Modifica promemoria" : "Nuovo promemoria"} · ${esc(a.name)}</h2>
    <fieldset class="scelta"><legend>Tipo</legend>
      <div class="segmenti quattro">${Object.entries(TIPI).map(([k, x]) =>
        `<label><input type="radio" name="tipo" value="${k}" ${tipo === k ? "checked" : ""}><span><span aria-hidden="true">${x.icona}</span> ${x.nome}</span></label>`).join("")}
      </div>
      ${l ? "" : `<div class="hint">Se non scegli, lo indovino dal testo (“dim” → Diminuzioni, “aum” → Aumenti).</div>`}
    </fieldset>
    <label for="n-testo">Cosa fare<input id="n-testo" name="t" required value="${esc(l?.t)}" placeholder="Es. due dim"></label>
    <div class="griglia2">
      <label for="n-dal">Dal giro<input id="n-dal" name="r" type="number" min="0" inputmode="numeric" required value="${l?.r ?? a.rounds}"></label>
      <label for="n-al">Al giro (facoltativo)<input id="n-al" name="to" type="number" min="0" inputmode="numeric" value="${l && l.to > l.r ? l.to : ""}"></label>
    </div>
    <div class="hint">Quando arrivi al primo giro compare un avviso da confermare; se c'è “Al giro”, un altro all'ultimo giro.</div>
    ${pulsanti("Salva", l ? `<button type="button" class="pericolo" data-a="nota-rimuovi" data-v="${l.id}">Rimuovi</button>` : "")}`,
  (d) => {
    const r = +d.get("r") || 0;
    const to = Math.max(r, +d.get("to") || r);
    const t = d.get("t").trim();
    const scelto = TIPI[d.get("tipo")] ? d.get("tipo") : indovinaTipo(t);
    if (l) Object.assign(l, { r, to, t, tipo: scelto });
    else a.log.push(nuovaNota(r, to, t, scelto));
  });
}

// Avviso grande da confermare quando il giro passa da "prima" a "dopo".
// Restituisce true se ha mostrato qualcosa (così il contagiri non aggiunge altri messaggi).
export function annuncia(a, prima, dopo) {
  const eventi = eventiGiro(a.log, prima, dopo);
  if (!eventi.length) return false;
  const voci = eventi.map(({ nota, quando }) => `
    <div class="pm grande tipo-${tipoDi(nota)}"><span class="pm-icona" aria-hidden="true">${icona(nota)}</span>
      <span class="pm-testo"><small>${quando === "fine" ? "Ultimo giro" : "Da adesso"} · ${intervallo(nota)}</small><b>${esc(nota.t)}</b></span></div>`).join("");
  apri(`<div class="annuncio" role="alertdialog" aria-label="Promemoria">
      <div class="eyebrow">${esc(a.name)} · giro ${dopo}</div>
      ${voci}
    </div>
    <div class="azioni"><button class="btn largo" autofocus>Ok, fatto</button></div>`, () => {});
  suona();
  vibra([120, 80, 120]);
  return true;
}

export const azioni = {
  "nota-nuova": ({ a }) => modulo(a),
  "nota-modifica": ({ a, v }) => modulo(a, a.log.find((l) => l.id === v)),
  "nota-rimuovi": ({ a, v }) => { a.log = a.log.filter((l) => l.id !== v); chiudi(); aggiorna(); },
};

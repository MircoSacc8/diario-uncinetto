// Le parti di un progetto (es. maniche, posteriore): scorrono in orizzontale, una è attiva.
import { esc, num } from "../utils/formato.js";
import { aggiorna, parteAttiva } from "../dati/stato.js";
import { nuovaParte } from "../dati/modelli.js";
import { giriDaCm } from "../calcoli/campione.js";
import { apri, chiudi, pulsanti } from "./finestre.js";

const percento = (x) => Math.min(100, (x.rounds / x.target) * 100);

export function html(p, a) {
  const schede = p.parts.map((x) => `
    <button class="parte" data-a="parte" data-v="${x.id}" aria-pressed="${x.id === a.id}">
      <b>${esc(x.name)}</b>
      <span>${x.rounds}${x.target ? ` <small>/ ${x.target}</small>` : ""}${x.target && x.rounds >= x.target ? " <small>✓</small>" : ""}</span>
      ${x.target ? `<span class="mini"><i style="width:${percento(x)}%"></i></span>` : ""}
    </button>`).join("");
  return `<nav class="parti" aria-label="Parti del progetto">${schede}
    <button class="parte aggiungi" data-a="parte-nuova">+ Parte</button></nav>`;
}

function modulo(p, x) {
  apri(`<h2>${x ? "Modifica parte" : "Nuova parte"}</h2>
    <label for="p-nome">Nome<input id="p-nome" name="name" required value="${esc(x?.name)}" placeholder="Es. Manica dx"></label>
    <label for="p-inizio">Partenza<input id="p-inizio" name="start" value="${esc(x?.start)}" placeholder="Es. 50 cat"></label>
    <div class="griglia2">
      <label for="p-giri">Giri da fare<input id="p-giri" name="target" type="number" min="0" inputmode="numeric" value="${x?.target || ""}"></label>
      <label for="p-unc">Uncinetto (se diverso)<input id="p-unc" name="hook" value="${esc(x?.hook)}" placeholder="5 poi 6"></label>
    </div>
    ${p.gauge ? `<label for="p-cm">Oppure lunghezza in cm<input id="p-cm" name="cm" inputmode="decimal" placeholder="Es. 43"></label>
      <div class="hint">Se scrivi i cm, i giri si calcolano col campione (${p.gauge} giri in 10 cm).</div>` : ""}
    ${pulsanti("Salva", x && p.parts.length > 1 ? `<button type="button" class="pericolo" data-a="parte-rimuovi">Rimuovi parte</button>` : "")}`,
  (d) => {
    let target = +d.get("target") || 0;
    const cm = num(d.get("cm"));
    if (cm && p.gauge) target = giriDaCm(cm, p.gauge);
    const valori = { name: d.get("name").trim(), start: d.get("start").trim(), hook: d.get("hook").trim(), target };
    if (x) Object.assign(x, valori);
    else { const n = nuovaParte(valori.name, valori); p.parts.push(n); p.active = n.id; }
    p.updated = Date.now();
  });
}

export const azioni = {
  "parte": ({ p, v }) => { p.active = v; aggiorna(); },
  "parte-nuova": ({ p }) => modulo(p),
  "parte-modifica": ({ p }) => modulo(p, parteAttiva(p)),
  "parte-rimuovi": ({ p }) => {
    const a = parteAttiva(p);
    p.parts = p.parts.filter((x) => x.id !== a.id);
    p.active = p.parts[0].id;
    chiudi(); aggiorna();
  },
};

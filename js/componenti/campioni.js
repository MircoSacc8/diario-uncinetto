// Campioni del progetto: quante maglie e giri stanno in 10 cm con un filato e un uncinetto.
// Se cambia il filo si aggiunge un campione nuovo e lo si assegna alle parti fatte con quel filo.
import { esc, num } from "../utils/formato.js";
import { aggiorna } from "../dati/stato.js";
import { nuovoCampione } from "../dati/modelli.js";
import { uncinettoTesto, campioneTesto } from "../calcoli/misure.js";
import { apri, chiudi, pulsanti } from "./finestre.js";
import * as uncinetto from "./uncinetto.js";

export function html(p) {
  const righe = p.campioni.map((c) => `
    <button class="campione" data-a="campione-modifica" data-v="${c.id}">
      <span class="t"><strong>${esc(c.nome || "Campione")}${c.id === p.campione ? ' <span class="tag">principale</span>' : ""}</strong>
      <span>${esc([c.filato, uncinettoTesto(c.uncinetto, true), c.punto].filter(Boolean).join(" · "))}</span></span>
      <span class="misura">${esc(campioneTesto(c))}</span>
    </button>`).join("");
  return `<section class="card"><div class="card-h"><h2>Campioni</h2><button class="btn ghost piccolo" data-a="campione-nuovo">+ Campione</button></div>
    ${p.campioni.length ? `<div class="lista-campioni">${righe}</div>`
      : `<div class="testo-muto">Fai un quadrato di circa 12×12 cm con il filato e l'uncinetto del progetto, poi conta maglie e giri dentro 10 cm. Con il campione l'app calcola cm, giri e catenelle.</div>`}
  </section>`;
}

function modulo(p, c) {
  const filati = p.yarns.map((y) => [y.name, y.color].filter(Boolean).join(" ")).filter(Boolean);
  apri(`<h2>${c ? "Modifica campione" : "Nuovo campione"}</h2>
    <label for="cp-nome">Nome<input id="cp-nome" name="nome" value="${esc(c?.nome)}" placeholder="Es. Lana grigia"></label>
    <label for="cp-filato">Filato<input id="cp-filato" name="filato" list="cp-filati" value="${esc(c?.filato)}" placeholder="Marca e colore"></label>
    <datalist id="cp-filati">${filati.map((f) => `<option value="${esc(f)}">`).join("")}</datalist>
    ${uncinetto.campi("cp-unc", c?.uncinetto || p.uncinetto)}
    <label for="cp-punto">Punto del campione<input id="cp-punto" name="punto" value="${esc(c?.punto)}" placeholder="Es. maglia alta"></label>
    <div class="griglia2">
      <label for="cp-maglie">Maglie in 10 cm<input id="cp-maglie" name="maglie10" inputmode="decimal" value="${c?.maglie10 || ""}" placeholder="14"></label>
      <label for="cp-giri">Giri in 10 cm<input id="cp-giri" name="giri10" inputmode="decimal" value="${c?.giri10 || ""}" placeholder="18"></label>
    </div>
    <label class="interruttore" for="cp-principale">Campione principale del progetto<input id="cp-principale" name="principale" type="checkbox" ${!c || c.id === p.campione || !p.campioni.length ? "checked" : ""}></label>
    <div class="hint">Le parti usano il campione principale, a meno che tu ne scelga un altro nella parte.</div>
    ${pulsanti("Salva", c ? `<button type="button" class="pericolo" data-a="campione-rimuovi" data-v="${c.id}">Rimuovi</button>` : "")}`,
  (d) => {
    const valori = {
      nome: d.get("nome").trim(), filato: d.get("filato").trim(), punto: d.get("punto").trim(),
      uncinetto: uncinetto.leggi(d, "cp-unc"), maglie10: num(d.get("maglie10")), giri10: num(d.get("giri10")),
    };
    let id = c?.id;
    if (c) Object.assign(c, valori);
    else { const n = nuovoCampione(valori); p.campioni.push(n); id = n.id; }
    if (d.get("principale") || !p.campione) p.campione = id;
  });
}

export const azioni = {
  "campione-nuovo": ({ p }) => modulo(p),
  "campione-modifica": ({ p, v }) => modulo(p, p.campioni.find((c) => c.id === v)),
  "campione-rimuovi": ({ p, v }) => {
    p.campioni = p.campioni.filter((c) => c.id !== v);
    if (p.campione === v) p.campione = p.campioni[0]?.id || "";
    p.parts.forEach((x) => { if (x.campione === v) x.campione = ""; });
    chiudi(); aggiorna();
  },
};

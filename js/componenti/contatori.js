// Contatori in più con un nome (ripetizioni del motivo, diminuzioni fatte…).
import { esc, uid } from "../utils/formato.js";
import { aggiorna } from "../dati/stato.js";
import { apri, chiudi, pulsanti } from "./finestre.js";

export function html(p) {
  const righe = p.counters.map((c) => `<div class="contatore">
      <button class="nome" data-a="contatore-modifica" data-v="${c.id}">${esc(c.name)} ✎</button>
      <span class="n">${c.n}</span>
      <button class="tondo" data-a="contatore-meno" data-v="${c.id}" aria-label="Togli uno a ${esc(c.name)}">−</button>
      <button class="tondo" data-a="contatore-piu" data-v="${c.id}" aria-label="Aggiungi uno a ${esc(c.name)}">+</button>
    </div>`).join("");
  return `<section class="card"><div class="card-h"><h2>Altri contatori</h2><button class="btn ghost piccolo" data-a="contatore-nuovo">+ Contatore</button></div>
    ${p.counters.length ? `<div>${righe}</div>` : `<div class="testo-muto">Per ripetizioni del motivo, diminuzioni fatte o pezzi finiti.</div>`}
  </section>`;
}

function modulo(p, c) {
  apri(`<h2>${c ? "Modifica contatore" : "Nuovo contatore"}</h2>
    <label for="c-nome">Nome<input id="c-nome" name="name" required value="${esc(c?.name)}" placeholder="Es. Diminuzioni fatte"></label>
    <label for="c-valore">Valore<input id="c-valore" name="n" type="number" min="0" inputmode="numeric" value="${c?.n ?? 0}"></label>
    ${pulsanti("Salva", c ? `<button type="button" class="pericolo" data-a="contatore-rimuovi" data-v="${c.id}">Rimuovi</button>` : "")}`,
  (d) => {
    const valori = { name: d.get("name").trim(), n: Math.max(0, +d.get("n") || 0) };
    if (c) Object.assign(c, valori); else p.counters.push({ id: uid(), ...valori });
  });
}

const trova = (p, v) => p.counters.find((c) => c.id === v);

export const azioni = {
  "contatore-nuovo": ({ p }) => modulo(p),
  "contatore-modifica": ({ p, v }) => modulo(p, trova(p, v)),
  "contatore-piu": ({ p, v }) => { trova(p, v).n++; aggiorna(); },
  "contatore-meno": ({ p, v }) => { const c = trova(p, v); c.n = Math.max(0, c.n - 1); aggiorna(); },
  "contatore-rimuovi": ({ p, v }) => { p.counters = p.counters.filter((c) => c.id !== v); chiudi(); aggiorna(); },
};

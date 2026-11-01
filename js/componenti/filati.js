// Filati usati: marca, colore, tinta e grammi.
import { esc, uid, ora } from "../utils/formato.js";
import { aggiorna, grammiTotali } from "../dati/stato.js";
import { apri, chiudi, pulsanti } from "./finestre.js";

export function html(p) {
  const righe = p.yarns.map((y) => `<div class="filato">
      <span class="pallino" style="background:${esc(y.hex || "#cccccc")}"></span>
      <span class="t"><strong>${esc(y.name)}</strong><span>${esc(y.color || "")}</span></span>
      <button class="g" data-a="filato" data-v="${y.id}">${+y.grams || 0} g ✎</button>
    </div>`).join("");
  return `<section class="card"><div class="card-h"><h2>Filati</h2><button class="btn ghost piccolo" data-a="filato">+ Filato</button></div>
    ${p.yarns.length ? `${righe}<div class="totale">Totale ${grammiTotali(p)} g</div>`
      : `<div class="testo-muto">Aggiungi il filato che stai usando: marca, colore e grammi.</div>`}
  </section>`;
}

function modulo(p, y) {
  apri(`<h2>${y ? "Modifica filato" : "Aggiungi filato"}</h2>
    <label for="f-nome">Marca / filato<input id="f-nome" name="name" required value="${esc(y?.name)}" placeholder="Es. Cotone Milano"></label>
    <div class="griglia2">
      <label for="f-colore">Colore<input id="f-colore" name="color" value="${esc(y?.color)}" placeholder="Salvia"></label>
      <label for="f-tinta">Tinta<input id="f-tinta" name="hex" type="color" value="${esc(y?.hex || "#b9a3cf")}" style="padding:4px"></label>
    </div>
    <label for="f-grammi">Grammi usati<input id="f-grammi" name="grams" type="number" min="0" inputmode="numeric" value="${y?.grams ?? ""}" placeholder="50 g = 1 gomitolo"></label>
    ${pulsanti("Salva", y ? `<button type="button" class="pericolo" data-a="filato-rimuovi" data-v="${y.id}">Rimuovi</button>` : "")}`,
  (d) => {
    const valori = { name: d.get("name").trim(), color: d.get("color").trim(), hex: d.get("hex"), grams: +d.get("grams") || 0 };
    if (y) Object.assign(y, valori); else p.yarns.push({ id: uid(), ...valori });
    p.updated = ora();
  });
}

export const azioni = {
  "filato": ({ p, v }) => modulo(p, p.yarns.find((y) => y.id === v)),
  "filato-rimuovi": ({ p, v }) => { p.yarns = p.yarns.filter((y) => y.id !== v); chiudi(); aggiorna(); },
};

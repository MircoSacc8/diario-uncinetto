// Punti usati nel progetto. L'elenco viene da dati/punti.json.
import { esc } from "../utils/formato.js";
import { aggiorna } from "../dati/stato.js";

let elenco = [];

export async function caricaElenco() {
  try {
    const r = await fetch("dati/punti.json");
    elenco = await r.json();
  } catch {
    elenco = [];
  }
}

export function html(p) {
  if (!elenco.length) return "";
  const chips = elenco.map(({ sigla, nome }) =>
    `<button class="chip" data-a="punto" data-v="${esc(sigla)}" aria-pressed="${p.stitches.includes(sigla)}"><b>${esc(sigla)}</b> ${esc(nome)}</button>`).join("");
  return `<section class="card"><h2>Punti usati</h2><div class="chips">${chips}</div></section>`;
}

export const azioni = {
  "punto": ({ p, v }) => {
    p.stitches = p.stitches.includes(v) ? p.stitches.filter((x) => x !== v) : [...p.stitches, v];
    aggiorna();
  },
};

// Convertitore col campione della parte attiva: cm ↔ giri (lunghezza) e cm ↔ maglie (larghezza).
import { num, virgola } from "../utils/formato.js";
import { cmDaGiri, giriDaCm } from "../calcoli/campione.js";
import { campioneDi } from "../calcoli/misure.js";
import { parteAttiva } from "../dati/stato.js";

const campione = (p) => campioneDi(p, parteAttiva(p));

export function html(p) {
  const c = campione(p);
  if (!c?.giri10 && !c?.maglie10) return "";
  const riga = (id, etichetta, ph) => `<div class="calcolo">
      <label for="conv-${id}-cm">Centimetri<input id="conv-${id}-cm" type="text" inputmode="decimal" placeholder="${ph[0]}"></label>
      <span class="uguale">=</span>
      <label for="conv-${id}">${etichetta}<input id="conv-${id}" type="text" inputmode="decimal" placeholder="${ph[1]}"></label>
    </div>`;
  return `<section class="card"><h2>Calcola col campione</h2>
    ${c.giri10 ? riga("giri", "Giri (lunghezza)", ["20", String(giriDaCm(20, c.giri10))]) : ""}
    ${c.maglie10 ? riga("maglie", "Maglie (larghezza)", ["20", String(giriDaCm(20, c.maglie10))]) : ""}
    <div class="hint">Campione “${c.nome || "principale"}”: ${[c.maglie10 && `${c.maglie10} maglie`, c.giri10 && `${c.giri10} giri`].filter(Boolean).join(" e ")} in 10 cm.</div>
  </section>`;
}

// Mentre scrive in un campo, l'altro si aggiorna. "giri10" e "maglie10" funzionano allo stesso modo
const coppia = (id, chiave) => ({
  [`conv-${id}-cm`]: (el, { p }) => {
    const cm = num(el.value);
    document.getElementById(`conv-${id}`).value = cm ? giriDaCm(cm, campione(p)[chiave]) : "";
  },
  [`conv-${id}`]: (el, { p }) => {
    const n = num(el.value);
    document.getElementById(`conv-${id}-cm`).value = n ? virgola(cmDaGiri(n, campione(p)[chiave])) : "";
  },
});

export const input = { ...coppia("giri", "giri10"), ...coppia("maglie", "maglie10") };

// Convertitore cm ↔ giri, visibile solo se il progetto ha il campione.
import { num, virgola } from "../utils/formato.js";
import { cmDaGiri, giriDaCm } from "../calcoli/campione.js";

export function html(p) {
  if (!p.gauge) return "";
  return `<section class="card"><h2>Da cm a giri</h2>
    <div class="calcolo">
      <label for="conv-cm">Centimetri<input id="conv-cm" type="text" inputmode="decimal" placeholder="20"></label>
      <span class="uguale">=</span>
      <label for="conv-giri">Giri<input id="conv-giri" type="text" inputmode="decimal" placeholder="36"></label>
    </div>
    <div class="hint">Calcolato sul tuo campione: ${p.gauge} giri ogni 10 cm.</div>
  </section>`;
}

// Mentre scrive in un campo, l'altro si aggiorna
export const input = {
  "conv-cm": (el, { p }) => {
    const cm = num(el.value);
    document.getElementById("conv-giri").value = cm ? giriDaCm(cm, p.gauge) : "";
  },
  "conv-giri": (el, { p }) => {
    const g = num(el.value);
    document.getElementById("conv-cm").value = g ? virgola(cmDaGiri(g, p.gauge)) : "";
  },
};

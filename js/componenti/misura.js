// "📏 Misura": Laura misura col metro e scrive i cm. Da lì le stime partono dalla misura vera.
import { esc, num, virgola, ora } from "../utils/formato.js";
import { ultimaMisura } from "../calcoli/misure.js";
import { apri, pulsanti } from "./finestre.js";

// Riga sotto il contagiri con l'ultima misura
export function riga(parte) {
  const m = ultimaMisura(parte);
  return m ? `<div class="hint">📏 Ultima misura: ${virgola(m.cm)} cm al giro ${m.giro}</div>` : "";
}

export const azioni = {
  "misura": ({ p, a }) => apri(`<h2>Misura · ${esc(a.name)}</h2>
    <p class="testo-muto">Appoggia il lavoro in piano e misura dall'inizio fino al giro ${a.rounds}.</p>
    <label for="mis-cm">Centimetri adesso<input id="mis-cm" name="cm" inputmode="decimal" required placeholder="Es. 24,5"></label>
    ${pulsanti("Salva misura")}`,
  (d) => {
    const cm = num(d.get("cm"));
    if (!cm) return;
    a.misure.push({ giro: a.rounds, cm, data: ora() });
    p.updated = ora();
  }),
};

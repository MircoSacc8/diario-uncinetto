// Messaggio temporaneo in basso e vibrazione.
import { S } from "../dati/stato.js";

let timer = null;

export function avviso(testo) {
  const el = document.getElementById("avviso");
  el.textContent = testo;
  el.hidden = false;
  clearTimeout(timer);
  timer = setTimeout(() => { el.hidden = true; }, 2600);
}

export function vibra() {
  if (!S.dati.settings.vibrate) return;
  try { navigator.vibrate?.(15); } catch { /* non supportata (es. iPhone) */ }
}

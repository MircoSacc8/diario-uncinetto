// Messaggio temporaneo in basso, vibrazione e suono ("din") per i promemoria.
import { S } from "../dati/stato.js";

let timer = null;

export function avviso(testo) {
  const el = document.getElementById("avviso");
  el.textContent = testo;
  el.hidden = false;
  clearTimeout(timer);
  timer = setTimeout(() => { el.hidden = true; }, 2600);
}

export function vibra(durata = 15) {
  if (!S.dati.settings.vibrate) return;
  try { navigator.vibrate?.(durata); } catch { /* non supportata (es. iPhone) */ }
}

// Suono breve generato dal telefono (niente file da scaricare).
// Su iPhone funziona solo dopo un tocco (es. "+1 giro") e non si sente col tasto silenzioso attivo.
let audio = null;
export function suona(forza = false) {
  if (!forza && S.dati.settings.suono === false) return;
  try {
    audio ??= new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === "suspended") audio.resume();
    const t0 = audio.currentTime;
    // due note, come un campanello: "din-don" acuto e dolce
    [[880, 0], [1320, 0.14]].forEach(([freq, ritardo]) => {
      const osc = audio.createOscillator();
      const vol = audio.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      vol.gain.setValueAtTime(0.0001, t0 + ritardo);
      vol.gain.exponentialRampToValueAtTime(0.35, t0 + ritardo + 0.02);
      vol.gain.exponentialRampToValueAtTime(0.0001, t0 + ritardo + 0.45);
      osc.connect(vol).connect(audio.destination);
      osc.start(t0 + ritardo);
      osc.stop(t0 + ritardo + 0.5);
    });
  } catch { /* audio non disponibile */ }
}

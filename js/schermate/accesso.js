// Schermata di accesso: obbligatoria al primo avvio, così i progetti sono sempre salvati online.
import { esc } from "../utils/formato.js";

let messaggio = "";
let inCorso = false;

export const impostaMessaggio = (m) => { messaggio = m; };
export const impostaInCorso = (v) => { inCorso = v; };

export function html() {
  return `<section class="accesso">
    <img class="accesso-icona" src="assets/icone/icona-192.png" alt="" width="96" height="96">
    <div><div class="eyebrow">Benvenuta</div><h1>Diario dell'Uncinetto</h1></div>
    <p>Accedi con il tuo account Google: i progetti vengono salvati online e li ritrovi anche se cambi telefono.</p>
    <button class="btn" data-a="accedi" ${inCorso ? "disabled" : ""}>${inCorso ? "Accesso in corso…" : "Accedi con Google"}</button>
    ${messaggio ? `<p class="attenzione" role="alert">${esc(messaggio)}</p>` : ""}
    <p class="hint">Ognuno vede solo i propri progetti.</p>
  </section>`;
}

// Mentre Firebase si avvia
export const caricamento = () => `<section class="accesso"><img class="accesso-icona" src="assets/icone/icona-192.png" alt="" width="96" height="96"><p class="hint">Apro il diario…</p></section>`;

// Primo avvio senza internet
export const senzaRete = () => `<section class="accesso">
  <img class="accesso-icona" src="assets/icone/icona-192.png" alt="" width="96" height="96">
  <h1>Serve internet</h1>
  <p>La prima volta l'app ha bisogno di internet per farti accedere. Collegati e riprova.</p>
  <button class="btn" data-a="riprova">Riprova</button>
</section>`;

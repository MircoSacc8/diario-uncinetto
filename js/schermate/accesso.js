// Schermata di accesso: obbligatoria al primo avvio, così i progetti sono sempre salvati online.
// Si entra con email e password (nessuna finestra da aprire: funziona sempre anche dall'app sulla Home).
// L'accesso con Google è stato tolto su richiesta di Mircuz: il codice resta in js/firebase/accesso.js.
import { esc } from "../utils/formato.js";

const stato = { messaggio: "", conferma: "", inCorso: false, email: "", password: "" };

export const impostaMessaggio = (m) => { stato.messaggio = m; stato.conferma = ""; };
export const impostaConferma = (m) => { stato.conferma = m; stato.messaggio = ""; };
export const impostaInCorso = (v) => { stato.inCorso = v; };
export const credenziali = () => ({ email: stato.email, password: stato.password });
export const pulisci = () => { Object.assign(stato, { messaggio: "", conferma: "", inCorso: false, password: "" }); };

const icona = `<img class="accesso-icona" src="assets/icone/icona-192.png" alt="" width="96" height="96">`;

export function html() {
  const dis = stato.inCorso ? "disabled" : "";
  return `<section class="accesso">
    ${icona}
    <div><div class="eyebrow">Benvenuta</div><h1>Diario dell'Uncinetto</h1></div>
    <p>Entra con la tua email: i progetti vengono salvati online e li ritrovi anche se cambi telefono. La prima volta tocca “Crea account”.</p>
    <form class="accesso-modulo" id="modulo-accesso" novalidate>
      <label for="acc-email">Email<input id="acc-email" type="email" autocomplete="username" inputmode="email" autocapitalize="off" value="${esc(stato.email)}" placeholder="nome@esempio.it"></label>
      <label for="acc-password">Password<input id="acc-password" type="password" autocomplete="current-password" value="${esc(stato.password)}" placeholder="almeno 6 caratteri"></label>
      <button class="btn" type="submit" ${dis}>${stato.inCorso ? "Attendi…" : "Entra"}</button>
      <div class="azioni-accesso">
        <button type="button" class="link" data-a="crea-account" ${dis}>Crea account</button>
        <button type="button" class="link" data-a="password-dimenticata" ${dis}>Password dimenticata?</button>
      </div>
    </form>
    ${stato.messaggio ? `<p class="attenzione" role="alert">${esc(stato.messaggio)}</p>` : ""}
    ${stato.conferma ? `<p class="conferma" role="status">${esc(stato.conferma)}</p>` : ""}
    <p class="hint">Ognuno vede solo i propri progetti.</p>
  </section>`;
}

// Ricorda quello che si scrive, così non si perde se la schermata si ridisegna
export const input = {
  "acc-email": (el) => { stato.email = el.value; },
  "acc-password": (el) => { stato.password = el.value; },
};

// Mentre Firebase si avvia
export const caricamento = () => `<section class="accesso">${icona}<p class="hint">Apro il diario…</p></section>`;

// Primo avvio senza internet
export const senzaRete = () => `<section class="accesso">
  ${icona}
  <h1>Serve internet</h1>
  <p>La prima volta l'app ha bisogno di internet per farti accedere. Collegati e riprova.</p>
  <button class="btn" data-a="riprova">Riprova</button>
</section>`;

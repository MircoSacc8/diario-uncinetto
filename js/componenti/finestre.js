// Finestre che salgono dal basso: moduli, conferme, inserimento di un numero.
import { aggiorna } from "../dati/stato.js";

const contenitore = () => document.getElementById("finestra");

// Apre una finestra con un modulo. "invio" riceve i dati del modulo, poi si salva e ridisegna
export function apri(html, invio) {
  const el = contenitore();
  el.innerHTML = `<form id="modulo" novalidate>${html}</form>`;
  el.hidden = false;
  document.body.classList.add("bloccato");
  const form = document.getElementById("modulo");
  form.onsubmit = (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    invio(new FormData(form));
    chiudi();
    aggiorna();
  };
}

export function chiudi() {
  const el = contenitore();
  el.hidden = true;
  el.innerHTML = "";
  document.body.classList.remove("bloccato");
}

export const pulsanti = (ok, extra = "") =>
  `<div class="azioni">${extra}<button type="button" class="btn ghost" data-a="chiudi">Annulla</button><button class="btn">${ok}</button></div>`;

export function conferma(messaggio, etichetta, fn) {
  apri(`<h2>${messaggio}</h2>${pulsanti(etichetta)}`, () => fn());
}

export function chiediNumero(titolo, valore, fn) {
  apri(`<h2>${titolo}</h2>
    <label for="num">Numero<input id="num" name="n" type="number" min="0" inputmode="numeric" value="${valore}"></label>
    ${pulsanti("Imposta")}`,
  (d) => fn(Math.max(0, +d.get("n") || 0)));
}

// Chiusura toccando lo sfondo o con Esc
export function collega() {
  contenitore().addEventListener("click", (e) => { if (e.target.id === "finestra") chiudi(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") chiudi(); });
}

export const azioni = { chiudi: () => chiudi() };

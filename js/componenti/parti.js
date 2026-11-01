// Le parti di un progetto (es. maniche, posteriore): scorrono in orizzontale, una è attiva.
// Ogni parte ha un obiettivo in giri o in cm, e può avere uncinetto e campione propri.
import { esc, num, virgola } from "../utils/formato.js";
import { aggiorna, parteAttiva } from "../dati/stato.js";
import { nuovaParte } from "../dati/modelli.js";
import { campioneDi, cmAttuali, percentuale, obiettivoRaggiunto, catenelleDaLarghezza } from "../calcoli/misure.js";
import { apri, chiudi, pulsanti } from "./finestre.js";
import * as uncinetto from "./uncinetto.js";
import { CATEGORIE, indovinaCategoria } from "../calcoli/su-misura.js";

function valoreScheda(p, x) {
  const c = campioneDi(p, x);
  const fatto = obiettivoRaggiunto(x, c) ? " <small>✓</small>" : "";
  if (x.obiettivo.tipo === "cm" && x.obiettivo.valore) {
    const ora = cmAttuali(x, c);
    return `${ora ? virgola(ora.cm) : "?"} <small>/ ${virgola(x.obiettivo.valore)} cm</small>${fatto}`;
  }
  return `${x.rounds}${x.obiettivo.valore ? ` <small>/ ${x.obiettivo.valore}</small>` : ""}${fatto}`;
}

export function html(p, a) {
  const schede = p.parts.map((x) => {
    const pct = percentuale(x, campioneDi(p, x));
    return `<button class="parte" data-a="parte" data-v="${x.id}" aria-pressed="${x.id === a.id}">
      <b>${esc(x.name)}</b>
      <span>${valoreScheda(p, x)}</span>
      ${pct !== null ? `<span class="mini"><i style="width:${pct}%"></i></span>` : ""}
    </button>`;
  }).join("");
  return `<nav class="parti" aria-label="Parti del progetto">${schede}
    <button class="parte aggiungi" data-a="parte-nuova">+ Parte</button></nav>`;
}

// Dopo ogni disegno: porta in vista la parte attiva nella fila
export function dopoDisegno() {
  const fila = document.querySelector(".parti");
  const attiva = fila?.querySelector('[aria-pressed="true"]');
  if (!attiva) return;
  fila.scrollLeft = attiva.offsetLeft - (fila.clientWidth - attiva.offsetWidth) / 2;
}

function modulo(p, x) {
  const ob = x?.obiettivo || { tipo: "giri", valore: 0 };
  const sceltaCampione = p.campioni.length > 1 ? `<label for="p-campione">Campione
      <select id="p-campione" name="campione"><option value="">Principale del progetto</option>${p.campioni.map((c) =>
        `<option value="${c.id}" ${x?.campione === c.id ? "selected" : ""}>${esc(c.nome || "Campione")}</option>`).join("")}</select></label>` : "";
  const c = campioneDi(p, x);
  apri(`<h2>${x ? "Modifica parte" : "Nuova parte"}</h2>
    <label for="p-nome">Nome<input id="p-nome" name="name" required value="${esc(x?.name)}" placeholder="Es. Manica dx"></label>
    <label for="p-categoria">Tipo di parte
      <select id="p-categoria" name="categoria">${Object.entries(CATEGORIE).map(([k, t]) =>
        `<option value="${k}" ${(x?.categoria || "") === k ? "selected" : ""}>${t}</option>`).join("")}</select></label>
    <div class="hint">Serve a “Rifai…”: il corpo segue il giro seno, la manica il giro braccio.</div>

    <fieldset class="scelta"><legend>Obiettivo</legend>
      <div class="segmenti">
        <label><input type="radio" name="ob-tipo" value="cm" ${ob.tipo === "cm" ? "checked" : ""}><span>Arrivare a … cm</span></label>
        <label><input type="radio" name="ob-tipo" value="giri" ${ob.tipo !== "cm" ? "checked" : ""}><span>Fare … giri</span></label>
      </div>
      <label for="p-obiettivo">Quanti (cm o giri)<input id="p-obiettivo" name="ob-valore" inputmode="decimal" value="${ob.valore ? virgola(ob.valore) : ""}" placeholder="Es. 43"></label>
      <div class="hint">I cm non cambiano se cambi filo: i giri si stimano dal campione e dalle tue misure.</div>
    </fieldset>

    <div class="griglia2">
      <label for="p-larghezza">Larghezza (cm)<input id="p-larghezza" name="larghezza" inputmode="decimal" value="${x?.larghezza ? virgola(x.larghezza) : ""}" placeholder="Es. 20"></label>
      <label for="p-inizio">Partenza<input id="p-inizio" name="start" value="${esc(x?.start)}" placeholder="Es. 50 cat"></label>
    </div>
    <div class="hint">${c?.maglie10 ? `Se lasci vuota la partenza, la calcolo dalla larghezza col campione (${c.maglie10} maglie in 10 cm).` : "Con le maglie in 10 cm nel campione, la partenza si calcola dalla larghezza."}</div>

    ${sceltaCampione}
    <label class="interruttore" for="p-unc-diverso">Uncinetto diverso dal progetto<input id="p-unc-diverso" name="unc-diverso" type="checkbox" ${x?.uncinetto ? "checked" : ""}></label>
    <div class="se-diverso">${uncinetto.campi("p-unc", x?.uncinetto || p.uncinetto, { conNota: true })}</div>

    ${pulsanti("Salva", x && p.parts.length > 1 ? `<button type="button" class="pericolo" data-a="parte-rimuovi">Rimuovi parte</button>` : "")}`,
  (d) => {
    const valori = {
      name: d.get("name").trim(),
      categoria: x ? d.get("categoria") : (d.get("categoria") !== "altro" ? d.get("categoria") : indovinaCategoria(d.get("name"))),
      obiettivo: { tipo: d.get("ob-tipo") === "cm" ? "cm" : "giri", valore: num(d.get("ob-valore")) },
      larghezza: num(d.get("larghezza")),
      start: d.get("start").trim(),
      uncinetto: d.get("unc-diverso") ? uncinetto.leggi(d, "p-unc") : null,
      campione: d.get("campione") || "",
    };
    if (valori.obiettivo.tipo === "giri") valori.obiettivo.valore = Math.round(valori.obiettivo.valore);
    if (!valori.start && valori.larghezza) {
      const cat = catenelleDaLarghezza(valori.larghezza, campioneDi(p, valori));
      if (cat) valori.start = `${cat} cat (${virgola(valori.larghezza)} cm)`;
    }
    if (x) Object.assign(x, valori);
    else { const n = nuovaParte(valori.name, valori); p.parts.push(n); p.active = n.id; }
    p.updated = Date.now();
  });
}

export const azioni = {
  "parte": ({ p, v }) => { p.active = v; aggiorna(); },
  "parte-nuova": ({ p }) => modulo(p),
  "parte-modifica": ({ p }) => modulo(p, parteAttiva(p)),
  "parte-rimuovi": ({ p }) => {
    const a = parteAttiva(p);
    p.parts = p.parts.filter((x) => x.id !== a.id);
    p.active = p.parts[0].id;
    chiudi(); aggiorna();
  },
};

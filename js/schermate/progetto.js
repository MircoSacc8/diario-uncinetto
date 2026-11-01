// Scheda di un progetto: mette insieme i componenti, più modifica/stato/eliminazione del progetto.
import { esc, num, ora } from "../utils/formato.js";
import { S, aggiorna, salva, parteAttiva, fermaTimer } from "../dati/stato.js";
import { nuovoProgetto } from "../dati/modelli.js";
import { apri, conferma, pulsanti } from "../componenti/finestre.js";
import { avviso } from "../componenti/avvisi.js";
import * as parti from "../componenti/parti.js";
import * as contagiri from "../componenti/contagiri.js";
import * as promemoria from "../componenti/promemoria.js";
import * as convertitore from "../componenti/convertitore.js";
import * as contatori from "../componenti/contatori.js";
import * as punti from "../componenti/punti.js";
import * as filati from "../componenti/filati.js";

export function html(p) {
  const a = parteAttiva(p);
  const sopra = [p.hook && `Uncinetto ${esc(p.hook)} mm`, p.gauge && `${p.gauge} giri in 10 cm`, p.status === "finito" && "finito"]
    .filter(Boolean).join(" · ") || "Progetto";
  return `
    <button class="link" data-a="home" style="align-self:flex-start">← Tutti i progetti</button>
    <div class="top">
      <div><div class="eyebrow">${sopra}</div><h1>${esc(p.name)}</h1></div>
      <button class="btn ghost piccolo" data-a="progetto-modifica">Modifica</button>
    </div>
    ${parti.html(p, a)}
    ${contagiri.html(p, a)}
    ${promemoria.html(a)}
    ${convertitore.html(p)}
    ${contatori.html(p)}
    ${punti.html(p)}
    ${filati.html(p)}
    <section class="card"><h2>Schema e appunti</h2>
      ${p.pattern ? `<div><div class="eyebrow">Schema</div>${esc(p.pattern)}</div>` : ""}
      <label for="appunti">Appunti<textarea id="appunti" placeholder="Misure, modifiche allo schema, idee…">${esc(p.notes)}</textarea></label>
    </section>
    <div class="azioni" style="justify-content:space-between">
      <button class="btn ghost piccolo" data-a="progetto-stato">${p.status === "finito" ? "Riapri progetto" : "Segna come finito"}</button>
      <button class="pericolo" data-a="progetto-elimina">Elimina progetto</button>
    </div>
    ${contagiri.barra()}`;
}

// Modulo nuovo progetto / modifica progetto (usato anche dalla home)
export function moduloProgetto(p) {
  apri(`<h2>${p ? "Modifica progetto" : "Nuovo progetto"}</h2>
    <label for="pr-nome">Nome<input id="pr-nome" name="name" required value="${esc(p?.name)}" placeholder="Es. Borsa a rete"></label>
    <div class="griglia2">
      <label for="pr-unc">Uncinetto (mm)<input id="pr-unc" name="hook" inputmode="decimal" value="${esc(p?.hook)}" placeholder="5,5"></label>
      <label for="pr-camp">Giri in 10 cm<input id="pr-camp" name="gauge" inputmode="decimal" value="${p?.gauge || ""}" placeholder="18"></label>
    </div>
    <div class="hint">Con i giri in 10 cm l'app ti dice a quanti cm sei e converte cm in giri.</div>
    <label for="pr-schema">Schema / riferimento<input id="pr-schema" name="pattern" value="${esc(p?.pattern)}" placeholder="Nome dello schema o link"></label>
    ${pulsanti(p ? "Salva" : "Crea")}`,
  (d) => {
    const valori = { name: d.get("name").trim(), hook: d.get("hook").trim(), gauge: num(d.get("gauge")), pattern: d.get("pattern").trim(), updated: ora() };
    if (p) Object.assign(p, valori);
    else { const n = nuovoProgetto(valori); S.dati.projects.push(n); S.vista.id = n.id; }
  });
}

export const azioni = {
  "home": () => { S.vista.id = null; S.vista.schermata = "home"; aggiorna(); scrollTo(0, 0); },
  "progetto-modifica": ({ p }) => moduloProgetto(p),
  "progetto-stato": ({ p }) => {
    p.status = p.status === "finito" ? "in corso" : "finito";
    if (p.status === "finito") fermaTimer(p);
    p.updated = ora(); aggiorna();
    avviso(p.status === "finito" ? "Progetto finito!" : "Progetto riaperto");
  },
  "progetto-elimina": ({ p }) => conferma(`Eliminare “${esc(p.name)}”? Non si può annullare.`, "Elimina", () => {
    S.dati.projects = S.dati.projects.filter((x) => x.id !== p.id);
    S.vista.id = null;
  }),
};

export const input = {
  "appunti": (el, { p }) => { p.notes = el.value; salva(); },
};

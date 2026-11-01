// Progetti dall'alto (dal collo): calcolatore dello sprone raglan e creazione della parte "Sprone"
// con i promemoria già scritti. Le misure si possono prendere da una taglia o da una persona (fase 5).
import { esc, num, virgola, ora } from "../utils/formato.js";
import { aggiorna } from "../dati/stato.js";
import { nuovaParte, nuovaNota } from "../dati/modelli.js";
import { calcolaRaglan, promemoriaRaglan } from "../calcoli/raglan.js";
import { apri, pulsanti } from "./finestre.js";
import * as sorgenti from "./sorgenti-misure.js";

const PREDEFINITI = { agioCorpo: 5, agioManica: 4 };

const campioneUsabile = (p) => p.campioni.find((c) => c.id === p.campione && c.maglie10 && c.giri10)
  || p.campioni.find((c) => c.maglie10 && c.giri10) || null;

// Scheda nella pagina del progetto (solo per i progetti dall'alto)
export function html(p) {
  if (p.direzione !== "alto") return "";
  const r = p.sprone?.risultato;
  const riassunto = r && !r.errore ? `<dl class="riassunto">
      <dt>Avvio</dt><dd>${r.avvio} maglie</dd>
      <dt>Divisione</dt><dd>dietro ${r.divisione.dietro} · davanti ${r.divisione.davanti}${r.davantiPerLato ? ` (${r.davantiPerLato.sinistro} + ${r.davantiPerLato.destro})` : ""} · maniche ${r.divisione.manica} · raglan 4</dd>
      <dt>Aumenti</dt><dd>${r.giriAumento} giri di aumenti, ${r.passo === 1 ? "a ogni giro" : `ogni ${r.passo} giri`}</dd>
      <dt>Separa maniche</dt><dd>al giro ${r.giriSprone}: ${r.finale.manica} maglie per manica${r.finale.sottoAscella ? `, ${r.finale.sottoAscella} cat sotto l'ascella` : ""}</dd>
      <dt>Corpo</dt><dd>${r.finale.corpo} maglie (≈ ${virgola(r.obiettivi.corpoCm)} cm)</dd>
    </dl>` : `<p class="testo-muto">Calcola catenelle iniziali, aumenti e quando separare le maniche partendo dalle misure e dal campione.</p>`;
  return `<section class="card"><div class="card-h"><h2>Sprone raglan</h2>
      <button class="btn ghost piccolo" data-a="sprone-calcola">${r ? "Ricalcola" : "Calcola"}</button></div>
    ${riassunto}
  </section>`;
}

function modulo(p, valori = p.sprone?.misure || {}) {
  const c = campioneUsabile(p);
  const v = { ...PREDEFINITI, aperto: /cardigan|giacca/i.test(p.name), maglie10: c?.maglie10 || "", giri10: c?.giri10 || "", ...valori };
  const campo = (id, etichetta, valore, ph) =>
    `<label for="sp-${id}">${etichetta}<input id="sp-${id}" name="${id}" inputmode="decimal" value="${valore ? virgola(valore) : ""}" placeholder="${ph}"></label>`;
  apri(`<h2>Sprone raglan dall'alto</h2>
    ${sorgenti.scelta("sp")}
    <div class="griglia2">
      ${campo("scollo", "Giro scollo (cm)", v.scollo, "46")}
      ${campo("seno", "Giro seno (cm)", v.seno, "86")}
      ${campo("braccio", "Giro braccio (cm)", v.braccio, "26")}
      ${campo("scalfo", "Profondità scalfo (cm)", v.scalfo, "18")}
      ${campo("agioCorpo", "Agio corpo (cm)", v.agioCorpo, "5")}
      ${campo("agioManica", "Agio maniche (cm)", v.agioManica, "4")}
      ${campo("maglie10", "Maglie in 10 cm", v.maglie10, "14")}
      ${campo("giri10", "Giri in 10 cm", v.giri10, "18")}
    </div>
    <div class="hint">Scollo = giro dell'apertura del collo del capo (più largo del collo). Agio = quanto il capo è più largo del corpo.</div>
    <label class="interruttore" for="sp-aperto">Aperto davanti (cardigan)<input id="sp-aperto" name="aperto" type="checkbox" ${v.aperto ? "checked" : ""}></label>
    ${pulsanti("Calcola")}`,
  (d) => {
    const misure = Object.fromEntries(["scollo", "seno", "braccio", "scalfo", "agioCorpo", "agioManica", "maglie10", "giri10"].map((k) => [k, num(d.get(k))]));
    misure.aperto = !!d.get("aperto");
    const risultato = calcolaRaglan(misure);
    p.sprone = { misure, risultato };
    p.updated = ora();
    setTimeout(() => risultati(p), 0);   // dopo la chiusura del modulo mostra il risultato
  });
}

function risultati(p) {
  const r = p.sprone.risultato;
  if (r.errore) {
    apri(`<h2>Non riesco a calcolare</h2><p class="attenzione">${esc(r.errore)}</p>${pulsanti("Correggi")}`, () => setTimeout(() => modulo(p), 0));
    return;
  }
  const note = promemoriaRaglan(r);
  const esiste = p.parts.find((x) => x.categoria === "sprone" || /sprone/i.test(x.name));
  apri(`<h2>Sprone calcolato</h2>
    <ol class="passi">${note.map((n) => `<li><b>${n.to > n.r ? `Giri ${n.r}–${n.to}` : `Giro ${n.r}`}</b> ${esc(n.t)}</li>`).join("")}</ol>
    <p class="hint">È una proposta: controlla il primo giro e misura dopo qualche giro col 📏.</p>
    ${pulsanti(esiste ? "Aggiorna la parte Sprone" : "Crea la parte Sprone")}`,
  () => {
    const valori = {
      obiettivo: { tipo: "cm", valore: p.sprone.misure.scalfo },
      start: `${r.avvio} cat (scollo ${virgola(p.sprone.misure.scollo)} cm)`,
      categoria: "sprone",
      log: note.map((n) => nuovaNota(n.r, n.to, n.t)),
    };
    if (esiste) Object.assign(esiste, valori);
    else { const n = nuovaParte("Sprone", valori); p.parts.unshift(n); p.active = n.id; }
    p.updated = ora();
  });
}

export const azioni = {
  "sprone-calcola": ({ p }) => modulo(p),
};

export const cambio = sorgenti.cambioPer("sp");

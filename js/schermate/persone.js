// Misure delle persone (Laura, una figlia, una cliente…): con la guida per prenderle.
// Le misure non prese si completano con la taglia standard più vicina.
import { esc, num, virgola } from "../utils/formato.js";
import { S, aggiorna } from "../dati/stato.js";
import { nuovaPersona } from "../dati/modelli.js";
import { apri, chiudi, conferma, pulsanti } from "../componenti/finestre.js";
import * as sorgenti from "../componenti/sorgenti-misure.js";

let guida = {};
export async function caricaGuida() {
  try { guida = await (await fetch("dati/come-misurare.json")).json(); } catch { guida = {}; }
}

const ORDINE = ["seno", "vita", "fianchi", "braccio", "scalfo", "manica", "schiena", "spalle", "scollo"];

function riassunto(x) {
  const prese = ORDINE.filter((k) => x.misure?.[k] > 0).length;
  const base = x.tagliaBase ? ` · il resto da ${sorgenti.nomeSorgente(x.tagliaBase).replace("Taglia ", "")}` : "";
  return `${prese} misure prese${base}`;
}

export function html() {
  const persone = S.dati.persone;
  return `
    <button class="link" data-a="impostazioni" style="align-self:flex-start">← Impostazioni</button>
    <div class="top"><div><div class="eyebrow">Su misura</div><h1>Misure delle persone</h1></div></div>
    <p class="testo-muto">Salva le misure di chi vestirai. Servono per "Rifai…" su misura e per calcolare lo sprone. Le vedi solo tu.</p>
    <button class="btn" data-a="persona-nuova">+ Nuova persona</button>
    <div class="lista">${persone.length ? persone.map((x) => `<button class="proj" data-a="persona-modifica" data-v="${x.id}">
        <span class="nome">${esc(x.nome || "Senza nome")}</span><span class="meta">${esc(riassunto(x))}</span></button>`).join("")
      : `<div class="vuoto">Nessuna persona ancora.<br>Tocca “Nuova persona” e prendi le misure col metro.</div>`}</div>`;
}

function modulo(x) {
  const etichette = sorgenti.tabella().misure || {};
  const campi = ORDINE.map((k) => `<div class="misura-campo">
      <label for="ps-${k}">${esc(etichette[k] || k)} (cm)<input id="ps-${k}" name="${k}" inputmode="decimal" value="${x?.misure?.[k] ? virgola(x.misure[k]) : ""}"></label>
      ${guida[k] ? `<div class="hint">${esc(guida[k])}</div>` : ""}
    </div>`).join("");
  apri(`<h2>${x ? "Modifica misure" : "Nuova persona"}</h2>
    <label for="ps-nome">Nome<input id="ps-nome" name="nome" required value="${esc(x?.nome)}" placeholder="Es. Laura"></label>
    <label for="ps-base">Taglia più vicina (per le misure che mancano)
      <select id="ps-base" name="tagliaBase"><option value="">Nessuna</option>${sorgenti.opzioni(x?.tagliaBase || "", { conVuota: false }).replace(/<optgroup label="Misure prese">.*?<\/optgroup>/s, "")}</select></label>
    <div class="hint">Misura sopra la biancheria, col metro morbido, senza stringere. Non servono tutte: quelle vuote si prendono dalla taglia scelta.</div>
    ${campi}
    ${pulsanti("Salva", x ? `<button type="button" class="pericolo" data-a="persona-elimina" data-v="${x.id}">Elimina</button>` : "")}`,
  (d) => {
    const misure = Object.fromEntries(ORDINE.map((k) => [k, num(d.get(k))]).filter(([, v]) => v > 0));
    const valori = { nome: d.get("nome").trim(), tagliaBase: d.get("tagliaBase") || "", misure };
    if (x) Object.assign(x, valori); else S.dati.persone.push(nuovaPersona(valori));
  });
}

export const azioni = {
  "persone": () => { S.vista.id = null; S.vista.schermata = "persone"; aggiorna(); scrollTo(0, 0); },
  "persona-nuova": () => modulo(),
  "persona-modifica": ({ v }) => modulo(S.dati.persone.find((x) => x.id === v)),
  "persona-elimina": ({ v }) => {
    chiudi();
    conferma("Eliminare le misure di questa persona?", "Elimina", () => {
      S.dati.persone = S.dati.persone.filter((x) => x.id !== v);
    });
  },
};

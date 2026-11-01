// "Rifai…": crea una copia del progetto in un'altra taglia, sulle misure di una persona
// o con un filato diverso. Prima mostra un riepilogo parte per parte da controllare.
import { esc, num, virgola, uid, ora } from "../utils/formato.js";
import { S, aggiorna } from "../dati/stato.js";
import { nuovoCampione } from "../dati/modelli.js";
import { rifai } from "../calcoli/su-misura.js";
import { apri, pulsanti } from "./finestre.js";
import * as sorgenti from "./sorgenti-misure.js";
import * as uncinetto from "./uncinetto.js";

const MODI = { taglia: "Altra taglia", persona: "Su misura", filato: "Filato diverso" };
let ultimo = null;   // scelte dell'ultimo modulo, per tornare indietro dal riepilogo

export const pulsante = () => `<button class="btn ghost piccolo" data-a="rifai">Rifai…</button>`;

function modulo(p, v = {}) {
  const principale = p.campioni.find((c) => c.id === p.campione);
  const modo = v.modo || "taglia";
  const opzioniDest = sorgenti.opzioni(v.a || "")
    .replace(modo === "persona" ? /<optgroup label="(Donna|Uomo)">.*?<\/optgroup>/gs : /<optgroup label="Misure prese">.*?<\/optgroup>/s, "");
  apri(`<h2>Rifai “${esc(p.name)}”</h2>
    <fieldset class="scelta"><legend>Come vuoi rifarlo</legend>
      <div class="segmenti tre">${Object.entries(MODI).map(([k, t]) =>
        `<label><input type="radio" name="modo" value="${k}" ${k === modo ? "checked" : ""}><span>${t}</span></label>`).join("")}</div>
    </fieldset>
    <label for="rf-da">È fatto per<select id="rf-da" name="da" required>${sorgenti.opzioni(v.da || p.taglia || "")}</select></label>
    <div class="per-destinazione"><label for="rf-a">Nuova misura<select id="rf-a" name="a">${opzioniDest}</select></label>
      ${modo === "persona" && !S.dati.persone.length ? `<p class="attenzione">Non hai ancora salvato misure: vai in Impostazioni → Misure delle persone.</p>` : ""}</div>
    <div class="griglia2">
      <label for="rf-agio-c">Agio corpo (cm)<input id="rf-agio-c" name="agioCorpo" inputmode="decimal" value="${virgola(v.agioCorpo ?? 5)}"></label>
      <label for="rf-agio-m">Agio maniche (cm)<input id="rf-agio-m" name="agioManica" inputmode="decimal" value="${virgola(v.agioManica ?? 4)}"></label>
    </div>
    <label class="interruttore" for="rf-nuovo-campione">Uso un filato o un uncinetto diverso<input id="rf-nuovo-campione" name="nuovoCampione" type="checkbox" ${v.nuovoCampione || modo === "filato" ? "checked" : ""}></label>
    <div class="se-campione">
      <label for="rf-filato">Filato nuovo<input id="rf-filato" name="filato" value="${esc(v.filato)}" placeholder="Marca e colore"></label>
      ${uncinetto.campi("rf-unc", v.uncinetto || principale?.uncinetto || p.uncinetto)}
      <div class="griglia2">
        <label for="rf-maglie">Maglie in 10 cm<input id="rf-maglie" name="maglie10" inputmode="decimal" value="${v.maglie10 ? virgola(v.maglie10) : ""}" placeholder="${principale?.maglie10 || 14}"></label>
        <label for="rf-giri">Giri in 10 cm<input id="rf-giri" name="giri10" inputmode="decimal" value="${v.giri10 ? virgola(v.giri10) : ""}" placeholder="${principale?.giri10 || 18}"></label>
      </div>
      <div class="hint">Fai prima il campione col filato nuovo e conta maglie e giri in 10 cm.</div>
    </div>
    ${pulsanti("Vedi le modifiche")}`,
  (d) => {
    const scelte = {
      modo: d.get("modo"), da: d.get("da"), a: d.get("modo") === "filato" ? d.get("da") : d.get("a"),
      agioCorpo: num(d.get("agioCorpo")), agioManica: num(d.get("agioManica")),
      nuovoCampione: !!d.get("nuovoCampione") || d.get("modo") === "filato",
      filato: (d.get("filato") || "").trim(), uncinetto: uncinetto.leggi(d, "rf-unc"),
      maglie10: num(d.get("maglie10")), giri10: num(d.get("giri10")),
    };
    ultimo = { ...scelte, id: p.id };
    setTimeout(() => riepilogo(p, scelte), 0);
  });
}

function riepilogo(p, v) {
  const da = sorgenti.misureDa(v.da);
  const a = sorgenti.misureDa(v.a);
  const errori = [];
  if (!da) errori.push("Scegli per quale taglia o persona è fatto il progetto.");
  if (!a) errori.push("Scegli la nuova taglia o la persona.");
  if (v.nuovoCampione && !v.maglie10 && !v.giri10) errori.push("Scrivi almeno maglie o giri in 10 cm del campione nuovo.");
  if (errori.length) {
    apri(`<h2>Manca qualcosa</h2>${errori.map((e) => `<p class="attenzione">${esc(e)}</p>`).join("")}${pulsanti("Correggi")}`,
      () => setTimeout(() => modulo(p, v), 0));
    return;
  }
  const campioneNuovo = v.nuovoCampione
    ? nuovoCampione({ nome: v.filato || "Campione nuovo", filato: v.filato, uncinetto: v.uncinetto, maglie10: v.maglie10, giri10: v.giri10 })
    : null;
  const r = rifai(p, { da, a, agioCorpo: v.agioCorpo, agioManica: v.agioManica, campioneNuovo });
  const nomeNuovo = `${p.name} – ${v.modo === "filato" ? "filato nuovo" : sorgenti.nomeSorgente(v.a).replace("Taglia ", "").replace("Misure di ", "su misura ")}`;

  apri(`<h2>Controlla prima di creare</h2>
    <p class="testo-muto">${esc(sorgenti.nomeSorgente(v.da))} → ${esc(v.modo === "filato" ? "stessa misura" : sorgenti.nomeSorgente(v.a))}${campioneNuovo ? ` · campione nuovo ${[v.maglie10 && `${virgola(v.maglie10)} maglie`, v.giri10 && `${virgola(v.giri10)} giri`].filter(Boolean).join(" × ")} in 10 cm` : ""}</p>
    ${r.avvisi.map((x) => `<p class="attenzione">${esc(x)}</p>`).join("")}
    <div class="tabella-rifai">${r.righe.map((x) => `<div class="riga-rifai">
        <b>${esc(x.parte)}</b><span class="hint">${esc(x.categoria)}</span>
        <span>${esc(x.prima)} → <b>${esc(x.dopo)}</b></span>
        <span class="hint">${esc(x.motivo)}</span></div>`).join("")}</div>
    <p class="hint">Verrà creato “${esc(nomeNuovo)}”, con i giri da zero. Il progetto originale non cambia. Il tipo di ogni parte si cambia in “Modifica parte”.</p>
    ${pulsanti("Crea il progetto")}`,
  () => {
    const copia = structuredClone(p);
    Object.assign(copia, {
      id: uid() + uid(), name: nomeNuovo, status: "in corso", taglia: v.a, parts: r.parti,
      foto: [], time: 0, timerStart: null, stitchCount: 0, created: ora(), updated: ora(),
      notes: `Rifatto da “${p.name}” (${sorgenti.nomeSorgente(v.da)} → ${v.modo === "filato" ? "filato nuovo" : sorgenti.nomeSorgente(v.a)}).\n${p.notes || ""}`.trim(),
    });
    if (campioneNuovo) { copia.campioni = [...copia.campioni, campioneNuovo]; copia.campione = campioneNuovo.id; }
    if (r.sprone) copia.sprone = r.sprone;
    copia.parts.forEach((x) => { x.id = uid(); x.campione = ""; });
    copia.active = copia.parts[0].id;
    if (!p.taglia) p.taglia = v.da;   // ricordo per cosa era fatto l'originale
    S.dati.projects.push(copia);
    S.vista.id = copia.id;
    scrollTo(0, 0);
  });
}

export const azioni = {
  "rifai": ({ p }) => modulo(p, ultimo?.id === p.id ? ultimo : {}),
};

// Cambiando "modo" il modulo si ridisegna con le scelte giuste
export function collegaModo() {
  document.addEventListener("change", (e) => {
    if (e.target.name !== "modo" || !e.target.closest("#modulo")) return;
    const p = S.dati.projects.find((x) => x.id === S.vista.id);
    const d = new FormData(document.getElementById("modulo"));
    modulo(p, { modo: e.target.value, da: d.get("da"), agioCorpo: num(d.get("agioCorpo")), agioManica: num(d.get("agioManica")),
      filato: d.get("filato"), maglie10: num(d.get("maglie10")), giri10: num(d.get("giri10")) });
  });
}

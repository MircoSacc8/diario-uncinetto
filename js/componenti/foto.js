// Foto del progetto: "Ispirazione" (con link alla fonte) e "Lavoro finito".
// Le immagini arrivano dopo (dal telefono o da internet): qui si disegnano i riquadri e poi si riempiono.
import { esc, uid, ora } from "../utils/formato.js";
import { aggiorna } from "../dati/stato.js";
import { apri, chiudi, pulsanti, conferma } from "./finestre.js";
import { avviso } from "./avvisi.js";
import { comprimi } from "../foto/comprimi.js";
import * as archivio from "../foto/archivio.js";

const MASSIMO = 6;   // foto per gruppo
const GRUPPI = { ispirazione: "Ispirazione", finito: "Lavoro finito" };

// Riquadro di una miniatura: l'immagine viene caricata da riempi()
const riquadro = (f) => `<button class="foto-mini" data-a="foto-apri" data-v="${f.id}" aria-label="${esc(f.didascalia || "Foto")}">
  <img data-foto="${f.id}" alt="${esc(f.didascalia || "")}"></button>`;

function gruppo(p, tipo) {
  const elenco = p.foto.filter((f) => f.tipo === tipo);
  const aggiungi = elenco.length < MASSIMO ? `<label class="foto-mini aggiungi" for="foto-${tipo}">+ Foto
    <input id="foto-${tipo}" type="file" accept="image/*" hidden></label>` : "";
  return `<div class="foto-gruppo"><div class="eyebrow">${GRUPPI[tipo]}</div>
    <div class="foto-griglia">${elenco.map(riquadro).join("")}${aggiungi}</div></div>`;
}

export function html(p) {
  const link = p.ispirazioneLink
    ? `<a class="link" href="${esc(p.ispirazioneLink)}" target="_blank" rel="noopener">Apri la fonte d'ispirazione ↗</a>` : "";
  return `<section class="card"><div class="card-h"><h2>Foto</h2>
      <button class="btn ghost piccolo" data-a="foto-link">${p.ispirazioneLink ? "Cambia link" : "+ Link"}</button></div>
    ${gruppo(p, "ispirazione")}
    ${link}
    ${gruppo(p, "finito")}
  </section>`;
}

// Dopo ogni disegno: mette le immagini nei riquadri <img data-foto="id">
export async function riempi(radice = document) {
  for (const img of radice.querySelectorAll("img[data-foto]")) {
    if (img.src) continue;
    const v = await archivio.leggi(img.dataset.foto);
    if (v) img.src = v.miniatura;
    else img.closest(".foto-mini, .proj-foto")?.classList.add("in-arrivo");
  }
}

// Foto di copertina per la lista: il lavoro finito, altrimenti l'ispirazione
export function copertina(p) {
  const f = p.foto.find((x) => x.tipo === "finito") || p.foto.find((x) => x.tipo === "ispirazione");
  return f ? `<span class="proj-foto"><img data-foto="${f.id}" alt=""></span>` : "";
}

async function aggiungi(p, tipo, file) {
  if (!file) return;
  avviso("Preparo la foto…");
  try {
    const dati = await comprimi(file);
    const id = uid() + uid();
    await archivio.salva(id, p.id, dati);
    p.foto.push({ id, tipo, didascalia: "", aggiunta: ora() });
    p.updated = ora();
    aggiorna();
    avviso("Foto aggiunta");
  } catch {
    avviso("Non riesco a leggere questa foto. Prova con un'altra.");
  }
}

// Foto a tutto schermo con didascalia ed elimina
async function mostra(p, f) {
  const v = await archivio.leggi(f.id);
  apri(`<div class="foto-grande">${v ? `<img src="${v.foto}" alt="${esc(f.didascalia)}">` : `<p class="testo-muto">La foto non è ancora arrivata su questo telefono. Collegati a internet e riprova.</p>`}</div>
    <div class="eyebrow">${GRUPPI[f.tipo]}</div>
    <label for="foto-didascalia">Didascalia<input id="foto-didascalia" name="didascalia" value="${esc(f.didascalia)}" placeholder="Es. Davanti, prima del bordo"></label>
    ${pulsanti("Salva", `<button type="button" class="pericolo" data-a="foto-elimina" data-v="${f.id}">Elimina foto</button>`)}`,
  (d) => { f.didascalia = d.get("didascalia").trim(); p.updated = ora(); });
}

export const azioni = {
  "foto-apri": ({ p, v }) => { const f = p.foto.find((x) => x.id === v); if (f) mostra(p, f); },
  "foto-elimina": ({ p, v }) => {
    chiudi();
    conferma("Eliminare questa foto? Non si può annullare.", "Elimina", () => {
      p.foto = p.foto.filter((x) => x.id !== v);
      p.updated = ora();
      archivio.elimina(v);
    });
  },
  "foto-link": ({ p }) => apri(`<h2>Link alla fonte d'ispirazione</h2>
    <label for="foto-url">Indirizzo (Pinterest, Instagram, Ravelry…)<input id="foto-url" name="url" type="text" inputmode="url" autocapitalize="off" value="${esc(p.ispirazioneLink)}" placeholder="https://"></label>
    <div class="hint">Lascia vuoto per togliere il link.</div>
    ${pulsanti("Salva")}`,
  (d) => {
    let url = d.get("url").trim();
    if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`;
    p.ispirazioneLink = url;
    p.updated = ora();
  }),
};

export const cambio = {
  "foto-ispirazione": (el, { p }) => { const f = el.files?.[0]; el.value = ""; aggiungi(p, "ispirazione", f); },
  "foto-finito": (el, { p }) => { const f = el.files?.[0]; el.value = ""; aggiungi(p, "finito", f); },
};

// Quando si elimina un progetto, via anche le sue foto
export function eliminaFotoDi(p) {
  (p.foto || []).forEach((f) => archivio.elimina(f.id));
}

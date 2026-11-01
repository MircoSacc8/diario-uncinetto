// "Riempi con…": prende le misure da una taglia standard (donna/uomo) o da una persona salvata
// e le scrive nei campi del modulo aperto. Usato dallo sprone raglan e da "Rifai".
import { esc, virgola } from "../utils/formato.js";
import { S } from "../dati/stato.js";

let taglie = { donna: {}, uomo: {}, misure: {} };

export async function caricaTaglie() {
  try { taglie = await (await fetch("dati/taglie.json")).json(); } catch { /* senza tabella: solo misure a mano */ }
}
export const tabella = () => taglie;

// Valore della scelta: "donna:S", "uomo:L", "persona:{id}"
export function misureDa(valore) {
  const [tipo, chiave] = String(valore || "").split(":");
  if (tipo === "donna" || tipo === "uomo") return taglie[tipo]?.[chiave] || null;
  if (tipo === "persona") {
    const persona = (S.dati.persone || []).find((x) => x.id === chiave);
    if (!persona) return null;
    // Le misure non prese si completano con la taglia più vicina indicata nella persona
    const base = persona.tagliaBase ? misureDa(persona.tagliaBase) || {} : {};
    const proprie = Object.fromEntries(Object.entries(persona.misure || {}).filter(([, v]) => v > 0));
    return { ...base, ...proprie };
  }
  return null;
}

export function nomeSorgente(valore) {
  const [tipo, chiave] = String(valore || "").split(":");
  if (tipo === "donna") return `Taglia donna ${chiave}`;
  if (tipo === "uomo") return `Taglia uomo ${chiave}`;
  if (tipo === "persona") return `Misure di ${(S.dati.persone || []).find((x) => x.id === chiave)?.nome || "—"}`;
  return "";
}

export function opzioni(selezionato = "", { conVuota = true } = {}) {
  const gruppo = (tipo, etichetta) => `<optgroup label="${etichetta}">${Object.keys(taglie[tipo] || {}).map((t) =>
    `<option value="${tipo}:${t}" ${selezionato === `${tipo}:${t}` ? "selected" : ""}>${etichetta} ${t}</option>`).join("")}</optgroup>`;
  const persone = (S.dati.persone || []).length ? `<optgroup label="Misure prese">${S.dati.persone.map((x) =>
    `<option value="persona:${x.id}" ${selezionato === `persona:${x.id}` ? "selected" : ""}>${esc(x.nome)}</option>`).join("")}</optgroup>` : "";
  return `${conVuota ? `<option value="">Scegli…</option>` : ""}${persone}${gruppo("donna", "Donna")}${gruppo("uomo", "Uomo")}`;
}

// Menu "Riempi con…" da mettere in cima a un modulo
export const scelta = (prefisso) => `<label for="${prefisso}-sorgente">Riempi le misure con
  <select id="${prefisso}-sorgente">${opzioni()}</select></label>`;

// Quando si sceglie, scrive le misure nei campi "{prefisso}-{misura}" che esistono nel modulo
export function riempi(prefisso, valore) {
  const m = misureDa(valore);
  if (!m) return;
  for (const [k, v] of Object.entries(m)) {
    const campo = document.getElementById(`${prefisso}-${k}`);
    if (campo && v) campo.value = virgola(v);
  }
}

// Collega il menu di un modulo: da usare come "cambio" nel componente che lo mostra
export const cambioPer = (prefisso) => ({ [`${prefisso}-sorgente`]: (el) => riempi(prefisso, el.value) });

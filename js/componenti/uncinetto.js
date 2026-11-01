// Scelta dell'uncinetto (tipo e misura), usata nei moduli di progetto, parte e campione.
// Gli elenchi vengono da dati/uncinetti.json.
import { esc, num } from "../utils/formato.js";

let elenchi = { tipi: [{ id: "normale", nome: "Normale" }, { id: "tunisino", nome: "Tunisino" }], misure: [] };

export async function caricaElenco() {
  try { elenchi = await (await fetch("dati/uncinetti.json")).json(); } catch { /* restano i tipi base */ }
}

const mmTesto = (mm) => String(mm).replace(".", ",");

// Campi tipo + mm. "prefisso" distingue i campi quando ce ne sono più nello stesso modulo
export function campi(prefisso, u, { conNota = false } = {}) {
  const tipo = u?.tipo || "normale";
  const mm = u?.mm ?? "";
  const misure = elenchi.misure.includes(mm) || mm === "" ? elenchi.misure : [...elenchi.misure, mm].sort((a, b) => a - b);
  return `<div class="griglia2">
    <label for="${prefisso}-tipo">Tipo di uncinetto
      <select id="${prefisso}-tipo" name="${prefisso}-tipo">${elenchi.tipi.map((t) =>
        `<option value="${t.id}" ${t.id === tipo ? "selected" : ""}>${esc(t.nome)}</option>`).join("")}</select></label>
    <label for="${prefisso}-mm">Misura (mm)
      <select id="${prefisso}-mm" name="${prefisso}-mm"><option value="">—</option>${misure.map((m) =>
        `<option value="${m}" ${m === mm ? "selected" : ""}>${mmTesto(m)} mm</option>`).join("")}</select></label>
  </div>
  ${conNota ? `<label for="${prefisso}-nota">Nota sull'uncinetto (facoltativa)<input id="${prefisso}-nota" name="${prefisso}-nota" value="${esc(u?.nota)}" placeholder="Es. 5 poi 6"></label>` : ""}`;
}

// Legge i campi dal modulo
export function leggi(d, prefisso) {
  const u = { tipo: d.get(`${prefisso}-tipo`) || "normale", mm: num(d.get(`${prefisso}-mm`)) || null };
  const nota = d.get(`${prefisso}-nota`);
  if (nota !== null && nota.trim()) u.nota = nota.trim();
  return u;
}

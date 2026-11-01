// Piccole funzioni di uso generale: id, ora, testo sicuro, numeri e durate.

export const uid = () => Math.random().toString(36).slice(2, 10);
export const ora = () => Date.now();

// Rende sicuro un testo prima di metterlo nell'HTML
export const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Legge un numero scritto anche con la virgola ("5,5" → 5.5). Se non è un numero → 0
export const num = (v) => {
  const n = parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

// Mostra un numero con la virgola italiana (20.5 → "20,5")
export const virgola = (n) => String(n).replace(".", ",");

// Durata in millisecondi → "1:05:09" oppure "1 h 5 min"
export function durata(ms, conSecondi = true) {
  const t = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  if (conSecondi) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return h ? `${h} h ${m} min` : `${m} min`;
}

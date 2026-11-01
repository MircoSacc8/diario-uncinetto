// Calcoli su misure, campione e obiettivi di una parte. Solo funzioni pure (test in test/misure.test.js).
import { cmDaGiri } from "./campione.js";

// Il campione che vale per una parte: il suo, altrimenti quello principale del progetto
export function campioneDi(p, parte) {
  const id = parte?.campione || p.campione;
  return p.campioni.find((c) => c.id === id) || p.campioni.find((c) => c.id === p.campione) || null;
}

// L'uncinetto che vale per una parte: il suo, altrimenti quello del progetto
export const uncinettoDi = (p, parte) => parte?.uncinetto || p.uncinetto;

// Ultima misura presa col metro fino al giro attuale
export function ultimaMisura(parte) {
  const valide = parte.misure.filter((m) => m.giro <= parte.rounds);
  return valide.length ? valide.reduce((a, b) => (b.giro > a.giro || (b.giro === a.giro && b.data > a.data) ? b : a)) : null;
}

// Quanti cm fa un giro: dalla misura col metro se c'è (più precisa), altrimenti dal campione
export function cmPerGiro(parte, campione) {
  const m = ultimaMisura(parte);
  if (m && m.giro >= 5 && m.cm > 0) return m.cm / m.giro;
  if (campione?.giri10) return 10 / campione.giri10;
  if (m && m.giro > 0 && m.cm > 0) return m.cm / m.giro;
  return null;
}

// Cm raggiunti (stima). { cm, daMisura } oppure null se non si può sapere
export function cmAttuali(parte, campione) {
  const m = ultimaMisura(parte);
  const passo = cmPerGiro(parte, campione);
  if (m) return { cm: arrotonda(m.cm + (parte.rounds - m.giro) * (passo || 0)), daMisura: true };
  if (campione?.giri10) return { cm: cmDaGiri(parte.rounds, campione.giri10), daMisura: false };
  return null;
}

// Giri che mancano all'obiettivo (per i cm è una stima). null se non si può sapere
export function giriMancanti(parte, campione) {
  const { tipo, valore } = parte.obiettivo;
  if (!valore) return null;
  if (tipo === "giri") return Math.max(0, valore - parte.rounds);
  const ora = cmAttuali(parte, campione);
  const passo = cmPerGiro(parte, campione);
  if (!ora || !passo) return null;
  return Math.max(0, Math.ceil((valore - ora.cm) / passo - 1e-9));
}

// Avanzamento 0–100 verso l'obiettivo. null se non c'è obiettivo o non si può stimare
export function percentuale(parte, campione) {
  const { tipo, valore } = parte.obiettivo;
  if (!valore) return null;
  if (tipo === "giri") return Math.min(100, (parte.rounds / valore) * 100);
  const ora = cmAttuali(parte, campione);
  return ora ? Math.min(100, (ora.cm / valore) * 100) : null;
}

export const obiettivoRaggiunto = (parte, campione) => (percentuale(parte, campione) ?? 0) >= 100;

// Catenelle per una larghezza, dal campione (maglie in 10 cm). null senza campione
export function catenelleDaLarghezza(cm, campione) {
  if (!cm || !campione?.maglie10) return null;
  return Math.round((cm * campione.maglie10) / 10);
}

// "Unc. 5,5 mm" · "Tunisino 6 mm" · "" se manca la misura
export function uncinettoTesto(u, breve = false) {
  if (!u?.mm) return u?.nota || "";
  const mm = String(u.mm).replace(".", ",");
  const nome = u.tipo === "tunisino" ? "Tunisino" : breve ? "Unc." : "Uncinetto";
  return `${nome} ${mm} mm${u.nota && u.nota !== mm ? ` (${u.nota})` : ""}`;
}

// "14 maglie × 18 giri in 10 cm"
export function campioneTesto(c) {
  const pezzi = [c.maglie10 && `${c.maglie10} maglie`, c.giri10 && `${c.giri10} giri`].filter(Boolean);
  return pezzi.length ? `${pezzi.join(" × ")} in 10 cm` : "misure da inserire";
}

function arrotonda(n) { return Math.round(n * 10) / 10; }

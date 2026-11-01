// Promemoria: tipi e quando avvisare. Funzioni pure (niente DOM), con test in test/promemoria.test.js.

// Tipi di promemoria: nome, icona e classe del colore
export const TIPI = {
  aumenti: { nome: "Aumenti", icona: "➕" },
  diminuzioni: { nome: "Diminuzioni", icona: "➖" },
  colore: { nome: "Cambio colore", icona: "🎨" },
  altro: { nome: "Altro", icona: "📌" },
};

export const tipoDi = (l) => (TIPI[l?.tipo] ? l.tipo : "altro");

// Indovina il tipo dal testo: "due dim" → diminuzioni, "aum ogni 3" → aumenti, "altro colore" → colore
export function indovinaTipo(testo) {
  const t = String(testo ?? "").toLowerCase();
  if (/senza\s+(aum|dim)/.test(t)) return "altro";
  if (/\bdim/.test(t)) return "diminuzioni";
  if (/\baum/.test(t)) return "aumenti";
  if (/\bcolor/.test(t)) return "colore";
  return "altro";
}

// Cosa annunciare quando il giro passa da "prima" a "dopo" (col +1 o scritto a mano).
// Restituisce [{ nota, quando }] con quando = "inizio" (sei entrata nell'intervallo)
// oppure "fine" (ultimo giro di un intervallo lungo almeno 2 giri). Tornando indietro non si avvisa.
export function eventiGiro(log, prima, dopo) {
  if (!(dopo > prima)) return [];
  const eventi = [];
  for (const nota of [...log].sort((x, y) => x.r - y.r)) {
    const entrata = prima < nota.r && nota.r <= dopo && dopo <= nota.to;
    const ultimo = nota.to > nota.r && dopo === nota.to;
    if (ultimo) eventi.push({ nota, quando: "fine" });
    else if (entrata) eventi.push({ nota, quando: "inizio" });
  }
  return eventi;
}

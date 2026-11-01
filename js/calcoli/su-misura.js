// "Rifai…": riproporziona un progetto per un'altra taglia, per le misure di una persona
// o per un filato diverso. Solo funzioni pure (test in test/su-misura.test.js).
//
// Principio: misura del corpo + agio = misura del capo. Ogni parte si allarga o allunga in base
// alla misura che la riguarda (corpo → seno, manica → braccio e lunghezza manica, ...),
// poi il campione nuovo trasforma i cm in catenelle e giri.
import { calcolaRaglan, promemoriaRaglan } from "./raglan.js";

export const CATEGORIE = {
  dietro: "Corpo — dietro",
  davanti: "Corpo — davanti",
  manica: "Manica",
  sprone: "Sprone",
  bordo: "Bordo / rifinitura",
  altro: "Altro",
};

// Tipo di parte dal nome, per i progetti fatti prima che esistesse il tipo
export function indovinaCategoria(nome) {
  const n = String(nome || "").toLowerCase();
  if (/manic/.test(n)) return "manica";
  if (/sprone|carré|carre/.test(n)) return "sprone";
  if (/davant|quart|anterior/.test(n)) return "davanti";
  if (/dietro|posterior|schiena/.test(n)) return "dietro";
  if (/bord|rifinit|polsin|collo|collett|orlo/.test(n)) return "bordo";
  return "altro";
}

const rapporto = (a, b) => (a > 0 && b > 0 ? a / b : null);
const intero = (n) => Math.round(n + 1e-9);            // 57,5 → 58 anche con gli arrotondamenti del computer
const mezzo = (n) => Math.round(n * 2) / 2;            // cm al mezzo centimetro
const cm = (n) => String(mezzo(n)).replace(".", ",");

// Fattori per una parte: larghezza e lunghezza, con il motivo da mostrare nel riepilogo.
// L'agio scelto vale per il capo nuovo; per quello di partenza si suppone l'agio predefinito.
function fattori(cat, da, a, ag) {
  const corpo = a.seno > 0 && da.seno > 0 ? (a.seno + ag.corpo) / (da.seno + ag.corpoDa) : null;
  const braccio = a.braccio > 0 && da.braccio > 0 ? (a.braccio + ag.manica) / (da.braccio + ag.manicaDa) : null;
  const motivoSeno = corpo !== null ? `seno ${cm(da.seno)} → ${cm(a.seno)} cm` : "manca il giro seno";
  switch (cat) {
    case "manica": return {
      larg: braccio, lung: rapporto(a.manica, da.manica),
      motivo: [braccio !== null ? `braccio ${cm(da.braccio)} → ${cm(a.braccio)} cm` : "manca il giro braccio",
        rapporto(a.manica, da.manica) !== null ? `manica ${cm(da.manica)} → ${cm(a.manica)} cm` : "manca la lunghezza manica"],
    };
    case "dietro": case "davanti": return {
      larg: corpo, lung: rapporto(a.schiena, da.schiena),
      motivo: [motivoSeno, rapporto(a.schiena, da.schiena) !== null ? `schiena ${cm(da.schiena)} → ${cm(a.schiena)} cm` : "manca la lunghezza schiena"],
    };
    case "sprone": return { larg: corpo, lung: rapporto(a.scalfo, da.scalfo), motivo: [motivoSeno] };
    default: return { larg: corpo, lung: 1, motivo: [motivoSeno, "lunghezza invariata"] };
  }
}

// Primo numero di catenelle in un testo come "36 cat" o "50 cat (scalfo 17 cm)"
function catenelle(testo) {
  const m = String(testo || "").match(/(\d+)\s*cat/i);
  return m ? +m[1] : null;
}

/**
 * @param {object} p           progetto da rifare
 * @param {object} o
 *   da, a                     misure (seno, braccio, manica, schiena, scalfo, scollo…) della taglia di partenza e nuova
 *   agioCorpo, agioManica     cm di agio del capo nuovo (predefiniti 5 e 4)
 *   agioCorpoDa, agioManicaDa agio del capo di partenza (se non lo si sa: 5 e 4)
 *   campioneNuovo             { maglie10, giri10, … } oppure null per lo stesso campione
 * @returns {{ parti: object[], righe: object[], avvisi: string[], sprone: object|null }}
 */
export function rifai(p, o) {
  const agioCorpo = o.agioCorpo ?? 5;
  const agioManica = o.agioManica ?? 4;
  const ag = { corpo: agioCorpo, manica: agioManica, corpoDa: o.agioCorpoDa ?? 5, manicaDa: o.agioManicaDa ?? 4 };
  const vecchio = p.campioni.find((c) => c.id === p.campione) || null;
  const nuovo = o.campioneNuovo || vecchio;
  const fMaglie = rapporto(nuovo?.maglie10, vecchio?.maglie10) ?? 1;
  const fGiri = rapporto(nuovo?.giri10, vecchio?.giri10) ?? 1;
  const avvisi = [];
  if (o.campioneNuovo && vecchio) {
    if (o.campioneNuovo.maglie10 && !vecchio.maglie10) avvisi.push("Il campione di partenza non ha le maglie in 10 cm: le catenelle sono riproporzionate solo sulle misure.");
    if (o.campioneNuovo.giri10 && !vecchio.giri10) avvisi.push("Il campione di partenza non ha i giri in 10 cm: i giri sono riproporzionati solo sulle misure.");
  }

  const righe = [];
  const parti = p.parts.map((x) => {
    const cat = x.categoria || indovinaCategoria(x.name);
    const f = fattori(cat, o.da || {}, o.a || {}, ag);
    const fl = f.larg ?? 1;
    const fv = f.lung ?? 1;
    const parte = structuredClone(x);
    parte.categoria = cat;
    parte.rounds = 0;
    parte.misure = [];
    const prima = [];
    const dopo = [];

    // Larghezza e partenza
    if (x.larghezza) parte.larghezza = mezzo(x.larghezza * fl);
    const cat0 = catenelle(x.start);
    if (cat0 !== null) {
      const cat1 = parte.larghezza && nuovo?.maglie10 ? intero((parte.larghezza * nuovo.maglie10) / 10) : intero(cat0 * fl * fMaglie);
      // Le note tra parentesi (es. "scalfo 17 cm") valevano per la misura vecchia: se cambia, le tolgo
      parte.start = cat1 === cat0 ? x.start : x.start.replace(/(\d+)(\s*cat)/i, `${cat1}$2`).replace(/\s*\([^)]*\)/g, "");
      prima.push(`${cat0} cat`); dopo.push(`${cat1} cat`);
    }

    // Obiettivo
    const { tipo, valore } = x.obiettivo;
    if (valore) {
      const v = tipo === "cm" ? mezzo(valore * fv) : intero(valore * fv * fGiri);
      parte.obiettivo = { tipo, valore: v };
      prima.push(tipo === "cm" ? `${cm(valore)} cm` : `${valore} giri`);
      dopo.push(tipo === "cm" ? `${cm(v)} cm` : `${v} giri`);
    }

    // Promemoria: i numeri di giro seguono la nuova lunghezza
    const fGiroNote = fv * fGiri;
    if (fGiroNote !== 1) {
      parte.log = x.log.map((l) => ({ ...l, r: intero(l.r * fGiroNote), to: Math.max(intero(l.r * fGiroNote), intero(l.to * fGiroNote)) }));
    }

    righe.push({ parte: x.name, categoria: CATEGORIE[cat], prima: prima.join(" · ") || "—", dopo: dopo.join(" · ") || "—", motivo: f.motivo.join("; ") });
    return parte;
  });

  // Progetto dall'alto: lo sprone si ricalcola da capo con le misure nuove
  let sprone = null;
  if (p.direzione === "alto" && p.sprone?.misure) {
    const a = o.a || {};
    const misure = {
      ...p.sprone.misure,
      ...(a.scollo && { scollo: a.scollo }), ...(a.seno && { seno: a.seno }),
      ...(a.braccio && { braccio: a.braccio }), ...(a.scalfo && { scalfo: a.scalfo }),
      agioCorpo, agioManica,
      ...(nuovo?.maglie10 && { maglie10: nuovo.maglie10 }), ...(nuovo?.giri10 && { giri10: nuovo.giri10 }),
    };
    const risultato = calcolaRaglan(misure);
    sprone = { misure, risultato };
    const parte = parti.find((x) => x.categoria === "sprone");
    if (parte && !risultato.errore) {
      parte.start = `${risultato.avvio} cat (scollo ${cm(misure.scollo)} cm)`;
      parte.obiettivo = { tipo: "cm", valore: misure.scalfo };
      parte.log = promemoriaRaglan(risultato).map((n, i) => ({ id: `sp${i}`, ...n }));
      const riga = righe.find((r) => r.parte === parte.name);
      if (riga) { riga.dopo = `${risultato.avvio} cat · ${cm(misure.scalfo)} cm`; riga.motivo = "sprone ricalcolato con le misure nuove"; }
    }
  }

  return { parti, righe, avvisi, sprone };
}

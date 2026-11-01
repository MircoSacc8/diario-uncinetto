// Sprone raglan lavorato dall'alto (dal collo): catenelle iniziali, divisione, aumenti,
// giro in cui separare le maniche. Solo funzioni pure (test in test/raglan.test.js).
//
// Idea: si parte dal giro dello scollo e si aumenta lungo 4 linee raglan (8 maglie per giro
// di aumenti: 2 sul dietro, 2 sul davanti, 2 per manica) finché corpo e maniche arrivano
// alla misura del capo finito (misura del corpo + agio). Quello che non si riesce ad aumentare
// entro la profondità dello scalfo si aggiunge con catenelle sotto l'ascella.

const maglie = (cm, m10) => Math.round((cm * m10) / 10);

/**
 * @param {object} d
 *   scollo, seno, braccio, scalfo  misure in cm (scollo = giro dell'apertura del collo del capo)
 *   agioCorpo, agioManica          cm in più rispetto al corpo (predefiniti 5 e 4)
 *   maglie10, giri10               campione: maglie e giri in 10 cm
 *   aperto                         true per un cardigan (davanti diviso in due)
 */
export function calcolaRaglan(d) {
  const { scollo, seno, braccio, scalfo, maglie10: m, giri10: g } = d;
  const agioCorpo = d.agioCorpo ?? 5;
  const agioManica = d.agioManica ?? 4;
  const mancanti = Object.entries({ scollo, seno, braccio, scalfo, "maglie in 10 cm": m, "giri in 10 cm": g })
    .filter(([, v]) => !(v > 0)).map(([k]) => k);
  if (mancanti.length) return { errore: `Mancano: ${mancanti.join(", ")}.` };

  // Avvio e divisione: 4 maglie raglan, il resto diviso dietro 1/3, davanti 1/3, maniche 1/6 ciascuna
  const avvio = maglie(scollo, m);
  const resto = avvio - 4;
  if (resto < 12) return { errore: "Lo scollo è troppo piccolo per questo campione." };
  const manica0 = Math.round(resto / 6);
  const dietro0 = Math.round(resto / 3);
  const davanti0 = resto - dietro0 - 2 * manica0;

  // Misure del capo finito, in maglie. Le 4 maglie raglan e circa 2,5 cm di catenelle
  // sotto ogni ascella fanno parte del giro del corpo.
  const corpoFinito = seno + agioCorpo;
  const corpoObiettivo = maglie(corpoFinito, m);
  const ascellaIdeale = maglie(2.5, m);
  const dietroObiettivo = (corpoObiettivo - 4 - 2 * ascellaIdeale) / 2;
  const manicaObiettivo = maglie(braccio + agioManica, m);

  // Giri di aumenti necessari (ogni giro di aumenti: +2 dietro, +2 davanti, +2 per manica)
  const giriCorpo = Math.max(0, Math.round((dietroObiettivo - dietro0) / 2));
  const giriManica = Math.max(0, Math.round((manicaObiettivo - ascellaIdeale - manica0) / 2));
  const giriSprone = Math.max(1, Math.round((scalfo * g) / 10));

  // Quanti giri di aumenti stanno nella profondità dello scalfo
  const giriAumento = Math.min(Math.max(giriCorpo, giriManica), giriSprone);
  const passo = giriAumento ? Math.max(1, Math.floor(giriSprone / giriAumento)) : 0; // 1 = ogni giro, 2 = ogni 2 giri…
  const aumCorpo = Math.min(giriCorpo, giriAumento);
  const aumManica = Math.min(giriManica, giriAumento);

  const dietro = dietro0 + 2 * aumCorpo;
  const davanti = davanti0 + 2 * aumCorpo;
  const manica = manica0 + 2 * aumManica;

  // Quello che manca al corpo si recupera con catenelle sotto ogni ascella
  const sottoAscella = Math.max(0, Math.round((corpoObiettivo - (dietro + davanti + 4)) / 2));

  return {
    avvio,
    divisione: { dietro: dietro0, davanti: davanti0, manica: manica0, raglan: 4 },
    davantiPerLato: d.aperto ? { sinistro: Math.floor(davanti0 / 2), destro: davanti0 - Math.floor(davanti0 / 2) } : null,
    giriSprone, giriAumento, passo, aumCorpo, aumManica,
    finale: { dietro, davanti, manica, sottoAscella, corpo: dietro + davanti + 4 + 2 * sottoAscella, manicaTotale: manica + sottoAscella },
    obiettivi: { corpo: corpoObiettivo, manica: manicaObiettivo, corpoCm: corpoFinito, manicaCm: braccio + agioManica },
  };
}

const ogni = (passo) => (passo === 1 ? "a ogni giro" : `ogni ${passo} giri`);

// Promemoria per la parte "Sprone": { r, to, t }
export function promemoriaRaglan(r) {
  if (r.errore) return [];
  const note = [{ r: 0, to: 0, t: `Avvio: ${r.avvio} maglie — dietro ${r.divisione.dietro}, davanti ${r.divisione.davanti}, maniche ${r.divisione.manica} + ${r.divisione.manica}, 4 maglie raglan` }];
  const fineAumenti = r.giriAumento * r.passo;
  if (r.giriAumento) {
    const finoManiche = r.aumManica * r.passo;
    const finoCorpo = r.aumCorpo * r.passo;
    if (r.aumCorpo === r.aumManica) {
      note.push({ r: 1, to: fineAumenti, t: `8 aumenti ai raglan ${ogni(r.passo)} (${r.giriAumento} giri di aumenti)` });
    } else if (r.aumManica < r.aumCorpo) {
      if (r.aumManica) note.push({ r: 1, to: finoManiche, t: `8 aumenti ai raglan ${ogni(r.passo)}` });
      note.push({ r: finoManiche + 1, to: finoCorpo, t: `Solo corpo: 4 aumenti (dietro e davanti) ${ogni(r.passo)}` });
    } else {
      if (r.aumCorpo) note.push({ r: 1, to: finoCorpo, t: `8 aumenti ai raglan ${ogni(r.passo)}` });
      note.push({ r: finoCorpo + 1, to: finoManiche, t: `Solo maniche: 4 aumenti ${ogni(r.passo)}` });
    }
  }
  if (r.giriSprone > fineAumenti) note.push({ r: fineAumenti + 1, to: r.giriSprone, t: "Giri senza aumenti fino alla profondità dello scalfo" });
  note.push({
    r: r.giriSprone, to: r.giriSprone,
    t: `Separa le maniche: lascia ${r.finale.manica} maglie per manica${r.finale.sottoAscella ? ` e fai ${r.finale.sottoAscella} catenelle sotto ogni ascella` : ""}. Corpo: ${r.finale.corpo} maglie`,
  });
  return note;
}

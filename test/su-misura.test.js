import { test } from "node:test";
import assert from "node:assert/strict";
import { rifai, indovinaCategoria } from "../js/calcoli/su-misura.js";
import { normalizzaProgetto } from "../js/dati/migrazioni.js";
import { cardigan } from "../js/dati/esempi.js";
import taglie from "../dati/taglie.json" with { type: "json" };

const S = taglie.donna.S;
const L = taglie.donna.L;
const parte = (r, nome) => r.parti.find((x) => x.name === nome);
const riga = (r, nome) => r.righe.find((x) => x.parte === nome);

test("Tipo di parte dal nome", () => {
  assert.equal(indovinaCategoria("Manica dx"), "manica");
  assert.equal(indovinaCategoria("Quarto anteriore sx"), "davanti");
  assert.equal(indovinaCategoria("Posteriore"), "dietro");
  assert.equal(indovinaCategoria("Polsini"), "bordo");
  assert.equal(indovinaCategoria("Rifinitura busto"), "bordo");
  assert.equal(indovinaCategoria("Sprone"), "sprone");
  assert.equal(indovinaCategoria("Tasca"), "altro");
});

test("Cardigan S → L, stesso filato: il corpo si allarga col seno, le maniche col braccio", () => {
  const p = normalizzaProgetto(cardigan());
  const r = rifai(p, { da: S, a: L });
  // Dietro: 72 cat × (106,5+5)/(86+5) = 88,2 → 88
  assert.equal(parte(r, "Posteriore").start, "88 cat");
  // Quarti davanti: 36 → 44
  assert.equal(parte(r, "Quarto anteriore dx").start, "44 cat");
  // Manica: 50 cat × (30,5+4)/(26+4) = 57,5 → 58 ; lunghezza 43 cm × 44,5/43 = 44,5 cm
  assert.equal(parte(r, "Manica dx").start, "58 cat");
  assert.deepEqual(parte(r, "Manica dx").obiettivo, { tipo: "cm", valore: 44.5 });
  assert.match(riga(r, "Manica dx").motivo, /braccio 26 → 30,5 cm/);
});

test("I giri ripartono da zero e le misure col metro si azzerano", () => {
  const p = normalizzaProgetto(cardigan());
  p.parts[3].rounds = 64; p.parts[3].misure = [{ giro: 40, cm: 25, data: 1 }];
  const r = rifai(p, { da: S, a: L });
  for (const x of r.parti) { assert.equal(x.rounds, 0); assert.deepEqual(x.misure, []); }
  assert.equal(p.parts[3].rounds, 64, "il progetto originale non si tocca");
});

test("Stessa taglia, filato diverso: conta solo il campione", () => {
  const p = normalizzaProgetto(cardigan());
  p.campioni[0].maglie10 = 14;          // 14 maglie × 18 giri
  const r = rifai(p, { da: S, a: S, campioneNuovo: { maglie10: 12, giri10: 15 } });
  assert.equal(parte(r, "Posteriore").start, "62 cat");                  // 72 × 12/14 = 61,7
  assert.deepEqual(parte(r, "Posteriore").obiettivo, { tipo: "giri", valore: 60 });  // 72 × 15/18
  assert.deepEqual(parte(r, "Manica dx").obiettivo, { tipo: "cm", valore: 43 });      // i cm non cambiano
  // Le diminuzioni al giro 36 diventano al giro 30
  assert.equal(parte(r, "Quarto anteriore dx").log[0].r, 30);
});

test("Su misura: misure vere con agio 5/4, modificabile", () => {
  const p = normalizzaProgetto(cardigan());
  const laura = { ...S, seno: 90, braccio: 28, manica: 45 };
  const r = rifai(p, { da: S, a: laura });
  assert.equal(parte(r, "Posteriore").start, "75 cat");                    // 72 × 95/91
  // Più agio sul capo nuovo = più largo: 72 × (90+10)/(86+5) = 79
  assert.equal(parte(rifai(p, { da: S, a: laura, agioCorpo: 10 }), "Posteriore").start, "79 cat");
});

test("Misura mancante nella destinazione: quella dimensione resta com'era e lo dico", () => {
  const p = normalizzaProgetto(cardigan());
  const r = rifai(p, { da: S, a: { seno: 106.5 } });
  assert.deepEqual(parte(r, "Manica dx").obiettivo, { tipo: "cm", valore: 43 });
  assert.match(riga(r, "Manica dx").motivo, /manca/);
});

test("Avviso se il campione di partenza non ha le maglie", () => {
  const p = normalizzaProgetto(cardigan());   // il cardigan ha solo i giri
  const r = rifai(p, { da: S, a: S, campioneNuovo: { maglie10: 12, giri10: 15 } });
  assert.ok(r.avvisi.some((a) => /maglie in 10 cm/.test(a)));
});

test("Progetto dall'alto: lo sprone si ricalcola con le misure nuove", () => {
  const p = normalizzaProgetto({
    id: "m", name: "Maglione", direzione: "alto",
    campioni: [{ id: "c", maglie10: 14, giri10: 18, uncinetto: { tipo: "normale", mm: 5 } }], campione: "c",
    sprone: { misure: { scollo: 46, seno: 86, braccio: 26, scalfo: 17.75, agioCorpo: 5, agioManica: 4, maglie10: 14, giri10: 18 } },
    parts: [{ id: "s", name: "Sprone", categoria: "sprone", rounds: 10, obiettivo: { tipo: "cm", valore: 17.75 }, start: "64 cat", log: [] }],
  });
  const r = rifai(p, { da: S, a: L });
  assert.ok(r.sprone && !r.sprone.risultato.errore);
  assert.equal(r.sprone.misure.seno, 106.5);
  assert.match(parte(r, "Sprone").start, /^70 cat/);                     // scollo L 50 cm × 1,4
  assert.ok(parte(r, "Sprone").log.some((n) => /Separa le maniche/.test(n.t)));
});

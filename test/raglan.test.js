import { test } from "node:test";
import assert from "node:assert/strict";
import { calcolaRaglan, promemoriaRaglan } from "../js/calcoli/raglan.js";

// Taglia S: seno 86, braccio 26, scalfo 17,75; scollo 46; campione 14 maglie × 18 giri in 10 cm
const S = { scollo: 46, seno: 86, braccio: 26, scalfo: 17.75, maglie10: 14, giri10: 18 };

test("Avvio e divisione dello scollo", () => {
  const r = calcolaRaglan(S);
  assert.equal(r.avvio, 64);                            // 46 cm × 1,4
  const { dietro, davanti, manica, raglan } = r.divisione;
  assert.equal(dietro + davanti + 2 * manica + raglan, 64);
  assert.equal(dietro, 20);
  assert.equal(manica, 10);
});

test("Corpo e maniche arrivano alla misura del capo finito (agio 5 e 4 predefiniti)", () => {
  const r = calcolaRaglan(S);
  assert.equal(r.obiettivi.corpoCm, 91);
  assert.equal(r.obiettivi.manicaCm, 30);
  assert.ok(Math.abs(r.finale.corpo - r.obiettivi.corpo) <= 2, `corpo ${r.finale.corpo} vs ${r.obiettivi.corpo}`);
  assert.ok(Math.abs(r.finale.manicaTotale - r.obiettivi.manica) <= 2, `manica ${r.finale.manicaTotale} vs ${r.obiettivi.manica}`);
});

test("Gli aumenti stanno nella profondità dello scalfo", () => {
  const r = calcolaRaglan(S);
  assert.equal(r.giriSprone, 32);                       // 17,75 cm × 1,8
  assert.ok(r.giriAumento * r.passo <= r.giriSprone);
});

test("Agio modificabile: più agio = corpo più largo", () => {
  const largo = calcolaRaglan({ ...S, agioCorpo: 10 });
  assert.ok(largo.finale.corpo > calcolaRaglan(S).finale.corpo);
});

test("Scalfo corto: quello che non si aumenta va in catenelle sotto l'ascella", () => {
  const r = calcolaRaglan({ ...S, seno: 120, scalfo: 8 });
  assert.equal(r.passo, 1);
  assert.ok(r.finale.sottoAscella > 0);
  assert.ok(Math.abs(r.finale.corpo - r.obiettivi.corpo) <= 2);
});

test("Cardigan: il davanti si divide in due", () => {
  const r = calcolaRaglan({ ...S, aperto: true });
  assert.equal(r.davantiPerLato.sinistro + r.davantiPerLato.destro, r.divisione.davanti);
});

test("Dati mancanti: messaggio chiaro, nessun calcolo", () => {
  assert.match(calcolaRaglan({ ...S, giri10: 0 }).errore, /giri in 10 cm/);
  assert.deepEqual(promemoriaRaglan(calcolaRaglan({ ...S, seno: 0 })), []);
});

test("Promemoria per la parte Sprone: avvio, aumenti, separazione maniche", () => {
  const note = promemoriaRaglan(calcolaRaglan(S));
  assert.match(note[0].t, /^Avvio: 64 maglie/);
  assert.ok(note.some((n) => /aumenti ai raglan/.test(n.t)));
  const ultima = note.at(-1);
  assert.equal(ultima.r, 32);
  assert.match(ultima.t, /Separa le maniche/);
  for (const n of note) assert.ok(n.r >= 0 && n.to >= n.r);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { campioneDi, cmAttuali, giriMancanti, percentuale, catenelleDaLarghezza, uncinettoTesto, campioneTesto, cmPerGiro } from "../js/calcoli/misure.js";

const campione = { id: "c1", giri10: 18, maglie10: 14 };
const parte = (altro = {}) => ({ rounds: 0, obiettivo: { tipo: "giri", valore: 0 }, misure: [], campione: "", ...altro });
const progetto = { campioni: [campione, { id: "c2", giri10: 20, maglie10: 16 }], campione: "c1" };

test("Campione della parte: il suo, altrimenti quello principale", () => {
  assert.equal(campioneDi(progetto, parte()).id, "c1");
  assert.equal(campioneDi(progetto, parte({ campione: "c2" })).id, "c2");
  assert.equal(campioneDi(progetto, parte({ campione: "sparito" })).id, "c1");
  assert.equal(campioneDi({ campioni: [], campione: "" }, parte()), null);
});

test("Obiettivo in giri: mancano i giri esatti", () => {
  const x = parte({ rounds: 64, obiettivo: { tipo: "giri", valore: 77 } });
  assert.equal(giriMancanti(x, campione), 13);
  assert.equal(Math.round(percentuale(x, campione)), 83);
});

test("Obiettivo in cm col campione: manica a 43 cm, 18 giri in 10 cm", () => {
  const x = parte({ rounds: 36, obiettivo: { tipo: "cm", valore: 43 } });
  assert.deepEqual(cmAttuali(x, campione), { cm: 20, daMisura: false });
  assert.equal(giriMancanti(x, campione), 42);   // 23 cm ÷ (10/18) = 41,4 → servono 42 giri per arrivarci
});

test("La misura col metro vince sul campione", () => {
  // Al giro 40 Laura misura 25 cm: il suo passo vero è 0,625 cm a giro (il campione diceva 0,556)
  const x = parte({ rounds: 44, obiettivo: { tipo: "cm", valore: 43 }, misure: [{ giro: 40, cm: 25, data: 1 }] });
  assert.equal(cmPerGiro(x, campione), 0.625);
  assert.deepEqual(cmAttuali(x, campione), { cm: 27.5, daMisura: true });
  assert.equal(giriMancanti(x, campione), 25);  // 15,5 cm ÷ 0,625 = 24,8 → 25
});

test("Misura presa più avanti di dove si è ora (giri tolti): non si usa", () => {
  const x = parte({ rounds: 10, obiettivo: { tipo: "cm", valore: 43 }, misure: [{ giro: 40, cm: 25, data: 1 }] });
  assert.equal(cmAttuali(x, campione).daMisura, false);
});

test("Senza campione e senza misure non si stima nulla", () => {
  const x = parte({ rounds: 10, obiettivo: { tipo: "cm", valore: 43 } });
  assert.equal(cmAttuali(x, null), null);
  assert.equal(giriMancanti(x, null), null);
  assert.equal(percentuale(x, null), null);
});

test("Senza obiettivo: niente percentuale", () => {
  assert.equal(percentuale(parte({ rounds: 5 }), campione), null);
});

test("Catenelle dalla larghezza: 20 cm con 14 maglie in 10 cm → 28", () => {
  assert.equal(catenelleDaLarghezza(20, campione), 28);
  assert.equal(catenelleDaLarghezza(20, { giri10: 18 }), null);
});

test("Testi di uncinetto e campione", () => {
  assert.equal(uncinettoTesto({ tipo: "normale", mm: 5.5 }), "Uncinetto 5,5 mm");
  assert.equal(uncinettoTesto({ tipo: "normale", mm: 5.5 }, true), "Unc. 5,5 mm");
  assert.equal(uncinettoTesto({ tipo: "tunisino", mm: 6 }), "Tunisino 6 mm");
  assert.equal(uncinettoTesto({ tipo: "normale", mm: 5, nota: "5 poi 6" }), "Uncinetto 5 mm (5 poi 6)");
  assert.equal(uncinettoTesto({ tipo: "normale", mm: null }), "");
  assert.equal(campioneTesto(campione), "14 maglie × 18 giri in 10 cm");
  assert.equal(campioneTesto({ giri10: 18 }), "18 giri in 10 cm");
});

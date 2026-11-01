import { test } from "node:test";
import assert from "node:assert/strict";
import { cmDaGiri, giriDaCm } from "../js/calcoli/campione.js";

test("Cardigan Laura: 18 giri in 10 cm → 36 giri sono 20 cm", () => {
  assert.equal(cmDaGiri(36, 18), 20);
});

test("Maniche: 43 cm con 18 giri in 10 cm → 77 giri", () => {
  assert.equal(giriDaCm(43, 18), 77);
});

test("Cm con un decimale", () => {
  assert.equal(cmDaGiri(10, 18), 5.6);
});

test("Senza campione non si calcola nulla", () => {
  assert.equal(cmDaGiri(36, 0), null);
  assert.equal(giriDaCm(20, 0), null);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizzaStato, VERSIONE_DATI } from "../js/dati/migrazioni.js";
import { cardigan } from "../js/dati/esempi.js";

test("Dati vuoti o rotti diventano uno stato valido", () => {
  for (const vecchio of [null, undefined, "testo", {}]) {
    const s = normalizzaStato(vecchio);
    assert.deepEqual(s.projects, []);
    assert.equal(s.settings.vibrate, true);
    assert.equal(s.versione, VERSIONE_DATI);
  }
});

test("Progetto della prima versione (senza parti) non perde giri né promemoria", () => {
  const s = normalizzaStato({ projects: [{ id: "x", name: "Borsa", rounds: 12, targetRounds: 30, log: [{ r: 10, t: "cambio colore" }] }] });
  const p = s.projects[0];
  assert.equal(p.parts.length, 1);
  assert.equal(p.parts[0].rounds, 12);
  assert.equal(p.parts[0].target, 30);
  assert.equal(p.parts[0].log[0].t, "cambio colore");
  assert.equal(p.parts[0].log[0].to, 10);
  assert.equal(p.active, p.parts[0].id);
  assert.equal(p.rounds, undefined);
});

test("Parte attiva sparita: si torna alla prima", () => {
  const p = cardigan();
  p.active = "inesistente";
  const s = normalizzaStato({ projects: [p] });
  assert.equal(s.projects[0].active, s.projects[0].parts[0].id);
});

test("Il Cardigan Laura ha 7 parti e il campione a 18", () => {
  const p = normalizzaStato({ projects: [cardigan()] }).projects[0];
  assert.equal(p.parts.length, 7);
  assert.equal(p.gauge, 18);
  assert.equal(p.parts.find((x) => x.name === "Manica dx").target, 77);
});

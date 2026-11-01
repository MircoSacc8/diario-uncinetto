import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizzaStato, normalizzaProgetto, VERSIONE_DATI, primoNumero } from "../js/dati/migrazioni.js";
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
  assert.deepEqual(p.parts[0].obiettivo, { tipo: "giri", valore: 30 });
  assert.equal(p.parts[0].log[0].t, "cambio colore");
  assert.equal(p.parts[0].log[0].to, 10);
  assert.equal(p.active, p.parts[0].id);
  assert.equal(p.rounds, undefined);
});

// Il Cardigan com'era salvato nella versione 1.4 (formato dati 1)
const cardiganV1 = () => ({
  id: "cardigan-laura", name: "Cardigan Laura", hook: "5,5", gauge: 18, status: "in corso",
  parts: [
    { id: "a", name: "Manica dx", rounds: 64, target: 77, start: "50 cat", hook: "", log: [{ id: "n1", r: 18, to: 44, t: "diminuzioni" }] },
    { id: "b", name: "Posteriore", rounds: 10, target: 72, start: "72 cat", hook: "5 poi 6", log: [] },
  ],
  active: "a", updated: 500,
});

test("Versione 1 → 2: il Cardigan non perde niente", () => {
  const p = normalizzaProgetto(cardiganV1());
  assert.deepEqual(p.uncinetto, { tipo: "normale", mm: 5.5 });
  assert.equal(p.campioni.length, 1);
  assert.equal(p.campioni[0].giri10, 18);
  assert.equal(p.campioni[0].id, "campione-cardigan-laura");
  assert.equal(p.campione, p.campioni[0].id);
  const [manica, post] = p.parts;
  assert.equal(manica.rounds, 64);
  assert.deepEqual(manica.obiettivo, { tipo: "giri", valore: 77 });
  assert.equal(manica.uncinetto, null);
  assert.equal(manica.log[0].t, "diminuzioni");
  assert.deepEqual(manica.misure, []);
  assert.equal(post.uncinetto.mm, 5);
  assert.equal(post.uncinetto.nota, "5 poi 6");
  for (const vecchio of ["hook", "gauge"]) assert.equal(p[vecchio], undefined);
  for (const vecchio of ["hook", "target"]) assert.equal(manica[vecchio], undefined);
  assert.equal(p.updated, 500, "la data di modifica non cambia");
});

test("Aggiornare due volte dà lo stesso risultato (anche su due telefoni)", () => {
  const una = normalizzaProgetto(cardiganV1());
  const due = normalizzaProgetto(structuredClone(una));
  assert.deepEqual(due, una);
  assert.deepEqual(normalizzaProgetto(cardiganV1()), una);
});

test("Senza campione nella versione 1 non ne invento uno", () => {
  const p = normalizzaProgetto({ id: "z", name: "Borsa", hook: "", gauge: 0, parts: [{ id: "q", name: "Fondo", rounds: 3, target: 0 }] });
  assert.deepEqual(p.campioni, []);
  assert.equal(p.campione, "");
  assert.equal(p.uncinetto.mm, null);
});

test("Primo numero da un testo", () => {
  assert.equal(primoNumero("5,5"), 5.5);
  assert.equal(primoNumero("5 poi 6"), 5);
  assert.equal(primoNumero(""), null);
  assert.equal(primoNumero(undefined), null);
});

test("Parte attiva sparita: si torna alla prima", () => {
  const p = cardigan();
  p.active = "inesistente";
  const s = normalizzaStato({ projects: [p] });
  assert.equal(s.projects[0].active, s.projects[0].parts[0].id);
});

test("Il Cardigan d'esempio: 7 parti, campione a 18 giri, maniche a 43 cm", () => {
  const p = normalizzaStato({ projects: [cardigan()] }).projects[0];
  assert.equal(p.parts.length, 7);
  assert.equal(p.campioni[0].giri10, 18);
  assert.deepEqual(p.parts.find((x) => x.name === "Manica dx").obiettivo, { tipo: "cm", valore: 43 });
});

test("Versione 3: ogni progetto ha l'elenco foto e il link d'ispirazione", () => {
  const p = normalizzaProgetto(cardiganV1());
  assert.deepEqual(p.foto, []);
  assert.equal(p.ispirazioneLink, "");
  const conFoto = normalizzaProgetto({ ...cardiganV1(), foto: [{ id: "f1", tipo: "ispirazione", didascalia: "" }], ispirazioneLink: "https://esempio.it" });
  assert.equal(conFoto.foto.length, 1);
  assert.equal(conFoto.ispirazioneLink, "https://esempio.it");
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { indovinaTipo, eventiGiro, tipoDi } from "../js/calcoli/promemoria.js";
import { normalizzaStato, VERSIONE_DATI } from "../js/dati/migrazioni.js";
import { calcolaRaglan, promemoriaRaglan } from "../js/calcoli/raglan.js";

test("Il tipo si indovina dal testo come lo scrive Laura", () => {
  assert.equal(indovinaTipo("due dim"), "diminuzioni");
  assert.equal(indovinaTipo("Arrivata a 20 cm: inizia le diminuzioni"), "diminuzioni");
  assert.equal(indovinaTipo("aum ogni 3 maglie"), "aumenti");
  assert.equal(indovinaTipo("8 aumenti ai raglan a ogni giro"), "aumenti");
  assert.equal(indovinaTipo("Altro colore: maglia bassa a rilievo"), "colore");
  assert.equal(indovinaTipo("Giri senza aumenti fino alla profondità dello scalfo"), "altro");
  assert.equal(indovinaTipo("Maglia alta a rilievo"), "altro");
  assert.equal(indovinaTipo(""), "altro");
  assert.equal(tipoDi({ tipo: "boh" }), "altro");
});

const log = [
  { id: "a", r: 18, to: 44, t: "diminuzioni" },
  { id: "b", r: 10, to: 10, t: "cambio colore" },
];

test("+1 giro: avviso all'inizio e all'ultimo giro dell'intervallo", () => {
  assert.deepEqual(eventiGiro(log, 17, 18).map((e) => [e.nota.id, e.quando]), [["a", "inizio"]]);
  assert.deepEqual(eventiGiro(log, 43, 44).map((e) => [e.nota.id, e.quando]), [["a", "fine"]]);
  assert.deepEqual(eventiGiro(log, 9, 10).map((e) => [e.nota.id, e.quando]), [["b", "inizio"]]);
  assert.deepEqual(eventiGiro(log, 20, 21), []);
});

test("Giro scritto a mano: avvisa se entri in un intervallo, non per quelli già passati", () => {
  assert.deepEqual(eventiGiro(log, 5, 25).map((e) => [e.nota.id, e.quando]), [["a", "inizio"]]);
  assert.deepEqual(eventiGiro(log, 20, 30), []);          // ci eri già dentro
  assert.deepEqual(eventiGiro(log, 5, 50), []);           // intervalli già finiti
  assert.deepEqual(eventiGiro(log, 30, 44).map((e) => e.quando), ["fine"]);
});

test("Tornando indietro non compare nessun avviso", () => {
  assert.deepEqual(eventiGiro(log, 19, 18), []);
  assert.deepEqual(eventiGiro(log, 18, 18), []);
});

test("Migrazione 5 → 6: i promemoria esistenti restano uguali e ricevono il tipo", () => {
  const vecchio = {
    versione: 5, settings: { vibrate: false },
    projects: [{ id: "p", name: "Maglione", parts: [{ id: "x", name: "Dietro", rounds: 25,
      log: [{ id: "n1", r: 18, to: 44, t: "due dim" }, { id: "n2", r: 50, to: 50, t: "Chiudi" }, { id: "n3", r: 1, to: 2, t: "x", tipo: "colore" }] }] }],
  };
  const s = normalizzaStato(structuredClone(vecchio));
  assert.equal(s.versione, VERSIONE_DATI);
  assert.equal(VERSIONE_DATI, 6);
  const [n1, n2, n3] = s.projects[0].parts[0].log;
  assert.deepEqual({ ...n1 }, { id: "n1", r: 18, to: 44, t: "due dim", tipo: "diminuzioni" });
  assert.equal(n2.tipo, "altro");
  assert.equal(n3.tipo, "colore");                      // un tipo già scelto non cambia
  assert.equal(s.projects[0].parts[0].rounds, 25);
  assert.equal(s.settings.vibrate, false);
  assert.equal(s.settings.suono, true);
  // ripetere la migrazione non cambia niente
  assert.deepEqual(normalizzaStato(structuredClone(s)), s);
});

test("I promemoria dello sprone hanno il tipo giusto", () => {
  const r = calcolaRaglan({ scollo: 40, seno: 88, braccio: 28, scalfo: 19, maglie10: 16, giri10: 9, agioCorpo: 5, agioManica: 4 });
  const note = promemoriaRaglan(r);
  assert.ok(note.length > 2);
  assert.ok(note.some((n) => n.tipo === "aumenti"));
  assert.ok(note.every((n) => ["aumenti", "altro"].includes(n.tipo)));
});

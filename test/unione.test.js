// Unione tra telefono e copia online: nessun progetto deve andare perso o ricomparire per sbaglio.
import { test } from "node:test";
import assert from "node:assert/strict";
import { unisciRemoti } from "../js/calcoli/unione.js";

const prog = (id, updated, giri = 0) => ({ id, name: id, updated, parts: [{ rounds: giri }] });
const remoto = (p) => ({ id: p.id, updated: p.updated, eliminato: false, progetto: p });
const eliminatoOnline = (id, updated) => ({ id, updated, eliminato: true });
const giri = (r, id) => r.progetti.find((p) => p.id === id)?.parts[0].rounds;

test("Telefono nuovo: arrivano tutti i progetti online", () => {
  const r = unisciRemoti([], {}, [remoto(prog("a", 10, 64)), remoto(prog("b", 20))]);
  assert.equal(r.progetti.length, 2);
  assert.equal(giri(r, "a"), 64);
});

test("Stesso progetto: vince la modifica più recente, da qualunque parte arrivi", () => {
  const piuNuovoOnline = unisciRemoti([prog("a", 10, 5)], {}, [remoto(prog("a", 20, 9))]);
  assert.equal(giri(piuNuovoOnline, "a"), 9);
  const piuNuovoQui = unisciRemoti([prog("a", 30, 12)], {}, [remoto(prog("a", 20, 9))]);
  assert.equal(giri(piuNuovoQui, "a"), 12);
});

test("Progetti solo sul telefono restano", () => {
  const r = unisciRemoti([prog("solo-qui", 5)], {}, [remoto(prog("a", 10))]);
  assert.deepEqual(r.progetti.map((p) => p.id).sort(), ["a", "solo-qui"]);
});

test("Il cardigan d'esempio (data 1) non sovrascrive quello vero online", () => {
  const r = unisciRemoti([prog("cardigan-laura", 1, 0)], {}, [remoto(prog("cardigan-laura", 500, 64))]);
  assert.equal(r.progetti.length, 1);
  assert.equal(giri(r, "cardigan-laura"), 64);
});

test("Eliminato su un altro telefono: sparisce anche qui", () => {
  const r = unisciRemoti([prog("a", 10)], {}, [eliminatoOnline("a", 20)]);
  assert.equal(r.progetti.length, 0);
  assert.equal(r.eliminati.a, 20);
});

test("Eliminato online ma modificato qui dopo: non si perde", () => {
  const r = unisciRemoti([prog("a", 30, 7)], {}, [eliminatoOnline("a", 20)]);
  assert.equal(giri(r, "a"), 7);
});

test("Eliminato qui dopo l'ultima modifica online: non ricompare", () => {
  const r = unisciRemoti([], { a: 40 }, [remoto(prog("a", 20))]);
  assert.equal(r.progetti.length, 0);
});

test("Eliminato qui ma modificato online dopo: torna", () => {
  const r = unisciRemoti([], { a: 10 }, [remoto(prog("a", 20, 3))]);
  assert.equal(giri(r, "a"), 3);
  assert.equal(r.eliminati.a, undefined);
});

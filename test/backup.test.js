import { test } from "node:test";
import assert from "node:assert/strict";
import { creaBackup, leggiBackup, nomeFile, importaNeiDati } from "../js/dati/backup.js";
import { normalizzaStato } from "../js/dati/migrazioni.js";
import { cardigan } from "../js/dati/esempi.js";

const statoDiProva = () => normalizzaStato({ projects: [cardigan()], settings: { vibrate: false } });

test("Esporta e reimporta: i progetti tornano identici", () => {
  const dati = statoDiProva();
  dati.projects[0].parts[3].rounds = 64;
  const letto = leggiBackup(JSON.stringify(creaBackup(dati)));
  assert.deepEqual(letto.projects, dati.projects);
  assert.equal(letto.projects[0].parts[3].rounds, 64);
});

test("Un file qualsiasi viene rifiutato con un messaggio chiaro", () => {
  assert.throws(() => leggiBackup("non è json"), /non riesco a leggerlo/);
  assert.throws(() => leggiBackup(JSON.stringify({ ciao: 1 })), /non è un backup/);
});

test("Importare non cancella nulla e tiene la versione più recente", () => {
  const dati = statoDiProva();
  const backup = structuredClone(dati);
  backup.projects[0].parts[0].rounds = 40;          // nel backup il progetto è più avanti
  backup.projects[0].updated = dati.projects[0].updated + 1000;
  const nuovo = structuredClone(backup.projects[0]);
  nuovo.id = "altro"; nuovo.name = "Borsa";
  backup.projects.push(nuovo);

  const esito = importaNeiDati(dati, backup);
  assert.deepEqual(esito, { aggiunti: 1, aggiornati: 1 });
  assert.equal(dati.projects.length, 2);
  assert.equal(dati.projects.find((p) => p.name === "Cardigan Laura").parts[0].rounds, 40);
});

test("Importare un backup più vecchio non torna indietro", () => {
  const dati = statoDiProva();
  const vecchio = structuredClone(dati);
  vecchio.projects[0].parts[0].rounds = 3;
  vecchio.projects[0].updated -= 1000;
  dati.projects[0].parts[0].rounds = 20;
  assert.deepEqual(importaNeiDati(dati, vecchio), { aggiunti: 0, aggiornati: 0 });
  assert.equal(dati.projects[0].parts[0].rounds, 20);
});

test("Nome del file con la data", () => {
  assert.equal(nomeFile(new Date(2026, 10, 1).getTime()), "diario-uncinetto-2026-11-01.json");
});

// Controlli sull'app installabile: niente file dimenticati fuori dalla cache offline, versioni allineate.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { VERSIONE_APP } from "../js/versione.js";

const sw = readFileSync("sw.js", "utf8");
const elencati = new Set([...sw.matchAll(/^\s+"([^"]+)",?$/gm)].map((m) => m[1]));

function tuttiIFile(cartella) {
  return readdirSync(cartella).flatMap((n) => {
    const p = join(cartella, n);
    return statSync(p).isDirectory() ? tuttiIFile(p) : [p.replaceAll("\\", "/")];
  });
}

test("Ogni file dell'app è nella cache offline di sw.js", () => {
  const mancanti = ["js", "css", "dati", "assets"].flatMap(tuttiIFile).filter((f) => !elencati.has(f));
  assert.deepEqual(mancanti, [], "Aggiungi questi file all'elenco FILE in sw.js");
});

test("Ogni file elencato in sw.js esiste davvero", () => {
  const inesistenti = [...elencati].filter((f) => f !== "./").filter((f) => { try { statSync(f); return false; } catch { return true; } });
  assert.deepEqual(inesistenti, []);
});

test("La versione in sw.js è uguale a js/versione.js", () => {
  const v = sw.match(/const VERSIONE = "([^"]+)"/)[1];
  assert.equal(v, VERSIONE_APP);
});

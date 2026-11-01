# Formato dei dati (versione dati 2)

Salvati nel telefono, chiave `diario-uncinetto` di localStorage.

```
stato
├─ versione        numero del formato (vedi js/dati/migrazioni.js)
├─ updatedAt       ultima modifica (ms)
├─ settings        { vibrate, lastBackup, uid, email, nome, sincronizzato }
├─ eliminati       { id progetto: quando è stato eliminato (ms) }
└─ projects[]      progetti
```

## Progetto
| Campo | Significato |
|---|---|
| id, name | identificativo e nome |
| status | "in corso" oppure "finito" |
| uncinetto | `{ tipo: "normale" \| "tunisino", mm }` |
| campioni[] | `{ id, nome, filato, uncinetto, punto, maglie10, giri10 }` (maglie e giri in 10 cm) |
| campione | id del campione principale ("" se nessuno) |
| pattern, notes | schema e appunti |
| stitchCount | contatore maglie |
| stitches[] | sigle dei punti usati (da dati/punti.json) |
| yarns[] | filati: { id, name, color, hex, grams } |
| counters[] | contatori extra: { id, name, n } |
| time, timerStart | tempo accumulato (ms) e inizio del timer acceso (ms o null) |
| parts[], active | parti del capo e id della parte aperta |
| created, updated | date (ms) |

## Parte
| Campo | Significato |
|---|---|
| id, name | identificativo e nome (es. "Manica dx") |
| rounds | giri fatti |
| obiettivo | `{ tipo: "giri" \| "cm", valore }` (0 = nessun obiettivo) |
| start | partenza (es. "50 cat") |
| larghezza | cm, per proporre le catenelle dal campione |
| uncinetto | null = come il progetto, altrimenti `{ tipo, mm, nota }` |
| campione | "" = principale del progetto, altrimenti id di un campione |
| misure[] | misure col metro: `{ giro, cm, data }` |
| log[] | promemoria: { id, r: dal giro, to: al giro, t: testo } |

Formato 1 → 2 (`js/dati/migrazioni.js`): `hook` (testo) → `uncinetto`; `gauge` → primo campione con id `campione-{id progetto}`; `target` → `obiettivo` in giri; `hook` della parte → `uncinetto` con nota.

## Copia online (Firestore, regione eur3)
`utenti/{uid}/progetti/{id progetto}` → `{ nome, updated, eliminato, json }`, dove `json` è il progetto intero.
Un progetto eliminato resta come documento con `eliminato: true` (così non ricompare).
Unione: `js/calcoli/unione.js` → `unisciRemoti` (vince `updated` più recente; vedi test/unione.test.js).
`updated` viene aggiornato da `salva()` in `js/dati/stato.js` per ogni progetto il cui contenuto è cambiato.

## File di backup
`{ app: "diario-uncinetto", versioneDati, esportatoIl, dati: stato }`. All'importazione i progetti si uniscono per id (vince `updated` più recente).

Cambiando formato: aumentare `VERSIONE_DATI`, aggiungere la migrazione e il suo test.

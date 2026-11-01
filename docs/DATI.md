# Formato dei dati (versione dati 1)

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
| hook | uncinetto del progetto (testo, es. "5,5") |
| gauge | campione: giri in 10 cm (0 = non impostato) |
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
| rounds, target | giri fatti e giri da fare |
| start | partenza (es. "50 cat") |
| hook | uncinetto se diverso dal progetto |
| log[] | promemoria: { id, r: dal giro, to: al giro, t: testo } |

## Copia online (Firestore, regione eur3)
`utenti/{uid}/progetti/{id progetto}` → `{ nome, updated, eliminato, json }`, dove `json` è il progetto intero.
Un progetto eliminato resta come documento con `eliminato: true` (così non ricompare).
Unione: `js/calcoli/unione.js` → `unisciRemoti` (vince `updated` più recente; vedi test/unione.test.js).
`updated` viene aggiornato da `salva()` in `js/dati/stato.js` per ogni progetto il cui contenuto è cambiato.

## File di backup
`{ app: "diario-uncinetto", versioneDati, esportatoIl, dati: stato }`. All'importazione i progetti si uniscono per id (vince `updated` più recente).

Cambiando formato: aumentare `VERSIONE_DATI`, aggiungere la migrazione e il suo test.

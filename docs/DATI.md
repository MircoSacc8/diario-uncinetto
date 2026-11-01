# Formato dei dati (versione dati 6)

Salvati nel telefono, chiave `diario-uncinetto` di localStorage.

```
stato
├─ versione        numero del formato (vedi js/dati/migrazioni.js)
├─ updatedAt       ultima modifica (ms)
├─ settings        { vibrate, suono, lastBackup, uid, email, nome, sincronizzato }
├─ eliminati       { id progetto: quando è stato eliminato (ms) }
├─ persone[]       { id, nome, tagliaBase ("donna:S"…), misure: { seno, vita, … } }
├─ personeUpdated  ultima modifica delle persone (ms)
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
| foto[] | `{ id, tipo: "ispirazione" \| "finito", didascalia, aggiunta }` (le immagini stanno a parte, vedi sotto) |
| ispirazioneLink | link alla fonte d'ispirazione ("" se nessuno) |
| direzione | "basso" (dal basso in alto) oppure "alto" (dal collo) |
| sprone | null oppure `{ misure, risultato }` dell'ultimo calcolo dello sprone raglan (`js/calcoli/raglan.js`) |
| taglia | per cosa è fatto: "donna:S", "uomo:L", "persona:{id}" oppure "" |
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
| categoria | dietro, davanti, manica, sprone, bordo, altro (per "Rifai…") |
| log[] | promemoria: { id, r: dal giro, to: al giro, t: testo, tipo: "aumenti" \| "diminuzioni" \| "colore" \| "altro" } (versione 6; se manca si indovina dal testo) |

Formato 1 → 2 (`js/dati/migrazioni.js`): `hook` (testo) → `uncinetto`; `gauge` → primo campione con id `campione-{id progetto}`; `target` → `obiettivo` in giri; `hook` della parte → `uncinetto` con nota.

## Copia online (Firestore, regione eur3)
`utenti/{uid}/progetti/{id progetto}` → `{ nome, updated, eliminato, json }`, dove `json` è il progetto intero.
Un progetto eliminato resta come documento con `eliminato: true` (così non ricompare).
Unione: `js/calcoli/unione.js` → `unisciRemoti` (vince `updated` più recente; vedi test/unione.test.js).
`updated` viene aggiornato da `salva()` in `js/dati/stato.js` per ogni progetto il cui contenuto è cambiato.

## Misure delle persone online
`utenti/{uid}/impostazioni/persone` → `{ updated, json }` (tutto l'elenco; vince il più recente).

## Foto
Immagini JPEG in base64 (lato lungo 1200 px + miniatura 240 px), mai dentro il progetto:
- sul telefono: IndexedDB `diario-uncinetto-foto`, store `foto`, chiave id;
- online: `utenti/{uid}/foto/{id}` → `{ progetto, foto, miniatura, creata }` (senza il prefisso `data:`).
Codice: `js/foto/comprimi.js` (rimpicciolisce) e `js/foto/archivio.js` (telefono + online). Niente Cloud Storage: sul piano gratuito non è disponibile.

## File di backup
`{ app: "diario-uncinetto", versioneDati, esportatoIl, dati: stato, foto: { id: { foto, miniatura, progetto } } }`. All'importazione i progetti si uniscono per id (vince `updated` più recente).

Cambiando formato: aumentare `VERSIONE_DATI`, aggiungere la migrazione e il suo test.

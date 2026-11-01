# Diario dell'Uncinetto — regole per Claude

Leggi prima `docs/ISTRUZIONI.md` (obiettivo, decisioni, piano a fasi, regole di calcolo).

## Regole di lavoro (decise da Mircuz)
- **Prima di scrivere codice chiedi sempre conferma**, spiegando quali file tocchi.
- Niente file unico: ogni cosa nel suo file e nella sua cartella.
- Dopo ogni passaggio aggiorna `docs/ISTRUZIONI.md`, `docs/CHANGELOG.md`, il documento ISTRUZIONI nel progetto claude.ai e la memoria.
- Lingua: tutto in italiano (interfaccia, commenti, documenti).
- L'app si usa **solo da cellulare** (iPhone di Laura): prove sempre a 390 × 844.

## Struttura
- `index.html` solo scheletro. Niente codice dentro.
- `css/` → `temi.css` (colori, font, misure), `base.css` (impaginazione), `componenti.css` (una sezione per componente).
- `js/main.js` → avvio e smistamento dei tocchi (`data-a="nome-azione"`).
- `js/dati/` → stato, salvataggio, modelli, migrazioni, progetto di esempio.
- `js/calcoli/` → funzioni pure (niente DOM), sempre con test in `test/`.
- `js/componenti/` → ogni componente esporta `html(...)`, `azioni` e se serve `input` / `cambio` (per id del campo).
- `js/schermate/` → `home.js` (lista) e `progetto.js` (scheda), che compongono i componenti.
- `dati/` → elenchi in JSON (punti; poi taglie, uncinetti).

## Convenzioni
- Dopo ogni modifica ai dati chiama `aggiorna()` (salva e ridisegna).
- Formato dati in `docs/DATI.md`. Se cambi il formato: aumenta `VERSIONE_DATI` in `js/dati/migrazioni.js` e aggiungi la migrazione con il suo test. I dati di Laura non vanno mai persi.
- Niente librerie esterne senza motivo; niente build.

## Test e pubblicazione
- Test: `npm test` (Node 20+, nessuna installazione).
- Pubblicazione: GitHub Pages dal branch `main`, cartella principale. Ogni fase chiusa ha un tag (`v1.0`, `v1.1`…).

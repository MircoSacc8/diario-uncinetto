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
- `css/` → `temi.css` (colori beige e rosa antico, sempre tema chiaro; font, misure), `base.css` (impaginazione), `componenti.css` (una sezione per componente).
- `js/main.js` → avvio e smistamento dei tocchi (`data-a="nome-azione"`).
- `js/dati/` → stato, salvataggio, modelli, migrazioni. `esempi.js` (Cardigan) serve solo ai test: l'app parte senza progetti.
- `js/calcoli/` → funzioni pure (niente DOM), sempre con test in `test/`.
- `js/componenti/` → ogni componente esporta `html(...)`, `azioni` e se serve `input` / `cambio` (per id del campo).
- `js/schermate/` → `home.js` (lista) e `progetto.js` (scheda), che compongono i componenti.
- `dati/` → elenchi in JSON (`punti.json`, `uncinetti.json`; poi taglie).
- Calcoli di cm, giri e catenelle: `js/calcoli/misure.js` (la misura col metro vince sul campione).
- Sprone raglan dall'alto: `js/calcoli/raglan.js` (agio predefinito 5 cm corpo, 4 maniche: sempre modificabile). Taglie standard in `dati/taglie.json` (donna e uomo, Craft Yarn Council; lo scollo è una stima).
- Promemoria (tipi e quando avvisare): `js/calcoli/promemoria.js`; avviso grande `annuncia()` in `js/componenti/promemoria.js`, suono `suona()` in `js/componenti/avvisi.js` (spegnibile, `settings.suono`).
- "Rifai…" e su misura: `js/calcoli/su-misura.js` (corpo ← seno, manica ← braccio e lunghezza manica, sprone ricalcolato; l'agio scelto vale per il capo nuovo, per quello vecchio si suppone 5/4). Misure delle persone: `js/schermate/persone.js`, guida in `dati/come-misurare.json`.

## Convenzioni
- Dopo ogni modifica ai dati chiama `aggiorna()` (salva e ridisegna).
- Formato dati in `docs/DATI.md`. Se cambi il formato: aumenta `VERSIONE_DATI` in `js/dati/migrazioni.js` e aggiungi la migrazione con il suo test. I dati di Laura non vanno mai persi.
- Niente librerie esterne senza motivo; niente build.

## Dove sta il codice
- GitHub: `MircoSacc8/diario-uncinetto` (branch `main`).
- PC di Mircuz: `C:\Users\mirco\Desktop\WebApp\Diario_Uncinetto` (stessa repository).
- Flusso: modifica → `npm test` → commit e push dalla copia di Claude → `git pull` nella cartella del PC, così resta sempre allineata.

## App installabile (PWA)
- A ogni rilascio aumenta la versione **in due posti**: `js/versione.js` e `VERSIONE` in `sw.js` (il test lo controlla). Senza questo i telefoni non ricevono l'aggiornamento.
- Ogni file nuovo in `js/`, `css/`, `dati/`, `assets/` va aggiunto all'elenco `FILE` di `sw.js` (il test lo controlla).
- Le icone si rigenerano con `python3 strumenti/crea-icone.py`.

## Firebase (fase 2b)
- Progetto `diario-uncinetto-c2c4e` (account Google di Mircuz), piano Spark gratuito, Firestore in eur3.
- Codice in `js/firebase/`: `config.js` (dati pubblici), `sdk.js` (versione fissa da gstatic), `accesso.js` (Google), `sincronizza.js` (copia online), `account.js` (collega tutto all'app).
- Regole in `firestore.rules`: se cambiano, vanno ripubblicate anche nella console Firebase.
- Il telefono resta la copia principale; online è la copia di sicurezza e il passaggio tra telefoni.
- Accesso: solo **email e password** nella schermata (Google tolto da v1.8.1 su richiesta di Mircuz; resta attivo in Firebase e il codice `entra()` in `js/firebase/accesso.js` non è usato).
- La chiave web in `config.js` è pubblica per natura; in Google Cloud è limitata ai domini `mircosacc8.github.io/*` e `diario-uncinetto-c2c4e.firebaseapp.com/*` e a 25 API. Se l'app cambia indirizzo, aggiorna la limitazione e i domini autorizzati di Firebase Authentication. L'avviso "secret detected" di GitHub su questa chiave è atteso.

## Test e pubblicazione
- Test: `npm test` (Node 20+, nessuna installazione).
- Pubblicazione: GitHub Pages dal branch `main`, cartella principale. Ogni fase chiusa ha un tag (`v1.0`, `v1.1`…).

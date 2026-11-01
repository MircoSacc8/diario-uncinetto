# Diario dell'Uncinetto — istruzioni di progetto

Documento di riferimento per chi lavora all'app (anche Claude in chat future). Aggiornato al 1° novembre 2026.

## Obiettivo
App web, in italiano, per tenere traccia dei progetti all'uncinetto di Laura: giri, misure in cm, uncinetto, filati, campione, tempo e taglie. Sostituisce il blocco note del telefono, dove prima annotava giri e misure.

## Chi la usa e da dove
- Laura, dal suo cellulare (iPhone, Safari), **senza Claude**. Mircuz la sviluppa e la prova.
- L'app deve funzionare come **sito statico** su **GitHub Pages**, aperto dal browser e aggiunto alla schermata Home.
- Nessuna dipendenza da claude.ai: il salvataggio su claude.ai (`window.claude`) è solo un extra quando è disponibile.

## Dati e salvataggio
- I dati stanno nel telefono (localStorage), sotto la chiave `uncinetto-v1`.
- Su iPhone, Safari può cancellare i dati di un sito non usato per 7 giorni se **non** è aggiunto alla schermata Home. Per questo:
  - l'app va installata come PWA (manifest + icona, "Aggiungi a Home");
  - serve **Esporta / Importa** un file di backup (.json), da salvare in File o iCloud;
  - in futuro, se serve la sincronizzazione tra più dispositivi, valutare un backend (es. Supabase o Firebase).

## Funzioni già presenti (versione 3)
- Progetti con stato in corso / finito.
- Ogni progetto è diviso in **parti** (es. quarto anteriore, posteriore, maniche, rifiniture), ognuna con il suo contagiri, giri da fare, catenelle di partenza e uncinetto se diverso.
- Promemoria per **intervallo di giri** (es. "dal 18 al 44: diminuzioni"), evidenziati quando si è in quei giri.
- Contatore maglie, contatori extra con nome, timer per progetto (uno attivo alla volta), vibrazione disattivabile.
- Punti usati (abbreviazioni italiane: cat, mbss, mb, mma, ma, mad, ma ril, mb ril, aum, dim…), filati con colore e grammi, appunti.
- Campione in giri per 10 cm, stima dei cm raggiunti e convertitore cm ↔ giri.

## Funzioni da aggiungere (concordate)
1. **Uncinetto con tipo e misura**: tipo (normale, tunisino; eventualmente altri) e mm, per progetto e per singola parte (es. "5 poi 6").
2. **Cm come riferimento principale**: l'obiettivo di ogni parte si salva in cm (es. "arrivare a 43–44 cm"); i giri sono una stima dal campione. Laura può anche segnare la misura presa col metro.
3. **Campione legato a filato + uncinetto**: maglie e giri in 10 cm, con il punto usato. Il campione lo fornisce sempre lei, a ogni cambio.
4. **Direzione di lavoro per progetto**:
   - dal basso in alto: catenelle = larghezza, giri = lunghezza (es. Cardigan Laura);
   - dall'alto in basso (top-down, dal collo): l'app calcola aumenti giro per giro in base al campione.
5. **Taglie standard e ricalcolo**: tabella taglie donna; tasto "Rifai in un'altra taglia" che crea una copia del progetto con nuove misure in cm, catenelle e giri calcolati dal nuovo campione. Vale anche per "stessa taglia, filato/uncinetto diverso".
6. **Esporta / Importa** backup e installazione come PWA.

## Regole di calcolo
- Si ragiona sempre in **cm**, poi si converte con il campione:
  - catenelle = larghezza (cm) × maglie in 10 cm ÷ 10
  - giri = lunghezza (cm) × giri in 10 cm ÷ 10
- Cambio taglia: le **larghezze** del corpo scalano con il giro seno, la **manica** con scalfo e giro braccio, le **lunghezze** con le misure di lunghezza della tabella.
- Arrotondare catenelle e giri all'intero; dove il punto richiede multipli (es. motivi), arrotondare al multiplo più vicino.

## Taglie standard donna (cm)
Fonte: tabella misure standard per capi all'uncinetto (Hanjan Crochet, basata sugli standard Craft Yarn Council).

| Misura | S | M | L |
|---|---|---|---|
| Giro seno | 86 | 96,5 | 106,5 |
| Lunghezza schiena alla vita | 43 | 43,5 | 44,5 |
| Larghezza spalle (dietro) | 38 | 40,5 | 43 |
| Manica fino all'ascella | 43 | 43 | 44,5 |
| Giro braccio | 26 | 28 | 30,5 |
| Profondità scalfo | 17,75 | 19 | 20,25 |
| Vita | 67,5 | 76 | 86,5 |
| Fianchi | 91,5 | 101,5 | 111,5 |

Da completare con XS, XL, XXL.

## Progetto di riferimento: Cardigan Laura (taglia S)
- Uncinetto 5,5, lavorato dal basso in alto. Campione ricavato: circa 18 giri in 10 cm (20 cm = 36 giri).
- Quarti anteriori: 36 cat per quarto; diminuzioni a 20 cm (36 giri); totale 72 giri.
- Posteriore: 72 cat, uncinetto 5 poi 6; giri 72 (da verificare).
- Maniche: 50 cat per scalfo da 17 cm, fino a 43–44 cm (= 77 giri).
- Rifinitura busto: 1 giro maglia alta + 6 giri maglia alta a rilievo + 2 giri maglia bassa a rilievo in altro colore.
- Polsini: 3 giri maglia alta a rilievo + 2 giri maglia bassa a rilievo in altro colore.
- Nota a parte (da chiarire a quale parte appartiene): giro attuale 64; diminuzioni dal 18 al 44; al 59 due dim; al 62 una dim; "10" di significato da chiarire.
- Stima taglia L: posteriore circa 89 cat, quarti circa 45 cat, maniche circa 58 cat, manica 44,5 cm (da ricalcolare con il nuovo campione).

## Regole di lavoro
- Prima di scrivere codice, Claude chiede sempre conferma.
- Codice diviso in file e cartelle: niente file unico.
- Dopo ogni fase: aggiornare questo documento (anche in `docs/` nel repository), il CHANGELOG e la memoria del progetto.

## Piano
**Confermata (1 nov 2026): opzione A**, HTML + CSS + JavaScript a moduli, senza build, pubblicato su GitHub Pages. I calcoli sono testati con il test runner di Node.

**Confermato (1 nov 2026): salvataggio su Firebase.**
- Accesso con account Google. Chiunque abbia un account Google può usare l'app; per ora ognuno vede solo i propri progetti (regole Firestore per utente).
- Tre livelli di protezione: app installata sulla Home + archiviazione persistente; sincronizzazione su Firestore (piano gratuito Spark, funziona anche offline); backup esportabile in un file.
- Supabase scartato: il piano gratuito mette in pausa i progetti inattivi.
- La sincronizzazione passa dalla fase 6 alla fase 2.

Repository: `MircoSacc8/diario-uncinetto` (pubblica, per GitHub Pages gratuito).

## Stato avanzamento
- **Fase 0** (1 nov 2026): repository creata con README; app GitHub di Claude installata solo su `diario-uncinetto` (Claude può caricare i file).
- **Fase 1** (1 nov 2026, v1.0): app divisa in cartelle, solo mobile, barra fissa "+1 giro" in basso, test automatici, GitHub Pages attivo. Dati solo sul telefono fino alla fase 2.
- Nota: GitHub Pages tiene in cache i file per circa 10 minuti, quindi dopo un aggiornamento il telefono può vedere la versione vecchia per qualche minuto. Nella fase 2 il service worker gestirà gli aggiornamenti.
- **Cartella sul PC** (1 nov 2026): `C:\Users\mirco\Desktop\WebApp\Diario_Uncinetto`, copia della repository (git, branch `main`, tag v1.0 creato da Mircuz). Claude la raggiunge quando la chat è collegata al PC: lì fa pull e i test; i push partono dalla copia di Claude nel cloud perché la shell del PC non ha le credenziali GitHub.
- **Fase 2a** (1 nov 2026, v1.1): app installabile sulla Home con icona, funziona offline, avviso di aggiornamento, dati permanenti, schermata Impostazioni con Esporta/Importa backup (unione senza cancellare), promemoria backup dopo 30 giorni.
- **Firebase configurato** (1 nov 2026), account Google di Mircuz: progetto `diario-uncinetto` (ID `diario-uncinetto-c2c4e`), piano Spark gratuito, app web "Diario dell'Uncinetto" registrata, accesso con Google attivo (nome mostrato: "Diario dell'Uncinetto", email assistenza di Mircuz), dominio autorizzato `mircosacc8.github.io`, Firestore Standard in **eur3 (Europa)** in modalità produzione, regole pubblicate (copia in `firestore.rules`: ognuno solo `utenti/{suo id}/…`). Backup automatici di Firestore non disponibili sul piano gratuito: restano Esporta/Importa.
- **Fase 2b** (1 nov 2026, v1.2): accesso con Google obbligatorio, copia online su Firestore (`utenti/{uid}/progetti/{id}`), unione che rispetta le eliminazioni, stato della sincronizzazione in home e impostazioni, uscita dall'account. Da provare sull'iPhone di Mircuz (Safari e app sulla Home) prima di dare il link a Laura.
- **v1.3** (1 nov 2026): accesso anche con email e password (deciso da Mircuz per evitare problemi della finestra Google sull'iPhone), "Crea account", "Password dimenticata?". Chiave web Firebase limitata ai domini dell'app in Google Cloud (avviso GitHub "secret detected" atteso: la chiave è pubblica per design).
- **v1.4** (1 nov 2026): colori beige chiaro e rosa antico (scelta B di Mircuz), app sempre chiara anche in modalità scura, icona ricolorata. Mircuz ha provato su iPhone l'accesso con email e password: funziona.
- **Fase 3** (1 nov 2026, v1.5): uncinetto tipo + mm (progetto e parte), obiettivi parte in cm o giri, 📏 misura col metro (vince sul campione), campioni multipli per filato/uncinetto, catenelle da larghezza, convertitore cm ↔ giri/maglie. Dati versione 2 con migrazione automatica.
- **Prossima: fase 3b** — foto di ispirazione e del lavoro finito (approvata): foto compresse ~1200 px salvate in Firestore (`utenti/{uid}/foto/{id}`, niente Cloud Storage a pagamento) + link alla fonte d'ispirazione.
- **Poi: fase 4** — direzione di lavoro (dal basso / top-down con aumenti); **fase 5** — taglie e "Rifai in un'altra taglia".

Fasi:
0. Repository GitHub `diario-uncinetto` (pubblica) e GitHub Pages.
1. Struttura a cartelle e porting delle funzioni attuali, senza cambiare il comportamento.
2. Dati al sicuro: installazione come app (PWA, funziona anche offline) ed Esporta / Importa backup.
3. Uncinetto con tipo e mm, obiettivi in cm, misura col metro, campione per filato e uncinetto.
4. Direzione di lavoro e calcolo degli aumenti top-down.
5. Taglie standard e "Rifai in un'altra taglia".
6. (Facoltativa) Sincronizzazione online tra più dispositivi.

Ogni fase: conferma → codice → test → commit con tag di versione (si può tornare indietro) → aggiornamento di istruzioni, CHANGELOG e memoria.

## Solo telefono (deciso 1 nov 2026)
L'app si usa **solo da cellulare**. Quindi:
- impaginazione pensata per schermi da 360 a 430 px di larghezza, a una colonna, senza versioni per computer;
- pulsanti grandi (almeno 48 px), il "+1 giro" raggiungibile col pollice;
- rispetto di notch e barra in basso dell'iPhone (aree sicure);
- niente zoom accidentale col doppio tocco sul contatore;
- aspetto da app quando è installata sulla Home (senza barre del browser);
- prove sempre a misura di telefono (iPhone, 390 × 844).

## Tecnica
- Codice: repository `MircoSacc8/diario-uncinetto`, struttura descritta in `CLAUDE.md`. App online: https://mircosacc8.github.io/diario-uncinetto/
- La vecchia versione a file unico (v3) resta nel progetto come `app/index.html`, solo come archivio.
- Font da Google Fonts (Bricolage Grotesque, Figtree). Colori: beige chiaro e rosa antico, sempre tema chiaro.
- Repository GitHub con GitHub Pages attivo sul branch principale.

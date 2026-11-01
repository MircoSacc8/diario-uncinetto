// Service worker: fa funzionare l'app anche senza internet.
// A OGNI RILASCIO aumenta VERSIONE (uguale a js/versione.js) e, se aggiungi file, mettili in FILE.
const VERSIONE = "1.3.0";
const CACHE = `uncinetto-${VERSIONE}`;
const CACHE_FONT = "uncinetto-font";
const CACHE_FIREBASE = "uncinetto-firebase";

// Tutti i file dell'app (test/pwa.test.js controlla che non manchi nessuno)
const FILE = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "assets/icone/apple-touch-icon.png",
  "assets/icone/icona-192.png",
  "assets/icone/icona-512.png",
  "css/temi.css",
  "css/base.css",
  "css/componenti.css",
  "dati/punti.json",
  "js/main.js",
  "js/versione.js",
  "js/utils/formato.js",
  "js/calcoli/campione.js",
  "js/calcoli/unione.js",
  "js/dati/modelli.js",
  "js/dati/migrazioni.js",
  "js/dati/esempi.js",
  "js/dati/salvataggio.js",
  "js/dati/stato.js",
  "js/dati/backup.js",
  "js/pwa/installa.js",
  "js/componenti/avvisi.js",
  "js/componenti/finestre.js",
  "js/componenti/parti.js",
  "js/componenti/promemoria.js",
  "js/componenti/timer.js",
  "js/componenti/contagiri.js",
  "js/componenti/convertitore.js",
  "js/componenti/contatori.js",
  "js/componenti/punti.js",
  "js/componenti/filati.js",
  "js/schermate/home.js",
  "js/schermate/progetto.js",
  "js/schermate/impostazioni.js",
  "js/schermate/accesso.js",
  "js/firebase/config.js",
  "js/firebase/sdk.js",
  "js/firebase/accesso.js",
  "js/firebase/sincronizza.js",
  "js/firebase/account.js",
];

// Installazione: scarica tutti i file della nuova versione
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILE.map((f) => new Request(f, { cache: "reload" })))));
});

// Attivazione: cancella le versioni vecchie
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((nomi) => Promise.all(nomi.filter((n) => n !== CACHE && n !== CACHE_FONT && n !== CACHE_FIREBASE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// L'app chiede di passare subito alla versione nuova (pulsante "Aggiorna")
self.addEventListener("message", (e) => {
  if (e.data === "aggiorna") self.skipWaiting();
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Font di Google e programma di Firebase (versione fissa): dalla cache se ci sono,
  // altrimenti scaricati e salvati. I dati di Firebase invece passano sempre da internet.
  const font = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  const firebase = url.hostname === "www.gstatic.com" && url.pathname.startsWith("/firebasejs/");
  if (font || firebase) {
    e.respondWith(caches.open(font ? CACHE_FONT : CACHE_FIREBASE).then(async (c) => {
      const salvato = await c.match(req);
      if (salvato) return salvato;
      const risposta = await fetch(req);
      if (risposta.ok || risposta.type === "opaque") c.put(req, risposta.clone());
      return risposta;
    }));
    return;
  }

  // File dell'app: prima la cache della versione installata, poi la rete
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(req, { ignoreSearch: true }).then((salvato) => salvato || fetch(req).catch(() => caches.match("index.html")))
    );
  }
});

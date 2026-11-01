// Carica Firebase dal sito di Google, versione fissa (cambiarla solo dopo averla provata).
// Il service worker ne tiene una copia, così l'app si apre anche senza internet.
export const VERSIONE_FIREBASE = "12.19.0";
const BASE = `https://www.gstatic.com/firebasejs/${VERSIONE_FIREBASE}/`;

let caricamento = null;

export function caricaSdk() {
  caricamento ??= Promise.all([
    import(`${BASE}firebase-app.js`),
    import(`${BASE}firebase-auth.js`),
    import(`${BASE}firebase-firestore.js`),
  ]).then(([app, auth, firestore]) => ({ app, auth, firestore }))
    .catch((e) => { caricamento = null; throw e; });
  return caricamento;
}

// Accesso con l'account Google. Dopo il primo accesso il telefono lo ricorda, anche senza internet.
import { configFirebase } from "./config.js";
import { caricaSdk } from "./sdk.js";

let sdk = null;
let auth = null;
let db = null;
let utente = null;
const ascoltatori = [];

export const utenteAttuale = () => utente;
export const quandoCambiaUtente = (fn) => ascoltatori.push(fn);
export const firestore = () => ({ sdk: sdk.firestore, db });

// Avvia Firebase e risponde con l'utente già collegato (o null)
export async function inizializza() {
  sdk = await caricaSdk();
  const app = sdk.app.initializeApp(configFirebase);
  auth = sdk.auth.getAuth(app);
  auth.languageCode = "it";
  db = sdk.firestore.initializeFirestore(app, {
    localCache: sdk.firestore.persistentLocalCache({ tabManager: sdk.firestore.persistentMultipleTabManager() }),
  });
  return new Promise((risolvi) => {
    let primo = true;
    sdk.auth.onAuthStateChanged(auth, (u) => {
      utente = u;
      if (primo) { primo = false; risolvi(u); return; }
      ascoltatori.forEach((fn) => fn(u));
    });
  });
}

const MESSAGGI = {
  "auth/popup-blocked": "Il telefono ha bloccato la finestra di Google. Riprova toccando di nuovo il pulsante.",
  "auth/popup-closed-by-user": "Hai chiuso la finestra prima di finire. Riprova quando vuoi.",
  "auth/cancelled-popup-request": "Hai chiuso la finestra prima di finire. Riprova quando vuoi.",
  "auth/network-request-failed": "Manca la connessione a internet. Collegati e riprova.",
  "auth/unauthorized-domain": "Questo indirizzo non è autorizzato in Firebase. Avvisa Mircuz.",
  "auth/invalid-email": "L'email non è scritta bene. Controllala e riprova.",
  "auth/missing-password": "Scrivi la password.",
  "auth/invalid-credential": "Email o password sbagliate. Controlla e riprova, oppure tocca \"Password dimenticata?\".",
  "auth/wrong-password": "Email o password sbagliate. Controlla e riprova, oppure tocca \"Password dimenticata?\".",
  "auth/user-not-found": "Non c'è un account con questa email. Tocca \"Crea account\" per farne uno.",
  "auth/email-already-in-use": "Esiste già un account con questa email: entra con la password, oppure con Google se l'hai creato così.",
  "auth/weak-password": "La password è troppo corta: usa almeno 6 caratteri.",
  "auth/too-many-requests": "Troppi tentativi. Aspetta qualche minuto e riprova.",
};

function spiega(e) {
  const codice = String(e?.code || "");
  if (codice.includes("requests-from-referer")) return new Error(MESSAGGI["auth/unauthorized-domain"]);
  return new Error(MESSAGGI[codice] || `Accesso non riuscito (${codice || "errore sconosciuto"}). Riprova.`);
}

// Apre la finestra di Google. Lancia un errore con un messaggio in italiano se non va
export async function entra() {
  const provider = new sdk.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  try {
    const { user } = await sdk.auth.signInWithPopup(auth, provider);
    utente = user;
    return user;
  } catch (e) {
    throw spiega(e);
  }
}

// ---- Email e password: niente finestre, funziona sempre anche dall'app sulla Home ----

export async function entraConEmail(email, password) {
  try {
    const { user } = await sdk.auth.signInWithEmailAndPassword(auth, email.trim(), password);
    utente = user;
    return user;
  } catch (e) { throw spiega(e); }
}

export async function creaAccount(email, password) {
  try {
    const { user } = await sdk.auth.createUserWithEmailAndPassword(auth, email.trim(), password);
    utente = user;
    return user;
  } catch (e) { throw spiega(e); }
}

// Manda un'email (in italiano) con il link per scegliere una nuova password
export async function recuperaPassword(email) {
  try { await sdk.auth.sendPasswordResetEmail(auth, email.trim()); }
  catch (e) { throw spiega(e); }
}

// Esce solo se tutte le modifiche sono già online (aspetta al massimo 8 secondi)
export async function esci() {
  const attesa = sdk.firestore.waitForPendingWrites(db);
  const tempoScaduto = new Promise((_, no) => setTimeout(() => no(new Error("scaduto")), 8000));
  try { await Promise.race([attesa, tempoScaduto]); }
  catch { throw new Error("Ci sono modifiche non ancora salvate online. Collegati a internet e riprova."); }
  await sdk.auth.signOut(auth);
  utente = null;
}

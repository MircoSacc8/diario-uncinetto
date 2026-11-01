// Collega accesso e sincronizzazione all'app: chi è entrato, entrata, uscita.
import { S, salvaArrivati, disegna } from "../dati/stato.js";
import * as accesso from "./accesso.js";
import * as sincronizza from "./sincronizza.js";
import * as schermataAccesso from "../schermate/accesso.js";
import { avviso } from "../componenti/avvisi.js";

function mostraErrore(m) { schermataAccesso.impostaMessaggio(m); disegna(); }

// Prova ad accedere (Google o email): se va, entra nell'app; se no, mostra il motivo
async function tenta(fn) {
  schermataAccesso.impostaMessaggio("");
  schermataAccesso.impostaInCorso(true);
  disegna();
  try {
    const u = await fn();
    schermataAccesso.pulisci();
    collega(u);
  } catch (e) {
    schermataAccesso.impostaInCorso(false);
    mostraErrore(e.message);
  }
}

const vai = (schermata) => { S.vista.id = null; S.vista.schermata = schermata; disegna(); };

function collega(u) {
  const imp = S.dati.settings;
  imp.uid = u.uid;
  imp.email = u.email || "";
  imp.nome = u.displayName || "";
  salvaArrivati();
  sincronizza.avvia(u.uid, imp.sincronizzato === u.uid);
  vai("home");
}

// All'avvio: decide se mostrare l'accesso o l'app
export async function avvia() {
  vai("caricamento");
  sincronizza.quandoPronto(() => { S.dati.settings.sincronizzato = S.dati.settings.uid; salvaArrivati(); });
  sincronizza.quandoCambiaStato(() => {
    const el = document.getElementById("stato-sync");
    if (el) el.textContent = testoStato();
  });
  try {
    const u = await accesso.inizializza();
    if (u) collega(u); else vai("accesso");
  } catch {
    // Firebase non si carica (niente internet): chi è già entrato usa l'app sul telefono
    vai(S.dati.settings.uid ? "home" : "senza-rete");
  }
}

export function testoStato() {
  return {
    ok: "Progetti salvati online ✓",
    attesa: "Salvati sul telefono · vanno online appena c'è rete",
    spento: "Salvati solo su questo telefono",
  }[sincronizza.stato()];
}

export const azioni = {
  "accedi": () => tenta(() => accesso.entra()),
  "entra-email": () => {
    const { email, password } = schermataAccesso.credenziali();
    if (!email.trim()) return mostraErrore("Scrivi la tua email.");
    tenta(() => accesso.entraConEmail(email, password));
  },
  "crea-account": () => {
    const { email, password } = schermataAccesso.credenziali();
    if (!email.trim()) return mostraErrore("Scrivi l'email che vuoi usare.");
    if (password.length < 6) return mostraErrore("Scegli una password di almeno 6 caratteri.");
    tenta(() => accesso.creaAccount(email, password));
  },
  "password-dimenticata": async () => {
    const { email } = schermataAccesso.credenziali();
    if (!email.trim()) return mostraErrore("Scrivi prima la tua email, poi tocca di nuovo \"Password dimenticata?\".");
    try {
      await accesso.recuperaPassword(email);
      schermataAccesso.impostaConferma(`Ti ho mandato un'email a ${email.trim()} per scegliere una nuova password. Controlla anche la posta indesiderata.`);
    } catch (e) {
      schermataAccesso.impostaMessaggio(e.message);
    }
    disegna();
  },
  "riprova": () => location.reload(),
  // Esce: i progetti restano online e spariscono da questo telefono finché non si rientra
  "esci": async () => {
    try {
      await accesso.esci();
    } catch (e) {
      avviso(e.message);
      return;
    }
    sincronizza.ferma();
    S.dati.projects = [];
    S.dati.eliminati = {};
    S.dati.persone = [];
    S.dati.personeUpdated = 0;
    for (const k of ["uid", "email", "nome", "sincronizzato"]) delete S.dati.settings[k];
    salvaArrivati();
    vai("accesso");
  },
};

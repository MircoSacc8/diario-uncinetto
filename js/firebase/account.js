// Collega accesso e sincronizzazione all'app: chi è entrato, entrata, uscita.
import { S, salvaArrivati, disegna } from "../dati/stato.js";
import * as accesso from "./accesso.js";
import * as sincronizza from "./sincronizza.js";
import * as schermataAccesso from "../schermate/accesso.js";
import { avviso } from "../componenti/avvisi.js";

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
  "accedi": async () => {
    schermataAccesso.impostaMessaggio("");
    schermataAccesso.impostaInCorso(true);
    disegna();
    try {
      collega(await accesso.entra());
    } catch (e) {
      schermataAccesso.impostaInCorso(false);
      schermataAccesso.impostaMessaggio(e.message);
      disegna();
    }
    schermataAccesso.impostaInCorso(false);
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
    for (const k of ["uid", "email", "nome", "sincronizzato"]) delete S.dati.settings[k];
    salvaArrivati();
    vai("accesso");
  },
};

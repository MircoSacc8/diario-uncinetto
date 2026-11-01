// Installazione come app: registra il service worker, gestisce gli aggiornamenti,
// chiede di tenere i dati in modo permanente e capisce se l'app è già sulla Home.

let inAttesa = null;          // service worker nuovo pronto a sostituire quello attuale
const ascoltatori = [];

export const aggiornamentoPronto = () => !!inAttesa;
export const quandoAggiornamento = (fn) => ascoltatori.push(fn);

// true se l'app è aperta dalla schermata Home (non da Safari)
export const suHome = () =>
  window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;

export const suIphone = () => /iPhone|iPad|iPod/.test(navigator.userAgent);

export async function registra() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.register("sw.js");
    const segnala = (sw) => { inAttesa = sw; ascoltatori.forEach((fn) => fn()); };

    if (reg.waiting && navigator.serviceWorker.controller) segnala(reg.waiting);
    reg.addEventListener("updatefound", () => {
      const nuovo = reg.installing;
      nuovo?.addEventListener("statechange", () => {
        if (nuovo.state === "installed" && navigator.serviceWorker.controller) segnala(nuovo);
      });
    });

    // Quando una versione nuova prende il controllo, ricarica una volta.
    // Alla primissima installazione (nessuna versione precedente) non serve ricaricare.
    const giaInstallata = !!navigator.serviceWorker.controller;
    let ricaricato = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!giaInstallata || ricaricato) return;
      ricaricato = true;
      location.reload();
    });

    // Controlla se c'è una versione nuova ogni volta che l'app torna in primo piano
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") reg.update().catch(() => {});
    });
  } catch { /* senza service worker l'app funziona lo stesso, solo non offline */ }
}

export function applicaAggiornamento() {
  inAttesa?.postMessage("aggiorna");
}

// Chiede al telefono di non cancellare mai i dati dell'app
export async function datiPermanenti() {
  try {
    if (await navigator.storage?.persisted?.()) return true;
    return (await navigator.storage?.persist?.()) ?? false;
  } catch {
    return false;
  }
}

// Lettura e scrittura nella memoria del telefono (localStorage).
// Nella fase 2 qui si aggiunge la copia online su Firebase.

const CHIAVE = "diario-uncinetto";

export function carica() {
  try {
    const v = localStorage.getItem(CHIAVE);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}

export function scrivi(dati) {
  try {
    localStorage.setItem(CHIAVE, JSON.stringify(dati));
    return true;
  } catch {
    return false;
  }
}

// Unione di progetti tra telefono, backup e copia online, senza perderne nessuno.
// Regola unica: per lo stesso progetto (stesso id) vince la modifica più recente.

// Backup: aggiunge i progetti nuovi e aggiorna quelli più vecchi
export function unisciProgetti(miei, altri) {
  const perId = new Map(miei.map((p) => [p.id, p]));
  let aggiunti = 0;
  let aggiornati = 0;
  for (const p of altri) {
    const mio = perId.get(p.id);
    if (!mio) { perId.set(p.id, p); aggiunti++; }
    else if ((p.updated || 0) > (mio.updated || 0)) { perId.set(p.id, p); aggiornati++; }
  }
  return { progetti: [...perId.values()], aggiunti, aggiornati };
}

// Copia online: "remoti" sono { id, updated, eliminato, progetto }.
// Tiene conto delle eliminazioni, così un progetto cancellato non ricompare
// e un progetto modificato dopo la cancellazione non va perso.
export function unisciRemoti(locali, eliminatiLocali, remoti) {
  const progetti = new Map(locali.map((p) => [p.id, p]));
  const eliminati = { ...eliminatiLocali };

  for (const r of remoti) {
    const mio = progetti.get(r.id);
    const mioAggiornato = mio?.updated || 0;
    const eliminatoQui = eliminati[r.id] || 0;

    if (r.eliminato) {
      if (mio && mioAggiornato > r.updated) continue;          // modificato qui dopo la cancellazione: resta
      progetti.delete(r.id);
      eliminati[r.id] = Math.max(eliminatoQui, r.updated);
    } else if (eliminatoQui >= r.updated) {
      progetti.delete(r.id);                                  // cancellato qui dopo l'ultima modifica online
    } else if (!mio || r.updated > mioAggiornato) {
      progetti.set(r.id, r.progetto);
      delete eliminati[r.id];
    }
  }
  return { progetti: [...progetti.values()], eliminati };
}

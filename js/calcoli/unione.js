// Unisce due elenchi di progetti senza perderne nessuno.
// Stesso progetto (stesso id) in entrambi: vince quello modificato più di recente.
// Usato dall'importazione del backup e, nella fase 2b, dalla sincronizzazione online.

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

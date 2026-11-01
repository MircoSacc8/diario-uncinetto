// Progetto caricato al primo avvio: il Cardigan Laura (taglia S, uncinetto 5,5, dal basso in alto).
import { nuovoProgetto, nuovaParte, nuovaNota } from "./modelli.js";

export function cardigan() {
  const diminuzioni = () => [nuovaNota(36, 36, "Arrivata a 20 cm: inizia le diminuzioni")];
  // Id e data fissi e "vecchi": su un telefono nuovo la versione online vince sempre
  // e il cardigan non viene mai duplicato.
  return nuovoProgetto({
    id: "cardigan-laura",
    created: 1,
    updated: 1,
    name: "Cardigan Laura",
    hook: "5,5",
    gauge: 18,
    stitches: ["cat", "ma", "ma ril", "mb ril", "dim"],
    notes: "Posteriore: 72 giri? Da verificare.\nManiche: arrivare a 43–44 cm (=77 giri).",
    parts: [
      nuovaParte("Quarto anteriore dx", { target: 72, start: "36 cat", log: diminuzioni() }),
      nuovaParte("Quarto anteriore sx", { target: 72, start: "36 cat", log: diminuzioni() }),
      nuovaParte("Posteriore", { target: 72, start: "72 cat", hook: "5 poi 6" }),
      nuovaParte("Manica dx", { target: 77, start: "50 cat (scalfo 17 cm)" }),
      nuovaParte("Manica sx", { target: 77, start: "50 cat (scalfo 17 cm)" }),
      nuovaParte("Rifinitura busto", { target: 9, log: [
        nuovaNota(1, 1, "Maglia alta"),
        nuovaNota(2, 7, "Maglia alta a rilievo"),
        nuovaNota(8, 9, "Altro colore: maglia bassa a rilievo"),
      ] }),
      nuovaParte("Polsini", { target: 5, log: [
        nuovaNota(1, 3, "Maglia alta a rilievo"),
        nuovaNota(4, 5, "Altro colore: maglia bassa a rilievo"),
      ] }),
    ],
  });
}

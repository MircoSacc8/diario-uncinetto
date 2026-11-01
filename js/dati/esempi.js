// Cardigan Laura (taglia S, uncinetto 5,5, dal basso in alto): dati di prova per i test.
// Dalla versione 1.8.2 NON viene più caricato nell'app al primo avvio.
import { nuovoProgetto, nuovaParte, nuovaNota, nuovoCampione, nuovoUncinetto } from "./modelli.js";

export function cardigan() {
  const diminuzioni = () => [nuovaNota(36, 36, "Arrivata a 20 cm: inizia le diminuzioni")];
  const campione = nuovoCampione({ id: "campione-cardigan", nome: "Campione cardigan", uncinetto: nuovoUncinetto({ mm: 5.5 }), giri10: 18 });
  const giri = (valore) => ({ tipo: "giri", valore });
  // Id e data fissi e "vecchi": su un telefono nuovo la versione online vince sempre
  // e il cardigan non viene mai duplicato.
  return nuovoProgetto({
    id: "cardigan-laura",
    created: 1,
    updated: 1,
    name: "Cardigan Laura",
    taglia: "donna:S",
    uncinetto: nuovoUncinetto({ mm: 5.5 }),
    campioni: [campione],
    campione: campione.id,
    stitches: ["cat", "ma", "ma ril", "mb ril", "dim"],
    notes: "Posteriore: 72 giri? Da verificare.",
    parts: [
      nuovaParte("Quarto anteriore dx", { obiettivo: giri(72), start: "36 cat", log: diminuzioni() }),
      nuovaParte("Quarto anteriore sx", { obiettivo: giri(72), start: "36 cat", log: diminuzioni() }),
      nuovaParte("Posteriore", { obiettivo: giri(72), start: "72 cat", uncinetto: nuovoUncinetto({ mm: 5, nota: "5 poi 6" }) }),
      nuovaParte("Manica dx", { obiettivo: { tipo: "cm", valore: 43 }, start: "50 cat (scalfo 17 cm)" }),
      nuovaParte("Manica sx", { obiettivo: { tipo: "cm", valore: 43 }, start: "50 cat (scalfo 17 cm)" }),
      nuovaParte("Rifinitura busto", { obiettivo: giri(9), log: [
        nuovaNota(1, 1, "Maglia alta"),
        nuovaNota(2, 7, "Maglia alta a rilievo"),
        nuovaNota(8, 9, "Altro colore: maglia bassa a rilievo"),
      ] }),
      nuovaParte("Polsini", { obiettivo: giri(5), log: [
        nuovaNota(1, 3, "Maglia alta a rilievo"),
        nuovaNota(4, 5, "Altro colore: maglia bassa a rilievo"),
      ] }),
    ],
  });
}

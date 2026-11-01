// Conversioni basate sul campione: quanti giri ci sono in 10 cm.
// Esempio Cardigan Laura: 18 giri in 10 cm → 20 cm = 36 giri.

// Giri fatti → centimetri (una cifra decimale). Senza campione → null
export function cmDaGiri(giri, giriIn10cm) {
  if (!giriIn10cm) return null;
  return Math.round((giri / giriIn10cm) * 100) / 10;
}

// Centimetri → giri (intero). Senza campione → null
export function giriDaCm(cm, giriIn10cm) {
  if (!giriIn10cm) return null;
  return Math.round((cm * giriIn10cm) / 10);
}

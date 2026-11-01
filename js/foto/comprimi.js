// Rimpicciolisce una foto del telefono prima di salvarla: lato lungo 1200 px per vederla bene
// a schermo intero, più una miniatura da 240 px per le liste. Il risultato è JPEG in base64.

const LATO = 1200;
const LATO_MINI = 240;
const LIMITE = 850_000;   // caratteri: resta sotto il limite di 1 MB di un documento online

async function caricaImmagine(file) {
  // createImageBitmap raddrizza le foto girate (dati EXIF) e legge anche le foto HEIC dell'iPhone
  if ("createImageBitmap" in window) {
    try { return await createImageBitmap(file, { imageOrientation: "from-image" }); } catch { /* provo l'altro modo */ }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function disegna(img, lato, qualita) {
  const w = img.width, h = img.height;
  const scala = Math.min(1, lato / Math.max(w, h));
  const tela = document.createElement("canvas");
  tela.width = Math.round(w * scala);
  tela.height = Math.round(h * scala);
  const ctx = tela.getContext("2d");
  ctx.fillStyle = "#ffffff";            // le PNG trasparenti diventano su sfondo bianco
  ctx.fillRect(0, 0, tela.width, tela.height);
  ctx.drawImage(img, 0, 0, tela.width, tela.height);
  return tela.toDataURL("image/jpeg", qualita);
}

// File scelto dal telefono → { foto, miniatura } come "data:image/jpeg;base64,…"
export async function comprimi(file) {
  const img = await caricaImmagine(file);
  let qualita = 0.8;
  let foto = disegna(img, LATO, qualita);
  while (foto.length > LIMITE && qualita > 0.4) {
    qualita -= 0.1;
    foto = disegna(img, LATO, qualita);
  }
  const miniatura = disegna(img, LATO_MINI, 0.7);
  img.close?.();
  return { foto, miniatura };
}

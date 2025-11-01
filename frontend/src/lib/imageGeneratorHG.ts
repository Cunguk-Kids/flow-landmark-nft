export interface CardData {
  brand: string;
  description: string;
  count: number;
}


export async function generateImageCard(data: CardData): Promise<string> {
  const { brand, description, count } = data;

  // Add randomness with timestamp and random number
  const timestamp = Date.now();
  const randomSeed = Math.floor(Math.random() * 1000000);

  const prompt = `
    Gaya ilustrasi klasik dengan sentuhan vintage dan tekstur kertas.
    Menampilkan karakter sesuai ${brand},
    dengan ornamen.
    Latar belakang menampilkan arsitektur yang sesuai dengan ${brand}.
    Pencahayaan hangat seperti senja, warna earthy,
    gaya ilustrasi tradisional dengan detail halus seperti ukiran dan lukisan tinta.
    Proporsi simetris, komposisi vertikal, seukuran kartu premium.
    Tema merek "${brand}", menggambarkan "${description}".
    Kualitas tinggi, tone hangat, detail realistis, nuansa budaya autentik.
    sekarang card yang beredar sudah ${count} dengan tampilan berbeda
    seed: ${randomSeed}-${timestamp}
  `;
  const encodedPrompt = encodeURIComponent(prompt);

  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=flux&width=630&height=880&seed=${randomSeed}&nologo=true`;

  return imageUrl;
}

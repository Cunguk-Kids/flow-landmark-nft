import { uploadDirect } from "@uploadcare/upload-client";

/**
 * Upload gambar (URL/base64/file) langsung ke Uploadcare CDN.
 * @param imageUrl - URL atau base64 data image (data:image/png;base64,...)
 * @param options - opsional: nama file dan public key
 * @returns URL CDN publik Uploadcare
 */
export async function uploadImage(
  imageUrl: string,
  options?: {
    publicKey?: string;
    fileName?: string;
    store?: "auto" | "1" | "0";
  },
) {
  const publicKey = options?.publicKey ?? import.meta.env.VITE_UPLOADCARE_KEY;
  const uploadURL = options?.publicKey ?? import.meta.env.VITE_UPLOADCARE_URL;
  if (!publicKey) throw new Error("❌ Missing VITE_UPLOADCARE_KEY in .env");

  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Gagal fetch image: ${res.statusText}`);

  const blob = await res.blob();
  const file = new File([blob], options?.fileName ?? `upload-${Date.now()}.png`, {
    type: blob.type || "image/png",
  });

  console.log("☁️ Uploading to Uploadcare...");

  const result = await uploadDirect(file, {
    publicKey,
    store: "auto",
  });

  return {
    id: result.uuid,
    image: `${uploadURL}/${result.uuid}/-/preview/630x880/${result.name}`,
    name: result.name
  };
}

export const cleanImageURL = (imageURL: string) => imageURL
  ?.replace(/^"|"$/g, "")
  ?.replace(/^\/+/, "");
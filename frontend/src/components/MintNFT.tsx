import {
  useFlowCurrentUser,
  useFlowMutate,
  useFlowTransactionStatus,
} from "@onflow/react-sdk";
import { useEffect, useState } from "react";
import { MINT_SIMPLE_NFT, MINT_NFT } from "../flow/nft-transactions";

const CATEGORIES = [
  { value: 0, label: "Landscape" },
  { value: 1, label: "Cultural" },
  { value: 2, label: "Event" },
  { value: 3, label: "Historical" },
  { value: 4, label: "Nature" },
  { value: 5, label: "Urban" },
  { value: 6, label: "Food" },
  { value: 7, label: "Art" },
];

const BORDER_STYLES = [
  { value: 0, label: "None" },
  { value: 1, label: "Batik" },
  { value: 2, label: "Wayang" },
  { value: 3, label: "Songket" },
  { value: 4, label: "Tenun" },
];

const STICKER_STYLES = [
  { value: 0, label: "None" },
  { value: 1, label: "Javanese Script" },
  { value: 2, label: "Traditional Pattern" },
  { value: 3, label: "Cultural Icon" },
];

const FILTER_STYLES = [
  { value: 0, label: "None" },
  { value: 1, label: "Vintage" },
  { value: 2, label: "Cultural" },
  { value: 3, label: "Vibrant" },
];

const AUDIO_STYLES = [
  { value: 0, label: "None" },
  { value: 1, label: "Gamelan" },
  { value: 2, label: "Angklung" },
  { value: 3, label: "Kendang" },
];

export default function MintNFT({ onMintSuccess }: { onMintSuccess?: () => void }) {
  const { user } = useFlowCurrentUser();
  const { mutateAsync, isPending, data: txId } = useFlowMutate();
  const { transactionStatus } = useFlowTransactionStatus({ id: txId || "" });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: 0,
    imageURL: "",
    thumbnailURL: "",
    // Advanced fields
    weather: "",
    temperature: "",
    latitude: "",
    longitude: "",
    placeName: "",
    city: "",
    country: "",
    altitude: "",
    windSpeed: "",
    borderStyle: 0,
    stickerStyle: 0,
    filterStyle: 0,
    audioStyle: 0,
    javaneseText: "",
    tags: "",
    rarity: 0,
  });

  useEffect(() => {
    if (txId && transactionStatus?.status === 3) {
      // Transaction sealed (completed)
      console.log("NFT minted successfully!");
      if (onMintSuccess) {
        onMintSuccess();
      }
      // Reset form
      setFormData({
        title: "",
        description: "",
        category: 0,
        imageURL: "",
        thumbnailURL: "",
        weather: "",
        temperature: "",
        latitude: "",
        longitude: "",
        placeName: "",
        city: "",
        country: "",
        altitude: "",
        windSpeed: "",
        borderStyle: 0,
        stickerStyle: 0,
        filterStyle: 0,
        audioStyle: 0,
        javaneseText: "",
        tags: "",
        rarity: 0,
      });
    }
  }, [transactionStatus, txId, onMintSuccess]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("Style") || name === "category" || name === "rarity"
        ? parseInt(value)
        : value,
    }));
  };

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.loggedIn) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      if (showAdvanced) {
        // Full mint with all metadata
        const tags = formData.tags
          ? formData.tags.split(",").map((t) => t.trim())
          : [];

        await mutateAsync({
          cadence: MINT_NFT,
          args: (arg, t) => [
            arg(formData.title, t.String),
            arg(formData.description, t.String),
            arg(formData.category.toString(), t.UInt8),
            arg(formData.imageURL, t.String),
            arg(formData.thumbnailURL || formData.imageURL, t.String),
            arg(formData.weather || null, t.Optional(t.String)),
            arg(formData.temperature || null, t.Optional(t.String)),
            arg(formData.latitude || null, t.Optional(t.String)),
            arg(formData.longitude || null, t.Optional(t.String)),
            arg(formData.placeName || null, t.Optional(t.String)),
            arg(formData.city || null, t.Optional(t.String)),
            arg(formData.country || null, t.Optional(t.String)),
            arg(formData.altitude || null, t.Optional(t.String)),
            arg(formData.windSpeed || null, t.Optional(t.String)),
            arg(formData.borderStyle.toString(), t.UInt8),
            arg(formData.stickerStyle.toString(), t.UInt8),
            arg(formData.filterStyle.toString(), t.UInt8),
            arg(formData.audioStyle.toString(), t.UInt8),
            arg(formData.javaneseText || null, t.Optional(t.String)),
            arg(tags, t.Array(t.String)),
            arg(formData.rarity.toString(), t.UInt8),
          ],
        });
      } else {
        // Simple mint
        await mutateAsync({
          cadence: MINT_SIMPLE_NFT,
          args: (arg, t) => [
            arg(formData.title, t.String),
            arg(formData.description, t.String),
            arg(formData.category.toString(), t.UInt8),
            arg(formData.imageURL, t.String),
          ],
        });
      }
    } catch (error) {
      console.error("Minting failed:", error);
      alert("Failed to mint NFT. Check console for details.");
    }
  };

  if (!user?.loggedIn) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Mint NFT Moment</h2>
        <p style={{ color: "#666", marginTop: "1rem" }}>
          Connect your wallet to mint NFTs
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h2>Mint NFT Moment</h2>

      <form onSubmit={handleMint}>
        {/* Basic Fields */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
            placeholder="e.g., Borobudur Temple"
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
            placeholder="Describe this moment..."
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
              Image URL *
            </label>
            <input
              type="url"
              name="imageURL"
              value={formData.imageURL}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
              placeholder="https://..."
            />
          </div>
        </div>

        {/* Toggle Advanced Fields */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            padding: "0.5rem 1rem",
            background: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginBottom: "1rem",
          }}
        >
          {showAdvanced ? "Hide" : "Show"} Advanced Options
        </button>

        {/* Advanced Fields */}
        {showAdvanced && (
          <div
            style={{
              background: "#f9f9f9",
              padding: "1.5rem",
              borderRadius: "8px",
              marginBottom: "1rem",
            }}
          >
            <h3>Location & Weather</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>Latitude</label>
                <input
                  type="text"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                  placeholder="-7.6079"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>Longitude</label>
                <input
                  type="text"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                  placeholder="110.2038"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>Place Name</label>
                <input
                  type="text"
                  name="placeName"
                  value={formData.placeName}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>Weather</label>
                <input
                  type="text"
                  name="weather"
                  value={formData.weather}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                  placeholder="Sunny"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>Temperature</label>
                <input
                  type="text"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                  placeholder="28°C"
                />
              </div>
            </div>

            <h3>Cultural Customization</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>Border Style</label>
                <select
                  name="borderStyle"
                  value={formData.borderStyle}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                >
                  {BORDER_STYLES.map((style) => (
                    <option key={style.value} value={style.value}>
                      {style.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>Sticker Style</label>
                <select
                  name="stickerStyle"
                  value={formData.stickerStyle}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                >
                  {STICKER_STYLES.map((style) => (
                    <option key={style.value} value={style.value}>
                      {style.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>Filter Style</label>
                <select
                  name="filterStyle"
                  value={formData.filterStyle}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                >
                  {FILTER_STYLES.map((style) => (
                    <option key={style.value} value={style.value}>
                      {style.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>Audio Style</label>
                <select
                  name="audioStyle"
                  value={formData.audioStyle}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                >
                  {AUDIO_STYLES.map((style) => (
                    <option key={style.value} value={style.value}>
                      {style.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Javanese Text
              </label>
              <input
                type="text"
                name="javaneseText"
                value={formData.javaneseText}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
                placeholder="ꦧꦺꦴꦫꦺꦴꦧꦸꦝꦸꦂ"
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Tags (comma separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
                placeholder="temple, historical, buddhist"
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending || !user?.loggedIn}
          style={{
            padding: "0.75rem 2rem",
            background: isPending ? "#6c757d" : "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isPending ? "not-allowed" : "pointer",
            fontSize: "1rem",
            fontWeight: "bold",
            width: "100%",
          }}
        >
          {isPending ? "Minting..." : "Mint NFT"}
        </button>

        {isPending && (
          <p style={{ marginTop: "1rem", color: "#007bff", textAlign: "center" }}>
            Processing transaction... Please wait.
          </p>
        )}

        {transactionStatus?.status === 3 && (
          <p style={{ marginTop: "1rem", color: "#28a745", textAlign: "center" }}>
            NFT minted successfully! 🎉
          </p>
        )}
      </form>
    </div>
  );
}

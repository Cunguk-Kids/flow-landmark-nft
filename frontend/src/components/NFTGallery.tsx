import { useFlowCurrentUser, useFlowQuery } from "@onflow/react-sdk";
import { useEffect, useState } from "react";
import {
  GET_NFT_IDS,
  GET_NFT_INFO,
  GET_COLLECTION_STATS,
} from "../flow/nft-scripts";

// Type definitions matching Cadence structs
interface NFTInfo {
  id: number;
  title: string;
  description: string;
  imageURL: string;
  thumbnailURL: string;
  category: number;
  rarity: number;
  timestamp: number;
  location?: {
    latitude: string;
    longitude: string;
    placeName?: string;
    city?: string;
    country?: string;
  };
  javaneseText?: string;
  tags: string[];
  upgradeCount: number;
}

interface CollectionStats {
  totalNFTs: number;
  commonCount: number;
  rareCount: number;
  epicCount: number;
  legendaryCount: number;
}

const CATEGORY_NAMES = [
  "Landscape",
  "Cultural",
  "Event",
  "Historical",
  "Nature",
  "Urban",
  "Food",
  "Art",
];

const RARITY_NAMES = ["Common", "Rare", "Epic", "Legendary"];
const RARITY_COLORS = [
  "bg-gray-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-yellow-500",
];

export default function NFTGallery() {
  const { user } = useFlowCurrentUser();
  const [selectedNFT, setSelectedNFT] = useState<number | null>(null);

  // Get NFT IDs
  const {
    data: nftIds,
    refetch: refetchIds,
    isLoading: isLoadingIds,
  } = useFlowQuery<number[]>({
    cadence: GET_NFT_IDS,
    args: (arg, t) => [arg(user?.addr || "", t.Address)],
    query: { enabled: !!user?.addr },
  });

  // Get collection stats
  const { data: stats } = useFlowQuery<CollectionStats>({
    cadence: GET_COLLECTION_STATS,
    args: (arg, t) => [arg(user?.addr || "", t.Address)],
    query: { enabled: !!user?.addr },
  });

  // Get selected NFT details
  const {
    data: nftInfo,
    isLoading: isLoadingNFT,
    error: nftError,
  } = useFlowQuery<NFTInfo>({
    cadence: GET_NFT_INFO,
    args: (arg, t) => [
      arg(user?.addr || "", t.Address),
      arg(selectedNFT?.toString() || "0", t.UInt64),
    ],
    query: { enabled: !!user?.addr && selectedNFT !== null },
  });

  // Debug logging
  useEffect(() => {
    console.log("NFT Gallery Debug:", {
      userAddr: user?.addr,
      nftIds,
      selectedNFT,
      nftInfo,
      isLoadingNFT,
      nftError,
    });
  }, [user?.addr, nftIds, selectedNFT, nftInfo, isLoadingNFT, nftError]);

  // Auto-select first NFT when IDs load
  useEffect(() => {
    if (nftIds && nftIds.length > 0 && selectedNFT === null) {
      setSelectedNFT(nftIds[0]);
    }
  }, [nftIds, selectedNFT]);

  if (!user?.loggedIn) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>NFT Gallery</h2>
        <p style={{ color: "#666", marginTop: "1rem" }}>
          Connect your wallet to view your NFT collection
        </p>
      </div>
    );
  }

  if (isLoadingIds) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>NFT Gallery</h2>
        <p>Loading collection...</p>
      </div>
    );
  }

  if (!nftIds || nftIds.length === 0) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>NFT Gallery</h2>
        <p style={{ color: "#666", marginTop: "1rem" }}>
          No NFTs found. Mint your first NFT moment!
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>NFT Gallery</h2>

      {/* Collection Stats */}
      {stats && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              padding: "1rem",
              background: "#f0f0f0",
              borderRadius: "8px",
            }}
          >
            <div style={{ fontSize: "2rem", fontWeight: "bold" }}>
              {stats.totalNFTs}
            </div>
            <div style={{ fontSize: "0.875rem", color: "#666" }}>
              Total NFTs
            </div>
          </div>
          <div
            style={{
              padding: "1rem",
              background: "#f0f0f0",
              borderRadius: "8px",
            }}
          >
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              {stats.commonCount}
            </div>
            <div style={{ fontSize: "0.875rem", color: "#666" }}>Common</div>
          </div>
          <div
            style={{
              padding: "1rem",
              background: "#f0f0f0",
              borderRadius: "8px",
            }}
          >
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              {stats.rareCount}
            </div>
            <div style={{ fontSize: "0.875rem", color: "#666" }}>Rare</div>
          </div>
          <div
            style={{
              padding: "1rem",
              background: "#f0f0f0",
              borderRadius: "8px",
            }}
          >
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              {stats.epicCount}
            </div>
            <div style={{ fontSize: "0.875rem", color: "#666" }}>Epic</div>
          </div>
          <div
            style={{
              padding: "1rem",
              background: "#f0f0f0",
              borderRadius: "8px",
            }}
          >
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              {stats.legendaryCount}
            </div>
            <div style={{ fontSize: "0.875rem", color: "#666" }}>Legendary</div>
          </div>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "300px 1fr",
          gap: "2rem",
        }}
      >
        {/* NFT List */}
        <div>
          <h3>Your NFTs ({nftIds.length})</h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            {nftIds.map((id) => (
              <button
                key={id}
                onClick={() => setSelectedNFT(id)}
                style={{
                  padding: "0.75rem",
                  background: selectedNFT === id ? "#007bff" : "#f0f0f0",
                  color: selectedNFT === id ? "white" : "black",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  textAlign: "left",
                  fontWeight: selectedNFT === id ? "bold" : "normal",
                }}
              >
                NFT #{id}
              </button>
            ))}
          </div>
          <button
            onClick={() => refetchIds()}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              background: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Refresh Collection
          </button>
        </div>

        {/* NFT Details */}
        <div className="flex overflow-auto">
          {isLoadingNFT && <p>Loading NFT details...</p>}
          {nftError && (
            <div
              style={{
                padding: "1rem",
                background: "#fee",
                borderRadius: "8px",
                color: "#c00",
              }}
            >
              <strong>Error loading NFT:</strong>
              <pre className="whitespace-pre-wrap" style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
                {JSON.stringify(nftError, null, 2) }
              </pre>
            </div>
          )}
          {!isLoadingNFT && !nftError && !nftInfo && selectedNFT !== null && (
            <p style={{ color: "#666" }}>
              No NFT data found for ID {selectedNFT}
            </p>
          )}
          {nftInfo && (
            <div>
              <div
                style={{
                  background: "#f9f9f9",
                  padding: "1.5rem",
                  borderRadius: "12px",
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <h3 style={{ margin: 0 }}>{nftInfo?.metadata?.title}</h3>
                    <p style={{ color: "#666", margin: "0.25rem 0" }}>
                      #{nftInfo?.metadata?.id}
                    </p>
                  </div>
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      background:
                        nftInfo?.metadata?.rarity === 0
                          ? "#6c757d"
                          : nftInfo?.metadata?.rarity === 1
                          ? "#007bff"
                          : nftInfo?.metadata?.rarity === 2
                          ? "#6f42c1"
                          : "#ffc107",
                      color: "white",
                      borderRadius: "12px",
                      fontSize: "0.875rem",
                      fontWeight: "bold",
                    }}
                  >
                    {RARITY_NAMES[nftInfo?.metadata?.rarity]}
                  </span>
                </div>

                {/* Image */}
                <div
                  style={{
                    width: "100%",
                    height: "400px",
                    background: "#e0e0e0",
                    borderRadius: "8px",
                    marginBottom: "1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {nftInfo?.metadata?.imageURL ? (
                    <img
                      src={nftInfo?.metadata?.imageURL}
                      alt={nftInfo?.metadata?.title}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement!.innerHTML =
                          '<div style="color: #999;">Image not available</div>';
                      }}
                    />
                  ) : (
                    <div style={{ color: "#999" }}>No image</div>
                  )}
                </div>

                {/* Description */}
                <p style={{ marginBottom: "1rem" }}>{nftInfo?.metadata?.description}</p>

                {/* Metadata Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                      Category
                    </div>
                    <div>{CATEGORY_NAMES[nftInfo?.metadata?.category]}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                      Upgrade Count
                    </div>
                    <div>{nftInfo?.metadata?.upgradeCount}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                      Created
                    </div>
                    <div>
                      {new Date(nftInfo?.metadata?.timestamp * 1000).toLocaleDateString()}
                    </div>
                  </div>
                  {nftInfo?.metadata?.location && (
                    <div>
                      <div style={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                        Location
                      </div>
                      <div>
                        {nftInfo?.metadata?.metadata.location.placeName ||
                          nftInfo?.metadata?.metadata.location.city ||
                          "Unknown"}
                      </div>
                    </div>
                  )}
                </div>

                {/* Javanese Text */}
                {nftInfo?.metadata?.javaneseText && (
                  <div style={{ marginTop: "1rem" }}>
                    <div style={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                      Javanese Script
                    </div>
                    <div style={{ fontSize: "1.5rem", marginTop: "0.5rem" }}>
                      {nftInfo?.metadata?.javaneseText}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {nftInfo?.metadata?.tags && nftInfo?.metadata?.tags.length > 0 && (
                  <div style={{ marginTop: "1rem" }}>
                    <div style={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                      Tags
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        marginTop: "0.5rem",
                        flexWrap: "wrap",
                      }}
                    >
                      {nftInfo?.metadata?.tags.map((tag, index) => (
                        <span
                          key={index}
                          style={{
                            padding: "0.25rem 0.75rem",
                            background: "#e0e0e0",
                            borderRadius: "12px",
                            fontSize: "0.875rem",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

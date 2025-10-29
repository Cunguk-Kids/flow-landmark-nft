package schema

import (
	"time" // Import time package

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// Location struct corresponds to Cadence Location struct
type Location struct {
	PlaceName string  `json:"placeName,omitempty"` // Use omitempty for optional fields
	City      string  `json:"city,omitempty"`
	Country   string  `json:"country,omitempty"`
	Latitude  float64 `json:"latitude"` // Using float64 for lat/long
	Longitude float64 `json:"longitude"`
}

// Metadata struct corresponds to Cadence MomentMetadata struct
type Metadata struct {
	Title        string            `json:"title"`
	Description  string            `json:"description"`
	Category     string            `json:"category"` // Storing enum as string
	ImageURL     string            `json:"imageURL"`
	ThumbnailURL string            `json:"thumbnailURL,omitempty"`
	Timestamp    float64           `json:"timestamp"` // Using float64 for UFix64 timestamp
	Weather      string            `json:"weather,omitempty"`
	Temperature  string            `json:"temperature,omitempty"`
	Location     *Location         `json:"location,omitempty"` // Pointer for optional struct
	Altitude     string            `json:"altitude,omitempty"`
	WindSpeed    string            `json:"windSpeed,omitempty"`
	Border       string            `json:"border,omitempty"`  // Storing enum as string
	Sticker      string            `json:"sticker,omitempty"` // Storing enum as string
	Filter       string            `json:"filter,omitempty"`  // Storing enum as string
	Audio        string            `json:"audio,omitempty"`   // Storing enum as string
	JavaneseText string            `json:"javaneseText,omitempty"`
	Tags         []string          `json:"tags,omitempty"`       // Slice for array
	Attributes   map[string]string `json:"attributes,omitempty"` // Map for dictionary
}

// Nft holds the schema definition for the Nft entity.
type Nft struct {
	ent.Schema
}

// Fields of the Nft.
func (Nft) Fields() []ent.Field {
	return []ent.Field{
		// Renaming to follow Go conventions (snake_case in DB, CamelCase in Go)
		// Assuming nft_id comes from the blockchain event (UInt64)
		field.Int64("nft_id").
			Unique(), // Add validation if applicable
		// Use the defined Metadata struct for the JSON field
		field.JSON("metadata", Metadata{}),
		// You had extra fields here, removed them as they seem redundant with Metadata
		// If you need fields outside metadata, add them here:
		field.String("owner_address"), // Example: Storing the owner address directly
		field.Time("mint_time"). // Example: Storing when indexed
						Default(time.Now),
		field.String("rarity"), // Example: Storing rarity separately for easier querying
	}
}

// Edges of the Nft.
func (Nft) Edges() []ent.Edge {
	return []ent.Edge{
		// Define the relationship back to the Event
		edge.From("event", Event.Type).
			Ref("nfts").
			Unique().
			Required(),
	}
}

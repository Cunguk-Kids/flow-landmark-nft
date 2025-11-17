package swagdto

import (
	"time"
	// Kita perlu mengimpor 'ent' agar 'swag' tahu apa itu 'Pagination'
	// (Asumsi 'Pagination' didefinisikan di 'handlers.go' di package 'main')
	//
	// Kita definisikan ulang saja di sini agar bersih.
)

// Definisikan ulang 'Pagination' agar 'swag' mengerti
type Pagination struct {
	TotalItems  int `json:"totalItems"`
	TotalPages  int `json:"totalPages"`
	CurrentPage int `json:"currentPage"`
	PageSize    int `json:"pageSize"`
}

// --- Ini adalah 'struct' DTO bersih yang Anda minta ---

// HostResponse bersih (tanpa 'edges' yang tidak perlu)
type HostResponse struct {
	ID      int    `json:"id"`
	Address string `json:"address"`
}

// EventEdges bersih (HANYA 'host')
type EventEdges struct {
	Host *HostResponse `json:"host,omitempty"`
}

// EventResponse bersih (sesuai JSON Anda)
type EventResponse struct {
	ID          int        `json:"id"`
	EventID     uint64     `json:"event_id"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	Thumbnail   string     `json:"thumbnail"`
	Location    string     `json:"location"`
	StartDate   time.Time  `json:"start_date"`
	EndDate     time.Time  `json:"end_date"`
	Quota       uint64     `json:"quota"`
	Edges       EventEdges `json:"edges"` // <-- Menggunakan struct 'edges' bersih
}

// GetEventsResponse bersih (pembungkus utama)
type GetEventsResponse struct {
	Data       []*EventResponse `json:"data"`
	Pagination *Pagination      `json:"pagination"`
}

// OwnerResponse (struct bersih untuk 'owner' di 'edges')
type OwnerResponse struct {
	ID      int    `json:"id"`
	Address string `json:"address"`
	// Kita sengaja HAPUS 'edges' dari 'Owner'
}

// MomentEdges (struct bersih untuk 'edges' di 'Moment')
// Kita HANYA sertakan 'owner' (sesuai JSON Anda)
// 'omitempty' berarti 'jangan tampilkan jika nil'
type MomentEdges struct {
	Owner               *OwnerResponse               `json:"owner,omitempty"`
	EquippedAccessories []*EquippedAccessoryResponse `json:"equipped_accessories,omitempty"`
	MintedWithPass      *MintPassResponse            `json:"minted_with_pass,omitempty"`
}

// MomentResponse (struct bersih untuk data 'Moment')
// Ini HARUS cocok dengan JSON Anda
type MomentResponse struct {
	ID          int         `json:"id"`
	NftID       uint64      `json:"nft_id"`
	Name        string      `json:"name"`
	Description string      `json:"description"`
	Thumbnail   string      `json:"thumbnail"`
	Edges       MomentEdges `json:"edges"` // <-- Menggunakan struct 'edges' bersih
}

// GetMomentsResponse (struct pembungkus utama)
type GetMomentsResponse struct {
	Data       []*MomentResponse `json:"data"`
	Pagination *Pagination       `json:"pagination"`
}

type Response404 struct {
	Data       []any       `json:"data,omitempty"`
	Pagination *Pagination `json:"pagination"`
}

// ---- Struct untuk DTO 'Accessory' Anda (untuk 'EquippedAccessories') ----

type EquippedAccessoryResponse struct {
	ID        int    `json:"id"`
	NftID     uint64 `json:"nft_id"`
	Name      string `json:"name"`
	Thumbnail string `json:"thumbnail"`
}

// ---- Struct untuk DTO 'EventPass' Anda (untuk 'MintedWithPass') ----

type MintPassResponse struct {
	ID     int    `json:"id"`
	PassID uint64 `json:"pass_id"`
}

type DTOUser struct {
	ID      int    `json:"id"`
	Address string `json:"address"`
}

type DTOAccessoryEdges struct {
	Owner *DTOUser `json:"owner,omitempty"`
}

// DTOAccessory (Struct bersih untuk data 'Aksesori')
// Ini HARUS cocok dengan JSON Anda
type DTOAccessory struct {
	ID          int               `json:"id"`
	NftID       uint64            `json:"nft_id"`
	Name        string            `json:"name"`
	Description string            `json:"description"`
	Thumbnail   string            `json:"thumbnail"`
	Edges       DTOAccessoryEdges `json:"edges"` // <-- Menggunakan struct 'edges' bersih
}

// GetAccessoriesResponse (Struct pembungkus utama)
type GetAccessoriesResponse struct {
	Data       []*DTOAccessory `json:"data"`
	Pagination *Pagination     `json:"pagination"`
}

type DTOEventPass struct {
	ID         int               `json:"id"`
	PassID     uint64            `json:"pass_id"`
	IsRedeemed bool              `json:"is_redeemed"`
	Edges      DTOEventPassEdges `json:"edges"`
}
type DTOEventPassEdges struct {
	Owner *DTOUser       `json:"owner,omitempty"`
	Event *EventResponse `json:"event,omitempty"`
}

// DTOListing (Struct bersih untuk 'Listing')
type DTOListing struct {
	ID               int             `json:"id"`
	ListingID        uint64          `json:"listing_id"`
	Price            float64         `json:"price"`
	PaymentVaultType string          `json:"payment_vault_type"`
	Expiry           time.Time       `json:"expiry"`
	Edges            DTOListingEdges `json:"edges"`
}
type DTOListingEdges struct {
	Seller       *DTOUser      `json:"seller,omitempty"`
	NftAccessory *DTOAccessory `json:"nft_accessory,omitempty"`
}

// DTOUserProfileEdges (Struct bersih untuk 'edges' di Profil User)
// Ini adalah 'edges' yang Anda 'eager load' di 'getUserProfile'
type DTOUserProfileEdges struct {
	Moments      []*MomentResponse `json:"moments,omitempty"`
	Accessories  []*DTOAccessory   `json:"accessories,omitempty"`
	EventPasses  []*DTOEventPass   `json:"event_passes,omitempty"`
	HostedEvents []*EventResponse  `json:"hosted_events,omitempty"`
	Listings     []*DTOListing     `json:"listings,omitempty"`
}

// DTOUserProfile (Struct bersih untuk data 'User' lengkap)
type DTOUserProfile struct {
	ID                      int                 `json:"id"`
	Address                 string              `json:"address"`
	Nickname                string              `json:"nickname,omitempty"`
	Bio                     string              `json:"bio,omitempty"`
	Pfp                     string              `json:"pfp,omitempty"`
	ShortDescription        string              `json:"short_description,omitempty"`
	BgImage                 string              `json:"bg_image,omitempty"`
	HighlightedEventPassIds []uint64            `json:"highlighted_eventPass_ids,omitempty"`
	HighlightedMomentID     uint64              `json:"highlighted_moment_id,omitempty"`
	Socials                 map[string]string   `json:"socials,omitempty"`
	Edges                   DTOUserProfileEdges `json:"edges"` // <-- Menggunakan struct 'edges' bersih
}

type GetUserProfileResponse struct {
	Data *DTOUserProfile `json:"data"` // <-- Sekarang 'data' adalah OBJEK, bukan array
}

type GetListingsResponse struct {
	Data       []*DTOListing `json:"data"`
	Pagination *Pagination   `json:"pagination"`
}

type CheckInRequest struct {
	UserAddress string `json:"userAddress" example:"0x1bb6b1e0a5170088"`
	EventID     string `json:"eventID" example:"1"`
}

// Struct DTO untuk 'response' data (Data respons)
type CheckInDataResponse struct {
	Message     string `json:"message"`
	UserAddress string `json:"userAddress"`
	EventID     string `json:"eventID"`
}

type MintResponse struct {
	Message   string `json:"message"   example:"NFT minted successfully!"`
	Recipient string `json:"recipient" example:"0x1bb6b1e0a5170088"`
	Name      string `json:"name"      example:"Momen Keren"`
	Thumbnail string `json:"thumbnail" example:"ipfs://bafy..."`
}

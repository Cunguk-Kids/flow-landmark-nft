package swagresponse

import "backend/ent"

type ErrorResponse struct {
	Status  string `json:"status" example:"error"`
	Message string `json:"message" example:"Deskripsi error spesifik"`
	Details string `json:"details,omitempty" example:"Detail teknis (jika ada)"` // omitempty jika tidak selalu ada
}

type SuccessCreateResponse struct {
	Status     string `json:"status" example:"success"`
	Message    string `json:"message" example:"Permintaan CreateEvent diterima dan transaksi berhasil dikirim."`
	Brand      string `json:"brand" example:"0x179b6b1cb6755e31"`
	EventName  string `json:"eventName" example:"Event Keren"`
	Disclaimer string `json:"disclaimer" example:"Status transaksi final akan terlihat di blockchain/indexer."`
}

type PaginationMetadata struct {
	TotalItems  int `json:"totalItems" example:"100"`
	CurrentPage int `json:"currentPage" example:"1"`
	PageSize    int `json:"pageSize" example:"10"`
	TotalPages  int `json:"totalPages" example:"10"`
}

type PaginatedEventsResponse struct {
	Data       []*ent.Event       `json:"data"` // Slice dari data event
	Pagination PaginationMetadata `json:"pagination"`
}

type CheckinSuccessResponse struct {
	Status  string `json:"status" example:"success"`
	Message string `json:"message" example:"Check-in successful"`
}

type UpdateStatusResponse struct {
	Status  string `json:"status" example:"success"`
	Message string `json:"message" example:"Transaksi update status berhasil dikirim dan di-seal."`
	EventID string `json:"eventId" example:"1"`
}

type PaginatedNFTsResponse struct {
	Data       []*ent.Nft         `json:"data"` // Tipe spesifik: slice dari Nft
	Pagination PaginationMetadata `json:"pagination"`
}

type PaginatedPartnersResponse struct {
	Data       []*ent.Partner     `json:"data"` // Tipe spesifik: slice dari Partner
	Pagination PaginationMetadata `json:"pagination"`
}

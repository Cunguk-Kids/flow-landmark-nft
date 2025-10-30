package route

import (
	"backend/ent/event" // <-- Impor sub-package event
	"backend/ent/nft"   // <-- Impor sub-package nft
	"backend/utils"     // Asumsi Open ada di sini
	"context"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/labstack/echo/v4"
)

// (Struct PaginatedResponse Anda tetap sama)
type PaginatedResponse struct {
	Data       interface{} `json:"data"`
	Pagination struct {
		Total int `json:"total"`
		Page  int `json:"page"`
		Limit int `json:"limit"`
	} `json:"pagination"`
}

// @Summary Mendapatkan Daftar NFT (Pagination & Filter)
// @Description Mengambil daftar semua NFT dengan filter opsional (eventId, userAddress) dan pagination.
// @Tags NFTs
// @Produce json
// @Param   eventId query int false "Filter berdasarkan Event ID" example(1)
// @Param   userAddress query string false "Filter berdasarkan Alamat User (Owner)" example("0x179b6b1cb6755e31")
// @Param   page query int false "Nomor halaman" example(1)
// @Param   limit query int false "Jumlah item per halaman" example(10)
// @Success 200 {object} swagresponse.PaginatedNFTsResponse "Daftar NFT yang dipaginasi"
// @Failure 400 {object} swagresponse.ErrorResponse "Error: Format query param tidak valid"
// @Failure 500 {object} swagresponse.ErrorResponse "Error: Kesalahan server internal"
// @Router  /nft [get]
func HandleGetNFTs(c echo.Context) error {
	log.Println("Menerima request /nfts...")
	ctx := context.Background()
	//1 validasi entclient
	entClient := utils.Open(os.Getenv("DATABASE_URL"))
	defer entClient.Close()
	if entClient == nil {
		log.Println("Error: Ent client not initialized")
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Server configuration error"})
	}

	// 2. Ambil Query Parameter (Filter & Pagination)
	eventIDFilter := c.QueryParam("eventId")
	userAddressFilter := c.QueryParam("userAddress")
	pageParam := c.QueryParam("page")
	limitParam := c.QueryParam("limit")

	page, err := strconv.Atoi(pageParam)
	if err != nil || page < 1 {
		page = 1
	}
	limit, err := strconv.Atoi(limitParam)
	if err != nil || limit <= 0 {
		limit = 10
	}
	offset := (page - 1) * limit

	log.Printf("Filter - EventID: '%s', UserAddress: '%s', Page: %d, Limit: %d",
		eventIDFilter, userAddressFilter, page, limit)

	// 3. Bangun Query Secara Dinamis
	query := entClient.Nft.Query()

	// Terapkan filter eventId (jika ada)
	if eventIDFilter != "" {
		eventID, err := strconv.Atoi(eventIDFilter)
		if err != nil {
			log.Printf("Format eventId tidak valid: %s", eventIDFilter)
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid eventId format"})
		}
		// Cari NFT yang punya relasi ke Event dengan EventId yang cocok
		query = query.Where(nft.HasEventWith(event.EventIdEQ(eventID)))
	}

	// Terapkan filter userAddress (jika ada)
	if userAddressFilter != "" {
		// Asumsi field di schema Nft adalah "owner_address"
		query = query.Where(nft.OwnerAddressEQ(userAddressFilter))
	}

	// 4. Query total count (dengan filter yang sama)
	totalCount, err := query.Count(ctx)
	if err != nil {
		log.Printf("Error menghitung total NFT: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database count error"})
	}

	// 5. Query data NFT dengan pagination
	nftRecords, err := query.
		Limit(limit).
		Offset(offset).
		// Opsional: Muat relasi event jika perlu
		// WithEvent().
		All(ctx)

	// 6. Handle Error Query Data
	if err != nil {
		log.Printf("Error querying database for nfts: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database query error"})
	}

	// 7. Buat Respons
	response := PaginatedResponse{
		Data: nftRecords,
	}
	response.Pagination.Total = totalCount
	response.Pagination.Page = page
	response.Pagination.Limit = limit

	// 8. Kembalikan data sebagai JSON
	log.Printf("Sukses mengambil %d data NFT (halaman %d, limit %d)", len(nftRecords), page, limit)
	return c.JSON(http.StatusOK, response)
}

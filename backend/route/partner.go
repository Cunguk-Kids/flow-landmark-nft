package route

import (
	"backend/ent"
	"backend/ent/partner"
	"backend/utils"
	"context"
	"log"
	"net/http"
	"os"
	"strconv"

	// "backend/ent/eventparticipant"

	"github.com/labstack/echo/v4"
)

// @Summary Mendapatkan Daftar Partner (Pagination)
// @Description Mengambil daftar semua partner (brand) yang terdaftar di platform, dengan pagination.
// @Tags Partners
// @Produce json
// @Param   page query int false "Nomor halaman" example(1)
// @Param   limit query int false "Jumlah item per halaman" example(10)
// @Success 200 {object} swagresponse.PaginatedPartnersResponse "Daftar partner yang dipaginasi"
// @Failure 500 {object} swagresponse.ErrorResponse "Error: Kesalahan server internal"
// @Router  /partner [get]
func HandleGetAllPartner(c echo.Context) error {
	entClient := utils.Open(os.Getenv("DATABASE_URL"))
	defer entClient.Close()
	log.Println("Menerima request /partners...")
	ctx := context.Background() // Or c.Request().Context()

	// 1. Validasi Ent Client
	if entClient == nil {
		log.Println("Error: Ent client not initialized")
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Server configuration error"})
	}

	// 2. Ambil Query Parameter untuk Pagination
	pageParam := c.QueryParam("page")
	limitParam := c.QueryParam("limit")

	// Set nilai default
	page, err := strconv.Atoi(pageParam)
	if err != nil || page < 1 {
		page = 1 // Default halaman 1
	}

	limit, err := strconv.Atoi(limitParam)
	if err != nil || limit <= 0 {
		limit = 10 // Default 10 item per halaman
	}

	// Hitung offset
	offset := (page - 1) * limit

	// 3. Query database untuk total count (untuk info pagination)
	totalCount, err := entClient.Partner.
		Query().
		Count(ctx)
	if err != nil {
		log.Printf("Error counting partners: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database count error"})
	}

	// 4. Query database untuk data partner dengan limit dan offset
	partnerRecords, err := entClient.Partner.
		Query().
		Limit(limit).
		Offset(offset).
		All(ctx)

	// 5. Handle Error Query Data
	if err != nil {
		log.Printf("Error querying database for partners: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database query error"})
	}

	// 6. Buat struct respons yang rapi
	type PaginatedResponse struct {
		Data       interface{} `json:"data"`
		Pagination struct {
			Total int `json:"total"`
			Page  int `json:"page"`
			Limit int `json:"limit"`
		} `json:"pagination"`
	}

	response := PaginatedResponse{
		Data: partnerRecords,
	}
	response.Pagination.Total = totalCount
	response.Pagination.Page = page
	response.Pagination.Limit = limit

	// 7. Kembalikan data sebagai JSON
	log.Printf("Sukses mengambil %d data partner (halaman %d, limit %d)", len(partnerRecords), page, limit)
	return c.JSON(http.StatusOK, response)
}

// @Summary Mendapatkan Detail Partner (Brand)
// @Description Mengambil detail lengkap dari satu partner (brand) berdasarkan Alamat (Address) blockchain-nya.
// @Tags Partners
// @Produce json
// @Param   address path string true "Alamat Partner (Brand)" example("0x179b6b1cb6755e31")
// @Success 200 {object} ent.Partner "Detail Partner (Brand)"
// @Failure 400 {object} swagresponse.ErrorResponse "Error: Alamat (Address) tidak boleh kosong"
// @Failure 404 {object} swagresponse.ErrorResponse "Error: Partner tidak ditemukan"
// @Failure 500 {object} swagresponse.ErrorResponse "Error: Kesalahan server internal"
// @Router  /partner/{address} [get]
func HandleGetPartnerByAddress(c echo.Context) error {
	entClient := utils.Open(os.Getenv("DATABASE_URL"))
	defer entClient.Close()
	log.Println("Menerima request /partners/:address...")
	ctx := context.Background() // Or c.Request().Context()

	// 1. Dapatkan address dari URL path parameter
	// (Asumsi route: e.GET("/partners/:address", ...))
	addressParam := c.Param("address")

	// 2. Validasi sederhana
	if addressParam == "" {
		log.Println("Error: Address parameter kosong")
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Address parameter is required"})
	}

	// (Opsional: normalisasi address jika perlu, misal: tolower)
	// addressParam = strings.ToLower(addressParam)

	// 3. Query database menggunakan Ent
	if entClient == nil {
		log.Println("Error: Ent client not initialized")
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Server configuration error"})
	}

	// Asumsi field di schema Ent Anda bernama 'Address'
	partnerRecord, err := entClient.Partner.
		Query().
		Where(partner.AddressEQ(addressParam)). // Cari berdasarkan field 'address'
		// WithX...() // Muat relasi jika perlu
		Only(ctx) // Ambil satu record, error jika tidak ada atau > 1

	// 4. Handle Error (Termasuk 'Not Found')
	if err != nil {
		if ent.IsNotFound(err) {
			log.Printf("Partner dengan address %s tidak ditemukan", addressParam)
			return c.JSON(http.StatusNotFound, map[string]string{"error": "Partner not found"})
		}
		// Error database lainnya
		log.Printf("Error querying database for partner address %s: %v", addressParam, err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database query error"})
	}

	// 5. Kembalikan data partner sebagai JSON
	log.Printf("Partner ditemukan: %v", partnerRecord)
	return c.JSON(http.StatusOK, partnerRecord)
}

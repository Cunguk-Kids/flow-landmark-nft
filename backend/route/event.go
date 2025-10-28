package route

import (
	"backend/ent"
	"backend/ent/event"
	"backend/ent/eventparticipant"
	"backend/transactions" // <-- Kode bersama Anda
	"backend/utils"
	"context"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	// "backend/ent/eventparticipant"

	"github.com/labstack/echo/v4"
)

type CreateEventRequest struct {
	BrandAddress string  `json:"brandAddress" form:"brandAddress" validate:"required"`
	EventName    string  `json:"eventName" form:"eventName" validate:"required"`
	Quota        uint64  `json:"quota" form:"quota" validate:"gte=0"`
	Description  string  `json:"description" form:"description"`
	Image        string  `json:"image" form:"image" validate:"url"`
	Lat          float64 `json:"lat" form:"lat"`
	Long         float64 `json:"long" form:"long"`
	Radius       float64 `json:"radius" form:"radius" validate:"gte=0"`
	StartDate    string  `json:"startDate" form:"startDate" validate:"required"`
	EndDate      string  `json:"endDate" form:"endDate" validate:"required"`
	TotalRareNFT uint64  `json:"totalRareNFT" form:"totalRareNFT" validate:"gte=0"`
}

// handleCreateEvent sekarang menerima 'echo.Context'
func HandleCreateEvent(c echo.Context) error {
	log.Println("Menerima request /create-event...")

	// ---
	// CATATAN: Di aplikasi nyata, Anda akan mem-parsing JSON body
	//          dari request (frontend/client) seperti ini:
	//
	// var requestData struct {
	// 	 BrandAddress string `json:"brandAddress"`
	// 	 EventName    string `json:"eventName"`
	//   // ... field lainnya
	// }
	//
	// if err := c.Bind(&requestData); err != nil {
	// 	 return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	// }
	//
	// Dan Anda akan menggunakan 'requestData.BrandAddress' di bawah.
	// ---

	var req CreateEventRequest
	if err := c.Bind(&req); err != nil {
		log.Printf("Error binding request body: %v", err)
		// Kembalikan error jika JSON tidak valid
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body format"})
	}

	startDate, err := time.Parse(time.RFC3339Nano, req.StartDate)
	log.Println(req.EventName)
	log.Println("wkwkw")
	if err != nil {
		log.Printf("Error parsing startDate '%s': %v", req.StartDate, err)
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid startDate format. Use RFC3339Nano (e.g., YYYY-MM-DDTHH:MM:SSZ)"})
	}
	endDate, err := time.Parse(time.RFC3339Nano, req.EndDate)
	if err != nil {
		log.Printf("Error parsing endDate '%s': %v", req.EndDate, err)
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid endDate format. Use RFC3339Nano (e.g., YYYY-MM-DDTHH:MM:SSZ)"})
	}

	// --- 3. TAMBAHKAN VALIDASI DI SINI ---
	now := time.Now()
	log.Println(now)
	// Validasi 1: StartDate tidak boleh di masa lalu
	// Kita gunakan Toleransi 1 menit untuk menghindari masalah clock skew
	if startDate.Before(now.Add(-1 * time.Minute)) {
		log.Printf("Validation failed: StartDate (%s) is in the past.", startDate.String())
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Start date cannot be in the past"})
	}

	// Validasi 2: EndDate harus setelah StartDate
	if !endDate.After(startDate) {
		log.Printf("Validation failed: EndDate (%s) is not after StartDate (%s).", endDate.String(), startDate.String())
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "End date must be after start date"})
	}

	// Validasi 3: TotalRareNFT tidak boleh melebihi Quota
	if req.TotalRareNFT > req.Quota {
		log.Printf("Validation failed: TotalRareNFT (%d) exceeds Quota (%d).", req.TotalRareNFT, req.Quota)
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Total rare NFT cannot exceed the total quota"})
	}
	// --- AKHIR VALIDASI ---

	// 4. Panggil Fungsi Transaksi (Sinkron)
	err = transactions.CreateEvent(
		req.BrandAddress,
		req.EventName,
		req.Quota,
		req.Description,
		req.Image,
		req.Lat,
		req.Long,
		req.Radius,
		startDate, // Gunakan time.Time yang sudah diparsing
		endDate,   // Gunakan time.Time yang sudah diparsing
		req.TotalRareNFT,
	)

	// 4. Handle Error Pengiriman Transaksi
	if err != nil {
		// Jika terjadi panic/error saat mengirim tx
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"status":  "error",
			"message": "Gagal mengirim transaksi ke blockchain.",
			"details": err.Error(), // Berikan detail error (hati-hati di produksi)
		})
	}

	// 5. Beri Respons Sukses
	log.Println("... Transaksi CreateEvent berhasil dikirim ke Flow.")
	return c.JSON(http.StatusOK, map[string]interface{}{
		"status":     "success",
		"message":    "Permintaan CreateEvent diterima dan transaksi berhasil dikirim.",
		"brand":      req.BrandAddress,
		"eventName":  req.EventName,
		"disclaimer": "Status transaksi final akan terlihat di blockchain/indexer.",
	})
}

func HandleGetEventByID(c echo.Context) error {
	entClient := utils.Open(os.Getenv("DATABASE_URL"))
	defer entClient.Close()
	log.Println("Menerima request event:id...")
	log.Println("Menerima request /events/:id...")
	ctx := context.Background() // Or c.Request().Context()

	// 1. Dapatkan ID dari URL path parameter
	idParam := c.Param("id") // "id" harus cocok dengan definisi route Anda (misal: e.GET("/events/:id", ...))
	eventIDInt64, err := strconv.Atoi(idParam)
	if err != nil {
		log.Printf("Error parsing event ID '%s': %v", idParam, err)
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid Event ID format"})
	}

	// 2. Query database menggunakan Ent
	if entClient == nil {
		log.Println("Error: Ent client not initialized")
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Server configuration error"})
	}

	eventRecord, err := entClient.Event.
		Query().
		Where(event.EventIdEQ(eventIDInt64)).
		WithEventID(). // Cari berdasarkan eventID
		// Load("participants"). // Opsional: Muat relasi jika perlu
		Only(ctx) // Ambil satu record, error jika tidak ada atau > 1

	// 3. Handle Error (Termasuk 'Not Found')
	if err != nil {
		if ent.IsNotFound(err) {
			log.Printf("Event dengan ID %d tidak ditemukan", eventIDInt64)
			return c.JSON(http.StatusNotFound, map[string]string{"error": "Event not found"})
		}
		// Error database lainnya
		log.Printf("Error querying database for event ID %d: %v", eventIDInt64, err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database query error"})
	}

	// 4. Kembalikan data event sebagai JSON
	log.Printf("Event ditemukan: %v", eventRecord)
	return c.JSON(http.StatusOK, eventRecord)
}

func HandleGetAllEvents(c echo.Context) error {
	log.Println("Menerima request /events...")
	ctx := context.Background() // Or c.Request().Context()
	entClient := utils.Open(os.Getenv("DATABASE_URL"))
	defer entClient.Close()

	// --- 1. Ambil Query Parameters ---

	// Filter by brandAddress (opsional)
	brandAddressFilter := c.QueryParam("brandAddress") // String kosong jika tidak ada
	statusFilter := c.QueryParam("status")

	// Pagination parameters (dengan default)
	pageParam := c.QueryParam("page")
	limitParam := c.QueryParam("limit")

	page, err := strconv.Atoi(pageParam)
	if err != nil || page < 1 {
		page = 1 // Default ke halaman 1 jika tidak ada atau tidak valid
	}

	limit, err := strconv.Atoi(limitParam)
	if err != nil || limit <= 0 {
		limit = 10 // Default 10 item per halaman
	}

	// Hitung offset
	offset := (page - 1) * limit

	log.Printf("Filter - Brand: '%s', Page: %d, Limit: %d, Offset: %d, status: %d", brandAddressFilter, page, limit, offset, statusFilter)

	if entClient == nil {
		// ... (handle client nil) ...
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Server error"})
	}

	query := entClient.Event.Query()

	if brandAddressFilter != "" {
		query = query.Where(event.BrandAddressEQ(brandAddressFilter))
		log.Printf("Menerapkan filter BrandAddress: %s", brandAddressFilter)
	}

	if statusFilter != "" {
		statusFilterInt, err := strconv.Atoi(statusFilter)
		if err != nil {
			log.Printf("Error querying events: %v", err)
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid status format"})
		}
		query = query.Where(event.StatusEQ(statusFilterInt))
		log.Printf("Menerapkan filter BrandAddress: %s", statusFilterInt)
	}

	// Hitung total item SEBELUM menerapkan limit/offset (untuk metadata pagination)
	totalCount, err := query.Count(ctx)
	if err != nil {
		log.Printf("Error menghitung total event: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database query error (count)"})
	}

	// Terapkan pagination
	query = query.Limit(limit).Offset(offset)

	// Terapkan ordering (opsional, misal order by ID descending)
	query = query.Order(ent.Desc(event.FieldEventId))

	// Jalankan query untuk mendapatkan data halaman ini
	eventsOnPage, err := query.WithEventID().All(ctx)

	// --- 3. Handle Error Query Utama ---
	if err != nil {
		log.Printf("Error querying events: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database query error"})
	}

	// --- 4. Siapkan Respons (dengan Metadata Pagination) ---
	totalPages := 0
	if totalCount > 0 {
		totalPages = (totalCount + limit - 1) / limit // Pembulatan ke atas
	}

	response := map[string]interface{}{
		"data": eventsOnPage, // Data event untuk halaman ini
		"pagination": map[string]interface{}{
			"totalItems":  totalCount,
			"currentPage": page,
			"pageSize":    limit,
			"totalPages":  totalPages,
		},
	}

	log.Printf("Ditemukan %d event(s) untuk halaman ini (Total: %d)", len(eventsOnPage), totalCount)
	return c.JSON(http.StatusOK, response)
}

type CheckinRequest struct {
	EventID      string `json:"eventId" form:"eventId" validate:"required"`
	UserAddress  string `json:"userAddress" form:"userAddress" validate:"required"`
	BrandAddress string `json:"brandAddress" form:"brandAddress" validate:"required"`
}

func HandleCheckin(c echo.Context) error {
	log.Println("Menerima request /checkin...")
	ctx := context.Background() // Gunakan context request jika perlu timeout
	entClient := utils.Open(os.Getenv("DATABASE_URL"))
	defer entClient.Close()
	// 1. Bind Request
	var req CheckinRequest
	if err := c.Bind(&req); err != nil {
		log.Printf("Error binding checkin request: %v", err)
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	// Konversi eventID ke tipe yang benar (misal: int64)
	eventIDInt, err := strconv.Atoi(req.EventID)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid Event ID format"})
	}
	userAddress := req.UserAddress   // Pastikan formatnya benar ("0x...")
	brandAddress := req.BrandAddress // Pastikan formatnya benar ("0x...")

	// 2. Validasi Cepat (Contoh: cek user terdaftar & event aktif)
	// (Tambahkan validasi lain sesuai kebutuhan)
	participant, err := entClient.EventParticipant.
		Query().
		Where(
			eventparticipant.UserAddressEQ(userAddress),
			eventparticipant.HasEventWith(event.EventIdEQ(eventIDInt)),
		).
		Only(ctx) // Pastikan user terdaftar di event ini

	if err != nil {
		if ent.IsNotFound(err) {
			log.Printf("Check-in Gagal: User %s tidak terdaftar di event %d", userAddress, eventIDInt)
			return c.JSON(http.StatusForbidden, map[string]string{"error": "User not registered for this event"})
		}
		log.Printf("Error DB saat validasi check-in: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database error during validation"})
	}

	// Cek apakah sudah check-in (opsional, jika ingin mencegah double check-in)
	if participant.IsCheckedIn {
		log.Printf("Check-in Info: User %s sudah check-in sebelumnya di event %d", userAddress, eventIDInt)
		// Kembalikan OK saja agar scanner tidak error
		return c.JSON(http.StatusOK, map[string]string{"status": "success", "message": "User already checked in"})
	}

	// TODO: Anda mungkin ingin cek status event (aktif) di sini juga,
	//       baik dari DB (jika indexer mengupdatenya) atau via script Flow.
	//       Untuk kecepatan, cek DB lebih baik.

	// 3. UPDATE DB INSTAN
	_, err = entClient.EventParticipant.
		UpdateOne(participant). // Update record yang sudah ditemukan
		SetIsCheckedIn(true).
		Save(ctx)

	if err != nil {
		log.Printf("Error DB saat update isCheckedIn: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database error during check-in"})
	}

	log.Printf("DB Check-in Berhasil: User %s di event %d", userAddress, eventIDInt)

	// 4. JALANKAN GOROUTINE ASINKRON
	// (Dapatkan brandAddress dari DB atau request jika perlu)
	go transactions.SendCheckinTransactionAsync(brandAddress, eventIDInt, userAddress)

	return c.JSON(http.StatusOK, map[string]string{"status": "success", "message": "Check-in successful"})
}

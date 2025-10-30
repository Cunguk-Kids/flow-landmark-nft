package route

import (
	"backend/ent"
	"backend/ent/event"
	"backend/ent/eventparticipant"
	"backend/ent/partner"
	swagresponse "backend/swag-response"
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
// @Summary Membuat Event Baru
// @Description Mendaftarkan event baru ke platform dan mengirim transaksi on-chain.
// @Tags Events
// @Accept  json
// @Produce json
// @Param   event body route.CreateEventRequest true "Data Event Baru"
// @Success 200 {object} swagresponse.SuccessCreateResponse "Pesan sukses"
// @Failure 400 {object} swagresponse.ErrorResponse "Error: Invalid request"
// @Failure 500 {object} swagresponse.ErrorResponse "Error: Gagal kirim transaksi"
// @Router  /event/create [post]
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

// @Summary Mendapatkan Detail Event
// @Description Mengambil detail lengkap dari satu event berdasarkan ID-nya, termasuk daftar partisipan dan info partner.
// @Tags Events
// @Produce json
// @Param   id path int true "Event ID" example(1)
// @Success 200 {object} ent.Event "Detail Event (termasuk relasi Edges.Participants dan Edges.Partner)"
// @Failure 400 {object} swagresponse.ErrorResponse "Error: Format ID tidak valid"
// @Failure 404 {object} swagresponse.ErrorResponse "Error: Event tidak ditemukan"
// @Failure 500 {object} swagresponse.ErrorResponse "Error: Kesalahan server internal"
// @Router  /event/{id} [get]
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
		WithParticipants().
		WithPartner().
		Only(ctx)

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

// @Summary Mendapatkan Daftar Event (Pagination)
// @Description Mengambil daftar semua event dengan filter opsional (brandAddress, status) dan pagination.
// @Tags Events
// @Produce json
// @Param   brandAddress query string false "Filter berdasarkan Brand Address (Partner)" example("0x179b6b1cb6755e31")
// @Param   status query int false "Filter berdasarkan Status Event (0=Pending, 1=Active, 2=Ended)" example(1)
// @Param   page query int false "Nomor halaman" example(1)
// @Param   limit query int false "Jumlah item per halaman" example(10)
// @Success 200 {object} swagresponse.PaginatedEventsResponse "Daftar event yang dipaginasi"
// @Failure 400 {object} swagresponse.ErrorResponse "Error: Format query param tidak valid"
// @Failure 500 {object} swagresponse.ErrorResponse "Error: Kesalahan server internal"
// @Router  /event [get]
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
		query = query.Where(event.HasPartnerWith(partner.AddressEQ(brandAddressFilter)))
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
	eventsOnPage, err := query.WithParticipants().WithPartner().All(ctx)

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

func Welcome(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "success", "message": "Welconme"})
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

// @Summary Check-in User ke Event
// @Description Mencatat check-in user di database (off-chain) dan memicu transaksi on-chain (asinkron).
// @Tags Events
// @Accept  json
// @Produce json
// @Param   checkin body swagresponse.CheckinRequest true "Data Check-in (EventID, UserAddress, BrandAddress)"
// @Success 200 {object} swagresponse.CheckinSuccessResponse "Check-in berhasil atau sudah check-in sebelumnya"
// @Failure 400 {object} swagresponse.ErrorResponse "Error: Request tidak valid (ID salah, body salah)"
// @Failure 403 {object} swagresponse.ErrorResponse "Error: Dilarang (User tidak terdaftar, Event tidak aktif)"
// @Failure 500 {object} swagresponse.ErrorResponse "Error: Kesalahan server internal"
// @Router  /event/check-in [post]
type UserEventView struct {
	*ent.Event                           // Embed *ent.Event (sudah termasuk Counter)
	UserStatus   string                  `json:"userStatus"`
	Participants []*ent.EventParticipant `json:"participants,omitempty"` // Daftar partisipan (maks 5)
}

const (
	StatusAvailable   = "Available"
	StatusRegistered  = "Registered"
	StatusCheckedIn   = "CheckedIn"
	StatusUpcoming    = "Upcoming"
	StatusAttended    = "Attended"
	StatusNotAttended = "NotAttended"
	StatusEnded       = "Ended"
)

type EventHandler struct {
	EntClient *ent.Client
}

type PaginatedUserEventsResponse struct {
	Data       []UserEventView                 `json:"data"` // Slice dari data event (user view)
	Pagination swagresponse.PaginationMetadata `json:"pagination"`
}

// ---------------------------------------------
// @Summary Mendapatkan Daftar Event (View User)
// @Description Mengambil daftar event, difilter, dengan status partisipasi user (Available, Registered, CheckedIn, dll.)
// @Tags Events
// @Produce json
// @Param   userAddress query string true "Alamat user untuk mengecek status partisipasinya" example("0x179b6b1cb6755e31")
// @Param   brandAddress query string false "Filter berdasarkan Brand Address (Partner)" example("0xf8d6e0a20c7")
// @Param   status query int false "Filter berdasarkan Status Event (0=Pending, 1=Active, 2=Ended)" example(1)
// @Param   page query int false "Nomor halaman" example(1)
// @Param   limit query int false "Jumlah item per halaman" example(10)
// @Success 200 {object} route.PaginatedUserEventsResponse "Daftar event yang dipaginasi (user view)"
// @Failure 400 {object} swagresponse.ErrorResponse "Error: Format query param tidak valid atau 'userAddress' hilang"
// @Failure 500 {object} swagresponse.ErrorResponse "Error: Kesalahan server internal"
// @Router  /event/user [get]
func HandleGetEventsForUser(c echo.Context) error {
	log.Println("Menerima request /user-events...")
	ctx := context.Background()

	// --- 1. Ambil Query Parameters ---
	userAddress := c.QueryParam("userAddress") // Opsional, untuk menentukan userStatus
	brandAddressFilter := c.QueryParam("brandAddress")
	statusFilter := c.QueryParam("status")
	pageParam := c.QueryParam("page")
	limitParam := c.QueryParam("limit")

	page, _ := strconv.Atoi(pageParam)
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(limitParam)
	if limit <= 0 {
		limit = 10
	}
	offset := (page - 1) * limit

	log.Printf("User: %s, Filter - Brand: '%s', Status: '%s', Page: %d, Limit: %d", userAddress, brandAddressFilter, statusFilter, page, limit)

	// --- 2. Validasi Ent Client ---
	entClient := utils.Open(os.Getenv("DATABASE_URL"))
	defer entClient.Close()
	if entClient == nil {
		log.Println("Error: Ent client not initialized")
		return c.JSON(http.StatusInternalServerError, swagresponse.ErrorResponse{
			Status: "error", Message: "Server configuration error",
		})
	}

	// --- 3. Bangun Query Event Utama ---
	query := entClient.Event.Query().WithPartner()

	// Terapkan filter opsional (brandAddress, status)
	if brandAddressFilter != "" {
		query = query.Where(event.HasPartnerWith(partner.AddressEQ(brandAddressFilter)))
	}
	if statusFilter != "" {
		statusFilterInt, err := strconv.Atoi(statusFilter)
		if err == nil {
			query = query.Where(event.StatusEQ(statusFilterInt))
		}
	}
	// --- PENTING: Hapus filter 'HasParticipantsWith(userAddress)' dari sini ---
	// agar kita bisa melihat SEMUA event (termasuk yang "Available")

	// --- 4. Query Total Count ---
	totalCount, err := query.Clone().Count(ctx)
	if err != nil { /* ... handle error ... */
	}

	// --- 5. Query Event di Halaman Ini ---
	eventsOnPage, err := query.
		Limit(limit).
		Offset(offset).
		Order(ent.Desc(event.FieldEventId)).
		// Muat 5 partisipan acak untuk preview
		WithParticipants(func(q *ent.EventParticipantQuery) {
			q.Limit(5).Order(ent.Asc(eventparticipant.FieldID))
		}).
		All(ctx)
	if err != nil { /* ... handle error ... */
	}

	// --- 6. Query Status Partisipasi User (Query Kedua yang Efisien) ---
	// (Hanya berjalan jika userAddress diberikan)
	userParticipationMap := make(map[int]*ent.EventParticipant)
	if userAddress != "" && len(eventsOnPage) > 0 {
		eventIDsOnPage := make([]int, len(eventsOnPage))
		for i, ev := range eventsOnPage {
			eventIDsOnPage[i] = ev.EventId
		}

		userParticipations, err := entClient.EventParticipant.
			Query().
			Where(
				eventparticipant.UserAddressEQ(userAddress),
				eventparticipant.HasEventWith(event.EventIdIn(eventIDsOnPage...)),
			).
			WithEvent(func(q *ent.EventQuery) { q.Select(event.FieldEventId) }).
			All(ctx)

		if err != nil {
			log.Printf("Gagal query status partisipasi user: %v", err)
		} else {
			for _, p := range userParticipations {
				if p.Edges.Event != nil {
					userParticipationMap[p.Edges.Event.EventId] = p
				}
			}
		}
	}

	// --- 7. Transformasi Hasil (Logika Switch & Penyesuaian Preview) ---
	userEventViews := make([]UserEventView, 0, len(eventsOnPage))
	for _, ev := range eventsOnPage {

		// Ambil status partisipasi user dari map yang kita buat
		userParticipation := userParticipationMap[ev.EventId] // Akan 'nil' jika user tidak terdaftar

		// Tentukan userStatus (Logika switch Anda yang sudah benar)
		var userStatus string
		switch ev.Status {
		case 0: // Pending
			userStatus = StatusAvailable
			if userParticipation != nil {
				userStatus = StatusRegistered
			}
		case 1: // Active
			if userParticipation != nil {
				if userParticipation.IsCheckedIn {
					userStatus = StatusAttended
				} else {
					userStatus = StatusRegistered
				}
			} else {
				userStatus = StatusAvailable
			}
		case 2: // Ended
			if userParticipation != nil {
				if userParticipation.IsCheckedIn {
					userStatus = StatusAttended
				} else {
					userStatus = StatusNotAttended
				}
			} else {
				userStatus = StatusEnded
			}
		default:
			userStatus = "Unknown"
		}

		// --- LOGIKA BARU: Sesuaikan Preview Partisipan ---
		participantPreview := ev.Edges.Participants // 5 partisipan acak

		// Jika user terdaftar TAPI tidak ada di 5 partisipan acak...
		if userParticipation != nil {
			foundInPreview := false
			for _, p := range participantPreview {
				if p.ID == userParticipation.ID {
					foundInPreview = true
					break
				}
			}

			if !foundInPreview {
				// ...geser 5 partisipan acak dan masukkan user di depan.
				if len(participantPreview) >= 5 {
					// Hapus partisipan terakhir dari preview acak
					participantPreview = participantPreview[:len(participantPreview)-1]
				}
				// Tambahkan user Anda ke depan slice
				participantPreview = append([]*ent.EventParticipant{userParticipation}, participantPreview...)
			}
		}
		// --- AKHIR LOGIKA PENYESUAIAN ---

		userEventViews = append(userEventViews, UserEventView{
			Event:        ev,
			UserStatus:   userStatus,
			Participants: participantPreview, // Gunakan preview yang sudah disesuaikan
		})
	}

	// --- 8. Siapkan Respons (Sama) ---
	totalPages := 0
	if totalCount > 0 {
		totalPages = (totalCount + limit - 1) / limit
	}

	response := map[string]interface{}{
		"data": userEventViews, // Gunakan hasil transformasi
		"pagination": map[string]interface{}{
			"totalItems":  totalCount,
			"currentPage": page,
			"pageSize":    limit,
			"totalPages":  totalPages,
		},
	}

	log.Printf("Ditemukan %d event(s) untuk user %s halaman ini (Total: %d)", len(userEventViews), userAddress, totalCount)
	return c.JSON(http.StatusOK, response)
}

type UpdateStatusRequest struct {
	BrandAddress string `json:"brandAddress" form:"brandAddress" validate:"required"`
	EventID      string `json:"eventId" form:"eventId" validate:"required"`
}

// HandleUpdateEventStatus memanggil transaksi update status
// @Summary Memperbarui Status Event (On-Chain)
// @Description Memicu transaksi on-chain untuk mengevaluasi ulang status event (Pending/Active/Ended) berdasarkan waktu blockchain saat ini.
// @Tags Events
// @Accept  json
// @Produce json
// @Param   statusRequest body route.UpdateStatusRequest true "Data Update Status (BrandAddress, EventID)"
// @Success 200 {object} swagresponse.UpdateStatusResponse "Status event berhasil diupdate"
// @Failure 400 {object} swagresponse.ErrorResponse "Error: Request tidak valid (ID salah, body salah)"
// @Failure 500 {object} swagresponse.ErrorResponse "Error: Transaksi blockchain gagal"
// @Router  /event/update-status [post]
func HandleUpdateEventStatus(c echo.Context) error {
	log.Println("Menerima request /update-event-status...")

	// 1. Bind Request
	var req UpdateStatusRequest
	if err := c.Bind(&req); err != nil {
		log.Printf("Error binding request body: %v", err)
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body format"})
	}

	// 2. Konversi EventID
	eventID, err := strconv.ParseUint(req.EventID, 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid Event ID format"})
	}

	// 3. Panggil Fungsi Transaksi (Sinkron)
	err = transactions.UpdateEventStatus(req.BrandAddress, eventID)

	// 4. Handle Error (jika ada)
	if err != nil {
		log.Printf("Gagal menjalankan UpdateEventStatus: %v", err)
		// Kirim error Cadence ke client
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"status":  "error",
			"message": "Gagal update status event.",
			"details": err.Error(),
		})
	}

	// 5. Kembalikan Sukses
	return c.JSON(http.StatusOK, map[string]interface{}{
		"status":  "success",
		"message": "Transaksi update status berhasil dikirim dan di-seal.",
		"eventId": req.EventID,
	})
}

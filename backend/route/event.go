package route

import (
	"backend/ent"
	"backend/ent/event"
	"backend/transactions" // <-- Kode bersama Anda
	"backend/utils"
	"context"
	"fmt"
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
	// Menjalankannya secara sinkron lebih mudah untuk debugging di hackathon.
	// Jika transaksi gagal dikirim (bukan di-seal, tapi GAGAL KIRIM),
	// fungsi CreateEvent Anda harusnya mengembalikan error (atau panic).
	// Kita akan menangkap panic di sini (jika CreateEvent panic).
	// Anda bisa juga modifikasi CreateEvent agar return error.
	var txErr error
	func() {
		// Menjalankan di dalam func agar bisa recover dari panic
		defer func() {
			if r := recover(); r != nil {
				log.Printf("PANIC saat mengirim transaksi CreateEvent: %v", r)
				// Ubah panic menjadi error biasa
				txErr = fmt.Errorf("transaction submission failed: %v", r)
			}
		}()
		// Panggil fungsi transaksi dengan data dari request
		transactions.CreateEvent(
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
	}() // Langsung panggil anonymous function

	// 4. Handle Error Pengiriman Transaksi
	if txErr != nil {
		// Jika terjadi panic/error saat mengirim tx
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"status":  "error",
			"message": "Gagal mengirim transaksi ke blockchain.",
			"details": txErr.Error(), // Berikan detail error (hati-hati di produksi)
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

	allEvents, err := entClient.Event.
		Query().
		WithEventID(). // Optional: Eager load participants for all events
		All(ctx)       // Fetch all records

	// 2. Handle potential database errors
	if err != nil {
		log.Printf("Error querying all events: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Database query error"})
	}

	// 3. Return the list of events as JSON
	// An empty slice is valid JSON ([]) if no events are found
	log.Printf("Ditemukan %d event(s)", len(allEvents))
	return c.JSON(http.StatusOK, allEvents)
}

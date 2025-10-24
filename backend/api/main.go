package main

import (
	"backend/transactions" // <-- Kode bersama Anda
	"log"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	// 1. Buat instance Echo
	e := echo.New()

	// 2. Tambahkan Middleware (Opsional, tapi bagus)
	// Ini setara dengan 'logger' & 'recovery' di Gin
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// 3. Definisikan Rute (Routes)
	// Kita gunakan e.POST karena ini adalah aksi "membuat" (create)
	e.POST("/create-event", handleCreateEvent)
	// Anda bisa menambahkan endpoint lain dengan mudah
	// e.GET("/events/:id", handleGetEvent)

	// 4. Jalankan Server
	log.Println("Server API Echo berjalan di http://localhost:6666")
	e.Logger.Fatal(e.Start(":6666"))
}

// handleCreateEvent sekarang menerima 'echo.Context'
func handleCreateEvent(c echo.Context) error {
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

	// Untuk simulasi, kita tetap gunakan data hardcoded
	brandAddress := "0x179b6b1cb6755e31" // Ganti dengan alamat brand
	eventName := "Event dari API (via Echo)"
	lat := -6.20
	long := 106.80
	radius := 500.0

	// Panggil fungsi transaksi Anda di background (goroutine)
	// agar respons API bisa cepat kembali
	go transactions.CreateEvent(
		brandAddress,
		eventName,
		100,
		"Deskripsi dari API Echo",
		"http://example.com/img.png",
		lat,
		long,
		radius,
		time.Now(),
		time.Now().Add(5*time.Hour),
		10,
	)

	// Beri respons JSON yang bersih ke client
	return c.JSON(http.StatusOK, map[string]string{
		"status":  "success",
		"message": "Permintaan CreateEvent diterima dan sedang diproses.",
		"brand":   brandAddress,
	})
}

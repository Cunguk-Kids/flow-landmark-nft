package main

import (
	_ "backend/docs"
	"backend/route"
	"log"
	"net/http"

	"github.com/joho/godotenv"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	echoSwagger "github.com/swaggo/echo-swagger"
)

// @title Event Platform API
// @version 1.0
// @host localhost:6666
// @BasePath /
func main() {
	// Load .env file if it exists (optional, environment variables can be set by Docker/system)
	err := godotenv.Load()
	if err != nil {
		log.Printf("Warning: .env file not found, using environment variables from system: %v", err)
	}
	// 1. Buat instance Echo
	e := echo.New()

	// 2. Tambahkan Middleware (Opsional, tapi bagus)
	// Ini setara dengan 'logger' & 'recovery' di Gin
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		// Izinkan semua origin. '*' adalah default, tapi ini lebih eksplisit.
		AllowOrigins: []string{"*"},

		// Izinkan semua metode yang umum digunakan,
		// middleware akan otomatis menangani preflight 'OPTIONS'.
		AllowMethods: []string{
			http.MethodGet,
			http.MethodHead,
			http.MethodPut,
			http.MethodPatch,
			http.MethodPost,
			http.MethodDelete,
		},

		// INI BAGIAN PENTING:
		// Izinkan header yang umum dikirim oleh frontend.
		AllowHeaders: []string{
			echo.HeaderOrigin,
			echo.HeaderContentType,
			echo.HeaderAccept,
			echo.HeaderAuthorization, // Jika Anda berencana menggunakan token (JWT)
		},
	}))
	e.GET("/", route.Welcome)
	e.GET("/swagger/*", echoSwagger.WrapHandler)
	// 3. Definisikan Rute (Routes)
	// Kita gunakan e.POST karena ini adalah aksi "membuat" (create)
	e.POST("/event/create", route.HandleCreateEvent)
	e.GET("/event/:id", route.HandleGetEventByID)
	e.GET("/event", route.HandleGetAllEvents)
	e.POST("/event/check-in", route.HandleCheckin)
	e.POST("/event/update-status", route.HandleUpdateEventStatus)
	e.GET("/event/user", route.HandleGetEventsForUser)

	// partner
	e.GET("/partner", route.HandleGetAllPartner)
	e.GET("/partner/:address", route.HandleGetPartnerByAddress)

	//nfts
	e.GET("/nft", route.HandleGetNFTs)

	// 4. Jalankan Server
	log.Println("Server API Echo berjalan di http://localhost:6060")
	e.Logger.Fatal(e.Start(":6666"))
}

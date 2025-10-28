package main

import (
	"backend/route"
	"log"

	"github.com/joho/godotenv"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Peringatan: Tidak bisa load .env file:", err)
	}
	// 1. Buat instance Echo
	e := echo.New()

	// 2. Tambahkan Middleware (Opsional, tapi bagus)
	// Ini setara dengan 'logger' & 'recovery' di Gin
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// 3. Definisikan Rute (Routes)
	// Kita gunakan e.POST karena ini adalah aksi "membuat" (create)
	e.POST("/event/create", route.HandleCreateEvent)
	e.GET("/event/:id", route.HandleGetEventByID)
	e.GET("/event/", route.HandleGetAllEvents)
	e.POST("/event/check-in", route.HandleCheckin)
	// Anda bisa menambahkan endpoint lain dengan mudah
	// e.GET("/events/:id", handleGetEvent)

	// 4. Jalankan Server
	log.Println("Server API Echo berjalan di http://localhost:6666")
	e.Logger.Fatal(e.Start(":6666"))
}

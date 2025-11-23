package main

import (
	"backend/utils"
	"context"
	"log"
	"os"

	_ "backend/docs"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	echoSwagger "github.com/swaggo/echo-swagger"
)

// @title Capt.today API
// @version 1.0
// @host localhost:8000
// @BasePath /
func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using environment variables from system:", err)
	}

	client := utils.Open(os.Getenv("DATABASE_URL"))
	defer client.Close()

	ctx := context.Background()
	if err := client.Schema.Create(ctx); err != nil {
		log.Fatalf("gagal membuat skema: %v", err)
	}

	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	e.Use(middleware.CORS())

	h := &Handler{DB: client}
	e.GET("/swagger/*", echoSwagger.WrapHandler)
	e.GET("/listings", h.getListings)
	e.GET("/events", h.getEvents)
	e.GET("/events/:id", h.getEventByID)
	e.GET("/profiles/:address", h.getUserProfile)
	e.GET("/accessories", h.getAccessories)
	e.GET("/moments", h.getMoments)
	e.GET("/event-passes", h.getEventPasses)
	e.GET("/event-passes/:id", h.getEventPassByID)
	e.GET("/users", h.getUsers)
	e.GET("/users/:address", h.getUserByAddress)
	e.GET("/users/search", h.searchUsers)

	e.POST("/moment/free", h.freeMintMoment)
	e.POST("/moment/with-event-pass", h.mintMomentWithEventPass)
	e.POST("/event/check-in", h.checkInUser)

	// Social Routes
	e.POST("/moments/:id/like", h.toggleLike)
	e.POST("/moments/:id/comments", h.createComment)
	e.GET("/moments/:id/comments", h.getComments)

	log.Println("Server API dimulai di http://localhost:8000")
	e.Logger.Fatal(e.Start(":8000"))
}

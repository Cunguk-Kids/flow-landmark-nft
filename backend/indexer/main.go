package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/onflow/flow-go-sdk"
	"github.com/onflow/flow-go-sdk/access/grpc"
	"google.golang.org/grpc/credentials/insecure"

	grpcOpts "google.golang.org/grpc"

	"backend/utils"

	_ "github.com/jackc/pgx/v5/stdlib"
)

const (
	ContractAddress = "1b7f070ebf7d0431" // Alamat tempat kontrak di-deploy
)

var (
	EventCreated     = fmt.Sprintf("A.%s.EventPlatform.EventCreated", ContractAddress)
	PartnerAdded     = fmt.Sprintf("A.%s.NFTMoment.PartnerAdded", ContractAddress)
	UserRegistered   = fmt.Sprintf("A.%s.EventPlatform.UserRegistered", ContractAddress)
	UserUnregistered = fmt.Sprintf("A.%s.EventPlatform.UserUnregistered", ContractAddress)
	EventStatus      = fmt.Sprintf("A.%s.EventPlatform.EventStatusUpdated", ContractAddress)
	EventNFTMinted   = fmt.Sprintf("A.%s.EventPlatform.EventNFTMinted", ContractAddress)
)

func main() {
	ctx := context.Background()
	// Load .env file if it exists (optional, environment variables can be set by Docker/system)
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using environment variables from system: %v", err)
	}

	client := utils.Open(os.Getenv("DATABASE_URL"))
	if err := client.Schema.Create(ctx); err != nil {
		log.Fatal(err)
	}
	events, err := client.Event.Query().All(ctx)
	if err != nil {
		log.Fatal(err)
	}
	log.Println(events)

	grpcClient, err := grpc.NewBaseClient(
		grpc.TestnetHost,
		grpcOpts.WithTransportCredentials(insecure.NewCredentials()),
	)

	if err != nil {
		log.Println("Gagal terhubung ke emulator gRPC: %v", err)
	}

	grpcBlock, err := grpcClient.GetLatestBlockHeader(ctx, true)

	if err != nil {
		log.Println("Gagal gRPC get latest block: %v", err)
	}
	fmt.Println("Block ID:", grpcBlock.ID.String(), grpcBlock.Height)

	dataCh, errCh, initErr := grpcClient.SubscribeEventsByBlockHeight(
		ctx,
		287624135,
		flow.EventFilter{
			EventTypes: []string{EventCreated, UserRegistered, UserUnregistered, EventStatus, PartnerAdded, EventNFTMinted},
		},
	)
	if initErr != nil {
		// handle init error
		log.Println("Gagal subscribe ke event init err: %v", initErr.Error())
	}

	for {
		select {
		case <-ctx.Done():
			// graceful shutdown
			return
		case data, ok := <-dataCh:
			if !ok {
				panic("data subscription closed")
			}
			for _, ev := range data.Events {
				fmt.Println("Type: %s\n", ev.Type)

				switch ev.Type {
				case EventCreated:
					utils.ProcessEventCreated(ctx, grpcClient, ev, client)
				case UserRegistered:
					utils.ProcessEventRegistered(ctx, ev, client)
				case UserUnregistered:
					utils.ProcessEventUnregistered(ctx, ev, client)
				case EventStatus:
					utils.ProcessEventStatus(ctx, ev, client)
				case PartnerAdded:
					utils.HandlePartnerAdded(ctx, client, ev)
				case EventNFTMinted:
					utils.HandleEventNFTMinted(ctx, grpcClient, client, ev)
				}
			}
		case err := <-errCh:
			if err != nil {
				// handle streaming error (log, reconnect / exponential back-off)
				log.Println("errorCh")
			}
		}
	}
}

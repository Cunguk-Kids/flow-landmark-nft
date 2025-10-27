package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/onflow/cadence"
	"github.com/onflow/flow-go-sdk"
	"github.com/onflow/flow-go-sdk/access/grpc"
	"google.golang.org/grpc/credentials/insecure"

	grpcOpts "google.golang.org/grpc"

	"backend/ent"

	"entgo.io/ent/dialect"
	entsql "entgo.io/ent/dialect/sql"
	_ "github.com/jackc/pgx/v5/stdlib"

	"database/sql"
)

const (
	EmulatorHost_gRPC = "127.0.0.1:3569"
	ContractAddress   = "f8d6e0586b0a20c7"
)

func main() {
	ctx := context.Background()
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	client := Open(os.Getenv("DATABASE_URL"))
	if err := client.Schema.Create(ctx); err != nil {
		log.Fatal(err)
	}
	events, err := client.Event.Query().All(ctx)
	if err != nil {
		log.Fatal(err)
	}
	log.Println(events)
	grpcClient, err := grpc.NewBaseClient(
		grpc.EmulatorHost,
		grpcOpts.WithTransportCredentials(insecure.NewCredentials()),
	)

	if err != nil {
		log.Fatalf("Gagal terhubung ke emulator gRPC: %v", err)
	}
	eventCreatedID := fmt.Sprintf("A.%s.EventPlatform.EventCreated", ContractAddress)

	grpcBlock, err := grpcClient.GetLatestBlockHeader(ctx, true)

	if err != nil {
		log.Fatalf("Gagal gRPC get latest block: %v", err)
	}
	fmt.Println("Block ID:", grpcBlock.ID.String(), grpcBlock.Height)

	dataCh, errCh, initErr := grpcClient.SubscribeEventsByBlockHeight(
		ctx,
		0,
		flow.EventFilter{
			EventTypes: []string{eventCreatedID},
		},
	)
	if initErr != nil {
		// handle init error
		log.Fatalf("Gagal subscribe ke event init err: %v", initErr.Error())
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
			// data contains block-level payload with Events
			for _, ev := range data.Events {
				fmt.Printf("Type: %s\n", ev.Type)
				var Fields = ev.Value.FieldsMappedByName()
				cadenceAddrVal, ok := Fields["brandAddress"]
				if !ok {
					log.Println("Error: field 'brandAddress' tidak ditemukan di event")
					continue
				}
				eventIDVal, ok := Fields["eventID"]
				if !ok {
					log.Println("Error: field 'eventID' tidak ditemukan di event")
					continue
				}

				cadenceAddr, ok := cadenceAddrVal.(cadence.Address)
				if !ok {
					log.Println("Error: field 'brandAddress' bukan tipe cadence.Address")
					return
				}

				cadenceEventID, ok := eventIDVal.(cadence.UInt64)
				if !ok {
					log.Println("Error: field 'eventID' bukan tipe cadence.UInt64")
					return
				}
				var brandAddress string = cadenceAddr.String()
				var eventID string = cadenceEventID.String()
				event, err := client.Event.Create().SetEventId(eventID).SetBrandAddress(brandAddress).Save(ctx)
				if err != nil {
					log.Fatalf("failed creating event")
				}
				log.Println("event telah dibuat: ", event)
			}
		case err := <-errCh:
			if err != nil {
				// handle streaming error (log, reconnect / exponential back-off)
				log.Fatalf("errCh")
			}
		}
	}
}

func Open(databaseUrl string) *ent.Client {
	db, err := sql.Open("pgx", databaseUrl)
	if err != nil {
		log.Fatal(err)
	}

	// Create an ent.Driver from `db`.
	drv := entsql.OpenDB(dialect.Postgres, db)
	return ent.NewClient(ent.Driver(drv))
}

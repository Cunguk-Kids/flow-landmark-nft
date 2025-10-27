package utils // Atau package tempat helper indexer Anda berada

import (
	"backend/ent"
	"backend/ent/event"
	"backend/ent/eventparticipant"
	"backend/script"
	"context" // Dibutuhkan jika Anda akan melakukan operasi DB
	"fmt"
	"log"
	"strconv"

	"github.com/onflow/cadence"
	"github.com/onflow/flow-go-sdk"
	"github.com/onflow/flow-go-sdk/access/grpc"
)

/**
 * getCadenceField[T cadence.Value] adalah fungsi generik
 * untuk mengambil dan memvalidasi tipe field dari event.
 *
 * T adalah tipe Cadence yang diharapkan (misal: cadence.Address)
 */
func getCadenceField[T cadence.Value](fields map[string]cadence.Value, key string) (T, error) {
	// 1. Ambil dari map
	fieldValue, ok := fields[key]
	if !ok {
		// 'var zero T' adalah cara untuk mendapatkan "tipe default"
		// dari T (misal: nil) agar kita bisa mengembalikannya.
		var zero T
		return zero, fmt.Errorf("field '%s' tidak ditemukan di event", key)
	}

	// 2. Lakukan type assertion ke tipe Generik 'T'
	typedValue, ok := fieldValue.(T)
	if !ok {
		var zero T
		// Error ini akan sangat jelas, misal:
		// "field 'brandAddress' bukan tipe cadence.Address (tipe: cadence.String)"
		return zero, fmt.Errorf("field '%s' bukan tipe yang diharapkan (tipe: %T)", key, fieldValue)
	}

	// 3. Kembalikan nilai yang sudah di-type-assert
	return typedValue, nil
}

// processEventCreated menerima event 'EventCreated' dan memprosesnya
// 'ctx' ditambahkan jika Anda perlu meneruskannya ke operasi database
func ProcessEventCreated(ctx context.Context, flowClient *grpc.BaseClient, ev flow.Event, client *ent.Client) { // <-- Tambahkan parameter
	var Fields = ev.Value.FieldsMappedByName()
	cadenceAddr, err := getCadenceField[cadence.Address](Fields, "brandAddress")
	if err != nil {
		log.Printf("Gagal parsing brandAddress: %v", err)
		return
	}

	cadenceEventID, err := getCadenceField[cadence.UInt64](Fields, "eventID")
	if err != nil {
		log.Printf("Gagal parsing eventID: %v", err)
		return
	}

	// Sekarang Anda bisa mengonversinya ke string
	var brandAddress string = cadenceAddr.String()
	var eventID string = cadenceEventID.String()
	num, err := strconv.Atoi(eventID) // Convert string to integer
	if err != nil {
		log.Fatalf("error failed to convert to integer")
	}

	script := []byte(script.GetEventDetailScriptTemplate)
	scriptArgs := []cadence.Value{
		cadence.NewAddress(cadenceAddr),
		cadenceEventID,
	}

	scriptResult, err := flowClient.ExecuteScriptAtLatestBlock(ctx, script, scriptArgs)
	if err != nil {
		log.Printf("[ProcessEventCreated] Gagal execute get_event_detail script for event %d: %v", num, err)
		return
	}

	optionalResult, ok := scriptResult.(cadence.Optional)
	if !ok || optionalResult.Value == nil {
		log.Printf("[ProcessEventCreated] Script get_event_detail mengembalikan nil untuk event %d", num)
		return
	}

	eventDetailsStruct, ok := optionalResult.Value.(cadence.Struct)
	if !ok {
		log.Printf("[ProcessEventCreated] Gagal parsing hasil script menjadi cadence.Struct untuk event %d", num)
		return
	}

	eventDetailsFields := eventDetailsStruct.FieldsMappedByName()
	eventNameCadence, err := getCadenceField[cadence.String](eventDetailsFields, "eventName")
	quotaCadence, _ := getCadenceField[cadence.UInt64](eventDetailsFields, "quota")
	counterCadence, _ := getCadenceField[cadence.UInt64](eventDetailsFields, "counter")
	descriptionCadence, _ := getCadenceField[cadence.String](eventDetailsFields, "description")
	imageCadence, _ := getCadenceField[cadence.String](eventDetailsFields, "image")
	latCadence, _ := getCadenceField[cadence.Fix64](eventDetailsFields, "lat")
	longCadence, _ := getCadenceField[cadence.Fix64](eventDetailsFields, "long")
	radiusCadence, _ := getCadenceField[cadence.UFix64](eventDetailsFields, "radius")
	statusCadence, _ := getCadenceField[cadence.UInt8](eventDetailsFields, "status")
	startDateCadence, _ := getCadenceField[cadence.UFix64](eventDetailsFields, "startDate")
	endDateCadence, _ := getCadenceField[cadence.UFix64](eventDetailsFields, "endDate")
	totalRareNFTCadence, _ := getCadenceField[cadence.UInt64](eventDetailsFields, "totalRareNFT")

	if err != nil {
		fmt.Println("Error get cadence field:", err)
		return
	}

	eventName := eventNameCadence.String()
	quota, _ := strconv.Atoi(quotaCadence.String())
	counter, _ := strconv.Atoi(counterCadence.String())
	description := descriptionCadence.String()
	image := imageCadence.String()
	lat, _ := strconv.ParseFloat(latCadence.String(), 64)
	long, _ := strconv.ParseFloat(longCadence.String(), 64)
	radius, _ := strconv.ParseFloat(radiusCadence.String(), 64)
	status, _ := strconv.Atoi(statusCadence.String())
	startDate, _ := strconv.ParseFloat(startDateCadence.String(), 64)
	endDate, _ := strconv.ParseFloat(endDateCadence.String(), 64)
	totalRareNFT, _ := strconv.Atoi(totalRareNFTCadence.String())

	event, err := client.Event.Create().
		SetEventId(num).
		SetBrandAddress(brandAddress).
		SetEventName(eventName).
		SetQuota(quota).
		SetCounter(counter).
		SetDescription(description).
		SetImage(image).
		SetLat(lat).
		SetLong(long).
		SetRadius(radius).
		SetStatus(status).
		SetStartDate(startDate).
		SetEndDate(endDate).
		SetTotalRareNFT(totalRareNFT).
		Save(ctx)
	if err != nil {
		log.Fatalf("failed creating event")
	}
	log.Println("event telah dibuat: ", event)
	log.Println("[ProcessEventCreated] (Placeholder) Simpan ke DB di sini...")
}

// --- Tambahkan juga fungsi untuk event lain ---

func ProcessEventRegistered(ctx context.Context, ev flow.Event, client *ent.Client) {
	var Fields = ev.Value.FieldsMappedByName()
	cadenceAddr, err := getCadenceField[cadence.Address](Fields, "user")
	if err != nil {
		log.Printf("Gagal parsing brandAddress: %v", err)
		return
	}

	cadenceEventID, err := getCadenceField[cadence.UInt64](Fields, "eventID")
	if err != nil {
		log.Printf("Gagal parsing eventID: %v", err)
		return
	}

	// Sekarang Anda bisa mengonversinya ke string
	var userAddress string = cadenceAddr.String()
	var eventID string = cadenceEventID.String()
	num, err := strconv.Atoi(eventID) // Convert string to integer

	if err != nil {
		fmt.Println("Error converting string to integer:", err)
		return
	}
	event, err := client.EventParticipant.Create().SetEventID(num).SetUserAddress(userAddress).Save(ctx)
	if err != nil {
		log.Fatalf("failed creating event")
	}
	log.Println("user register: ", event)
	log.Println("[ProcessEventRegistered] (Placeholder) Implementasikan fungsi ini...")
}

func ProcessEventUnregistered(ctx context.Context, ev flow.Event, client *ent.Client) {
	// Implementasi parsing & DB delete untuk EventUnregistered
	// Fields: eventID (UInt64), user (Address), newCounter (UInt64)
	var Fields = ev.Value.FieldsMappedByName()
	cadenceAddr, err := getCadenceField[cadence.Address](Fields, "user")
	if err != nil {
		log.Printf("Gagal parsing brandAddress: %v", err)
		return
	}

	cadenceEventID, err := getCadenceField[cadence.UInt64](Fields, "eventID")
	if err != nil {
		log.Printf("Gagal parsing eventID: %v", err)
		return
	}

	// Sekarang Anda bisa mengonversinya ke string
	var userAddress string = cadenceAddr.String()
	var eventID string = cadenceEventID.String()
	eventIDInt, err := strconv.Atoi(eventID) // Convert string to integer
	if err != nil {
		fmt.Println("Error converting string to integer:", err)
		return
	}
	deletedCount, err := client.EventParticipant.Delete().Where(
		eventparticipant.UserAddressEQ(userAddress),
		eventparticipant.HasEventWith(event.EventIdEQ(eventIDInt)),
	).Exec(ctx)
	if err != nil {
		log.Fatalf("failed creating event")
	}
	if err != nil {
		log.Printf("[ProcessEventUnregistered] Gagal delete user participant: %v", err)
		return
	}

	if deletedCount == 0 {
		log.Printf("[ProcessEventUnregistered] Tidak ada user participant yang cocok ditemukan untuk dihapus (Event: %d, User: %s)", eventIDInt, userAddress)
	} else {
		log.Printf("[DB] Berhasil menghapus %d user participant (Event: %d, User: %s)", deletedCount, eventIDInt, userAddress)
	}
}

func ProcessEventStatus(ctx context.Context, ev flow.Event, client *ent.Client) {

}

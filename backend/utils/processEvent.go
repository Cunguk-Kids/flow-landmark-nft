package utils // Atau package tempat helper indexer Anda berada

import (
	"backend/ent"
	"backend/ent/event"
	"backend/ent/eventparticipant"
	"context" // Dibutuhkan jika Anda akan melakukan operasi DB
	"fmt"
	"log"
	"strconv"

	"github.com/onflow/cadence"
	"github.com/onflow/flow-go-sdk"
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
func ProcessEventCreated(ctx context.Context, ev flow.Event, client *ent.Client) { // <-- Tambahkan parameter
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
		fmt.Println("Error converting string to integer:", err)
		return
	}
	event, err := client.Event.Create().SetEventId(num).SetBrandAddress(brandAddress).Save(ctx)
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

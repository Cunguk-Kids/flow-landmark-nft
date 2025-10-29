package utils

import (
	"backend/ent"
	"backend/ent/event"
	"backend/ent/eventparticipant"
	"backend/ent/partner"
	"backend/script"
	"context" // Dibutuhkan jika Anda akan melakukan operasi DB
	"fmt"
	"log"
	"strconv"
	"time"

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
	description := descriptionCadence.String()
	image := imageCadence.String()
	lat, _ := strconv.ParseFloat(latCadence.String(), 64)
	long, _ := strconv.ParseFloat(longCadence.String(), 64)
	radius, _ := strconv.ParseFloat(radiusCadence.String(), 64)
	status, _ := strconv.Atoi(statusCadence.String())
	startDate, _ := strconv.ParseFloat(startDateCadence.String(), 64)
	endDate, _ := strconv.ParseFloat(endDateCadence.String(), 64)
	totalRareNFT, _ := strconv.Atoi(totalRareNFTCadence.String())

	partnerEntity, err := client.Partner.
		Query().
		Where(partner.AddressEQ(brandAddress)). // Find partner by address
		Only(ctx)                               // Expect exactly one partner for this address

	if err != nil {
		log.Printf("[ProcessEventCreated] Gagal menemukan Partner dengan alamat %s di DB: %v", brandAddress, err)
		// Putuskan apa yang harus dilakukan jika partner tidak ada:
		// - return? (Batalkan penyimpanan event)
		// - Lanjutkan tanpa set partner?
		// Untuk sekarang, kita return:
		return
	}

	event, err := client.Event.Create().
		SetEventId(num).
		SetPartner(partnerEntity).
		SetEventName(eventName).
		SetQuota(quota).
		SetCounter(0).
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
		log.Fatalf("Gagal parsing eventID: %v", err)
		return
	}

	// Sekarang Anda bisa mengonversinya ke string
	var userAddress string = cadenceAddr.String()
	var eventID string = cadenceEventID.String()
	num, _ := strconv.Atoi(eventID) // Convert string to integer

	tx, err := client.Tx(ctx)
	if err != nil {
		log.Fatalf("[ProcessEventRegistered] Gagal memulai DB transaction: %v", err)
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			panic(r) // Re-panic after rollback
		}
		if err != nil { // Handle normal errors
			if rlbkErr := tx.Rollback(); rlbkErr != nil {
				log.Printf("[ProcessEventRegistered] Gagal rollback transaction: %v", rlbkErr)
			}
		}
	}()

	err = tx.Event.
		UpdateOneID(num).
		AddCounter(1).
		Exec(ctx)
	if err != nil {
		log.Printf("[ProcessEventRegistered] Gagal update counter event %d: %v", num, err)
		return // Will trigger rollback
	}

	_, err = tx.EventParticipant.Create().SetEventID(num).SetUserAddress(userAddress).Save(ctx)
	if err != nil {
		log.Fatalf("failed creating event")
	}
	err = tx.Commit()
	if err != nil {
		log.Printf("[ProcessEventRegistered] Gagal commit transaction: %v", err)
		return
	}
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

	tx, err := client.Tx(ctx)
	if err != nil {
		log.Fatalf("[ProcessEventRegistered] Gagal memulai DB transaction: %v", err)
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			panic(r) // Re-panic after rollback
		}
		if err != nil { // Handle normal errors
			if rlbkErr := tx.Rollback(); rlbkErr != nil {
				log.Printf("[ProcessEventUnregistered] Gagal rollback transaction: %v", rlbkErr)
			}
		}
	}()

	err = tx.Event.
		UpdateOneID(eventIDInt).
		AddCounter(-1).
		Exec(ctx)
	if err != nil {
		log.Printf("[ProcessEventUnregistered] Gagal update counter event %d: %v", eventIDInt, err)
		return // Will trigger rollback
	}

	_, err = tx.EventParticipant.Delete().Where(
		eventparticipant.UserAddressEQ(userAddress),
		eventparticipant.HasEventWith(event.EventIdEQ(eventIDInt)),
	).Exec(ctx)
	err = tx.Commit()
	if err != nil {
		log.Printf("[ProcessEventUnregistered] Gagal commit transaction: %v", err)
		return
	}
}

func ProcessEventStatus(ctx context.Context, ev flow.Event, client *ent.Client) {
	var Fields = ev.Value.FieldsMappedByName()

	// Parse eventID
	cadenceEventID, err := getCadenceField[cadence.UInt64](Fields, "eventID")
	if err != nil {
		log.Printf("[ProcessEventStatusUpdated] Gagal parsing eventID: %v", err)
		return
	}

	// Parse status (UInt8)
	cadenceStatus, err := getCadenceField[cadence.UInt8](Fields, "status")
	if err != nil {
		log.Printf("[ProcessEventStatusUpdated] Gagal parsing status: %v", err)
		return
	}

	eventID, err := strconv.Atoi(cadenceEventID.String())
	status, _ := strconv.Atoi(cadenceStatus.String())

	if err != nil {
		log.Printf("err convert")
		return
	}

	updatedCount, err := client.Event.
		Update().
		Where(event.EventIdEQ(eventID)).
		SetStatus(status).
		Save(ctx)

	if err != nil {
		log.Printf("[ProcessEventStatusUpdated] Gagal update status event %d di DB: %v", eventID, err)
		return
	}

	if updatedCount == 0 {
		log.Printf("[ProcessEventStatusUpdated] Event %d tidak ditemukan di DB untuk diupdate.", eventID)
	} else {
		log.Printf("[DB] Status event %d berhasil diupdate menjadi %d.", eventID, status)
	}
}

func HandlePartnerAdded(ctx context.Context, entClient *ent.Client, ev flow.Event) {
	var Fields = ev.Value.FieldsMappedByName()

	// --- 1. Parse Event Data ---
	cadenceAddr, err := getCadenceField[cadence.Address](Fields, "address")
	if err != nil {
		log.Printf("[HandlePartnerAdded] Gagal parsing address: %v", err)
		return
	}
	cadenceName, err := getCadenceField[cadence.String](Fields, "name")
	if err != nil {
		log.Printf("[HandlePartnerAdded] Gagal parsing name: %v", err)
		return
	}
	cadenceDesc, _ := getCadenceField[cadence.String](Fields, "description")
	cadenceEmail, _ := getCadenceField[cadence.String](Fields, "email")
	cadenceImage, _ := getCadenceField[cadence.String](Fields, "image")

	partnerAddress := cadenceAddr.String()
	partnerName := cadenceName.String()   // Convert cadence.String to Go string
	partnerDesc := cadenceDesc.String()   // Convert cadence.String to Go string
	partnerEmail := cadenceEmail.String() // Convert cadence.String to Go string
	partnerImage := cadenceImage.String() // Convert cadence.String to Go string

	log.Printf("[HandlePartnerAdded] Diterima: Address %s, Name %s", partnerAddress, partnerName)

	// --- 2. Create or Update Partner using Ent (Upsert) ---
	// Ent's Upsert is ideal here. It tries to create, and if the unique constraint
	// (on the 'address' field) fails, it updates instead.

	err = entClient.Partner.
		Create().
		SetAddress(partnerAddress). // Set the unique field
		SetName(partnerName).
		SetDescription(partnerDesc).
		SetEmail(partnerEmail).
		SetImage(partnerImage). // Update all fields (except Address) with the values from Create()
		// Or use specific updates: UpdateName()...
		Exec(ctx) // Execute the upsert operation

	// --- 3. Handle Result ---
	if err != nil {
		log.Printf("[HandlePartnerAdded] Gagal upsert partner %s: %v", partnerAddress, err)
		return
	}

	log.Printf("[DB] Partner %s (%s) berhasil disimpan/diupdate.", partnerAddress, partnerName)
}

func HandleEventNFTMinted(ctx context.Context, flowClient *grpc.BaseClient, entClient *ent.Client, ev flow.Event) {
	var Fields = ev.Value.FieldsMappedByName()

	// --- 1. Parse Basic Event Data ---
	cadenceEventID, err := getCadenceField[cadence.UInt64](Fields, "eventID")
	if err != nil {
		log.Printf("[HandleEventNFTMinted] Gagal parsing eventID: %v", err)
		return
	}
	cadenceNftID, err := getCadenceField[cadence.UInt64](Fields, "nftID")
	if err != nil {
		log.Printf("[HandleEventNFTMinted] Gagal parsing nftID: %v", err)
		return
	}
	cadenceUser, err := getCadenceField[cadence.Address](Fields, "user")
	if err != nil {
		log.Printf("[HandleEventNFTMinted] Gagal parsing user: %v", err)
		return
	}
	cadenceRarity, err := getCadenceField[cadence.String](Fields, "rarity") // Rarity in event is String
	if err != nil {
		log.Printf("[HandleEventNFTMinted] Gagal parsing rarity: %v", err)
		return
	}

	eventID := cadenceEventID.String()
	nftID := cadenceNftID.String()
	userAddress := cadenceUser.String()
	rarityString := cadenceRarity.String() // Get string value directly

	eventIDInt, _ := strconv.Atoi(eventID)
	nftIDInt64, _ := strconv.ParseInt(nftID, 10, 64) // Convert nftID for Ent

	log.Printf("[HandleEventNFTMinted] Diterima: Event %d, NFT %d, User %s, Rarity %s",
		eventIDInt, nftIDInt64, userAddress, rarityString)

	// --- 2. Fetch Full NFT Details via Script ---
	script := []byte(script.GetNFTDetailScriptTemplate)
	// log.Println(cadenceUser)
	// log.Println(cadenceNftID)
	scriptArgs := []cadence.Value{
		cadenceUser,  // ownerAddress
		cadenceNftID, // nftID
	}

	scriptResult, err := flowClient.ExecuteScriptAtLatestBlock(ctx, script, scriptArgs)
	if err != nil {
		log.Printf("[HandleEventNFTMinted] Gagal execute get_nft_details script for NFT %d: %v", nftIDInt64, err)
		return
	}
	optionalResult, ok := scriptResult.(cadence.Optional)
	if !ok || optionalResult.Value == nil {
		log.Printf("[HandleEventNFTMinted] Script get_nft_details mengembalikan nil untuk NFT %d (mungkin sudah dibakar?)", nftIDInt64)
		return // Cannot proceed without details
	}
	nftDetailsStruct, ok := optionalResult.Value.(cadence.Struct)
	if !ok {
		log.Printf("[HandleEventNFTMinted] Gagal parsing hasil script menjadi cadence.Struct untuk NFT %d", nftIDInt64)
		return
	}

	// --- 3. Parse Metadata Struct from Script Result ---
	outerMap := nftDetailsStruct.FieldsMappedByName()
	log.Printf("[DEBUG] Outer NFTDetails Map: %+v", outerMap) // Log this map

	// 2. Ambil nilai 'metadata' dari map luar (ini adalah cadence.Struct)
	metadataValue, ok := outerMap["metadata"]
	if !ok {
		log.Printf("[HandleEventNFTMinted] Field 'metadata' not found in NFTDetails struct result for NFT %d", nftIDInt64)
		return
	}
	metadataStruct, ok := metadataValue.(cadence.Struct)
	if !ok {
		log.Printf("[HandleEventNFTMinted] Field 'metadata' is not a cadence.Struct (type: %T) for NFT %d", metadataValue, nftIDInt64)
		return
	}

	// 3. Dapatkan map DARI struct metadata (inner struct)
	metadataMap := metadataStruct.FieldsMappedByName()         // <-- Panggil FieldsMappedByName() di sini!
	log.Printf("[DEBUG] Inner Metadata Map: %+v", metadataMap) // Log this map

	// 4. Parse map metadata yang benar
	metadata, err := parseNFTDetailsStruct(metadataMap) // <-- Kirim map yang benar
	if err != nil {
		log.Printf("[HandleEventNFTMinted] Gagal parsing inner metadata map from script for NFT %d: %v", nftIDInt64, err)
		return
	}
	if metadata == nil {
		log.Printf("[HandleEventNFTMinted] Parsing inner metadata map resulted in nil for NFT %d", nftIDInt64)
		return
	}
	// --- 4. Save NFT to Database using Ent ---
	// Consider wrapping in a DB transaction if you also update Event counter here
	_, err = entClient.Nft.
		Create().
		SetNftID(nftIDInt64).         // Set primary/unique key
		SetMetadata(*metadata).       // Set the parsed metadata struct
		SetOwnerAddress(userAddress). // Set owner
		SetRarity(rarityString).      // Set rarity from event data
		SetMintTime(time.Now()).      // Record indexing time
		SetEventID(eventIDInt).       // Set foreign key to link to Event
		// Use SetEventX if Event entity is guaranteed to exist:
		// SetEvent(entClient.Event.GetX(ctx, eventIDInt64))
		Save(ctx)

	if err != nil {
		// Handle potential unique constraint violation (NFT already indexed)
		// if ent.IsConstraintError(err) {
		//  log.Printf("[HandleEventNFTMinted] NFT %d sudah ada di DB.", nftIDInt64)
		//  return // Or update if necessary
		// }
		log.Printf("[HandleEventNFTMinted] Gagal menyimpan NFT %d ke DB: %v", nftIDInt64, err)
		return
	}

	log.Printf("[DB] NFT %d (dari Event %d) berhasil disimpan.", nftIDInt64, eventIDInt)

	// Optional: Update Event counter (if not handled by EventRegistered/Unregistered)
	// err = entClient.Event.UpdateOneID(eventIDInt64).AddCounter(1).Exec(ctx)
	// if err != nil { log.Printf("[HandleEventNFTMinted] Gagal update counter event %d: %v", eventIDInt64, err) }
}

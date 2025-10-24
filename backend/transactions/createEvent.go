package transactions

import (
	"backend/utils" // Asumsi dari file Anda sebelumnya
	"context"
	"fmt"
	"log"
	"os"
	"time" // <-- Dibutuhkan untuk StartDate/EndDate

	"github.com/joho/godotenv"
	"github.com/onflow/cadence" // <-- Dibutuhkan untuk argumen
	"github.com/onflow/flow-go-sdk"
	"github.com/onflow/flow-go-sdk/access"
	"github.com/onflow/flow-go-sdk/access/http"
	"github.com/onflow/flow-go-sdk/crypto"
)

// Ini adalah template skrip transaksi 'admin_create_event'
const adminCreateEventScriptTemplate = `
import EventPlatform from 0x%s // Alamat Kontrak

// Transaksi: admin_create_event.cdc
// Dijalankan oleh: Akun Admin Platform (Backend Anda)

transaction(
    brandAddress: Address,
    eventName: String,
    quota: UInt64,
    description: String,
    image: String,
    lat: Fix64, // Pastikan kontrak Anda menggunakan Fix64
    long: Fix64, // Pastikan kontrak Anda menggunakan Fix64
    radius: UFix64,
    startDate: UFix64,
    endDate: UFix64,
    totalRareNFT: UInt64
) {

    let adminRef: &{EventPlatform.IAdmin}

    prepare(adminAccount: auth(Storage) &Account) {
        
        let adminReceiver = adminAccount.storage
            .borrow<&EventPlatform.AdminReceiver>(
                from: EventPlatform.AdminReceiverStoragePath
            )
            ?? panic("Inbox Admin tidak ditemukan. Jalankan setup_admin_inbox.cdc")
            
        self.adminRef = adminReceiver.getAdminCapability(brandAddress: brandAddress)
            ?? panic("Admin tidak memiliki izin untuk Brand A ini")
    }

    execute {
        let newEventID = self.adminRef.createEvent(
            eventName: eventName,
            quota: quota,
            description: description,
            image: image,
            lat: lat,
            long: long,
            radius: radius,
            startDate: startDate,
            endDate: endDate,
            totalRareNFT: totalRareNFT
        )
        log("Admin berhasil membuat event baru! ID: ".concat(newEventID.toString()))
    }
}
`

const (
	deployerAddress = "f8d6e0586b0a20c7"
)

// CreateEvent membuat event baru atas nama Brand
// Fungsi ini ditandatangani oleh Akun Admin Platform
func CreateEvent(
	brandAddressString string,
	eventName string,
	quota uint64,
	description string,
	image string,
	lat float64, // Tipe Go
	long float64, // Tipe Go
	radius float64, // Tipe Go
	startDate time.Time, // Tipe Go
	endDate time.Time, // Tipe Go
	totalRareNFT uint64,
) {

	// Muat .env (sama seperti di SetupAdmin)
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	ctx := context.Background()
	var flowClient access.Client

	// Menggunakan pola koneksi yang Anda ingat
	flowClient, err = http.NewClient(http.EmulatorHost)
	if err != nil {
		fmt.Println("Connection Error:", err.Error())
		panic(err)
	}

	// 1. SIAPKAN SIGNER (ADMIN PLATFORM)
	// (Sama seperti di SetupAdmin, memuat dari .env)
	privateKey := os.Getenv("PRIVATE_KEY")
	platformAddress := flow.HexToAddress(deployerAddress) //ubah sesuai dengan account flow emulator
	platformKey, err := crypto.DecodePrivateKeyHex(crypto.ECDSA_P256, privateKey)
	if err != nil {
		log.Fatalf("Gagal decode private key: %v", err)
	}

	platformAccount, err := flowClient.GetAccount(ctx, platformAddress)
	if err != nil {
		log.Fatalf("Gagal mendapatkan akun platform: %v", err)
	}

	key := platformAccount.Keys[0]
	signer, err := crypto.NewInMemorySigner(platformKey, key.HashAlgo)
	if err != nil {
		log.Fatalf("Gagal memuat signer: %v", err)
	}

	// 2. BUAT SKRIP TRANSAKSI
	script := []byte(fmt.Sprintf(adminCreateEventScriptTemplate, deployerAddress))

	// 3. SIAPKAN SEMUA ARGUMEN (11 Argumen)
	// Konversi tipe Go ke tipe Cadence

	brandAddressArg := cadence.NewAddress(flow.HexToAddress(brandAddressString))

	eventNameArg, err := cadence.NewString(eventName)
	if err != nil {
		log.Fatalf("Gagal membuat argumen eventName: %v", err)
	}

	quotaArg := cadence.NewUInt64(quota)

	descriptionArg, err := cadence.NewString(description)
	if err != nil {
		log.Fatalf("Gagal membuat argumen description: %v", err)
	}

	imageArg, err := cadence.NewString(image)
	if err != nil {
		log.Fatalf("Gagal membuat argumen image: %v", err)
	}

	// Konversi float64 ke Fix64 (string)
	latString := fmt.Sprintf("%.8f", lat)
	latArg, err := cadence.NewFix64(latString)
	if err != nil {
		log.Fatalf("Gagal membuat argumen lat: %v", err)
	}

	longString := fmt.Sprintf("%.8f", long)
	longArg, err := cadence.NewFix64(longString)
	if err != nil {
		log.Fatalf("Gagal membuat argumen long: %v", err)
	}

	// Konversi float64 ke UFix64 (string)
	radiusString := fmt.Sprintf("%.8f", radius)
	radiusArg, err := cadence.NewUFix64(radiusString)
	if err != nil {
		log.Fatalf("Gagal membuat argumen radius: %v", err)
	}

	// Konversi time.Time ke UFix64 (Unix timestamp string)
	startDateString := fmt.Sprintf("%d.0", startDate.Unix())
	startDateArg, err := cadence.NewUFix64(startDateString)
	if err != nil {
		log.Fatalf("Gagal membuat argumen startDate: %v", err)
	}

	endDateString := fmt.Sprintf("%d.0", endDate.Unix())
	endDateArg, err := cadence.NewUFix64(endDateString)
	if err != nil {
		log.Fatalf("Gagal membuat argumen endDate: %v", err)
	}

	totalRareNFTArg := cadence.NewUInt64(totalRareNFT)

	// 4. BUAT TRANSAKSI
	latestBlock, err := flowClient.GetLatestBlock(ctx, true)
	if err != nil {
		log.Fatalf("Gagal mendapatkan block terbaru: %v", err)
	}

	tx := flow.NewTransaction().
		SetScript(script).
		SetComputeLimit(1000).
		SetReferenceBlockID(latestBlock.ID).
		SetPayer(platformAddress).                                      // Payer adalah Admin
		SetProposalKey(platformAddress, key.Index, key.SequenceNumber). // Proposal Key adalah Admin
		AddAuthorizer(platformAddress)                                  // Authorizer adalah Admin

	// 5. TAMBAHKAN ARGUMEN (SESUAI URUTAN DI CADENCE)
	_ = tx.AddArgument(brandAddressArg)
	_ = tx.AddArgument(eventNameArg)
	_ = tx.AddArgument(quotaArg)
	_ = tx.AddArgument(descriptionArg)
	_ = tx.AddArgument(imageArg)
	_ = tx.AddArgument(latArg)
	_ = tx.AddArgument(longArg)
	_ = tx.AddArgument(radiusArg)
	_ = tx.AddArgument(startDateArg)
	_ = tx.AddArgument(endDateArg)
	_ = tx.AddArgument(totalRareNFTArg)

	// 6. TANDA TANGANI TRANSAKSI (oleh ADMIN)
	err = tx.SignEnvelope(platformAddress, key.Index, signer)
	if err != nil {
		log.Fatalf("Gagal menandatangani transaksi: %v", err)
	}

	// 7. KIRIM TRANSAKSI
	log.Println("Mengirim transaksi 'admin_create_event'...")
	err = flowClient.SendTransaction(ctx, *tx)
	if err != nil {
		log.Fatalf("Gagal mengirim transaksi: %v", err)
	}

	// 8. TUNGGU HASILNYA (SEAL)
	result := utils.WaitForSeal(ctx, flowClient, tx.ID())

	if result.Error != nil {
		log.Fatalf("Transaksi error di chain: %s", result.Error)
	}

	log.Printf("Transaksi Create Event Berhasil! 🔥 Status: %s", result.Status)
}

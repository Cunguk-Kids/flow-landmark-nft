package transactions

import (
	"backend/utils" // Asumsi dari file Anda sebelumnya
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/onflow/cadence"
	"github.com/onflow/flow-go-sdk"
	"github.com/onflow/flow-go-sdk/access"
	"github.com/onflow/flow-go-sdk/access/http"
	"github.com/onflow/flow-go-sdk/crypto"
)

// (Template skrip adminCreateEventScriptTemplate tetap sama)
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
	// Ingat konstanta EmulatorHost Anda (Anda mungkin punya ini di tempat lain)
	EmulatorHost = "127.0.0.1:3569" // Atau port HTTP Anda jika tetap pakai http client
)

// CreateEvent membuat event baru atas nama Brand
// Mengembalikan error jika terjadi masalah
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
) error { // <-- PERUBAHAN: Mengembalikan error

	// Muat .env
	err := godotenv.Load()
	if err != nil {
		// Log saja, mungkin env var diset di sistem
		log.Println("Peringatan: Error loading .env file:", err)
		// return fmt.Errorf("error loading .env file: %w", err) // Atau return error jika .env wajib
	}

	ctx := context.Background()
	var flowClient access.Client

	// Koneksi Flow
	// PERHATIAN: http.EmulatorHost mungkin konstanta dari package http, sesuaikan jika perlu
	flowClient, err = http.NewClient(http.EmulatorHost) // Menggunakan koneksi HTTP Anda
	if err != nil {
		log.Printf("Connection Error: %v\n", err)
		// Jangan panic, return error
		return fmt.Errorf("gagal membuat flow client: %w", err)
	}

	// 1. SIAPKAN SIGNER (ADMIN PLATFORM)
	privateKey := os.Getenv("PRIVATE_KEY")
	if privateKey == "" {
		return fmt.Errorf("PRIVATE_KEY tidak ditemukan di environment variables")
	}
	platformAddress := flow.HexToAddress(deployerAddress)
	platformKey, err := crypto.DecodePrivateKeyHex(crypto.ECDSA_P256, privateKey)
	if err != nil {
		log.Printf("Gagal decode private key: %v\n", err)
		return fmt.Errorf("gagal decode private key: %w", err)
	}

	platformAccount, err := flowClient.GetAccount(ctx, platformAddress)
	if err != nil {
		log.Printf("Gagal mendapatkan akun platform: %v\n", err)
		return fmt.Errorf("gagal mendapatkan akun platform %s: %w", platformAddress.String(), err)
	}

	key := platformAccount.Keys[0]
	signer, err := crypto.NewInMemorySigner(platformKey, key.HashAlgo)
	if err != nil {
		log.Printf("Gagal memuat signer: %v\n", err)
		return fmt.Errorf("gagal memuat signer: %w", err)
	}

	// 2. BUAT SKRIP TRANSAKSI
	script := []byte(fmt.Sprintf(adminCreateEventScriptTemplate, deployerAddress))

	// 3. SIAPKAN SEMUA ARGUMEN (11 Argumen)
	// (Gunakan helper function jika Anda punya untuk menghindari Fatalf)
	makeStrArg := func(s string) (cadence.String, error) {
		val, err := cadence.NewString(s)
		if err != nil {
			return "", fmt.Errorf("gagal membuat argumen string '%s': %w", s, err)
		}
		return val, nil
	}
	makeFix64Arg := func(f float64) (cadence.Fix64, error) {
		s := fmt.Sprintf("%.8f", f)
		val, err := cadence.NewFix64(s)
		if err != nil {
			return cadence.Fix64(0), fmt.Errorf("gagal membuat argumen Fix64 '%s': %w", s, err)
		}
		return val, nil
	}
	makeUFix64Arg := func(f float64) (cadence.UFix64, error) {
		s := fmt.Sprintf("%.8f", f)
		val, err := cadence.NewUFix64(s)
		if err != nil {
			return cadence.UFix64(0), fmt.Errorf("gagal membuat argumen UFix64 '%s': %w", s, err)
		}
		return val, nil
	}
	makeUFix64TimestampArg := func(t time.Time) (cadence.UFix64, error) {
		s := fmt.Sprintf("%d.0", t.Unix())
		val, err := cadence.NewUFix64(s)
		if err != nil {
			return cadence.UFix64(0), fmt.Errorf("gagal membuat argumen timestamp '%s': %w", s, err)
		}
		return val, nil
	}

	// --- Buat Argumen ---
	brandAddressArg := cadence.NewAddress(flow.HexToAddress(brandAddressString))

	eventNameArg, err := makeStrArg(eventName)
	if err != nil {
		return err
	}

	quotaArg := cadence.NewUInt64(quota)

	descriptionArg, err := makeStrArg(description)
	if err != nil {
		return err
	}

	imageArg, err := makeStrArg(image)
	if err != nil {
		return err
	}

	latArg, err := makeFix64Arg(lat)
	if err != nil {
		return err
	}

	longArg, err := makeFix64Arg(long)
	if err != nil {
		return err
	}

	radiusArg, err := makeUFix64Arg(radius)
	if err != nil {
		return err
	}

	startDateArg, err := makeUFix64TimestampArg(startDate)
	if err != nil {
		return err
	}

	endDateArg, err := makeUFix64TimestampArg(endDate)
	if err != nil {
		return err
	}

	totalRareNFTArg := cadence.NewUInt64(totalRareNFT)

	// 4. BUAT TRANSAKSI
	latestBlock, err := flowClient.GetLatestBlock(ctx, true)
	if err != nil {
		log.Printf("Gagal mendapatkan block terbaru: %v\n", err)
		return fmt.Errorf("gagal mendapatkan block terbaru: %w", err)
	}

	tx := flow.NewTransaction().
		SetScript(script).
		SetComputeLimit(1000).
		SetReferenceBlockID(latestBlock.ID).
		SetPayer(platformAddress).
		SetProposalKey(platformAddress, key.Index, key.SequenceNumber).
		AddAuthorizer(platformAddress)

	// 5. TAMBAHKAN ARGUMEN
	// (Error check diabaikan karena AddArgument jarang gagal jika value benar)
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

	// 6. TANDA TANGANI TRANSAKSI
	err = tx.SignEnvelope(platformAddress, key.Index, signer)
	if err != nil {
		log.Printf("Gagal menandatangani transaksi: %v\n", err)
		return fmt.Errorf("gagal menandatangani transaksi: %w", err)
	}

	// 7. KIRIM TRANSAKSI
	log.Println("Mengirim transaksi 'admin_create_event'...")
	err = flowClient.SendTransaction(ctx, *tx)
	if err != nil {
		log.Printf("Gagal mengirim transaksi: %v\n", err)
		return fmt.Errorf("gagal mengirim transaksi: %w", err)
	}

	// 8. TUNGGU HASILNYA (SEAL)
	// Panggil WaitForSeal yang sudah diubah agar return error
	result, err := utils.WaitForSeal(ctx, flowClient, tx.ID())
	if err != nil {
		// Error bisa dari WaitForSeal itu sendiri atau error Cadence di chain
		log.Printf("Transaksi %s gagal: %v\n", tx.ID(), err)
		return fmt.Errorf("transaksi %s gagal: %w", tx.ID(), err) // Kembalikan error
	}

	// Jika tidak ada error dari WaitForSeal, berarti sukses
	log.Printf("Transaksi Create Event Berhasil! 🔥 Status: %s", result.Status)
	return nil // <-- PERUBAHAN: Kembalikan nil error jika sukses
}

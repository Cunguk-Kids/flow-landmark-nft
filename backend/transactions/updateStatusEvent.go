package transactions

import (
	"backend/utils" // Asumsi utils Anda
	"context"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/onflow/cadence"
	"github.com/onflow/flow-go-sdk"
	"github.com/onflow/flow-go-sdk/access"
	"github.com/onflow/flow-go-sdk/access/http"
	"github.com/onflow/flow-go-sdk/crypto"
)

// Template skrip dari Anda
const updateEventStatusScriptTemplate = `
import EventPlatform from 0x%s // Alamat Kontrak

transaction(brandAddress: Address, eventID: UInt64) {
    let eventRef: &{EventPlatform.IEventPublic}
    prepare(signer: &Account) {
        let managerCap = getAccount(brandAddress)
            .capabilities.get<&{EventPlatform.IPublicEventManager}>(
                EventPlatform.EventManagerPublicPath
            )
        let managerRef = managerCap.borrow()
            ?? panic("Brand ini tidak memiliki Event Manager publik")
        self.eventRef = managerRef.getEvent(id: eventID)!
    }
    execute {
        let currentTime = getCurrentBlock().timestamp
        self.eventRef.updateStatus(currentTime: currentTime)
        log("Status event ID ".concat(eventID.toString()).concat(" berhasil diperbarui."))
    }
}
`

// UpdateEventStatus mengirimkan transaksi untuk memperbarui status event
// Fungsi ini SINKRON dan mengembalikan error
func UpdateEventStatus(brandAddressString string, eventID uint64) error {
	log.Printf("[UpdateStatus] Memulai proses on-chain untuk Event: %d", eventID)

	err := godotenv.Load()
	if err != nil {
		log.Println("[UpdateStatus] Peringatan: Gagal load .env:", err)
	}

	ctx := context.Background()
	var flowClient access.Client

	// Menggunakan TestnetHost seperti di SendCheckinTransactionAsync
	flowClient, err = http.NewClient(http.TestnetHost)
	if err != nil {
		log.Printf("[UpdateStatus] Connection Error: %v", err)
		return fmt.Errorf("gagal membuat flow client: %w", err)
	}

	// Siapkan Signer (Admin Platform)
	// (Transaksi ini bisa ditandatangani siapa saja, tapi kita gunakan Admin
	//  sebagai praktik yang konsisten)
	privateKey := os.Getenv("PRIVATE_KEY")
	if privateKey == "" {
		log.Println("[UpdateStatus] Error: PRIVATE_KEY tidak ditemukan")
		return fmt.Errorf("PRIVATE_KEY tidak ditemukan")
	}
	platformAddress := flow.HexToAddress(deployerAddress) // Gunakan konstanta deployerAddress Anda
	platformKey, err := crypto.DecodePrivateKeyHex(crypto.ECDSA_P256, privateKey)
	if err != nil {
		log.Printf("[UpdateStatus] Gagal decode key: %v", err)
		return fmt.Errorf("gagal decode key: %w", err)
	}
	platformAccount, err := flowClient.GetAccount(ctx, platformAddress)
	if err != nil {
		log.Printf("[UpdateStatus] Gagal get account: %v", err)
		return fmt.Errorf("gagal get account: %w", err)
	}
	key := platformAccount.Keys[0]
	signer, err := crypto.NewInMemorySigner(platformKey, key.HashAlgo)
	if err != nil {
		log.Printf("[UpdateStatus] Gagal load signer: %v", err)
		return fmt.Errorf("gagal load signer: %w", err)
	}

	// Buat Skrip Transaksi
	script := []byte(fmt.Sprintf(updateEventStatusScriptTemplate, deployerAddress)) // Ganti jika kontrak di alamat lain

	// Siapkan Argumen
	brandAddrArg := cadence.NewAddress(flow.HexToAddress(brandAddressString))
	eventIDArg := cadence.NewUInt64(eventID)

	// Buat Transaksi
	latestBlock, err := flowClient.GetLatestBlock(ctx, true)
	if err != nil {
		log.Printf("[UpdateStatus] Gagal get block: %v", err)
		return fmt.Errorf("gagal get block: %w", err)
	}
	tx := flow.NewTransaction().
		SetScript(script).
		SetComputeLimit(100). // Update status harusnya murah
		SetReferenceBlockID(latestBlock.ID).
		SetPayer(platformAddress).
		SetProposalKey(platformAddress, key.Index, key.SequenceNumber).
		AddAuthorizer(platformAddress) // Cukup 1 authorizer (signer)

	_ = tx.AddArgument(brandAddrArg)
	_ = tx.AddArgument(eventIDArg)

	// Tanda Tangani
	err = tx.SignEnvelope(platformAddress, key.Index, signer)
	if err != nil {
		log.Printf("[UpdateStatus] Gagal sign tx: %v", err)
		return fmt.Errorf("gagal sign tx: %w", err)
	}

	// Kirim Transaksi
	err = flowClient.SendTransaction(ctx, *tx)
	if err != nil {
		log.Printf("[UpdateStatus] Gagal kirim tx: %v", err)
		return fmt.Errorf("gagal kirim tx: %w", err)
	}

	log.Printf("[UpdateStatus] Transaksi terkirim: %s. Menunggu seal...", tx.ID())

	// Tunggu Seal (Menggunakan WaitForSeal yang mengembalikan error)
	result, err := utils.WaitForSeal(ctx, flowClient, tx.ID())
	if err != nil {
		// Termasuk error Cadence panic ("Brand ini tidak memiliki...")
		log.Printf("[UpdateStatus] Transaksi %s GAGAL: %v", tx.ID(), err)
		return fmt.Errorf("transaksi gagal: %w", err)
	}

	// Sukses
	log.Printf("[UpdateStatus] Transaksi %s Berhasil di-seal! Status: %s", tx.ID(), result.Status)
	return nil // Kembalikan nil error jika sukses
}

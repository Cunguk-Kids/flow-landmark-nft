package transactions

import (
	"backend/utils"
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
	// "backend/utils" // Asumsi utils Anda
)

const checkinTransactionScriptTemplate = `
import EventPlatform from 0x%s // Alamat Kontrak

transaction(brandAddress: Address, eventID: UInt64, userAddress: Address) {

    let eventRef: &EventPlatform.Event // Kita butuh akses ke resource Event, bukan hanya interface

    prepare(signer: auth(Storage) &Account) { // Asumsi signer perlu storage untuk sesuatu, atau bisa &Account saja

        // Pinjam Event Manager dari Brand
        let managerCap = getAccount(brandAddress)
            .capabilities.get<&EventPlatform.EventManager>( // Pinjam EventManager penuh
                EventPlatform.EventManagerPublicPath // Asumsi kita pinjam dari storage brand
            )
            // ATAU jika Anda punya capability IAdmin di AdminReceiver:
            // let adminReceiver = signer.storage.borrow...
            // let adminRef = adminReceiver.getAdminCapability...
            // let managerRef = adminRef as! &EventPlatform.EventManager // Casting

        let manager = managerCap.borrow()
            ?? panic("EventManager tidak ditemukan")

        // Dapatkan reference ke Event (bukan interface)
        self.eventRef = manager.getEvent(id: eventID)
            ?? panic("Event tidak ditemukan")
    }

    execute {
        // Panggil fungsi checkIn di resource Event
        self.eventRef.checkIn(user: userAddress)
        log("Check-in on-chain berhasil untuk user ".concat(userAddress.toString()))
    }
}
`

// sendCheckinTransactionAsync mengirim transaksi check-in di background
// Anda perlu alamat Brand untuk menemukan EventManager-nya
func SendCheckinTransactionAsync(brandAddressString string, eventID int, userAddress string) {
	log.Printf("[Async Checkin] Memulai proses on-chain untuk Event: %d, User: %s", eventID, userAddress)

	// Muat .env (diperlukan lagi di goroutine terpisah)
	err := godotenv.Load()
	if err != nil {
		log.Println("[Async Checkin] Peringatan: Gagal load .env:", err)
		// Lanjutkan saja jika env var diset di sistem
	}

	ctx := context.Background() // Gunakan background context untuk goroutine
	var flowClient access.Client

	flowClient, err = http.NewClient(http.TestnetHost) // Pola koneksi Anda
	if err != nil {
		log.Printf("[Async Checkin] Connection Error: %v", err)
		return // Keluar dari goroutine jika koneksi gagal
	}

	// Siapkan Signer (Admin Platform)
	privateKey := os.Getenv("PRIVATE_KEY")
	if privateKey == "" {
		log.Println("[Async Checkin] Error: PRIVATE_KEY tidak ditemukan")
		return
	}
	platformAddress := flow.HexToAddress(deployerAddress) // Gunakan konstanta deployerAddress Anda
	platformKey, err := crypto.DecodePrivateKeyHex(crypto.ECDSA_P256, privateKey)
	if err != nil {
		log.Printf("[Async Checkin] Gagal decode key: %v", err)
		return
	}
	platformAccount, err := flowClient.GetAccount(ctx, platformAddress)
	if err != nil {
		log.Printf("[Async Checkin] Gagal get account: %v", err)
		return
	}
	key := platformAccount.Keys[0]
	signer, err := crypto.NewInMemorySigner(platformKey, key.HashAlgo)
	if err != nil {
		log.Printf("[Async Checkin] Gagal load signer: %v", err)
		return
	}

	// Buat Skrip Transaksi
	script := []byte(fmt.Sprintf(checkinTransactionScriptTemplate, deployerAddress)) // Ganti deployerAddress jika kontrak di tempat lain

	// Siapkan Argumen
	brandAddrArg := cadence.NewAddress(flow.HexToAddress(brandAddressString))
	eventIDArg := cadence.NewUInt64(uint64(eventID)) // Konversi int64 ke uint64
	userAddrArg := cadence.NewAddress(flow.HexToAddress(userAddress))

	// Buat Transaksi
	latestBlock, err := flowClient.GetLatestBlock(ctx, true)
	if err != nil {
		log.Printf("[Async Checkin] Gagal get block: %v", err)
		return
	}
	tx := flow.NewTransaction().
		SetScript(script).
		SetComputeLimit(100). // Check-in harusnya murah
		SetReferenceBlockID(latestBlock.ID).
		SetPayer(platformAddress).
		SetProposalKey(platformAddress, key.Index, key.SequenceNumber).
		AddAuthorizer(platformAddress)

	_ = tx.AddArgument(brandAddrArg)
	_ = tx.AddArgument(eventIDArg)
	_ = tx.AddArgument(userAddrArg)

	// Tanda Tangani
	err = tx.SignEnvelope(platformAddress, key.Index, signer)
	if err != nil {
		log.Printf("[Async Checkin] Gagal sign tx: %v", err)
		return
	}

	// Kirim Transaksi
	err = flowClient.SendTransaction(ctx, *tx)
	if err != nil {
		log.Printf("[Async Checkin] Gagal kirim tx: %v", err)
		return
	}

	log.Printf("[Async Checkin] Transaksi check-in terkirim: %s. Menunggu seal...", tx.ID())

	// Tunggu Seal (Gunakan WaitForSeal yang MENGEMBALIKAN error)
	result, err := utils.WaitForSeal(ctx, flowClient, tx.ID())
	if err != nil {
		// Termasuk error Cadence panic
		log.Printf("[Async Checkin] Transaksi %s GAGAL: %v", tx.ID(), err)
		// TODO: Implementasikan mekanisme retry atau logging error persisten
		return
	}

	// Sukses
	log.Printf("[Async Checkin] Transaksi %s Berhasil di-seal! Status: %s", tx.ID(), result.Status)
}

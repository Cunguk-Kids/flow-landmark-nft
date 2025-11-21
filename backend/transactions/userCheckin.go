package transactions

import (
	"backend/utils" // Asumsi dari file Anda sebelumnya (untuk WaitForSeal)
	"context"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/onflow/cadence"
	"github.com/onflow/flow-go-sdk"
	"github.com/onflow/flow-go-sdk/access"
	"github.com/onflow/flow-go-sdk/access/http" // Menggunakan klien HTTP
	"github.com/onflow/flow-go-sdk/crypto"
)

// Ini adalah skrip transaksi minting Anda
// Saya telah menambahkan '0x%s' agar kita bisa menyuntikkan alamat kontrak
const userCheckinScriptTemplate = `
import EventPass from 0x%s
import EventManager from 0x%s


// Transaksi ini dijalankan oleh ADMIN/BACKEND
// untuk secara manual melakukan check-in atas nama pengguna

transaction(
    eventID: UInt64,
    userAddress: Address // Alamat pengguna yang di-scan
) {

    // Referensi ke 'Admin' resource
    let adminRef: &EventManager.Admin
    let recipient: &EventPass.Collection
    let eventRef: &EventManager.Event
    let eventPassMinterRef: &EventPass.NFTMinter
    prepare(signer: auth(BorrowValue) &Account) {
        
        // Pinjam 'kunci' Admin dari storage 'signer' (backend)
        self.eventRef = EventManager.events[eventID] as! &EventManager.Event
        self.recipient = getAccount(userAddress).capabilities.borrow<&EventPass.Collection>(
          EventPass.CollectionPublicPath
        ) ?? panic("cant borrow ressource recipient collection EventPass")
        self.adminRef = signer.storage.borrow<&EventManager.Admin>(
            from: EventManager.eventManagerStoragePath
        ) ?? panic("cant borrow resource Admin EventManager")
        self.eventPassMinterRef = signer.storage.borrow<&EventPass.NFTMinter>(
          from: EventPass.MinterStoragePath
        ) ?? panic("cant borrow ressource minter EventPass")
    }

    execute {
        let thumbnail = self.eventRef.eventPassImg != nil ?
          self.eventRef.eventPassImg?.uri() :
          "https://white-lazy-marten-351.mypinata.cloud/ipfs/bafybeibv7mz4yvpuw5ejbovka3h2zhrzyf7jptikz7fzsuprlgw3h6qtnq"

        self.adminRef.checkInUserToEvent(eventID: eventID, userAddress: userAddress)
        self.eventPassMinterRef.mintNFT(
          recipient: self.recipient,
          name: self.eventRef.eventName,
          description: self.eventRef.description,
          thumbnail: thumbnail!,
          eventType: self.eventRef.eventType.rawValue,
          eventID: self.eventRef.eventID
        )
        
        log("checkIn success and event pass minted to ".concat(userAddress.toString()))
    }
}
`

func UserCheckin(
	eventID uint64,
	userAddress string,
) error {

	// Muat .env
	err := godotenv.Load()
	if err != nil {
		log.Println("Peringatan: Error loading .env file:", err)
	}

	ctx := context.Background()
	var flowClient access.Client

	// Koneksi Flow ke Emulator HTTP port
	flowClient, err = http.NewClient(http.EmulatorHost)
	if err != nil {
		return fmt.Errorf("gagal membuat flow client: %w", err)
	}

	// 1. SIAPKAN SIGNER (ADMIN/MINTER)
	privateKeyHex := os.Getenv("PRIVATE_KEY") // Ambil dari .env
	if privateKeyHex == "" {
		return fmt.Errorf("PRIVATE_KEY tidak ditemukan di environment variables")
	}

	// Gunakan alamat minter dari konstanta
	minterFlowAddress := flow.HexToAddress(deployerAddress)
	platformKey, err := crypto.DecodePrivateKeyHex(crypto.ECDSA_P256, privateKeyHex)
	if err != nil {
		return fmt.Errorf("gagal decode private key: %w", err)
	}

	platformAccount, err := flowClient.GetAccount(ctx, minterFlowAddress)
	if err != nil {
		return fmt.Errorf("gagal mendapatkan akun minter %s: %w", minterFlowAddress.String(), err)
	}

	// Asumsi kita menggunakan key pertama (index 0)
	key := platformAccount.Keys[0]
	signer, err := crypto.NewInMemorySigner(platformKey, key.HashAlgo)
	if err != nil {
		return fmt.Errorf("gagal memuat signer: %w", err)
	}

	// 2. BUAT SKRIP TRANSAKSI
	// Kita suntikkan alamat minter (yang juga alamat deployer) 2x
	// 1x untuk 'NFTMoment' dan 1x untuk 'MetadataViews'
	script := []byte(fmt.Sprintf(userCheckinScriptTemplate, deployerAddress, deployerAddress))

	// 3. SIAPKAN ARGUMEN (4 Argumen)

	// Helper function untuk argumen String (sama seperti template Anda)

	// --- Buat Argumen ---
	userAddressArg := cadence.NewAddress(flow.HexToAddress(userAddress))

	// 4. BUAT TRANSAKSI
	latestBlock, err := flowClient.GetLatestBlock(ctx, true)
	if err != nil {
		return fmt.Errorf("gagal mendapatkan block terbaru: %w", err)
	}

	tx := flow.NewTransaction().
		SetScript(script).
		SetReferenceBlockID(latestBlock.ID).
		SetPayer(minterFlowAddress). // Admin adalah 'Payer'
		SetProposalKey(minterFlowAddress, key.Index, key.SequenceNumber).
		AddAuthorizer(minterFlowAddress) // Admin adalah 'Authorizer'

	// 5. TAMBAHKAN ARGUMEN
	_ = tx.AddArgument(cadence.NewUInt64(eventID))
	_ = tx.AddArgument(userAddressArg)

	// 6. TANDA TANGANI TRANSAKSI
	err = tx.SignEnvelope(minterFlowAddress, key.Index, signer)
	if err != nil {
		return fmt.Errorf("gagal menandatangani transaksi: %w", err)
	}

	// 7. KIRIM TRANSAKSI
	log.Println("Mengirim transaksi 'mint_nft_moment'...")
	err = flowClient.SendTransaction(ctx, *tx)
	if err != nil {
		return fmt.Errorf("gagal mengirim transaksi: %w", err)
	}

	// 8. TUNGGU HASILNYA (SEAL)
	// (Menggunakan 'utils.WaitForSeal' dari template Anda)
	result, err := utils.WaitForSeal(ctx, flowClient, tx.ID())
	if err != nil {
		log.Printf("Transaksi %s gagal: %v\n", tx.ID(), err)
		return fmt.Errorf("transaksi %s gagal: %w", tx.ID(), err)
	}

	log.Printf("Transaksi Mint NFTMoment Berhasil! 🔥 Status: %s. TX ID: %s", result.Status, tx.ID())
	return nil // Sukses
}

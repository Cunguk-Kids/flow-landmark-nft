// Transaksi: claim_event_nft_partial_args.cdc
// Dijalankan oleh: User
// Menerima sebagian metadata sebagai argumen, sisanya hardcoded.

import "EventPlatform" // Alamat deploy EventPlatform
import "NFTMoment"     // Alamat deploy NFTMoment

// --- Argumen yang dibutuhkan ---
transaction(
    // Argumen inti
    eventID: UInt64,
    partnerAddress: Address, // Alamat Brand
    rarityRawValue: UInt8,   // 0=Common, 1=Rare, etc.

    // Argumen Metadata Dinamis
    title: String,
    description: String,
    imageURL: String,
    timestamp: UFix64 // Unix timestamp (misal: 1730100000.0)

) {

    let userAddress: Address

    prepare(signer: auth(Storage, Capabilities) &Account) {
        self.userAddress = signer.address

        // Setup Koleksi NFT jika belum ada (kode sama seperti sebelumnya)
        if signer.storage.borrow<&NFTMoment.Collection>(from: NFTMoment.CollectionStoragePath) == nil {
            let collection <- NFTMoment.createEmptyCollection(ownerAddress: self.userAddress)
            signer.storage.save(<-collection, to: NFTMoment.CollectionStoragePath)
            signer.capabilities.publish(
                signer.capabilities.storage.issue<&{NFTMoment.CollectionPublic}>(NFTMoment.CollectionStoragePath),
                at: NFTMoment.CollectionPublicPath
            )
            log("Koleksi NFTMoment baru dibuat.")
        } else if !signer.capabilities.exists(NFTMoment.CollectionPublicPath) {
             signer.capabilities.publish(
                signer.capabilities.storage.issue<&{NFTMoment.CollectionPublic}>(NFTMoment.CollectionStoragePath),
                at: NFTMoment.CollectionPublicPath
             )
             log("Capability publik Koleksi NFTMoment dipublikasikan ulang.")
        }
    }

    execute {
        // --- Hardcode Nilai Metadata Lainnya ---
        let category = NFTMoment.Category.Event // Atau kategori default lain
        let thumbnailURL: String? = nil
        let weather: String? = nil
        let temperature: String? = nil
        let location: NFTMoment.Location? = nil // Kosongkan jika tidak ada
        let altitude: String? = nil
        let windSpeed: String? = nil
        let border = NFTMoment.BorderStyle.Batik // Nilai WAJIB, pilih default
        let sticker: NFTMoment.StickerStyle? = nil
        let filter: NFTMoment.FilterStyle? = nil
        let audio: NFTMoment.AudioStyle? = nil
        let javaneseText: String? = nil
        let tags: [String]? = nil
        let attributes: {String: String}? = nil
        // ------------------------------------

        // --- Bangun Struct MomentMetadata ---
        let metadata = NFTMoment.MomentMetadata(
            title: title,                 // Dari argumen
            description: description,     // Dari argumen
            category: category,           // Hardcoded
            imageURL: imageURL,           // Dari argumen
            thumbnailURL: thumbnailURL,   // Hardcoded (nil)
            timestamp: timestamp,         // Dari argumen
            weather: weather,             // Hardcoded (nil)
            temperature: temperature,     // Hardcoded (nil)
            location: location,           // Hardcoded (nil)
            altitude: altitude,           // Hardcoded (nil)
            windSpeed: windSpeed,         // Hardcoded (nil)
            border: border,               // Hardcoded (WAJIB)
            sticker: sticker,             // Hardcoded (nil)
            filter: filter,               // Hardcoded (nil)
            audio: audio,                 // Hardcoded (nil)
            javaneseText: javaneseText,   // Hardcoded (nil)
            tags: tags,                   // Hardcoded (nil)
            attributes: attributes        // Hardcoded (nil)
        )

        // --- Konversi Rarity ---
        let rarity = NFTMoment.Rarity(rawValue: rarityRawValue)! // Dari argumen

        // --- Panggil claimEventNFT ---
        let newNftID = EventPlatform.claimEventNFT(
            eventID: eventID,
            userAddress: self.userAddress,
            partnerAddress: partnerAddress,
            metadata: metadata, // Gunakan metadata yang baru dibangun
            rarity: rarity
        )

        log("NFT berhasil di-mint! ID: ".concat(newNftID.toString()))
    }
}
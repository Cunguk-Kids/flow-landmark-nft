import "NFTMoment"
import "NonFungibleToken"

// Merge two NFTs into a new one
transaction(
    id1: UInt64,
    id2: UInt64,
    newTitle: String,
    newDescription: String,
    newCategoryRaw: UInt8,
    newImageURL: String,
    newThumbnailURL: String,
    newRarityRaw: UInt8,
    borderRaw: UInt8,
    stickerRaw: UInt8,
    filterRaw: UInt8,
    audioRaw: UInt8,
    javaneseText: String?,
    tags: [String]
) {
    let collection: &NFTMoment.Collection

    prepare(acct: auth(Storage) &Account) {
        self.collection = acct.storage.borrow<&NFTMoment.Collection>(from: NFTMoment.CollectionStoragePath)
            ?? panic("Could not borrow collection reference")
    }

    execute {
        // Get metadata from both NFTs to combine
        let nft1 = self.collection.borrowNFTMoment(id: id1)!
        let nft2 = self.collection.borrowNFTMoment(id: id2)!

        // Create new metadata for merged NFT
        let newMetadata = NFTMoment.MomentMetadata(
            title: newTitle,
            description: newDescription,
            category: NFTMoment.Category(rawValue: newCategoryRaw)!,
            imageURL: newImageURL,
            thumbnailURL: newThumbnailURL,
            timestamp: getCurrentBlock().timestamp,
            weather: nil,
            temperature: nil,
            location: nil,
            altitude: nil,
            windSpeed: nil,
            border: NFTMoment.BorderStyle(rawValue: borderRaw)!,
            sticker: NFTMoment.StickerStyle(rawValue: stickerRaw)!,
            filter: NFTMoment.FilterStyle(rawValue: filterRaw)!,
            audio: NFTMoment.AudioStyle(rawValue: audioRaw)!,
            javaneseText: javaneseText,
            tags: tags,
            attributes: {
                "merged_at": getCurrentBlock().timestamp.toString(),
                "source_nft_1": id1.toString(),
                "source_nft_2": id2.toString()
            }
        )

        let newRarity = NFTMoment.Rarity(rawValue: newRarityRaw)!

        // Perform the merge
        let newId = NFTMoment.mergeNFTs(
            collection: self.collection,
            id1: id1,
            id2: id2,
            newMetadata: newMetadata,
            newRarity: newRarity
        )

        log("NFTs ".concat(id1.toString()).concat(" and ").concat(id2.toString()).concat(" merged into new NFT ").concat(newId.toString()))
    }
}

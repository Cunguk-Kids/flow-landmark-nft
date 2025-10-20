import "NFTMoment"

// Mint an NFT Moment
transaction(
    title: String,
    description: String,
    categoryRaw: UInt8,
    imageURL: String,
    thumbnailURL: String,
    weather: String?,
    temperature: String?,
    latitude: String?,
    longitude: String?,
    placeName: String?,
    city: String?,
    country: String?,
    altitude: String?,
    windSpeed: String?,
    borderRaw: UInt8,
    stickerRaw: UInt8,
    filterRaw: UInt8,
    audioRaw: UInt8,
    javaneseText: String?,
    tags: [String],
    rarityRaw: UInt8
) {
    let recipient: &NFTMoment.Collection

    prepare(acct: auth(Storage) &Account) {
        // Get a reference to the recipient's collection
        self.recipient = acct.storage.borrow<&NFTMoment.Collection>(from: NFTMoment.CollectionStoragePath)
            ?? panic("Could not borrow collection reference. Make sure collection is initialized.")
    }

    execute {
        // Create location if coordinates provided
        let location: NFTMoment.Location? = latitude != nil && longitude != nil
            ? NFTMoment.Location(
                latitude: latitude!,
                longitude: longitude!,
                placeName: placeName,
                city: city,
                country: country
            )
            : nil

        // Create metadata
        let metadata = NFTMoment.MomentMetadata(
            title: title,
            description: description,
            category: NFTMoment.Category(rawValue: categoryRaw)!,
            imageURL: imageURL,
            thumbnailURL: thumbnailURL,
            timestamp: getCurrentBlock().timestamp,
            weather: weather,
            temperature: temperature,
            location: location,
            altitude: altitude,
            windSpeed: windSpeed,
            border: NFTMoment.BorderStyle(rawValue: borderRaw)!,
            sticker: NFTMoment.StickerStyle(rawValue: stickerRaw)!,
            filter: NFTMoment.FilterStyle(rawValue: filterRaw)!,
            audio: NFTMoment.AudioStyle(rawValue: audioRaw)!,
            javaneseText: javaneseText,
            tags: tags,
            attributes: {}
        )

        // Mint the NFT
        let rarity = NFTMoment.Rarity(rawValue: rarityRaw)!
        let nftId = NFTMoment.mintNFT(
            recipient: self.recipient,
            metadata: metadata,
            rarity: rarity
        )

        log("NFT minted with ID: ".concat(nftId.toString()))
    }
}

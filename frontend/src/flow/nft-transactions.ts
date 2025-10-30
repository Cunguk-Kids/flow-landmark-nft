// NFTMoment transactions

// Initialize user's collection
export const SETUP_COLLECTION = `
  import NFTMoment from 0x15728ff209769c63

  transaction {
    prepare(acct: auth(Storage, Capabilities) &Account) {
      if acct.storage.borrow<&NFTMoment.Collection>(from: NFTMoment.CollectionStoragePath) == nil {
        let collection <- NFTMoment.createEmptyCollection()
        acct.storage.save(<-collection, to: NFTMoment.CollectionStoragePath)

        acct.capabilities.unpublish(NFTMoment.CollectionPublicPath)
        let collectionCap = acct.capabilities.storage.issue<&NFTMoment.Collection>(
          NFTMoment.CollectionStoragePath
        )
        acct.capabilities.publish(collectionCap, at: NFTMoment.CollectionPublicPath)

        log("Collection created and initialized")
      } else {
        log("Collection already exists")
      }
    }
  }
`;

// Mint NFT with full metadata
export const MINT_NFT = `
  import NFTMoment from 0x15728ff209769c63

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
      self.recipient = acct.storage.borrow<&NFTMoment.Collection>(from: NFTMoment.CollectionStoragePath)
        ?? panic("Could not borrow collection reference. Make sure collection is initialized.")
    }

    execute {
      let location: NFTMoment.Location? = latitude != nil && longitude != nil
        ? NFTMoment.Location(
            latitude: latitude!,
            longitude: longitude!,
            placeName: placeName,
            city: city,
            country: country
          )
        : nil

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

      let rarity = NFTMoment.Rarity(rawValue: rarityRaw)!
      let nftId = NFTMoment.mintNFT(
        recipient: self.recipient,
        metadata: metadata,
        rarity: rarity
      )

      log("NFT minted with ID: ".concat(nftId.toString()))
    }
  }
`;

// Simplified mint transaction for quick testing
export const MINT_SIMPLE_NFT = `
  import NFTMoment from 0x15728ff209769c63

  transaction(
    title: String,
    description: String,
    categoryRaw: UInt8,
    imageURL: String
  ) {
    let recipient: &NFTMoment.Collection

    prepare(acct: auth(Storage) &Account) {
      self.recipient = acct.storage.borrow<&NFTMoment.Collection>(from: NFTMoment.CollectionStoragePath)
        ?? panic("Could not borrow collection reference. Make sure collection is initialized.")
    }

    execute {
      let metadata = NFTMoment.MomentMetadata(
        title: title,
        description: description,
        category: NFTMoment.Category(rawValue: categoryRaw)!,
        imageURL: imageURL,
        thumbnailURL: imageURL,
        timestamp: getCurrentBlock().timestamp,
        weather: nil,
        temperature: nil,
        location: nil,
        altitude: nil,
        windSpeed: nil,
        border: NFTMoment.BorderStyle.None,
        sticker: NFTMoment.StickerStyle.None,
        filter: NFTMoment.FilterStyle.None,
        audio: NFTMoment.AudioStyle.None,
        javaneseText: nil,
        tags: [],
        attributes: {}
      )

      let nftId = NFTMoment.mintNFT(
        recipient: self.recipient,
        metadata: metadata,
        rarity: NFTMoment.Rarity.Common
      )

      log("NFT minted with ID: ".concat(nftId.toString()))
    }
  }
`;

// Upgrade NFT rarity
export const UPGRADE_NFT = `
  import NFTMoment from 0x15728ff209769c63

  transaction(nftId: UInt64, newRarityRaw: UInt8) {
    let collection: &NFTMoment.Collection

    prepare(acct: auth(Storage) &Account) {
      self.collection = acct.storage.borrow<&NFTMoment.Collection>(from: NFTMoment.CollectionStoragePath)
        ?? panic("Could not borrow collection reference")
    }

    execute {
      let newRarity = NFTMoment.Rarity(rawValue: newRarityRaw)!
      NFTMoment.upgradeNFT(collection: self.collection, id: nftId, newRarity: newRarity)
      log("NFT ".concat(nftId.toString()).concat(" upgraded to rarity ").concat(newRarity.rawValue.toString()))
    }
  }
`;

// NFTMoment read-only scripts

// Get all NFT IDs owned by an address
export const GET_NFT_IDS = `
  import "NFTMoment"

  access(all) fun main(address: Address): [UInt64] {
    let account = getAccount(address)

    let collectionRef = account.capabilities.borrow<&NFTMoment.Collection>(
      NFTMoment.CollectionPublicPath
    )

    if collectionRef == nil {
      return []
    }

    return collectionRef!.getIDs()
  }
`;

// Get simple NFT info for display
export const GET_NFT_INFO = `
  import "NFTMoment"

  access(all) struct NFTInfo {
    access(all) let id: UInt64
    access(all) let title: String
    access(all) let description: String
    access(all) let imageURL: String
    access(all) let thumbnailURL: String
    access(all) let category: UInt8
    access(all) let rarity: UInt8
    access(all) let timestamp: UFix64
    access(all) let location: NFTMoment.Location?
    access(all) let javaneseText: String?
    access(all) let tags: [String]
    access(all) let upgradeCount: UInt64

    init(
      id: UInt64,
      title: String,
      description: String,
      imageURL: String,
      thumbnailURL: String,
      category: UInt8,
      rarity: UInt8,
      timestamp: UFix64,
      location: NFTMoment.Location?,
      javaneseText: String?,
      tags: [String],
      upgradeCount: UInt64
    ) {
      self.id = id
      self.title = title
      self.description = description
      self.imageURL = imageURL
      self.thumbnailURL = thumbnailURL
      self.category = category
      self.rarity = rarity
      self.timestamp = timestamp
      self.location = location
      self.javaneseText = javaneseText
      self.tags = tags
      self.upgradeCount = upgradeCount
    }
  }

  access(all) fun main(address: Address, id: UInt64): NFTInfo? {
    let account = getAccount(address)

    let collectionRef = account.capabilities.borrow<&NFTMoment.Collection>(
      NFTMoment.CollectionPublicPath
    )

    if collectionRef == nil {
      return nil
    }

    let nft = collectionRef!.borrowNFTMoment(id: id)
    if nft == nil {
      return nil
    }

    let metadata = nft!.metadata

    // Copy location if it exists
    var locationCopy: NFTMoment.Location? = nil
    if let loc = metadata.location {
      locationCopy = NFTMoment.Location(
        latitude: loc.latitude,
        longitude: loc.longitude,
        placeName: loc.placeName,
        city: loc.city,
        country: loc.country
      )
    }

    // Copy tags array
    let tagsCopy: [String] = []
    for tag in metadata.tags {
      tagsCopy.append(tag)
    }

    return NFTInfo(
      id: nft!.id,
      title: metadata.title,
      description: metadata.description,
      imageURL: metadata.imageURL,
      thumbnailURL: metadata.thumbnailURL,
      category: metadata.category.rawValue,
      rarity: nft!.rarity.rawValue,
      timestamp: metadata.timestamp,
      location: locationCopy,
      javaneseText: metadata.javaneseText,
      tags: tagsCopy,
      upgradeCount: nft!.upgradeCount
    )
  }
`;

// Check if user has collection initialized
export const CHECK_COLLECTION = `
  import "NFTMoment"

  access(all) fun main(address: Address): Bool {
    let account = getAccount(address)

    return account.capabilities.borrow<&NFTMoment.Collection>(
      NFTMoment.CollectionPublicPath
    ) != nil
  }
`;

// Get collection statistics
export const GET_COLLECTION_STATS = `
  import "NFTMoment"

  access(all) struct CollectionStats {
    access(all) let totalNFTs: Int
    access(all) let commonCount: Int
    access(all) let rareCount: Int
    access(all) let epicCount: Int
    access(all) let legendaryCount: Int

    init(
      totalNFTs: Int,
      commonCount: Int,
      rareCount: Int,
      epicCount: Int,
      legendaryCount: Int
    ) {
      self.totalNFTs = totalNFTs
      self.commonCount = commonCount
      self.rareCount = rareCount
      self.epicCount = epicCount
      self.legendaryCount = legendaryCount
    }
  }

  access(all) fun main(address: Address): CollectionStats {
    let account = getAccount(address)

    let collectionRef = account.capabilities.borrow<&NFTMoment.Collection>(
      NFTMoment.CollectionPublicPath
    )

    if collectionRef == nil {
      return CollectionStats(
        totalNFTs: 0,
        commonCount: 0,
        rareCount: 0,
        epicCount: 0,
        legendaryCount: 0
      )
    }

    let ids = collectionRef!.getIDs()
    var commonCount = 0
    var rareCount = 0
    var epicCount = 0
    var legendaryCount = 0

    for id in ids {
      let nft = collectionRef!.borrowNFTMoment(id: id)!

      switch nft.rarity {
        case NFTMoment.Rarity.Common:
          commonCount = commonCount + 1
        case NFTMoment.Rarity.Rare:
          rareCount = rareCount + 1
        case NFTMoment.Rarity.Epic:
          epicCount = epicCount + 1
        case NFTMoment.Rarity.Legendary:
          legendaryCount = legendaryCount + 1
      }
    }

    return CollectionStats(
      totalNFTs: ids.length,
      commonCount: commonCount,
      rareCount: rareCount,
      epicCount: epicCount,
      legendaryCount: legendaryCount
    )
  }
`;

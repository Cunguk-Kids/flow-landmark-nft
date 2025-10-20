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

  // Get full details for a specific NFT
  access(all) struct NFTDetails {
      access(all) let id: UInt64
      access(all) let metadata: &NFTMoment.MomentMetadata
      access(all) let rarity: UInt8
      access(all) let createdBy: Address
      access(all) let partnerAddress: Address?
      access(all) let upgradeCount: UInt64
      access(all) let mergedFrom: &[UInt64]

      init(
          id: UInt64,
          metadata: &NFTMoment.MomentMetadata,
          rarity: UInt8,
          createdBy: Address,
          partnerAddress: Address?,
          upgradeCount: UInt64,
          mergedFrom: &[UInt64]
      ) {
          self.id = id
          self.metadata = metadata
          self.rarity = rarity
          self.createdBy = createdBy
          self.partnerAddress = partnerAddress
          self.upgradeCount = upgradeCount
          self.mergedFrom = mergedFrom
      }
  }

  access(all) fun main(address: Address, id: UInt64): NFTDetails? {
      let account = getAccount(address)

      let collectionRef = account.capabilities.borrow<&NFTMoment.Collection>(
          NFTMoment.CollectionPublicPath
      ) ?? panic("Could not borrow collection reference")

      let nft = collectionRef.borrowNFT(id: id)
      if nft == nil {
          return nil
      }

      return NFTDetails(
          id: nft!.id,
          metadata: nft!.metadata,
          rarity: nft!.rarity.rawValue,
          createdBy: nft!.createdBy,
          partnerAddress: nft!.partnerAddress,
          upgradeCount: nft!.upgradeCount,
          mergedFrom: nft!.mergedFrom
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

import "NFTMoment"

// Get full details for a specific NFT
access(all) struct NFTDetails {
    access(all) let id: UInt64
    access(all) let metadata: NFTMoment.MomentMetadata
    access(all) let rarity: UInt8
    access(all) let createdBy: Address
    access(all) let partnerAddress: Address?
    access(all) let upgradeCount: UInt64
    access(all) let mergedFrom: [UInt64]

    init(
        id: UInt64,
        metadata: NFTMoment.MomentMetadata,
        rarity: UInt8,
        createdBy: Address,
        partnerAddress: Address?,
        upgradeCount: UInt64,
        mergedFrom: [UInt64]
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

import "NFTMoment"

// Get simple NFT info
access(all) fun main(address: Address, id: UInt64): String {
    let account = getAccount(address)

    let collectionRef = account.capabilities.borrow<&NFTMoment.Collection>(
        NFTMoment.CollectionPublicPath
    ) ?? panic("Could not borrow collection reference")

    let nft = collectionRef.borrowNFT(id: id)
    if nft == nil {
        return "NFT not found"
    }

    let metadata = nft!.metadata
    return "NFT #".concat(id.toString())
        .concat(": ")
        .concat(metadata.title)
        .concat(" - ")
        .concat(metadata.description)
        .concat(" (")
        .concat(metadata.category.rawValue.toString())
        .concat(", Rarity: ")
        .concat(nft!.rarity.rawValue.toString())
        .concat(")")
}

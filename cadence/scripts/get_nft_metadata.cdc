import "NFTMoment"
import "NonFungibleToken"

// Get metadata for a specific NFT
access(all) fun main(address: Address, id: UInt64): NFTMoment.MomentMetadata? {
    let account = getAccount(address)

    let collectionRef = account.capabilities.borrow<&NFTMoment.Collection>(
        NFTMoment.CollectionPublicPath
    ) ?? panic("Could not borrow collection reference")

    let nft = collectionRef.borrowNFTMoment(id: id)
    if nft == nil {
        return nil
    }

    return nft!.metadata
}

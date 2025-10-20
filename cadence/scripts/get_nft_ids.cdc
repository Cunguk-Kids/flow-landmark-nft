import "NFTMoment"

// Get all NFT IDs owned by an account
access(all) fun main(address: Address): [UInt64] {
    let account = getAccount(address)

    let collectionRef = account.capabilities.borrow<&NFTMoment.Collection>(
        NFTMoment.CollectionPublicPath
    ) ?? panic("Could not borrow collection reference")

    return collectionRef.getIDs()
}

package script

const GetNFTDetailScriptTemplate = `
import EventPlatform from 0x15728ff209769c63

import NFTMoment from 0x15728ff209769c63 // Replace 0x06 with your NFTMoment contract address

// Struct to hold the NFT details (mirroring the NFT resource fields)
access(all) struct NFTDetails {
    access(all) let id: UInt64
    access(all) let metadata: &NFTMoment.MomentMetadata
    access(all) let rarity: NFTMoment.Rarity
    access(all) let createdBy: Address
    access(all) let partnerAddress: Address?
    access(all) let upgradeCount: UInt64
    access(all) let mergedFrom: &[UInt64]
    access(all) let eventId: UInt64

    // Initialize the struct using a reference to the actual NFT
    init(nftRef: &NFTMoment.NFT) {
        self.id = nftRef.id
        self.metadata = nftRef.metadata
        self.rarity = nftRef.rarity
        self.createdBy = nftRef.createdBy
        self.partnerAddress = nftRef.partnerAddress
        self.upgradeCount = nftRef.upgradeCount
        self.mergedFrom = nftRef.mergedFrom
        self.eventId = nftRef.eventId
    }
}

// Arguments:
// - ownerAddress: The address of the account holding the NFT
// - nftID: The ID of the NFT to query
// Returns: The NFTDetails struct, or nil if the NFT is not found
access(all) fun main(ownerAddress: Address, nftID: UInt64): NFTDetails? {

    // 1. Get the public capability for the owner's collection
    let collectionCap = getAccount(ownerAddress)
        .capabilities.get<&{NFTMoment.CollectionPublic}>(
            NFTMoment.CollectionPublicPath
        )

    // 2. Borrow a reference to the collection
    let collectionRef = collectionCap.borrow()
        ?? panic("Could not borrow reference to NFT Collection")

    // 3. Borrow a reference to the specific NFT
    // We borrow the full &NFT type to access all fields
    let nftRef = collectionRef.borrowNFT(id: nftID)
        ?? nil // Return nil if the NFT is not found in the collection

    // 4. If the NFT reference exists, create and return the details struct
    if nftRef != nil {
        return NFTDetails(nftRef: nftRef!)
    }

    // 5. If the NFT was not found, return nil
    return nil
}
`

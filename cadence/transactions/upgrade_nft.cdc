import "NFTMoment"
import "NonFungibleToken"

// Upgrade an NFT to a higher rarity
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

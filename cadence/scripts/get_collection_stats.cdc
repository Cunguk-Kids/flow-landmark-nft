import "NFTMoment"
import "NonFungibleToken"

// Get collection statistics for an account
access(all) struct CollectionStats {
    access(all) let totalNFTs: Int
    access(all) let commonCount: Int
    access(all) let rareCount: Int
    access(all) let epicCount: Int
    access(all) let legendaryCount: Int
    access(all) let categoryCounts: {String: Int}

    init(
        totalNFTs: Int,
        commonCount: Int,
        rareCount: Int,
        epicCount: Int,
        legendaryCount: Int,
        categoryCounts: {String: Int}
    ) {
        self.totalNFTs = totalNFTs
        self.commonCount = commonCount
        self.rareCount = rareCount
        self.epicCount = epicCount
        self.legendaryCount = legendaryCount
        self.categoryCounts = categoryCounts
    }
}

access(all) fun main(address: Address): CollectionStats {
    let account = getAccount(address)

    let collectionRef = account.capabilities.borrow<&NFTMoment.Collection>(
        NFTMoment.CollectionPublicPath
    ) ?? panic("Could not borrow collection reference")

    let ids = collectionRef.getIDs()
    var commonCount = 0
    var rareCount = 0
    var epicCount = 0
    var legendaryCount = 0
    let categoryCounts: {String: Int} = {}

    for id in ids {
        let nft = collectionRef.borrowNFTMoment(id: id)!

        // Count by rarity
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

        // Count by category
        let categoryName = nft.metadata.category.rawValue.toString()
        if categoryCounts[categoryName] == nil {
            categoryCounts[categoryName] = 0
        }
        categoryCounts[categoryName] = categoryCounts[categoryName]! + 1
    }

    return CollectionStats(
        totalNFTs: ids.length,
        commonCount: commonCount,
        rareCount: rareCount,
        epicCount: epicCount,
        legendaryCount: legendaryCount,
        categoryCounts: categoryCounts
    )
}

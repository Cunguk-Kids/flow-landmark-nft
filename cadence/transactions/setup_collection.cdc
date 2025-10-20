import "NFTMoment"

// Initialize a user's NFT collection
transaction {
    prepare(acct: auth(Storage, Capabilities) &Account) {
        // Check if collection already exists
        if acct.storage.borrow<&NFTMoment.Collection>(from: NFTMoment.CollectionStoragePath) == nil {
            // Create a new empty collection
            let collection <- NFTMoment.createEmptyCollection()

            // Save it to storage
            acct.storage.save(<-collection, to: NFTMoment.CollectionStoragePath)

            // Create a public capability for the collection
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

    execute {
        log("NFT collection setup complete")
    }
}

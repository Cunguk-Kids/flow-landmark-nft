/// This transaction is what an account would run but will be fixed when release
/// because the code still hardcode and there is wild return

import "NonFungibleToken"
import "NFTMoment"
import "NFTAccessory"
import "UserProfile"
import "EventPass"
import "MetadataViews"

transaction {

    prepare(signer: auth(BorrowValue, IssueStorageCapabilityController, PublishCapability, SaveValue, UnpublishCapability, LoadValue) &Account) {
        
        // --- NFT Moment ---
        let collectionNFTMomentData = NFTMoment.resolveContractView(resourceType: nil, viewType: Type<MetadataViews.NFTCollectionData>()) as! MetadataViews.NFTCollectionData?
            ?? panic("Could not resolve NFTCollectionData view. The NFTMoment contract needs to implement the NFTCollectionData Metadata view in order to execute this transaction")

        // 1. Check if storage has something but it's the WRONG type (e.g. old contract)
        if signer.storage.type(at: collectionNFTMomentData.storagePath) != nil && !signer.storage.check<@NFTMoment.Collection>(from: collectionNFTMomentData.storagePath) {
            let old <- signer.storage.load<@AnyResource>(from: collectionNFTMomentData.storagePath)
            destroy old
        }

        // 2. If nothing is there (or we just destroyed it), create new
        if signer.storage.type(at: collectionNFTMomentData.storagePath) == nil {
            let collectionNFTMoment <- NFTMoment.createEmptyCollection(nftType: Type<@NFTMoment.NFT>())
            signer.storage.save(<-collectionNFTMoment, to: collectionNFTMomentData.storagePath)
        }

        // 3. Refresh Capabilities (Unpublish then Publish)
        signer.capabilities.unpublish(collectionNFTMomentData.publicPath)
        let collectionNFTMomentCap = signer.capabilities.storage.issue<&NFTMoment.Collection>(collectionNFTMomentData.storagePath)
        signer.capabilities.publish(collectionNFTMomentCap, at: collectionNFTMomentData.publicPath)


        // --- NFT Accessory ---
        let collectionNFTAccessoryData = NFTAccessory.resolveContractView(resourceType: nil, viewType: Type<MetadataViews.NFTCollectionData>()) as! MetadataViews.NFTCollectionData?
            ?? panic("Could not resolve NFTCollectionData view. The NFTAccessory contract needs to implement the NFTCollectionData Metadata view in order to execute this transaction")

        if signer.storage.type(at: collectionNFTAccessoryData.storagePath) != nil && !signer.storage.check<@NFTAccessory.Collection>(from: collectionNFTAccessoryData.storagePath) {
            let old <- signer.storage.load<@AnyResource>(from: collectionNFTAccessoryData.storagePath)
            destroy old
        }

        if signer.storage.type(at: collectionNFTAccessoryData.storagePath) == nil {
            let collectionNFTAccessory <- NFTAccessory.createEmptyCollection(nftType: Type<@NFTAccessory.NFT>())
            signer.storage.save(<-collectionNFTAccessory, to: collectionNFTAccessoryData.storagePath)
        }

        signer.capabilities.unpublish(collectionNFTAccessoryData.publicPath)
        let collectionNFTAccessoryCap = signer.capabilities.storage.issue<&NFTAccessory.Collection>(collectionNFTAccessoryData.storagePath)
        signer.capabilities.publish(collectionNFTAccessoryCap, at: collectionNFTAccessoryData.publicPath)


        // --- Event Pass ---
        let collectionEventPassData = EventPass.resolveContractView(resourceType: nil, viewType: Type<MetadataViews.NFTCollectionData>()) as! MetadataViews.NFTCollectionData?
            ?? panic("Could not resolve NFTCollectionData view. The EventPass contract needs to implement the NFTCollectionData Metadata view in order to execute this transaction")

        if signer.storage.type(at: collectionEventPassData.storagePath) != nil && !signer.storage.check<@EventPass.Collection>(from: collectionEventPassData.storagePath) {
            let old <- signer.storage.load<@AnyResource>(from: collectionEventPassData.storagePath)
            destroy old
        }

        if signer.storage.type(at: collectionEventPassData.storagePath) == nil {
            let collectionEventPass <- EventPass.createEmptyCollection(nftType: Type<@EventPass.NFT>())
            signer.storage.save(<-collectionEventPass, to: collectionEventPassData.storagePath)
        }

        signer.capabilities.unpublish(collectionEventPassData.publicPath)
        let collectionEventPassCap = signer.capabilities.storage.issue<&EventPass.Collection>(collectionEventPassData.storagePath)
        signer.capabilities.publish(collectionEventPassCap, at: collectionEventPassData.publicPath)


        // --- User Profile ---
        // Check if profile exists and is correct type
        if signer.storage.type(at: UserProfile.ProfileStoragePath) != nil && !signer.storage.check<@UserProfile.Profile>(from: UserProfile.ProfileStoragePath) {
             let old <- signer.storage.load<@AnyResource>(from: UserProfile.ProfileStoragePath)
             destroy old
        }

        if signer.storage.type(at: UserProfile.ProfileStoragePath) == nil {
            let profile: @UserProfile.Profile <- UserProfile.createEmptyProfile()
            signer.storage.save(<-profile, to: UserProfile.ProfileStoragePath)
        }

        signer.capabilities.unpublish(UserProfile.ProfilePublicPath)
        let userProfileCap = signer.capabilities.storage.issue<&UserProfile.Profile>(UserProfile.ProfileStoragePath)
        signer.capabilities.publish(userProfileCap, at: UserProfile.ProfilePublicPath)
    }
}
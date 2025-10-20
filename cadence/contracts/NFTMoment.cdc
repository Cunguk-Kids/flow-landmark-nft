// Simplified NFTMoment contract without external dependencies
access(all) contract NFTMoment {

    // ========================================
    // Events
    // ========================================

    access(all) event ContractInitialized()
    access(all) event Withdraw(id: UInt64, from: Address?)
    access(all) event Deposit(id: UInt64, to: Address?)
    access(all) event MomentMinted(id: UInt64, owner: Address, category: String, rarity: String)
    access(all) event MomentUpgraded(id: UInt64, newRarity: String)
    access(all) event MomentsMerged(id1: UInt64, id2: UInt64, newId: UInt64)
    access(all) event PartnerAdded(address: Address, name: String)
    access(all) event AchievementUnlocked(address: Address, achievement: String)

    // ========================================
    // Paths
    // ========================================

    access(all) let CollectionStoragePath: StoragePath
    access(all) let CollectionPublicPath: PublicPath
    access(all) let AdminStoragePath: StoragePath
    access(all) let PartnerStoragePath: StoragePath

    // ========================================
    // Contract State
    // ========================================

    access(all) var totalSupply: UInt64
    access(contract) var partners: {Address: PartnerInfo}

    // ========================================
    // Enums
    // ========================================

    access(all) enum Rarity: UInt8 {
        access(all) case Common
        access(all) case Rare
        access(all) case Epic
        access(all) case Legendary
    }

    access(all) enum Category: UInt8 {
        access(all) case Landscape
        access(all) case Cultural
        access(all) case Event
        access(all) case Historical
        access(all) case Nature
        access(all) case Urban
        access(all) case Food
        access(all) case Art
    }

    access(all) enum BorderStyle: UInt8 {
        access(all) case None
        access(all) case Batik
        access(all) case Wayang
        access(all) case Songket
        access(all) case Tenun
    }

    access(all) enum StickerStyle: UInt8 {
        access(all) case None
        access(all) case JavaneseScript
        access(all) case TraditionalPattern
        access(all) case CulturalIcon
    }

    access(all) enum FilterStyle: UInt8 {
        access(all) case None
        access(all) case Vintage
        access(all) case Cultural
        access(all) case Vibrant
    }

    access(all) enum AudioStyle: UInt8 {
        access(all) case None
        access(all) case Gamelan
        access(all) case Angklung
        access(all) case Kendang
    }

    // ========================================
    // Structs
    // ========================================

    access(all) struct MomentMetadata {
        access(all) let title: String
        access(all) let description: String
        access(all) let category: Category
        access(all) let imageURL: String
        access(all) let thumbnailURL: String

        // Auto-captured metadata
        access(all) let timestamp: UFix64
        access(all) let weather: String?
        access(all) let temperature: String?
        access(all) let location: Location?
        access(all) let altitude: String?
        access(all) let windSpeed: String?

        // Cultural customization
        access(all) let border: BorderStyle
        access(all) let sticker: StickerStyle
        access(all) let filter: FilterStyle
        access(all) let audio: AudioStyle
        access(all) let javaneseText: String?

        // Additional metadata
        access(all) let tags: [String]
        access(all) let attributes: {String: String}

        init(
            title: String,
            description: String,
            category: Category,
            imageURL: String,
            thumbnailURL: String,
            timestamp: UFix64,
            weather: String?,
            temperature: String?,
            location: Location?,
            altitude: String?,
            windSpeed: String?,
            border: BorderStyle,
            sticker: StickerStyle,
            filter: FilterStyle,
            audio: AudioStyle,
            javaneseText: String?,
            tags: [String],
            attributes: {String: String}
        ) {
            self.title = title
            self.description = description
            self.category = category
            self.imageURL = imageURL
            self.thumbnailURL = thumbnailURL
            self.timestamp = timestamp
            self.weather = weather
            self.temperature = temperature
            self.location = location
            self.altitude = altitude
            self.windSpeed = windSpeed
            self.border = border
            self.sticker = sticker
            self.filter = filter
            self.audio = audio
            self.javaneseText = javaneseText
            self.tags = tags
            self.attributes = attributes
        }
    }

    access(all) struct Location {
        access(all) let latitude: String
        access(all) let longitude: String
        access(all) let placeName: String?
        access(all) let city: String?
        access(all) let country: String?

        init(latitude: String, longitude: String, placeName: String?, city: String?, country: String?) {
            self.latitude = latitude
            self.longitude = longitude
            self.placeName = placeName
            self.city = city
            self.country = country
        }
    }

    access(all) struct PartnerInfo {
        access(all) let name: String
        access(all) let description: String
        access(all) let address: Address
        access(all) let allowedCategories: [Category]
        access(all) let location: Location?
        access(all) let radius: UFix64? // in meters for geo-fencing
        access(all) let qrCodeEnabled: Bool
        access(all) let eventBased: Bool
        access(all) let eventStartTime: UFix64?
        access(all) let eventEndTime: UFix64?

        init(
            name: String,
            description: String,
            address: Address,
            allowedCategories: [Category],
            location: Location?,
            radius: UFix64?,
            qrCodeEnabled: Bool,
            eventBased: Bool,
            eventStartTime: UFix64?,
            eventEndTime: UFix64?
        ) {
            self.name = name
            self.description = description
            self.address = address
            self.allowedCategories = allowedCategories
            self.location = location
            self.radius = radius
            self.qrCodeEnabled = qrCodeEnabled
            self.eventBased = eventBased
            self.eventStartTime = eventStartTime
            self.eventEndTime = eventEndTime
        }
    }

    // ========================================
    // Interfaces
    // ========================================

    access(all) resource interface NFTPublic {
        access(all) let id: UInt64
        access(all) let metadata: MomentMetadata
        access(all) var rarity: Rarity
        access(all) let createdBy: Address
        access(all) let partnerAddress: Address?
        access(all) var upgradeCount: UInt64
        access(all) var mergedFrom: [UInt64]
    }

    access(all) resource interface CollectionPublic {
        access(all) fun getIDs(): [UInt64]
        access(all) fun borrowNFT(id: UInt64): &NFT?
        access(all) fun deposit(token: @NFT)
    }

    // ========================================
    // NFT Resource
    // ========================================

    access(all) resource NFT: NFTPublic {
        access(all) let id: UInt64
        access(all) let metadata: MomentMetadata
        access(all) var rarity: Rarity
        access(all) let createdBy: Address
        access(all) let partnerAddress: Address?
        access(all) var upgradeCount: UInt64
        access(all) var mergedFrom: [UInt64]

        init(
            id: UInt64,
            metadata: MomentMetadata,
            rarity: Rarity,
            createdBy: Address,
            partnerAddress: Address?
        ) {
            self.id = id
            self.metadata = metadata
            self.rarity = rarity
            self.createdBy = createdBy
            self.partnerAddress = partnerAddress
            self.upgradeCount = 0
            self.mergedFrom = []
        }

        // Upgrade the rarity of this NFT
        access(contract) fun upgrade(newRarity: Rarity) {
            pre {
                newRarity.rawValue > self.rarity.rawValue: "New rarity must be higher than current"
            }
            self.rarity = newRarity
            self.upgradeCount = self.upgradeCount + 1
        }

        // Add merged NFT ID to history
        access(contract) fun addMergedNFT(id: UInt64) {
            self.mergedFrom.append(id)
        }
    }

    // ========================================
    // Collection Resource
    // ========================================

    access(all) resource Collection: CollectionPublic {
        access(all) var ownedNFTs: @{UInt64: NFT}

        init() {
            self.ownedNFTs <- {}
        }

        access(all) fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        access(all) fun borrowNFT(id: UInt64): &NFT? {
            if self.ownedNFTs[id] != nil {
                return &self.ownedNFTs[id] as &NFT?
            }
            return nil
        }

        access(all) fun withdraw(withdrawID: UInt64): @NFT {
            let token <- self.ownedNFTs.remove(key: withdrawID)
                ?? panic("NFT not found in collection")

            emit Withdraw(id: token.id, from: self.owner?.address)
            return <- token
        }

        access(all) fun deposit(token: @NFT) {
            let id = token.id

            let oldToken <- self.ownedNFTs[id] <- token
            destroy oldToken

            emit Deposit(id: id, to: self.owner?.address)
        }

        // Get NFTs by category
        access(all) fun getNFTsByCategory(category: Category): [UInt64] {
            let ids: [UInt64] = []
            for id in self.ownedNFTs.keys {
                let nft = self.borrowNFT(id: id)
                if nft != nil && nft!.metadata.category == category {
                    ids.append(id)
                }
            }
            return ids
        }

        // Get NFTs by rarity
        access(all) fun getNFTsByRarity(rarity: Rarity): [UInt64] {
            let ids: [UInt64] = []
            for id in self.ownedNFTs.keys {
                let nft = self.borrowNFT(id: id)
                if nft != nil && nft!.rarity == rarity {
                    ids.append(id)
                }
            }
            return ids
        }
    }

    // ========================================
    // Admin Resource
    // ========================================

    access(all) resource Admin {

        // Add a partner
        access(all) fun addPartner(
            address: Address,
            name: String,
            description: String,
            allowedCategories: [Category],
            location: Location?,
            radius: UFix64?,
            qrCodeEnabled: Bool,
            eventBased: Bool,
            eventStartTime: UFix64?,
            eventEndTime: UFix64?
        ) {
            let partnerInfo = PartnerInfo(
                name: name,
                description: description,
                address: address,
                allowedCategories: allowedCategories,
                location: location,
                radius: radius,
                qrCodeEnabled: qrCodeEnabled,
                eventBased: eventBased,
                eventStartTime: eventStartTime,
                eventEndTime: eventEndTime
            )
            NFTMoment.partners[address] = partnerInfo
            emit PartnerAdded(address: address, name: name)
        }

        // Remove a partner
        access(all) fun removePartner(address: Address) {
            NFTMoment.partners.remove(key: address)
        }

        // Create Partner capability
        access(all) fun createPartner(): @Partner {
            return <- create Partner()
        }
    }

    // ========================================
    // Partner Resource
    // ========================================

    access(all) resource Partner {

        // Mint NFT as partner (with restrictions)
        access(all) fun mintPartnerNFT(
            recipient: &Collection,
            metadata: MomentMetadata,
            rarity: Rarity,
            partnerAddress: Address
        ): UInt64 {
            pre {
                NFTMoment.partners[partnerAddress] != nil: "Partner not registered"
            }

            let partnerInfo = NFTMoment.partners[partnerAddress]!

            // Validate category is allowed for this partner
            assert(
                partnerInfo.allowedCategories.contains(metadata.category),
                message: "Category not allowed for this partner"
            )

            // Validate event timing if event-based
            if partnerInfo.eventBased {
                let now = getCurrentBlock().timestamp
                if partnerInfo.eventStartTime != nil {
                    assert(now >= partnerInfo.eventStartTime!, message: "Event has not started yet")
                }
                if partnerInfo.eventEndTime != nil {
                    assert(now <= partnerInfo.eventEndTime!, message: "Event has ended")
                }
            }

            let nft <- create NFT(
                id: NFTMoment.totalSupply,
                metadata: metadata,
                rarity: rarity,
                createdBy: recipient.owner!.address,
                partnerAddress: partnerAddress
            )

            let id = nft.id
            NFTMoment.totalSupply = NFTMoment.totalSupply + 1

            emit MomentMinted(
                id: id,
                owner: recipient.owner!.address,
                category: metadata.category.rawValue.toString(),
                rarity: rarity.rawValue.toString()
            )

            recipient.deposit(token: <- nft)
            return id
        }
    }

    // ========================================
    // Public Functions
    // ========================================

    // Create empty collection
    access(all) fun createEmptyCollection(): @Collection {
        return <- create Collection()
    }

    // Mint NFT (public minting for users)
    access(all) fun mintNFT(
        recipient: &Collection,
        metadata: MomentMetadata,
        rarity: Rarity
    ): UInt64 {
        let nft <- create NFT(
            id: self.totalSupply,
            metadata: metadata,
            rarity: rarity,
            createdBy: recipient.owner!.address,
            partnerAddress: nil
        )

        let id = nft.id
        self.totalSupply = self.totalSupply + 1

        emit MomentMinted(
            id: id,
            owner: recipient.owner!.address,
            category: metadata.category.rawValue.toString(),
            rarity: rarity.rawValue.toString()
        )

        recipient.deposit(token: <- nft)
        return id
    }

    // Upgrade NFT rarity
    access(all) fun upgradeNFT(collection: &Collection, id: UInt64, newRarity: Rarity) {
        let nft = collection.borrowNFT(id: id) ?? panic("NFT not found")
        nft.upgrade(newRarity: newRarity)
        emit MomentUpgraded(id: id, newRarity: newRarity.rawValue.toString())
    }

    // Merge two NFTs into one (burns the source NFTs, creates new one)
    access(all) fun mergeNFTs(
        collection: &Collection,
        id1: UInt64,
        id2: UInt64,
        newMetadata: MomentMetadata,
        newRarity: Rarity
    ): UInt64 {
        // Withdraw both NFTs
        let nft1 <- collection.withdraw(withdrawID: id1)
        let nft2 <- collection.withdraw(withdrawID: id2)

        // Create new merged NFT
        let mergedNFT <- create NFT(
            id: self.totalSupply,
            metadata: newMetadata,
            rarity: newRarity,
            createdBy: collection.owner!.address,
            partnerAddress: nil
        )

        // Track merge history
        mergedNFT.addMergedNFT(id: id1)
        mergedNFT.addMergedNFT(id: id2)

        let newId = mergedNFT.id
        self.totalSupply = self.totalSupply + 1

        emit MomentsMerged(id1: id1, id2: id2, newId: newId)

        // Deposit merged NFT
        collection.deposit(token: <- mergedNFT)

        // Destroy old NFTs
        destroy nft1
        destroy nft2

        return newId
    }

    // Get partner info
    access(all) fun getPartnerInfo(address: Address): PartnerInfo? {
        return self.partners[address]
    }

    // Get all partners
    access(all) fun getAllPartners(): {Address: PartnerInfo} {
        return self.partners
    }

    // Get total supply
    access(all) fun getTotalSupply(): UInt64 {
        return self.totalSupply
    }

    // ========================================
    // Contract Init
    // ========================================

    init() {
        self.totalSupply = 0
        self.partners = {}

        // Set paths
        self.CollectionStoragePath = /storage/NFTMomentCollection
        self.CollectionPublicPath = /public/NFTMomentCollection
        self.AdminStoragePath = /storage/NFTMomentAdmin
        self.PartnerStoragePath = /storage/NFTMomentPartner

        // Create Admin resource and save it
        let admin <- create Admin()
        self.account.storage.save(<- admin, to: self.AdminStoragePath)

        emit ContractInitialized()
    }
}

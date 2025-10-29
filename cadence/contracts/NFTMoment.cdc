// NFTMoment.cdc
access(all) contract NFTMoment {

    // ========================================
    // Events
    // ========================================
    access(all) event ContractInitialized()
    access(all) event Withdraw(id: UInt64, from: Address?)
    access(all) event Deposit(id: UInt64, to: Address?)
    access(all) event MomentMinted(id: UInt64, owner: Address, category: String, rarity: String, eventId: UInt64)
    access(all) event MomentUpgraded(id: UInt64, newRarity: String)
    access(all) event MomentsMerged(id1: UInt64, id2: UInt64, newId: UInt64)
    access(all) event PartnerAdded(address: Address, name: String, description: String, email: String, image: String)
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
    // Utility functions: enum -> String
    // ========================================
    access(all) fun rarityToString(r: Rarity): String {
        switch r {
            case Rarity.Common: return "Common"
            case Rarity.Rare: return "Rare"
            case Rarity.Epic: return "Epic"
            case Rarity.Legendary: return "Legendary"
            default: return "Unknown"
        }
    }

    access(all) fun categoryToString(c: Category): String {
        switch c {
            case Category.Landscape: return "Landscape"
            case Category.Cultural: return "Cultural"
            case Category.Event: return "Event"
            case Category.Historical: return "Historical"
            case Category.Nature: return "Nature"
            case Category.Urban: return "Urban"
            case Category.Food: return "Food"
            case Category.Art: return "Art"
            default: return "Unknown"
        }
    }

    access(all) fun borderToString(b: BorderStyle): String {
        switch b {
            case BorderStyle.None: return "None"
            case BorderStyle.Batik: return "Batik"
            case BorderStyle.Wayang: return "Wayang"
            case BorderStyle.Songket: return "Songket"
            case BorderStyle.Tenun: return "Tenun"
            default: return "Unknown"
        }
    }

    access(all) fun stickerToString(s: StickerStyle): String {
        switch s {
            case StickerStyle.None: return "None"
            case StickerStyle.JavaneseScript: return "JavaneseScript"
            case StickerStyle.TraditionalPattern: return "TraditionalPattern"
            case StickerStyle.CulturalIcon: return "CulturalIcon"
            default: return "Unknown"
        }
    }

    access(all) fun filterToString(f: FilterStyle): String {
        switch f {
            case FilterStyle.None: return "None"
            case FilterStyle.Vintage: return "Vintage"
            case FilterStyle.Cultural: return "Cultural"
            case FilterStyle.Vibrant: return "Vibrant"
            default: return "Unknown"
        }
    }

    access(all) fun audioToString(a: AudioStyle): String {
        switch a {
            case AudioStyle.None: return "None"
            case AudioStyle.Gamelan: return "Gamelan"
            case AudioStyle.Angklung: return "Angklung"
            case AudioStyle.Kendang: return "Kendang"
            default: return "Unknown"
        }
    }

    // ========================================
    // Structs
    // ========================================
    access(all) struct Location {
        access(all) let placeName: String?
        access(all) let city: String?
        access(all) let country: String?
        access(all) let latitude: Fix64
        access(all) let longitude: Fix64

        init(latitude: Fix64, longitude: Fix64, placeName: String?, city: String?, country: String?) {
            self.latitude = latitude
            self.longitude = longitude
            self.placeName = placeName
            self.city = city
            self.country = country
        }
    }

    access(all) struct MomentMetadata {
        access(all) let title: String
        access(all) let description: String
        access(all) let category: Category
        access(all) let imageURL: String
        access(all) let thumbnailURL: String?
        access(all) let timestamp: UFix64
        access(all) let weather: String?
        access(all) let temperature: String?
        access(all) let location: Location?
        access(all) let altitude: String?
        access(all) let windSpeed: String?
        access(all) let border: BorderStyle?
        access(all) let sticker: StickerStyle?
        access(all) let filter: FilterStyle?
        access(all) let audio: AudioStyle?
        access(all) let javaneseText: String?
        access(all) let tags: [String]?
        access(all) let attributes: {String: String}?

        init(
            title: String,
            description: String,
            category: Category,
            imageURL: String,
            thumbnailURL: String?,
            timestamp: UFix64,
            weather: String?,
            temperature: String?,
            location: Location?,
            altitude: String?,
            windSpeed: String?,
            border: BorderStyle,
            sticker: StickerStyle?,
            filter: FilterStyle?,
            audio: AudioStyle?,
            javaneseText: String?,
            tags: [String]?,
            attributes: {String: String}?
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

    access(all) struct PartnerInfo {
        access(all) let name: String
        access(all) let description: String
        access(all) let address: Address
        access(all) let email: String
        access(all) let image: String

        init(
            name: String,
            description: String,
            address: Address,
            email: String,
            image: String,
        ) {
            self.name = name
            self.description = description
            self.address = address
            self.email = email
            self.image = image
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
        access(all) var eventId: UInt64
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
        access(all) var eventId: UInt64

        init(
            id: UInt64,
            metadata: MomentMetadata,
            rarity: Rarity,
            createdBy: Address,
            partnerAddress: Address?,
            eventId: UInt64
        ) {
            self.id = id
            self.metadata = metadata
            self.rarity = rarity
            self.createdBy = createdBy
            self.partnerAddress = partnerAddress
            self.upgradeCount = 0
            self.mergedFrom = []
            self.eventId = eventId
        }

        access(contract) fun upgrade(newRarity: Rarity) {
            pre { newRarity.rawValue > self.rarity.rawValue: "New rarity must be higher than current" }
            self.rarity = newRarity
            self.upgradeCount = self.upgradeCount + 1
        }

        access(contract) fun addMergedNFT(id: UInt64) {
            self.mergedFrom.append(id)
        }
    }

    // ========================================
    // Collection Resource
    // ========================================
    access(all) resource Collection: CollectionPublic {
        access(all) var ownedNFTs: @{UInt64: NFT}
        access(all) let ownerAddress: Address

        init(ownerAddress: Address) {
            self.ownedNFTs <- {}
            self.ownerAddress = ownerAddress
        }

        access(all) fun getIDs(): [UInt64] { return self.ownedNFTs.keys }

        access(all) fun borrowNFT(id: UInt64): &NFT? {
            if self.ownedNFTs[id] != nil { return &self.ownedNFTs[id] }
            return nil
        }

        access(all) fun withdraw(withdrawID: UInt64): @NFT {
            let token <- self.ownedNFTs.remove(key: withdrawID) ?? panic("NFT not found")
            emit Withdraw(id: token.id, from: self.ownerAddress)
            return <- token
        }

        access(all) fun deposit(token: @NFT) {
            let id = token.id
            var oldTokenOpt <- self.ownedNFTs.remove(key: id)
            self.ownedNFTs[id] <-! token
            if let old <- oldTokenOpt { destroy old }
            emit Deposit(id: id, to: self.ownerAddress)
        }
    }

    // ========================================
    // Admin Resource
    // ========================================
    access(all) resource Admin {

        access(all) fun addPartner(
            address: Address,
            name: String,
            description: String,
            email: String,
            image: String,
        ) {
            let partnerInfo = PartnerInfo(
                name: name,
                description: description,
                address: address,
                email: email,
                image: image
            )
            NFTMoment.partners[address] = partnerInfo
            emit PartnerAdded(address: address, name: name, description: description, email: email, image: image)
        }

        access(all) fun removePartner(address: Address) {
            NFTMoment.partners.remove(key: address)
        }

        access(all) fun createPartner(): @Partner { return <- create Partner() }
    }

    // ========================================
    // Partner Resource
    // ========================================
    access(all) resource Partner {

        access(all) fun mintPartnerNFT(
            recipient: &Collection,
            metadata: MomentMetadata,
            rarity: Rarity,
            partnerAddress: Address,
            eventId: UInt64
        ): UInt64 {
            pre { NFTMoment.partners[partnerAddress] != nil: "Partner not registered" }

            let partnerInfo = NFTMoment.partners[partnerAddress]!

            let id = NFTMoment.totalSupply
            NFTMoment.totalSupply = NFTMoment.totalSupply + 1

            let nft <- create NFT(
                id: id,
                metadata: metadata,
                rarity: rarity,
                createdBy: recipient.ownerAddress,
                partnerAddress: partnerAddress,
                eventId: eventId
            )

            emit MomentMinted(
                id: id,
                owner: recipient.ownerAddress,
                category: NFTMoment.categoryToString(c: metadata.category),
                rarity: NFTMoment.rarityToString(r: rarity),
                eventId: eventId
            )

            recipient.deposit(token: <- nft)
            return id
        }
    }

    // ========================================
    // Public Functions
    // ========================================
    access(all) fun createEmptyCollection(ownerAddress: Address): @Collection {
        return <- create Collection(ownerAddress: ownerAddress)
    }

    access(all) fun getPartnerInfo(address: Address): PartnerInfo? { return self.partners[address] }
    access(all) fun getAllPartners(): {Address: PartnerInfo} { return self.partners }
    access(all) fun getTotalSupply(): UInt64 { return self.totalSupply }

    // ========================================
    // Contract Init
    // ========================================
    init() {
        self.totalSupply = 0
        self.partners = {}

        // Definisikan Path DULU
        self.CollectionStoragePath = /storage/NFTMomentCollection
        self.CollectionPublicPath = /public/NFTMomentCollection
        self.AdminStoragePath = /storage/NFTMomentAdmin
        self.PartnerStoragePath = /storage/NFTMomentPartner

        // --- PERBAIKAN: Buat dan LANGSUNG simpan Admin Resource ---
        // 1. Buat resource Admin
        let admin <- create Admin()

        // 2. Simpan resource ke storage path yang sudah didefinisikan
        self.account.storage.save(<-admin, to: self.AdminStoragePath)
        // --------------------------------------------------------

        log("Admin resource berhasil dibuat dan disimpan ke ".concat(self.AdminStoragePath.toString()))
        emit ContractInitialized()
    }
}

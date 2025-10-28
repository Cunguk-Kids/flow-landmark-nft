// EventPlatform.cdc

import "NFTMoment"

access(all) contract EventPlatform {

    // --- Events ---
    access(all) event EventCreated(eventID: UInt64, brandAddress: Address)
    access(all) event EventNFTMinted(eventID: UInt64, nftID: UInt64, user: Address, rarity: String)
    access(all) event UserRegistered(eventID: UInt64, user: Address)
    access(all) event UserUnregistered(eventID: UInt64, user: Address)
    access(all) event UserCheckin(eventID: UInt64, user: Address)
    access(all) event EventStatusUpdated(eventID: UInt64, status: UInt8)

    // --- Paths ---
    access(all) let EventManagerStoragePath: StoragePath
    access(all) let EventManagerPublicPath: PublicPath
    access(all) let AdminReceiverStoragePath: StoragePath
    access(all) let AdminReceiverPublicPath: PublicPath 
    access(contract) let NFTAdminCapStoragePath: StoragePath 

    access(contract) var nftAdminCap: Capability<&NFTMoment.Admin>?

    // --- Enum Status ---
    access(all) enum EventStatus: UInt8 {
        access(all) case pending
        access(all) case active
        access(all) case ended
    }

    // --- Struct Location ---
    access(all) struct Location {
        access(all) let latitude: Fix64
        access(all) let longitude: Fix64

        init(latitude: Fix64, longitude: Fix64) {
            self.latitude = latitude
            self.longitude = longitude
        }
    }

    // --- Resource Event ---
    access(all) resource Event: IEventPublic {

        access(all) let eventID: UInt64
        access(all) var eventName: String
        access(all) var description: String
        access(all) var image: String
        access(all) let lat: Fix64
        access(all) let long: Fix64
        access(all) let radius: UFix64
        access(all) let startDate: UFix64
        access(all) let endDate: UFix64
        access(all) let quota: UInt64
        access(all) var totalRareNFT: UInt64

        access(all) var counter: UInt64
        access(all) var registeredUsers: {Address: Bool}
        access(all) var checkedInUsers: {Address: Bool}
        access(all) var status: UInt8

        init(
            eventID: UInt64,
            eventName: String,
            quota: UInt64,
            description: String,
            image: String,
            lat: Fix64,
            long: Fix64,
            radius: UFix64,
            startDate: UFix64,
            endDate: UFix64,
            totalRareNFT: UInt64
        ) {
            self.eventID = eventID
            self.eventName = eventName
            self.quota = quota
            self.counter = 0
            self.registeredUsers = {}
            self.checkedInUsers = {}
            self.description = description
            self.image = image
            self.lat = lat
            self.long = long
            self.radius = radius
            self.startDate = startDate
            self.endDate = endDate
            self.totalRareNFT = totalRareNFT
            self.status = EventStatus.pending.rawValue
        }

        // --- Register ---
        access(all) fun register(user: Address) {
            pre {
                self.registeredUsers[user] == nil: "User sudah terdaftar"
                self.counter < self.quota: "Event sudah penuh"
            }
            self.registeredUsers[user] = true
            self.counter = self.counter + 1
            emit UserRegistered(eventID: self.eventID, user: user)
        }

        access(all) fun unregister(user: Address) {
            pre { self.registeredUsers[user] != nil: "User tidak terdaftar" }
            self.registeredUsers.remove(key: user)
            self.counter = self.counter - 1
            emit UserUnregistered(eventID: self.eventID, user: user)
        }
        
        access(all) view fun isRegistered(user: Address): Bool {
            return self.registeredUsers[user] != nil
        }

        access(all) fun checkIn(user: Address) {
            pre {
                self.registeredUsers[user] != nil: "User tidak terdaftar"
                self.status == EventStatus.active.rawValue: "Event belum aktif atau sudah selesai"
            }
            self.checkedInUsers[user] = true
            emit UserCheckin(eventID: self.eventID, user: user)
        }

        access(all) fun isCheckedIn(user: Address): Bool {
            return self.checkedInUsers[user] != nil
        }

        access(all) fun updateStatus(currentTime: UFix64) {
            if currentTime < self.startDate {
                emit EventStatusUpdated(eventID: self.eventID, status: EventStatus.pending.rawValue)
                self.status = EventStatus.pending.rawValue
            } else if currentTime >= self.startDate && currentTime <= self.endDate {
                emit EventStatusUpdated(eventID: self.eventID, status: EventStatus.active.rawValue)
                self.status = EventStatus.active.rawValue
            } else {
                emit EventStatusUpdated(eventID: self.eventID, status: EventStatus.ended.rawValue)
                self.status = EventStatus.ended.rawValue
            }
        }

        access(all) fun decrementRareNFT() {
            pre { self.totalRareNFT > 0: "Kuota NFT habis" }
            self.totalRareNFT = self.totalRareNFT - 1
        }
    }

    // --- Event Public Interface ---
    access(all) resource interface IEventPublic {
        access(all) var eventName: String
        access(all) var description: String
        access(all) var image: String
        access(all) let lat: Fix64
        access(all) let long: Fix64
        access(all) let radius: UFix64
        access(all) let startDate: UFix64
        access(all) let endDate: UFix64
        access(all) let quota: UInt64
        access(all) var counter: UInt64
        access(all) var totalRareNFT: UInt64
        access(all) var status: UInt8

        access(all) fun register(user: Address)
        access(all) fun unregister(user: Address)
        access(all) fun checkIn(user: Address)
        access(all) fun isCheckedIn(user: Address): Bool
        access(all) fun updateStatus(currentTime: UFix64)
    }

    // --- Event Manager Resource ---
    access(all) resource EventManager: IAdmin, IPublicEventManager {
        access(self) var ownedEvents: @{UInt64: Event}
        access(self) var nextEventID: UInt64 

        init() { 
            self.ownedEvents <- {} 
            self.nextEventID = 1
        }

        // ... createEvent, getEvent, getEventIDs SAMA ...
        access(all) fun createEvent(
            eventName: String,
            quota: UInt64,
            description: String,
            image: String,
            lat: Fix64,
            long: Fix64,
            radius: UFix64,
            startDate: UFix64,
            endDate: UFix64,
            totalRareNFT: UInt64
        ): UInt64 {
            
            let eventID = self.nextEventID
            self.nextEventID = self.nextEventID + 1

            let newEvent <- create Event(
                eventID: eventID,
                eventName: eventName,
                quota: quota,
                description: description,
                image: image,
                lat: lat,
                long: long,
                radius: radius,
                startDate: startDate,
                endDate: endDate,
                totalRareNFT: totalRareNFT
            )

            self.ownedEvents[eventID] <-! newEvent

            emit EventCreated(eventID: eventID, brandAddress: self.owner!.address)
            return eventID
        }

        access(all) fun getEvent(id: UInt64): &Event? {
            return &self.ownedEvents[id] as &Event?
        }

        access(all) fun getEventIDs(): [UInt64] {
            return self.ownedEvents.keys
        }
        
        // --- FUNGSI MINTING ---
        access(all) fun mintEventNFT(
            eventID: UInt64,
            user: Address,
            metadata: NFTMoment.MomentMetadata,
            rarity: NFTMoment.Rarity
        ): UInt64 {
            
            let adminCap = EventPlatform.nftAdminCap ?? panic("Capability NFTMoment Admin belum disetel. Harap lakukan delegasi.")
            let adminRef = adminCap.borrow() ?? panic("NFTMoment Admin reference tidak valid.")

            let eventRef = self.getEvent(id: eventID) ?? panic("Event tidak ditemukan")
            
            let userCollectionCap = getAccount(user)
                .capabilities
                .get<&NFTMoment.Collection>(NFTMoment.CollectionPublicPath)
                
            assert(
                userCollectionCap.check(), 
                message: "Koleksi NFT User tidak ditemukan. Pastikan User sudah setup koleksi di path: ".concat(NFTMoment.CollectionPublicPath.toString())
            )
            
            let userCollectionRef = userCollectionCap.borrow()
                ?? panic("Reference Koleksi NFT User tidak valid setelah check valid.")

            // Validasi status & check-in
            assert(eventRef.status == EventStatus.active.rawValue, message: "Event belum aktif")
            assert(eventRef.isCheckedIn(user: user), message: "User belum check-in")
            assert(eventRef.totalRareNFT > 0, message: "Kuota NFT habis")

            // --- Mint NFT via Partner ---
            let partner <- adminRef.createPartner()
            
            let nftID = partner.mintPartnerNFT(
                recipient: userCollectionRef,
                metadata: metadata,
                rarity: rarity,
                partnerAddress: self.owner!.address
            )

            eventRef.decrementRareNFT()
            
            emit EventNFTMinted(
                eventID: eventID, 
                nftID: nftID, 
                user: user, 
                rarity: NFTMoment.rarityToString(r: rarity)
            ) 
            
            destroy partner

            return nftID
        }
    }

    // --- Interfaces IAdmin, IPublicEventManager ---
    access(all) resource interface IAdmin {
        access(all) fun createEvent(
            eventName: String,
            quota: UInt64,
            description: String,
            image: String,
            lat: Fix64,
            long: Fix64,
            radius: UFix64,
            startDate: UFix64,
            endDate: UFix64,
            totalRareNFT: UInt64
        ): UInt64
    }

    access(all) resource interface IPublicEventManager {
        access(all) fun getEvent(id: UInt64): &Event?
        access(all) fun getEventIDs(): [UInt64]
    }

    // --- Admin Receiver ---
    access(all) resource interface IAdminReceiver {
        access(all) fun receiveAdminCapability(brandAddress: Address, cap: Capability<&{IAdmin}>)
    }

    access(all) resource AdminReceiver: IAdminReceiver {
        access(self) var adminCaps: {Address: Capability<&{IAdmin}>}

        init() { self.adminCaps = {} }

        access(all) fun receiveAdminCapability(brandAddress: Address, cap: Capability<&{IAdmin}>) {
             pre {
                cap.borrow() != nil: "Capability IAdmin tidak valid"
                self.adminCaps[brandAddress] == nil: "Brand sudah mendelegasikan capability"
            }
            self.adminCaps[brandAddress] = cap
        }

        access(all) fun getAdminCapability(brandAddress: Address): &{IAdmin}? {
            if let cap = self.adminCaps[brandAddress] {
                return cap.borrow()
            }
            return nil
        }
    }
    
    // --- FUNGSI DELEGASI NFT ADMIN ---
    access(all) fun setNFTAdminCapability(cap: Capability<&NFTMoment.Admin>) {
        pre { 
            EventPlatform.nftAdminCap == nil: "Capability NFT Admin sudah disetel." 
            cap.borrow() != nil: "Capability NFT Admin tidak valid." 
        }
        
        EventPlatform.nftAdminCap = cap
        log("Capability NFTMoment Admin berhasil disetel di EventPlatform.")
    }

    // --- FUNGSI BARU: KLAIM NFT OLEH USER ---
    access(all) fun claimEventNFT(
        eventID: UInt64,
        userAddress: Address,
        partnerAddress: Address, 
        metadata: NFTMoment.MomentMetadata,
        rarity: NFTMoment.Rarity
    ): UInt64 {
        
        // Alamat User 
        let user = userAddress

        // 1. Capability 
        let eventManagerCap = getAccount(partnerAddress)
            .capabilities
            .get<&EventPlatform.EventManager>(EventPlatform.EventManagerPublicPath)
        
        assert(
            eventManagerCap.check(), 
            message: "Event milik Partner tidak valid atau tidak ditemukan."
        )
        
        let eventManagerRef = eventManagerCap.borrow() 
            ?? panic("Reference Event Manager tidak valid setelah check valid.")
        
        return eventManagerRef.mintEventNFT(
            eventID: eventID,
            user: user, 
            metadata: metadata,
            rarity: rarity
        )
    }

    // --- Factory ---
    access(all) fun createEventManager(): @EventManager {
        return <- create EventManager()
    }

    access(all) fun createAdminReceiver(): @AdminReceiver {
        return <- create AdminReceiver()
    }

    // --- Init ---
    init() {
        // Path initialization
        self.EventManagerStoragePath = /storage/EventPlatform_Manager
        self.EventManagerPublicPath = /public/EventPlatform_Public
        self.AdminReceiverStoragePath = /storage/EventPlatform_AdminReceiver
        self.AdminReceiverPublicPath = /public/EventPlatform_AdminReceiver // Mengganti PublicPath receiver ke path yang benar
        self.NFTAdminCapStoragePath = /storage/NFTMomentAdminCap 
        
        // Initialize State Kontrak
        self.nftAdminCap = nil
        log("Kontrak EventPlatform berhasil di-deploy.")
    }
}
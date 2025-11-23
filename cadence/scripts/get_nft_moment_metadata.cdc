import "NonFungibleToken"
import "MetadataViews"
import "NFTMoment" // Pastikan ini mengarah ke kontrak NFTMoment Anda

// Struct ini meratakan semua data agar mudah dibaca Frontend
access(all) struct NFTDetail {
    access(all) let id: UInt64
    access(all) let uuid: UInt64
    access(all) let name: String
    access(all) let description: String
    access(all) let thumbnail: String
    access(all) let owner: Address
    access(all) let type: String
    access(all) let royalties: [MetadataViews.Royalty]
    access(all) let externalURL: String
    
    // Collection Data
    access(all) let collectionName: String
    access(all) let collectionDescription: String
    access(all) let collectionSquareImage: String
    access(all) let collectionBannerImage: String
    access(all) let collectionSocials: {String: String}
    access(all) let collectionPublicPath: PublicPath
    access(all) let collectionStoragePath: StoragePath
    
    // Traits & Editions
    access(all) let traits: MetadataViews.Traits?
    access(all) let edition: MetadataViews.Edition?
    access(all) let serialNumber: UInt64?
    
    // Advanced Views (Optional)
    access(all) let medias: MetadataViews.Medias?
    access(all) let license: MetadataViews.License?
    
    init(
        id: UInt64,
        uuid: UInt64,
        name: String,
        description: String,
        thumbnail: String,
        owner: Address,
        type: String,
        royalties: [MetadataViews.Royalty],
        externalURL: String,
        collectionName: String,
        collectionDescription: String,
        collectionSquareImage: String,
        collectionBannerImage: String,
        collectionSocials: {String: String},
        collectionPublicPath: PublicPath,
        collectionStoragePath: StoragePath,
        traits: MetadataViews.Traits?,
        edition: MetadataViews.Edition?,
        serialNumber: UInt64?,
        medias: MetadataViews.Medias?,
        license: MetadataViews.License?
    ) {
        self.id = id
        self.uuid = uuid
        self.name = name
        self.description = description
        self.thumbnail = thumbnail
        self.owner = owner
        self.type = type
        self.royalties = royalties
        self.externalURL = externalURL
        self.collectionName = collectionName
        self.collectionDescription = collectionDescription
        self.collectionSquareImage = collectionSquareImage
        self.collectionBannerImage = collectionBannerImage
        self.collectionSocials = collectionSocials
        self.collectionPublicPath = collectionPublicPath
        self.collectionStoragePath = collectionStoragePath
        self.traits = traits
        self.edition = edition
        self.serialNumber = serialNumber
        self.medias = medias
        self.license = license
    }
}

access(all) fun main(address: Address, id: UInt64): NFTDetail {
    let account = getAccount(address)

    // 1. Dapatkan Data Path Koleksi secara Dinamis
    // Ini lebih aman daripada hardcode path jika kontrak berubah
    let collectionData = NFTMoment.resolveContractView(resourceType: nil, viewType: Type<MetadataViews.NFTCollectionData>()) as! MetadataViews.NFTCollectionData?
            ?? panic("Could not resolve NFTCollectionData view from NFTMoment contract")
    
    // 2. Borrow Koleksi
    let collection = account.capabilities.borrow<&NFTMoment.Collection>(
            collectionData.publicPath
    ) ?? panic("The account does not have an NFTMoment Collection at ".concat(collectionData.publicPath.toString()))

    // 3. Borrow NFT Reference
    let nft = collection.borrowNFT(id)
        ?? panic("Could not borrow a reference to the NFT with ID: ".concat(id.toString()))

    // --- RESOLVE VIEWS ---

    // Display (Wajib ada)
    let display = MetadataViews.getDisplay(nft) 
        ?? panic("NFT does not have a Display view")

    // External URL
    let externalURLView = MetadataViews.getExternalURL(nft)
    let externalURL = externalURLView?.url ?? ""

    // Royalties
    let royaltyView = MetadataViews.getRoyalties(nft)
    let royalties = royaltyView?.getRoyalties() ?? []

    // Collection Display (Wajib ada untuk Marketplace)
    let colDisplay = MetadataViews.getNFTCollectionDisplay(nft)
        ?? panic("NFT does not have a CollectionDisplay view")
    
    let collectionSocials: {String: String} = {}
    for key in colDisplay.socials.keys {
        collectionSocials[key] = colDisplay.socials[key]!.url
    }

    // Serial & Edition (Opsional)
    let serialView = MetadataViews.getSerial(nft)
    let editionView = MetadataViews.getEditions(nft)
    var editionInfo: MetadataViews.Edition? = nil
    if let editions = editionView {
        if editions.infoList.length > 0 {
            editionInfo = editions.infoList[0]
        }
    }

    // Traits (Opsional tapi penting untuk Rarity)
    let traits = MetadataViews.getTraits(nft)

    // Medias & License (Opsional)
    let medias = MetadataViews.getMedias(nft)
    let license = MetadataViews.getLicense(nft)

    // --- CONSTRUCT RESULT ---

    return NFTDetail(
        id: nft.id,
        uuid: nft.uuid,
        name: display.name,
        description: display.description,
        thumbnail: display.thumbnail.uri(),
        owner: nft.owner!.address,
        type: nft.getType().identifier,
        royalties: royalties,
        externalURL: externalURL,
        collectionName: colDisplay.name,
        collectionDescription: colDisplay.description,
        collectionSquareImage: colDisplay.squareImage.file.uri(),
        collectionBannerImage: colDisplay.bannerImage.file.uri(),
        collectionSocials: collectionSocials,
        collectionPublicPath: collectionData.publicPath,
        collectionStoragePath: collectionData.storagePath,
        traits: traits,
        edition: editionInfo,
        serialNumber: serialView?.number,
        medias: medias,
        license: license
    )
}
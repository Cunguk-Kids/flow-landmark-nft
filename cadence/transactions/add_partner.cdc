import "NFTMoment"

// Add a new partner (admin only)
transaction(
    partnerAddress: Address,
    name: String,
    description: String,
    allowedCategoryRaws: [UInt8],
    latitude: String?,
    longitude: String?,
    placeName: String?,
    city: String?,
    country: String?,
    radius: UFix64?,
    qrCodeEnabled: Bool,
    eventBased: Bool,
    eventStartTime: UFix64?,
    eventEndTime: UFix64?
) {
    let admin: &NFTMoment.Admin

    prepare(acct: auth(Storage) &Account) {
        self.admin = acct.storage.borrow<&NFTMoment.Admin>(from: NFTMoment.AdminStoragePath)
            ?? panic("Could not borrow admin reference")
    }

    execute {
        // Convert raw values to Category enums
        let allowedCategories: [NFTMoment.Category] = []
        for raw in allowedCategoryRaws {
            allowedCategories.append(NFTMoment.Category(rawValue: raw)!)
        }

        // Create location if coordinates provided
        let location: NFTMoment.Location? = latitude != nil && longitude != nil
            ? NFTMoment.Location(
                latitude: latitude!,
                longitude: longitude!,
                placeName: placeName,
                city: city,
                country: country
            )
            : nil

        // Add the partner
        self.admin.addPartner(
            address: partnerAddress,
            name: name,
            description: description,
            allowedCategories: allowedCategories,
            location: location,
            radius: radius,
            qrCodeEnabled: qrCodeEnabled,
            eventBased: eventBased,
            eventStartTime: eventStartTime,
            eventEndTime: eventEndTime
        )

        log("Partner added: ".concat(name))
    }
}

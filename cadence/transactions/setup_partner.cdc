import "NFTMoment"

// Setup partner capability (admin creates and gives to partner)
transaction(partnerAddress: Address) {
    let admin: &NFTMoment.Admin

    prepare(acct: auth(Storage) &Account) {
        self.admin = acct.storage.borrow<&NFTMoment.Admin>(from: NFTMoment.AdminStoragePath)
            ?? panic("Could not borrow admin reference")
    }

    execute {
        // Create Partner resource
        let partner <- self.admin.createPartner()

        // Get the partner's account
        let partnerAccount = getAccount(partnerAddress)

        // Note: In production, you would use an Inbox or another mechanism
        // to transfer the Partner resource to the partner account
        // For now, this shows the pattern

        // Save to admin's storage with a unique path for this partner
        let partnerPath = StoragePath(identifier: "NFTMomentPartner_".concat(partnerAddress.toString()))!
        acct.storage.save(<-partner, to: partnerPath)

        log("Partner resource created for: ".concat(partnerAddress.toString()))
        log("Admin should transfer this resource to the partner account")
    }
}

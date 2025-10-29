import "EventPlatform" // Alamat Kontrak

transaction(brandAddress: Address, eventID: UInt64, userAddress: Address) {

    let eventRef: &EventPlatform.Event // Kita butuh akses ke resource Event, bukan hanya interface

    prepare(signer: auth(Storage) &Account) { // Asumsi signer perlu storage untuk sesuatu, atau bisa &Account saja

        // Pinjam Event Manager dari Brand
        let managerCap = getAccount(brandAddress)
            .capabilities.get<&EventPlatform.EventManager>( // Pinjam EventManager penuh
                EventPlatform.EventManagerPublicPath // Asumsi kita pinjam dari storage brand
            )
            // ATAU jika Anda punya capability IAdmin di AdminReceiver:
            // let adminReceiver = signer.storage.borrow...
            // let adminRef = adminReceiver.getAdminCapability...
            // let managerRef = adminRef as! &EventPlatform.EventManager // Casting

        let manager = managerCap.borrow()
            ?? panic("EventManager tidak ditemukan")

        // Dapatkan reference ke Event (bukan interface)
        self.eventRef = manager.getEvent(id: eventID)
            ?? panic("Event tidak ditemukan")
    }

    execute {
        // Panggil fungsi checkIn di resource Event
        self.eventRef.checkIn(user: userAddress)
        log("Check-in on-chain berhasil untuk user ".concat(userAddress.toString()))
    }
}
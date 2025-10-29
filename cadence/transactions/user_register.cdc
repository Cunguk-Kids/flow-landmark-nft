// Transaksi: user_register_event.cdc
// Dijalankan oleh: User
// (Perbaikan: Menggunakan variabel scope transaksi untuk 'userAccount.address')

import "EventPlatform" // Ganti dengan alamat deploy kontrak

transaction(brandAddress: Address, eventID: UInt64) {
    
    // Referensi ke event publik
    let eventRef: &{EventPlatform.IEventPublic}

    // Variabel scope transaksi untuk menyimpan alamat user
    let userAddress: Address

    // 'userAccount' adalah signer (user)
    prepare(userAccount: &Account) {
        
        // 1. Dapatkan 'Capability' publik dari path publik Brand A
        let managerCap = getAccount(brandAddress)
            .capabilities.get<&{EventPlatform.IPublicEventManager}>(
                EventPlatform.EventManagerPublicPath
            )
            
        let managerRef = managerCap.borrow()
            ?? panic("Brand ini tidak memiliki Event Manager publik")
            
        // 2. Dapatkan referensi ke event spesifik dari manajer
        self.eventRef = managerRef.getEvent(id: eventID)
            ?? panic("Event tidak ditemukan")

        // 3. Simpan alamat user ke variabel scope transaksi
        self.userAddress = userAccount.address
    }

    execute {
        // 4. Panggil fungsi 'register' menggunakan variabel yang sudah disimpan
        self.eventRef.register(user: self.userAddress)
        log("User berhasil mendaftar!")
    }
}
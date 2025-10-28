// Transaksi: update_event_status.cdc
// Dijalankan oleh: Siapa saja (misalnya backend, atau penjaga otomatis)

import "EventPlatform" // Pastikan alamat deploy benar

// Argumen: Alamat Brand pemilik event dan ID Event yang statusnya mau diupdate
transaction(brandAddress: Address, eventID: UInt64) {
    
    // Referensi ke event publik yang akan diupdate
    let eventRef: &{EventPlatform.IEventPublic}

    prepare(signer: &Account) {
        
        // 1. Dapatkan 'Capability' publik Event Manager dari Brand
        let managerCap = getAccount(brandAddress)
            .capabilities.get<&{EventPlatform.IPublicEventManager}>(
                EventPlatform.EventManagerPublicPath
            )
            
        let managerRef = managerCap.borrow()
            ?? panic("Brand ini tidak memiliki Event Manager publik")
            
        // 2. Dapatkan referensi ke event spesifik
        // Kita gunakan '!' (force-unwrap) karena jika event tidak ada,
        // kita memang ingin transaksi gagal (panic).
        self.eventRef = managerRef.getEvent(id: eventID)!
    }

    execute {
        // 3. Dapatkan waktu saat ini dari block
        let currentTime = getCurrentBlock().timestamp
        log("current time".concat(currentTime.toString()))
        
        // 4. Panggil fungsi 'updateStatus' pada event
        self.eventRef.updateStatus(currentTime: currentTime)
        
        log("Status event ID ".concat(eventID.toString()).concat(" berhasil diperbarui."))
    }
}
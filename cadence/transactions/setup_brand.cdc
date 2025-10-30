// Ganti dengan alamat KONTRAK BARU Anda
import "EventPlatform" 

transaction(adminPlatformAddress: Address) {
    
    prepare(brandAccount: auth(Storage, Capabilities) &Account) {
        
        log("Memulai setup/upgrade Brand Account...")

        // --- 1. UNPUBLISH (INI YANG ANDA MINTA) ---
        // Bersihkan link publik lama SEBELUM melakukan apa-apa.
        // Ini memastikan path-nya bersih untuk link baru.
        brandAccount.capabilities.unpublish(EventPlatform.EventManagerPublicPath)
        
        log("Path publik lama (EventManagerPublicPath) dibersihkan.")

        // --- 2. HAPUS RESOURCE LAMA (PENTING UNTUK FIX ERROR) ---
        // Hapus resource EventManager lama dari storage jika ada.
        // Ini adalah kunci untuk memperbaiki error 'type mismatch'
        if let oldManager <- brandAccount.storage.load<@AnyResource>(from: EventPlatform.EventManagerStoragePath) {
            log("Menghapus EventManager lama dari storage...")
            destroy oldManager
        }

        // --- 3. BUAT & SIMPAN RESOURCE BARU ---
        // Sekarang storage sudah bersih, kita buat & simpan yang baru.
        log("Membuat EventManager baru...")
        brandAccount.storage.save(<-EventPlatform.createEventManager(), to: EventPlatform.EventManagerStoragePath)

        // --- 4. PUBLIKASIKAN LINK BARU ---
        // Buat link capability baru yang menunjuk ke resource baru
        let publicCap = brandAccount.capabilities.storage.issue<&{EventPlatform.IPublicEventManager}>(EventPlatform.EventManagerStoragePath)
        brandAccount.capabilities.publish(publicCap, at: EventPlatform.EventManagerPublicPath)
        
        log("Capability publik baru dipublikasikan.")

        // --- 5. DELEGASIKAN ADMIN CAPABILITY BARU ---
        let adminCap = brandAccount.capabilities.storage.issue<&{EventPlatform.IAdmin}>(EventPlatform.EventManagerStoragePath)
        
        let adminInbox = getAccount(adminPlatformAddress)
            .capabilities.get<&{EventPlatform.IAdminReceiver}>(EventPlatform.AdminReceiverPublicPath)
            .borrow() ?? panic("Gagal meminjam Inbox Admin Platform")

        // Catatan: Jika error 'Brand sudah mendelegasikan capability'
        // Anda mungkin perlu menambahkan fungsi di AdminReceiver 
        // untuk menghapus/mengganti capability lama jika sudah ada.
        adminInbox.receiveAdminCapability(brandAddress: brandAccount.address, cap: adminCap)
        
        log("Brand setup/upgrade selesai! IAdmin capability telah didelegasikan.")
    }
}
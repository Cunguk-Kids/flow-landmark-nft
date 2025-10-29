// Transaksi: setup_admin_inbox.cdc
// Dijalankan oleh: Akun Admin Platform (Backend Anda)

import "EventPlatform" // Ganti dengan alamat deploy kontrak
import "NFTMoment" // Ganti dengan alamat deploy kontrak

transaction {

    prepare(adminAccount: auth(Storage, Capabilities) &Account) {
        
        // 1. Buat dan simpan 'Inbox' jika belum ada
        if adminAccount.storage.borrow<&EventPlatform.AdminReceiver>(from: EventPlatform.AdminReceiverStoragePath) == nil {
            adminAccount.storage.save(
                <-EventPlatform.createAdminReceiver(),
                to: EventPlatform.AdminReceiverStoragePath
            )
        }

        // 2. Publikasikan 'Capability' untuk MENERIMA
        //    Ini menggantikan 'public.link'
        let cap = adminAccount.capabilities.storage
            .issue<&{EventPlatform.IAdminReceiver}>(
                EventPlatform.AdminReceiverStoragePath
            )
        adminAccount.capabilities.publish(
            cap,
            at: EventPlatform.AdminReceiverPublicPath
        )
        
        log("Inbox Admin Platform berhasil disetup!")

        let adminStoragePath = NFTMoment.AdminStoragePath

        // --- PERBAIKAN: Gunakan PublicPath ---
        // Anda bisa membuat nama path ini lebih unik jika mau
        let capabilityPublicPath: PublicPath = /public/NFTMomentAdminCapForEventPlatform

        // 1. Issue Capability dari storage
        let adminCap = adminAccount.capabilities.storage
            .issue<&NFTMoment.Admin>(adminStoragePath)

        // 2. Publikasikan capability ini ke Public Path
        //    Sekarang tipenya cocok (PublicPath)
        adminAccount.capabilities.publish(
             adminCap,
             at: capabilityPublicPath // <-- Sekarang menggunakan PublicPath
        )

        log("Capability NFTMoment Admin berhasil dibuat dan dipublikasikan di ".concat(capabilityPublicPath.toString()))

                let newManager <- EventPlatform.createEventManager()
        
        adminAccount.storage.save(
            <- newManager, 
            to: EventPlatform.EventManagerStoragePath
        )
        
        adminAccount.capabilities.publish(
            adminAccount.capabilities.storage.issue<&EventPlatform.EventManager>(EventPlatform.EventManagerStoragePath),
            at: EventPlatform.EventManagerPublicPath
        )

        log("EventManager berhasil diinisialisasi dan disimpan.")

        let adminCapNFT = adminAccount.capabilities.storage.issue<&NFTMoment.Admin>(
            NFTMoment.AdminStoragePath
        )
            
        // 2. Pastikan Capability berhasil dibuat
        if adminCapNFT == nil {
            panic("Gagal membuat capability NFTMoment.Admin. Pastikan resource ada di NFTMoment.AdminStoragePath.")
        }
            
        // 3. Set capability di EventPlatform menggunakan fungsi publik
        EventPlatform.setNFTAdminCapability(cap: adminCapNFT)

        log("NFTMoment Admin capability berhasil diset di EventPlatform.")
    }

    execute {
        log("berhasil setup admin")
    }
}
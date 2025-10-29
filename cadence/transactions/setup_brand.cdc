// Transaksi: setup_brand_account.cdc
// Dijalankan oleh: Akun Brand A

import "EventPlatform" // Alamat deploy kontrak

transaction(adminPlatformAddress: Address) {
    prepare(brandAccount: auth(Storage, Capabilities) &Account) {
        // 1. Setup EventManager
        if brandAccount.storage.borrow<&EventPlatform.EventManager>(from: EventPlatform.EventManagerStoragePath) == nil {
            brandAccount.storage.save(<-EventPlatform.createEventManager(), to: EventPlatform.EventManagerStoragePath)
        }
        // 2. Publikasikan Capability Publik
        let publicCap = brandAccount.capabilities.storage.issue<&{EventPlatform.IPublicEventManager}>(EventPlatform.EventManagerStoragePath)
        brandAccount.capabilities.publish(publicCap, at: EventPlatform.EventManagerPublicPath)
        // 3. Delegasikan IAdmin Capability ke Inbox Admin
        let adminCap = brandAccount.capabilities.storage.issue<&{EventPlatform.IAdmin}>(EventPlatform.EventManagerStoragePath)
        let adminInbox = getAccount(adminPlatformAddress)
            .capabilities.get<&{EventPlatform.IAdminReceiver}>(EventPlatform.AdminReceiverPublicPath)
            .borrow() ?? panic("Gagal meminjam Inbox Admin Platform")
        adminInbox.receiveAdminCapability(brandAddress: brandAccount.address, cap: adminCap)
        log("Brand setup selesai! IAdmin capability telah didelegasikan.")
    }
}
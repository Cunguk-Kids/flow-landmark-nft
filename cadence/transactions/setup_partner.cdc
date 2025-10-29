// Transaksi: add_nft_partner.cdc
// Dijalankan oleh: Akun Deployer NFTMoment (Backend Anda)

import "NFTMoment" // Pastikan alamat deploy benar

// Argumen didapatkan backend dari database Brand
transaction(
    partnerAddress: Address, // Alamat Brand A
    partnerName: String,
    partnerDescription: String,
    partnerEmail: String, // Dari PartnerInfo baru
    partnerImage: String  // Dari PartnerInfo baru
) {
    let adminRef: &NFTMoment.Admin

    prepare(deployer: auth(Storage) &Account) {
        self.adminRef = deployer.storage.borrow<&NFTMoment.Admin>(from: NFTMoment.AdminStoragePath)
            ?? panic("Resource @NFTMoment.Admin tidak ditemukan.")
    }

    execute {
        // Panggil fungsi addPartner dengan data Brand
        self.adminRef.addPartner(
            address: partnerAddress,
            name: partnerName,
            description: partnerDescription,
            email: partnerEmail,
            image: partnerImage
        )
        log("Partner ".concat(partnerName).concat(" berhasil ditambahkan ke NFTMoment."))
    }
}
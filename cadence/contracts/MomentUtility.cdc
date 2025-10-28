// MomentUtility.cdc

import "NFTMoment"

access(all) contract MomentUtility {

    access(contract) var claimedNFTs: {UInt64: UFix64}
    
    // ========================================
    // Events
    // ========================================
    access(all) event BenefitClaimed(nftID: UInt64, recipient: Address, claimTime: UFix64)
    access(all) event NFTClaimStatusVerified(nftID: UInt64, isClaimed: Bool)


    // ========================================
    // Public Function: Klaim Benefit
    // ========================================

    // Fungsi UTAMA: Memungkinkan user mengklaim manfaat menggunakan NFT-nya.
    access(all) fun claimBenefit(
        nftID: UInt64,
        userCollectionCap: Capability<&{NFTMoment.CollectionPublic}>
    ) {
        pre { 
            self.claimedNFTs[nftID] == nil: 
            "NFT ID: ".concat(nftID.toString()).concat(" sudah digunakan untuk klaim manfaat."); 
            
            userCollectionCap.borrow() != nil: "Capability koleksi NFT tidak valid."
        }
        
        let recipientAddress = userCollectionCap.address
                
        // 2. Pinjam referensi ke koleksi NFT user
        let collectionRef = userCollectionCap.borrow() 
            ?? panic("Koleksi NFT Moment user tidak ada")
            
        // 3. Verifikasi kepemilikan NFT
        let nftRef = collectionRef.borrowNFT(id: nftID)
            ?? panic("NFT Moment ID: ".concat(nftID.toString()).concat(" tidak ditemukan di koleksi user.")
        )
            
        // 4.Verifikasi Rarity (Contoh: Hanya Rare atau lebih tinggi)
        assert(
            nftRef.rarity.rawValue >= NFTMoment.Rarity.Rare.rawValue,
            message: "NFT harus memiliki Rarity Rare (2) atau lebih tinggi untuk mengklaim manfaat."
        )

        let currentTime = getCurrentBlock().timestamp
        
        // 5. Catat bahwa NFT ini sudah digunakan (Single Use)
        self.claimedNFTs[nftID] = currentTime

        emit BenefitClaimed(
            nftID: nftID, 
            recipient: recipientAddress, 
            claimTime: currentTime
        )
    }

    // ========================================
    // Public View Function: Cek Status Klaim
    // ========================================

    // verifikasi status klaim suatu NFT
    access(all) fun getClaimStatus(nftID: UInt64): Bool {
        let isClaimed = self.claimedNFTs[nftID] != nil
        emit NFTClaimStatusVerified(nftID: nftID, isClaimed: isClaimed)
        return isClaimed
    }

    // ========================================
    // Initialization
    // ========================================
    init() {
        self.claimedNFTs = {}
    }
}
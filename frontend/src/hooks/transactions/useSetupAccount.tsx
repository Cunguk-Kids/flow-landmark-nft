'use client';

import { useFlowMutate, useFlowTransactionStatus } from '@onflow/react-sdk';
import { useCallback } from 'react';

// Kode Cadence Anda (Batch Setup)
const SETUP_ACCOUNT_TRANSACTION = `
import "NonFungibleToken"
import "NFTMoment"
import "NFTAccessory"
import "UserProfile"
import "EventPass"
import "MetadataViews"

transaction {

    prepare(signer: auth(BorrowValue, IssueStorageCapabilityController, PublishCapability, SaveValue, UnpublishCapability) &Account) {
        
        // 1. Setup NFTMoment Collection
        let collectionNFTMomentData = NFTMoment.resolveContractView(resourceType: nil, viewType: Type<MetadataViews.NFTCollectionData>()) as! MetadataViews.NFTCollectionData?
            ?? panic("Could not resolve NFTCollectionData view for NFTMoment")

        if signer.storage.borrow<&NFTMoment.Collection>(from: collectionNFTMomentData.storagePath) == nil {
            let collectionNFTMoment <- NFTMoment.createEmptyCollection(nftType: Type<@NFTMoment.NFT>())
            signer.storage.save(<-collectionNFTMoment, to: collectionNFTMomentData.storagePath)
            
            signer.capabilities.unpublish(collectionNFTMomentData.publicPath)
            let collectionNFTMomentCap = signer.capabilities.storage.issue<&NFTMoment.Collection>(collectionNFTMomentData.storagePath)
            signer.capabilities.publish(collectionNFTMomentCap, at: collectionNFTMomentData.publicPath)
        }

        // 2. Setup NFTAccessory Collection
        let collectionNFTAccessoryData = NFTAccessory.resolveContractView(resourceType: nil, viewType: Type<MetadataViews.NFTCollectionData>()) as! MetadataViews.NFTCollectionData?
            ?? panic("Could not resolve NFTCollectionData view for NFTAccessory")

        if signer.storage.borrow<&NFTAccessory.Collection>(from: collectionNFTAccessoryData.storagePath) == nil {
            let collectionNFTAccessory <- NFTAccessory.createEmptyCollection(nftType: Type<@NFTAccessory.NFT>())
            signer.storage.save(<-collectionNFTAccessory, to: collectionNFTAccessoryData.storagePath)

            signer.capabilities.unpublish(collectionNFTAccessoryData.publicPath)
            let collectionNFTAccessoryCap = signer.capabilities.storage.issue<&NFTAccessory.Collection>(collectionNFTAccessoryData.storagePath)
            signer.capabilities.publish(collectionNFTAccessoryCap, at: collectionNFTAccessoryData.publicPath)
        }

        // 3. Setup EventPass Collection
        let collectionEventPassData = EventPass.resolveContractView(resourceType: nil, viewType: Type<MetadataViews.NFTCollectionData>()) as! MetadataViews.NFTCollectionData?
            ?? panic("Could not resolve NFTCollectionData view for EventPass")

        if signer.storage.borrow<&EventPass.Collection>(from: collectionEventPassData.storagePath) == nil {
            let collectionEventPass <- EventPass.createEmptyCollection(nftType: Type<@EventPass.NFT>())
            signer.storage.save(<-collectionEventPass, to: collectionEventPassData.storagePath)

            signer.capabilities.unpublish(collectionEventPassData.publicPath)
            let collectionEventPassCap = signer.capabilities.storage.issue<&EventPass.Collection>(collectionEventPassData.storagePath)
            signer.capabilities.publish(collectionEventPassCap, at: collectionEventPassData.publicPath)
        }

        // 4. Setup UserProfile
        if signer.storage.borrow<&UserProfile.Profile>(from: UserProfile.ProfileStoragePath) == nil {
            let profile: @UserProfile.Profile <- UserProfile.createEmptyProfile()
            signer.storage.save(<-profile, to: UserProfile.ProfileStoragePath)

            signer.capabilities.unpublish(UserProfile.ProfilePublicPath)
            let userProfileCap = signer.capabilities.storage.issue<&UserProfile.Profile>(UserProfile.ProfileStoragePath)
            signer.capabilities.publish(userProfileCap, at: UserProfile.ProfilePublicPath)
        }
    }
}
`;

export function useSetupAccount() {
  // 1. Hook Mutasi (untuk mengirim transaksi)
  const { 
    mutate, 
    isPending: isMutating, 
    data: txId, 
    error: txError, 
    reset: resetMutate 
  } = useFlowMutate();

  // 2. Hook Status (untuk memantau progress)
  const { 
    transactionStatus, 
    error: txStatusError 
  } = useFlowTransactionStatus({
    id: txId,
  });

  // 3. Fungsi pemicu transaksi
  const setup = useCallback(() => {
    mutate({
      cadence: SETUP_ACCOUNT_TRANSACTION,
      args: () => [], // Tidak ada argumen yang diperlukan
    });
  }, [mutate]);

  // 4. Hitung status gabungan
  const isPending = isMutating || (txId && transactionStatus?.status !== 4);
  const isSealed = transactionStatus?.status === 4; // Status 4 = SEALED (Selesai)
  const isSuccess = isSealed && !txStatusError;
  const error = txError || txStatusError;

  return {
    setup,       // Panggil fungsi ini di tombol "Setup Account"
    isPending,   // Gunakan untuk menonaktifkan tombol / spinner
    isSealed,    // Gunakan untuk memicu refresh halaman / redirect
    isSuccess,   // True jika transaksi sukses total
    error,       // Tampilkan pesan error jika ada
    txId,        // ID Transaksi untuk link ke explorer
    resetMutate  // Untuk mereset state jika ingin mencoba lagi
  };
}
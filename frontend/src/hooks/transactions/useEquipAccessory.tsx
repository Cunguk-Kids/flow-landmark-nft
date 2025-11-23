'use client';

import { useFlowMutate, useFlowTransactionStatus } from '@onflow/react-sdk';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CONTRACT_ADDRESS } from '@/config/contracts';

// Copy script Cadence di atas ke sini
const EQUIP_TX = `
import "NonFungibleToken"
import "NFTMoment"
import "NFTAccessory"
import "MetadataViews"

transaction(
  nftAccessoryId: UInt64,
  nftMomentId: UInt64,
) {
    let momentCollectionRef: auth(NFTMoment.Equip) &NFTMoment.Collection
    let accessoryCollectionRef: &NFTAccessory.Collection
    let frameNFT: @NFTAccessory.NFT
    prepare(signer: auth(BorrowValue) &Account) {

      let accessoryCollectionData = NFTAccessory.resolveContractView(resourceType: nil, viewType: Type<MetadataViews.NFTCollectionData>()) as! MetadataViews.NFTCollectionData?
          ?? panic("Could not resolve NFTCollectionData view. The NFTAccessory contract needs to implement the NFTCollectionData Metadata view in order to execute this transaction")
      let momentCollectionData = NFTMoment.resolveContractView(resourceType: nil, viewType: Type<MetadataViews.NFTCollectionData>()) as! MetadataViews.NFTCollectionData?
          ?? panic("Could not resolve NFTCollectionData view. The NFTMoment contract needs to implement the NFTCollectionData Metadata view in order to execute this transaction")
      self.momentCollectionRef = signer.storage.borrow<auth(NFTMoment.Equip) &NFTMoment.Collection>(from: momentCollectionData.storagePath)
          ?? panic("No Moment Collection Ressource in Storage")
      self.accessoryCollectionRef = signer.storage.borrow<&NFTAccessory.Collection>(from: accessoryCollectionData.storagePath)
          ?? panic("No Accessory Collection Ressource in Storage")
      // borrow a reference to the signer's NFT collection
      let withdrawRef = signer.storage.borrow<auth(NonFungibleToken.Withdraw) &{NonFungibleToken.Collection}>(
        from: accessoryCollectionData.storagePath
      ) ?? panic("The signer does not store a NFT Collection object at the path \(accessoryCollectionData.storagePath)"
                      .concat("The signer must initialize their account with this collection first!"))
      self.frameNFT <- withdrawRef.withdraw(withdrawID: nftAccessoryId) as! @NFTAccessory.NFT

      assert(
        self.frameNFT.getType().identifier == "A.${CONTRACT_ADDRESS}.NFTAccessory.NFT",
        message: "The NFT that was withdrawn to transfer is not the type that was requested <A.${CONTRACT_ADDRESS}.NFTAccessory.NFT>."
      )
    }

    execute {
      let prevEquipFrame <- self.momentCollectionRef.equipFrame(momentNFTID: nftMomentId, frameNFT: <-self.frameNFT)
      if prevEquipFrame != nil {
        self.accessoryCollectionRef.deposit(token: <-prevEquipFrame!)
      } else {
        destroy prevEquipFrame
      }
    }

}
`;

export function useEquipAccessory() {
  const queryClient = useQueryClient();
  const { mutate, data: txId, isPending: isMutating, error: txError } = useFlowMutate();
  const { transactionStatus, error: statusError } = useFlowTransactionStatus({ id: txId });

  const isSealed = transactionStatus?.status === 4;
  const isPending = isMutating || (!!txId && !isSealed && transactionStatus?.status !== 5);

  const equip = (momentID: number, accessoryID: number) => {
    mutate({
      cadence: EQUIP_TX,
      args: (arg, t) => [
        arg(String(accessoryID), t.UInt64),
        arg(String(momentID), t.UInt64),
      ]
    });
  };

  // Refresh data setelah sukses
  useEffect(() => {
    if (isSealed) {
      // Refresh semua query yang relevan
      queryClient.invalidateQueries({ queryKey: ['moments'] });
      queryClient.invalidateQueries({ queryKey: ['accessories'] });
    }
  }, [isSealed, queryClient]);

  return { equip, isPending, isSealed, error: txError || statusError };
}
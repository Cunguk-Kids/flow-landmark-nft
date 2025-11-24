'use client';

import { useFlowMutate, useFlowTransactionStatus } from '@onflow/react-sdk';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const UNEQUIP_ACCESSORY_TX = `
import "NonFungibleToken"
import "NFTMoment"
import "NFTAccessory"
import "MetadataViews"

transaction(
  nftMomentId: UInt64,
) {
    let momentCollectionRef: auth(NFTMoment.Equip) &NFTMoment.Collection
    let accessoryCollectionRef: &NFTAccessory.Collection
    // let accessory: @NFTAccessory.NFT
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
    }

    execute {
        let accessory <- self.momentCollectionRef.unequipFrame(momentNFTID: nftMomentId)
        self.accessoryCollectionRef.deposit(token: <-accessory)
    }

}
`;

export function useUnequipAccessory() {
  const queryClient = useQueryClient();
  const { mutate, data: txId, isPending: isMutating, error: txError } = useFlowMutate();
  const { transactionStatus, error: statusError } = useFlowTransactionStatus({ id: txId });

  const isSealed = transactionStatus?.status === 4;
  const isPending = isMutating || (!!txId && !isSealed && transactionStatus?.status !== 5);

  const unequip = (momentID: number) => {
    mutate({
      cadence: UNEQUIP_ACCESSORY_TX,
      args: (arg, t) => [
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

  return { unequip, isPending, isSealed, error: txError || statusError };
}

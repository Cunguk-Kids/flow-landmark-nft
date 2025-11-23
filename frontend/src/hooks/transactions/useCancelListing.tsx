'use client';

import { useFlowMutate, useFlowTransactionStatus } from '@onflow/react-sdk';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const REMOVE_LISTING_TX = `
import "NFTStorefrontV2"
import "NFTAccessory"

transaction(listingResourceID: UInt64) {

    let storefront: auth(NFTStorefrontV2.RemoveListing) &NFTStorefrontV2.Storefront
    let collectionAccessories: auth(NFTAccessory.Sale) &NFTAccessory.Collection
    prepare(acct: auth(BorrowValue) &Account) {
        self.storefront = acct.storage.borrow<auth(NFTStorefrontV2.RemoveListing) &NFTStorefrontV2.Storefront>(
                from: NFTStorefrontV2.StorefrontStoragePath
            ) ?? panic("The signer does not store an NFT Storefront V2 object at the path \(NFTStorefrontV2.StorefrontStoragePath). "
                    .concat("The signer must initialize their account with this vault first!"))
        self.collectionAccessories = acct.storage.borrow<auth(NFTAccessory.Sale) &NFTAccessory.Collection>(from: NFTAccessory.CollectionStoragePath)
              ?? panic("No Ressource Collection NFTAccessory")
        
    }

    execute {
        let listingRef = self.storefront.borrowListing(listingResourceID: listingResourceID)!
        let NFTID = listingRef.getDetails().nftID
        self.collectionAccessories.itemUnlisted(nftID: NFTID)
        self.storefront.removeListing(listingResourceID: listingResourceID)
    }
}
`;

export function useCancelListing() {
  const queryClient = useQueryClient();
  const { mutate, data: txId, isPending: isCanceling, error: txError } = useFlowMutate();
  const { transactionStatus } = useFlowTransactionStatus({ id: txId });

  const isSealed = transactionStatus?.status === 4;
  const isPending = isCanceling || (!!txId && !isSealed);

  const cancelListing = (listingResourceID: number) => {
    mutate({
      cadence: REMOVE_LISTING_TX,
      args: (arg, t) => [
        arg(String(listingResourceID), t.UInt64),
      ]
    });
  };

  // Refresh data setelah sukses
  useEffect(() => {
    if (isSealed) {
      // Hapus cache listing agar item yang dihapus hilang dari UI
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      // Refresh inventory (item kembali jadi 'available' untuk di-equip/jual ulang)
      queryClient.invalidateQueries({ queryKey: ['accessories'] });
      queryClient.invalidateQueries({ queryKey: ['moments'] });
    }
  }, [isSealed, queryClient]);

  return { cancelListing, isPending, isSealed, error: txError };
}
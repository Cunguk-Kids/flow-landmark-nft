'use client';

import { useFlowMutate, useFlowTransactionStatus } from '@onflow/react-sdk';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Copy-Paste kode Cadence Anda di sini
const BUY_ITEM_TX = `
import "FungibleToken"
import "FungibleTokenMetadataViews"
import "NonFungibleToken"
import "NFTStorefrontV2"
import "MetadataViews"

transaction(
    listingResourceID: UInt64,
    storefrontAddress: Address,
    commissionRecipient: Address?,
    nftTypeIdentifier: String
) {
    let paymentVault: @{FungibleToken.Vault}
    let nftReceiver: &{NonFungibleToken.Receiver}
    let storefront: &{NFTStorefrontV2.StorefrontPublic}
    let listing: &{NFTStorefrontV2.ListingPublic}
    var commissionRecipientCap: Capability<&{FungibleToken.Receiver}>?

    prepare(acct: auth(BorrowValue) &Account) {
        // 1. Resolve NFT Metadata View
        let collectionData = MetadataViews.resolveContractViewFromTypeIdentifier(
            resourceTypeIdentifier: nftTypeIdentifier,
            viewType: Type<MetadataViews.NFTCollectionData>()
        ) as? MetadataViews.NFTCollectionData
            ?? panic("Could not construct valid NFT type and view from identifier ".concat(nftTypeIdentifier))

        self.commissionRecipientCap = nil
        
        // 2. Borrow Storefront (Seller)
        self.storefront = getAccount(storefrontAddress).capabilities.borrow<&{NFTStorefrontV2.StorefrontPublic}>(
                NFTStorefrontV2.StorefrontPublicPath
            ) ?? panic("Could not get a Storefront from the provided address")

        // 3. Borrow Listing
        self.listing = self.storefront.borrowListing(listingResourceID: listingResourceID)
            ?? panic("Could not get a listing with ID ".concat(listingResourceID.toString()))
        
        let price = self.listing.getDetails().salePrice
        let vaultType = self.listing.getDetails().salePaymentVaultType

        // 4. Resolve FT Metadata View (untuk tahu path vault pembayaran)
        let vaultData = MetadataViews.resolveContractViewFromTypeIdentifier(
            resourceTypeIdentifier: vaultType.identifier,
            viewType: Type<FungibleTokenMetadataViews.FTVaultData>()
        ) as? FungibleTokenMetadataViews.FTVaultData
            ?? panic("Could not construct valid FT type and view")

        // 5. Withdraw Payment (Buyer)
        let mainVault = acct.storage.borrow<auth(FungibleToken.Withdraw) &{FungibleToken.Vault}>(from: vaultData.storagePath)
            ?? panic("The signer does not store a Vault object at the path ".concat(vaultData.storagePath.toString()))
        
        self.paymentVault <- mainVault.withdraw(amount: price)

        // 6. Get NFT Receiver (Buyer)
        self.nftReceiver = acct.capabilities.borrow<&{NonFungibleToken.Receiver}>(collectionData.publicPath)
            ?? panic("Cannot borrow an NFT collection receiver")

        // 7. Handle Commission
        let commissionAmount = self.listing.getDetails().commissionAmount
        if commissionRecipient != nil && commissionAmount != 0.0 {
            let _commissionRecipientCap = getAccount(commissionRecipient!).capabilities.get<&{FungibleToken.Receiver}>(
                    vaultData.receiverPath
                )
            assert(_commissionRecipientCap.check(), message: "Commission Recipient invalid")
            self.commissionRecipientCap = _commissionRecipientCap
        } else if commissionAmount == 0.0 {
            self.commissionRecipientCap = nil
        } else {
            panic("Commission recipient cannot be empty when commission amount is non zero")
        }
    }

    execute {
        let item <- self.listing.purchase(
            payment: <-self.paymentVault,
            commissionRecipient: self.commissionRecipientCap
        )
        self.nftReceiver.deposit(token: <-item)
    }
}
`;

// Tipe argumen
interface BuyItemArgs {
  listingResourceID: number;
  storefrontAddress: string;
  commissionRecipient?: string | null;
  // Kita perlu tahu tipe NFT (Aksesori atau Momen) agar transaksi bisa resolve path yang benar
  nftTypeIdentifier: string;
}

export function useBuyItem() {
  const queryClient = useQueryClient();
  const { mutate, data: txId, isPending: isMutating, error: txError } = useFlowMutate();
  const { transactionStatus, error: statusError } = useFlowTransactionStatus({ id: txId });

  const isSealed = transactionStatus?.status === 4;
  const isPending = isMutating || (!!txId && !isSealed && transactionStatus?.status !== 5);

  const buy = ({
    listingResourceID,
    storefrontAddress,
    commissionRecipient = null,
    nftTypeIdentifier
  }: BuyItemArgs) => {
    mutate({
      cadence: BUY_ITEM_TX,
      args: (arg, t) => [
        arg(String(listingResourceID), t.UInt64),
        arg(storefrontAddress, t.Address),
        arg(commissionRecipient, t.Optional(t.Address)),
        arg(nftTypeIdentifier, t.String)
      ]
    });
  };

  // Refresh data setelah pembelian sukses
  useEffect(() => {
    if (isSealed) {
      // Invalidate semua query terkait marketplace dan inventory
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['accessories'] });
      queryClient.invalidateQueries({ queryKey: ['moments'] });
    }
  }, [isSealed, queryClient]);

  return {
    buy,
    isPending,
    isSealed,
    error: txError || statusError,
  };
}
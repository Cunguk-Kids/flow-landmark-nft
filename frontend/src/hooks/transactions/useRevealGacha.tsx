'use client';

import { useFlowMutate, useFlowTransactionStatus } from '@onflow/react-sdk';

const REVEAL_GACHA_TX = `
import "AccessoryPack"
import "NFTAccessory"
import "NonFungibleToken"
import "MetadataViews"
/// Retrieves the saved Receipt and redeems it to reveal the gacha result, depositing winnings with any luck
///
transaction() {

    let recipientCollectionRef: &{NonFungibleToken.Receiver}
    let randomNumber: UInt8

    prepare(signer: auth(BorrowValue, LoadValue) &Account) {
        let collectionData = NFTAccessory.resolveContractView(resourceType: nil, viewType: Type<MetadataViews.NFTCollectionData>()) as! MetadataViews.NFTCollectionData?
            ?? panic("Could not resolve NFTCollectionData view. The NFTAccessory contract needs to implement the NFTCollectionData Metadata view in order to execute this transaction")
        // Load my receipt from storage
        let receipt <- signer.storage.load<@AccessoryPack.Receipt>(from: AccessoryPack.ReceiptStoragePath)
            ?? panic("No Receipt found in storage at path=".concat(AccessoryPack.ReceiptStoragePath.toString()))
        self.randomNumber = AccessoryPack.RevealGacha(receipt: <-receipt)
        
        self.recipientCollectionRef = signer.capabilities.borrow<&{NonFungibleToken.Receiver}>(collectionData.publicPath)
            ?? panic("The recipient does not have a NonFungibleToken Receiver at "
                    .concat(collectionData.publicPath.toString())
                    .concat(" that is capable of receiving an NFT.")
                    .concat("The recipient must initialize their account with this collection and receiver first!"))
        AccessoryPack.distributeAccessory(self.randomNumber, recipient: self.recipientCollectionRef)
    }
}
`;

export function useRevealGacha() {
  const { mutate, data: txId, isPending: isMutating, error: txError, reset } = useFlowMutate();
  const { transactionStatus, error: statusError } = useFlowTransactionStatus({ id: txId });

  const isSealed = transactionStatus?.status === 4;
  const isPending = isMutating || (!!txId && !isSealed && transactionStatus?.status !== 5);

  const revealPack = () => {
    mutate({
      cadence: REVEAL_GACHA_TX,
    });
  };

  return { revealPack, isPending, isSealed, error: txError || statusError, reset, txId };
}
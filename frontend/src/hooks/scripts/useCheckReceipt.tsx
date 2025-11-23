'use client';

import { useFlowQuery } from '@onflow/react-sdk';

const CHECK_RECEIPT_SCRIPT = `
import "AccessoryPack"

access(all) fun main(address: Address): Bool {
    let account = getAccount(address)
    
    // Cek apakah ada sesuatu di path Receipt
    // Jika != nil, berarti Resi ADA -> Return TRUE
    if account.storage.type(at: AccessoryPack.ReceiptStoragePath) != nil {
        return true
    }
    
    // Jika nil, berarti kosong -> Return FALSE
    return false
}
`;

export function useCheckReceipt(address: string) {
  const { data, isLoading, refetch } = useFlowQuery({
    cadence: CHECK_RECEIPT_SCRIPT,
    args: (arg, t) => [arg(address, t.Address)],
    query: {
      // Hanya jalan jika address ada
      enabled: !!address, 
      // Jangan cache terlalu lama agar status update cepat setelah reveal
      staleTime: 0, 
    }
  });

  return { 
    hasReceipt: data as boolean, // true = Punya Resi (Siap Reveal)
    isLoading, 
    refetch 
  };
}
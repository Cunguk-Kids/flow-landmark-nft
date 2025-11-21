'use client';

import { useFlowMutate, useFlowTransactionStatus } from '@onflow/react-sdk';

const REGISTER_EVENT_TX = `
import "EventManager"

// Transaksi: User Register Event
transaction(eventID: UInt64) {

    prepare(signer: auth(BorrowValue) &Account) {
        // Panggil fungsi publik di kontrak EventManager
        // Kita meneruskan 'signer' (akun pengguna)
        EventManager.userRegisterForEvent(
            eventID: eventID,
            userAccount: signer
        )
    }

    execute {
        log("Pengguna berhasil mendaftar untuk event ID: ".concat(eventID.toString()))
    }
}
`;

export function useRegisterEvent() {
  // 1. Setup Mutasi FCL
  const { 
    mutate, 
    data: txId, 
    isPending: isMutating, 
    error: txError 
  } = useFlowMutate();

  // 2. Setup Status Pemantauan
  const { 
    transactionStatus, 
    error: statusError 
  } = useFlowTransactionStatus({ 
    id: txId 
  });

  // 3. Helper States
  const isSealed = transactionStatus?.status === 4; // 4 = SEALED (Selesai & Aman)
  const isPending = isMutating || (!!txId && !isSealed); // Loading selama proses
  const error = txError || statusError;

  // 4. Fungsi Pemicu
  const register = (eventID: number | string) => {
    mutate({
      cadence: REGISTER_EVENT_TX,
      args: (arg, t) => [
        arg(String(eventID), t.UInt64) // Pastikan dikirim sebagai String untuk UInt64
      ]
    });
  };

  return {
    register,
    isPending,
    isSealed,
    error,
    txId
  };
}
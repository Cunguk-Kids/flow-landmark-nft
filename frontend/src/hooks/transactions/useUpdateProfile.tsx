'use client';

import { useFlowMutate, useFlowTransactionStatus } from '@onflow/react-sdk';

const UPDATE_PROFILE_TX = `
import "UserProfile"
import "EventPass"
import "NFTMoment"

transaction(
  nickname: String?,
  bio: String?,
  socials: {String: String},
  pfp: String?,
  shortDescription: String?,
  bgImage: String?,
  highlightedEventPassIds: [UInt64?],
  momentID: UInt64?
) {

    prepare(signer: auth(BorrowValue) &Account) {
        //NFT Moment collection setup
        let userProfile = signer.storage.borrow<auth(UserProfile.Edit) &UserProfile.Profile>(
          from: UserProfile.ProfileStoragePath
        ) ?? panic("User Profile Ressource not found")

        let eventPassCollection = signer.storage.borrow<&EventPass.Collection>(from: EventPass.CollectionStoragePath)
        let momentCollection = signer.storage.borrow<&NFTMoment.Collection>(from: NFTMoment.CollectionStoragePath)
        let momentRef = momentID != nil ? momentCollection?.borrowNFT(momentID!) as! &NFTMoment.NFT : nil
        userProfile.updateProfile(
          nickname: nickname,
          bio: bio,
          socials: socials,
          pfp: pfp,
          shortDescription: shortDescription,
          bgImage: bgImage,
          highlightedEventPassIds: highlightedEventPassIds,
          eventPassCollection: eventPassCollection,
          momentRef: momentRef,
        )
    }
}
`;

// Tipe data input dari Frontend
export interface UpdateProfileDTO {
  nickname?: string;
  bio?: string;
  socials: Record<string, string>; // { twitter: "@...", website: "..." }
  pfp?: string;
  shortDescription?: string;
  bgImage?: string;
  momentID: number | null;
  // Untuk MVP Edit Profile, kita skip highlight ID dulu agar simpel,
  // atau kirim [] dan null sebagai default.
}

export function useUpdateProfile() {
  const { mutate, data: txId, isPending: isMutating, error: txError } = useFlowMutate();
  const { transactionStatus, error: statusError } = useFlowTransactionStatus({ id: txId });

  const isSealed = transactionStatus?.status === 4;
  const isPending = isMutating || (!!txId && !isSealed);

  const toNullable = (val?: string) => {
    if (!val || val.trim() === '') return null;
    return val.trim();
  };

  const updateProfile = (data: UpdateProfileDTO) => {
    // 1. Bersihkan Socials (Hapus key yang value-nya kosong)
    const cleanSocials: Record<string, string> = {};
    Object.entries(data.socials).forEach(([key, val]) => {
      if (val && val.trim() !== '') {
        cleanSocials[key] = val.trim();
      }
    });

    // Konversi ke format Cadence Dictionary { key, value }
    const socialsArg = Object.keys(cleanSocials).map(k => ({ key: k, value: cleanSocials[k] }));

    mutate({
      cadence: UPDATE_PROFILE_TX,
      args: (arg, t) => [
        // Gunakan helper 'toNullable' untuk semua field opsional
        arg(toNullable(data.nickname), t.Optional(t.String)),
        arg(toNullable(data.bio), t.Optional(t.String)),
        
        // Socials selalu dikirim sebagai Dictionary (bisa kosong)
        arg(socialsArg, t.Dictionary({ key: t.String, value: t.String })),
        
        arg(toNullable(data.pfp), t.Optional(t.String)),
        arg(toNullable(data.shortDescription), t.Optional(t.String)),
        arg(toNullable(data.bgImage), t.Optional(t.String)),
        
        // Highlight (Sementara hardcode nil/kosong sesuai request)
        arg([], t.Array(t.Optional(t.UInt64))), 
        arg(data.momentID, t.Optional(t.UInt64))
      ]
    });
  };

  return {
    updateProfile,
    isPending,
    isSealed,
    error: txError || statusError,
  };
}
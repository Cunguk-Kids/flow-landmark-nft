'use client';
import { useFlowQuery } from '@onflow/react-sdk';

const GET_METADATA_SCRIPT = `
import "NFTAccessory"
import "MetadataViews"

// Script sederhana untuk ambil Nama & Gambar berdasarkan ID
access(all) struct ItemData {
    access(all) let name: String
    access(all) let thumbnail: String

    init(name: String, thumbnail: String) {
        self.name = name
        self.thumbnail = thumbnail
    }
}

access(all) fun main(address: Address, id: UInt64): ItemData? {
    let account = getAccount(address)
    
    // Pinjam koleksi publik
    let collection = account.capabilities.borrow<&NFTAccessory.Collection>(
        NFTAccessory.CollectionPublicPath
    ) ?? panic("Koleksi tidak ditemukan")

    if let nft = collection.borrowNFT(id) {
        let display = MetadataViews.getDisplay(nft)!
        return ItemData(
            name: display.name,
            thumbnail: display.thumbnail.uri()
        )
    }
    return nil
}
`;

export function useGetAccessoryMetadata(address: string, id: number | null) {
  return useFlowQuery({
    cadence: GET_METADATA_SCRIPT,
    args: (arg, t) => [
        arg(address, t.Address), 
        arg(String(id), t.UInt64)
    ],
    query: {
        enabled: !!address && !!id
    }
  });
}
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageOff, Gem, Image, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNFTList } from '@/hooks';
import { useAccount } from '@/hooks/useAccount';
import { cleanImageURL } from '@/lib/cleanImageURL';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';

export default function MyListNft() {
  const { data } = useAccount();
  const { data: nfts } = useNFTList({
    eventId: '',
    userAddress: data?.address,
    limit: 10,
    page: 1,
  });

  const [openImage, setOpenImage] = useState<string | null>(null);

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            className="shadow-md rounded-lg font-medium bg-white hover:bg-gray-100 dark:bg-neutral-900 cursor-pointer">
            <Image className="w-2 h-2 text-primary" /> My NFTs
          </Button>
        </SheetTrigger>

        <SheetContent
          side="left"
          className="w-[380px] sm:w-[250px] bg-background border-r border-border p-4">
          <SheetHeader className="px-4 py-3 border-b border-border flex flex-row items-center w-full">
            <SheetTitle className="text-lg font-semibold grow">My NFT</SheetTitle>
            <SheetClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </Button>
            </SheetClose>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-64px)] px-4 py-3 space-y-3">
            {nfts?.data.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center mt-10">
                You don`t own any NFTs yet.
              </p>
            ) : (
              nfts?.data.map((nft) => {
                const imageUrl = `${import.meta.env.VITE_APP_URL.replace(
                  /\/$/,
                  '',
                )}/${cleanImageURL(nft.metadata.imageURL)}`;

                return (
                  <Card
                    key={nft.nft_id}
                    className="p-3 flex gap-3 items-start hover:bg-accent/40 transition-colors">
                    <Dialog
                      open={openImage === imageUrl}
                      onOpenChange={(open) => setOpenImage(open ? imageUrl : null)}>
                      <DialogTrigger asChild>
                        {nft.metadata.imageURL ? (
                          <img
                            src={imageUrl}
                            alt={nft.metadata.title}
                            className="w-20 h-20 object-cover rounded-md border cursor-pointer hover:opacity-80"
                            onError={(e) => (e.currentTarget.src = '/placeholder.jpg')}
                          />
                        ) : (
                          <div className="w-20 h-20 flex items-center justify-center border rounded-md bg-muted">
                            <ImageOff className="text-muted-foreground w-5 h-5" />
                          </div>
                        )}
                      </DialogTrigger>

                      {/* === Image Modal === */}
                      <DialogContent className="max-w-3xl bg-transparent border-none shadow-none p-0 flex justify-center items-center">
                        <img
                          src={imageUrl}
                          alt={nft.metadata.title}
                          className="max-h-[80vh] max-w-full rounded-lg shadow-xl"
                        />
                      </DialogContent>
                    </Dialog>

                    {/* === Nft Info === */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold line-clamp-1">
                          {nft.metadata.title || 'Untitled NFT'}
                        </h3>
                        <Badge variant="outline" className="capitalize">
                          <Gem className="w-3 h-3 mr-1" />
                          {nft.rarity || 'common'}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {nft.metadata.description || 'No description available'}
                      </p>

                      {nft.edges?.event?.eventName && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Event: <span className="font-medium">{nft.edges.event.eventName}</span>
                        </p>
                      )}
                    </div>
                  </Card>
                );
              })
            )}
          </ScrollArea>

          <div className="sticky bottom-0 bg-background z-10 py-2 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total NFTs: {nfts?.data.length}</span>
            <Button size="sm" variant="outline">
              Refresh
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageOff, Gem } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNFTList } from '@/hooks';
import { useAccount } from '@/hooks/useAccount';

export default function MyListNft() {
  const { data } = useAccount();

  const { data: nfts } = useNFTList({
    eventId: '',
    userAddress: data?.address,
    limit: 10,
    page: 1,
  });
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            className="shadow-md rounded-lg font-medium bg-white hover:bg-gray-100 dark:bg-neutral-900">
            🎴 My NFTs
          </Button>
        </SheetTrigger>

        <SheetContent
          side="left"
          className="w-[380px] sm:w-[400px] bg-background border-r border-border p-4">
          <SheetHeader className="px-4 py-3 border-b border-border">
            <SheetTitle className="text-lg font-semibold">My NFT Collection</SheetTitle>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-64px)] px-4 py-3 space-y-3">
            {nfts?.data.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center mt-10">
                You don’t own any NFTs yet.
              </p>
            ) : (
              nfts?.data.map((nft) => (
                <Card
                  key={nft.nft_id}
                  className="p-3 flex gap-3 items-start hover:bg-accent/40 transition-colors">
                  {nft.metadata.imageUrl ? (
                    <img
                      src={nft.metadata.imageUrl}
                      alt={nft.metadata.title}
                      className="w-20 h-20 object-cover rounded-md border"
                      onError={(e) => (e.currentTarget.src = '/placeholder.jpg')}
                    />
                  ) : (
                    <div className="w-20 h-20 flex items-center justify-center border rounded-md bg-muted">
                      <ImageOff className="text-muted-foreground w-5 h-5" />
                    </div>
                  )}

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
              ))
            )}
          </ScrollArea>
          <div className="sticky top-0 bg-background z-10 py-2 flex justify-between items-center">
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

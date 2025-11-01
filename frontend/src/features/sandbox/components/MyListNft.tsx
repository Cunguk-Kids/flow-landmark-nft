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
import { ImageOff, Gem, Image, X, LucideLogIn } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useNFTList, type NFT } from '@/hooks';
import { useAccount } from '@/hooks/useAccount';
import { cleanImageURL } from '@/lib/cleanImageURL';
import { memo, useEffect, useMemo, useState } from 'react';
import { isEmpty } from 'lodash';
import { useFlowCurrentUser } from '@onflow/react-sdk';
import { Typhography } from '@/components/ui/typhography';

function MyListNftComponent() {
  const { data: account } = useAccount();
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [nftList, setNftList] = useState<NFT[]>([]);
  const [openImage, setOpenImage] = useState<string | null>(null);
  const { authenticate } = useFlowCurrentUser();

  const { data: nfts, refetch } = useNFTList({
    eventId: '',
    userAddress: account?.address,
    limit: pagination.limit,
    page: pagination.page,
  });

  useEffect(() => {
    if (nfts?.data) {
      setNftList((prev) => {
        const ids = new Set(prev.map((x) => x.nft_id));
        const newOnes = nfts.data.filter((x) => !ids.has(x.nft_id));
        return [...prev, ...newOnes];
      });
    }
  }, [nfts]);

  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const isBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 50;

    if ((isBottom && !isFetchingMore && nfts?.pagination?.totalPages) || 1 > pagination.page) {
      setIsFetchingMore(true);
      await new Promise((r) => setTimeout(r, 600));
      setPagination((p) => ({ ...p, page: p.page + 1 }));
      setIsFetchingMore(false);
    }
  };

  const handleRefresh = async () => {
    setPagination({ page: 1, limit: 10 });
    setNftList([]);
    await refetch();
  };

  const nftData = useMemo(() => nftList ?? [], [nftList]);

  return (
    <div className="pointer-events-auto">
      <Sheet modal={false}>
        <SheetTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            className="shadow-md rounded-lg font-medium bg-white hover:bg-gray-100 dark:bg-neutral-900 cursor-pointer">
            <Image className="w-4 h-4 text-primary mr-2" /> My NFTs
          </Button>
        </SheetTrigger>

        <SheetContent
          side="left"
          className="w-[380px] sm:w-[500px] bg-background border-r border-border p-0">
          {/* Header */}
          <SheetHeader className="px-4 py-3 border-b border-border flex flex-row items-center">
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

          {/* NFT List */}
          <ScrollArea className="h-[calc(100vh-64px)] px-4 py-3 space-y-3" onScroll={handleScroll}>
            {isEmpty(account?.address) ? (
              <>
                <Button
                  className="w-full"
                  onClick={() => {
                    authenticate().then((x) => console.log(x));
                    requestAnimationFrame(() => {
                      const frame = document.querySelector(
                        '#FCL_IFRAME',
                      ) as HTMLIFrameElement | null;
                      if (frame) frame.style.pointerEvents = 'auto';
                    });
                  }}
                  variant="default">
                  <LucideLogIn />
                  <Typhography>Connect Wallet</Typhography>
                </Button>
              </>
            ) : (
              <>
                {nftData.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center mt-10">
                    You don’t own any NFTs yet.
                  </p>
                ) : (
                  nftData.map((nft) => {
                    const imageUrl = cleanImageURL(nft.metadata.imageURL);

                    return (
                      <Card
                        key={nft.nft_id}
                        className="p-3 flex gap-3 items-start hover:bg-accent/40 transition-colors mb-4">
                        {/* Dialog Image */}
                        <Dialog
                          open={openImage === imageUrl}
                          onOpenChange={(open) => setOpenImage(open ? imageUrl : null)}>
                          <DialogTrigger asChild>
                            {nft.metadata.imageURL ? (
                              <img
                                src={imageUrl}
                                alt={nft.metadata.title}
                                className="w-20 h-20 object-cover rounded-md border cursor-pointer hover:opacity-80"
                              />
                            ) : (
                              <div className="w-20 h-20 flex items-center justify-center border rounded-md bg-muted">
                                <ImageOff className="text-muted-foreground w-5 h-5" />
                              </div>
                            )}
                          </DialogTrigger>

                          <DialogContent className="max-w-3xl bg-transparent border-none shadow-none p-0 flex justify-center items-center">
                            <img
                              src={imageUrl}
                              alt={nft.metadata.title}
                              className="max-h-[80vh] max-w-full rounded-lg shadow-xl"
                            />
                          </DialogContent>
                        </Dialog>

                        {/* NFT Info */}
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
                              Event:{' '}
                              <span className="font-medium">{nft.edges.event.eventName}</span>
                            </p>
                          )}
                        </div>
                      </Card>
                    );
                  })
                )}

                {isFetchingMore && (
                  <div className="flex justify-center py-4 text-xs text-muted-foreground">
                    Loading more NFTs...
                  </div>
                )}
              </>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="sticky bottom-0 bg-background z-10 py-2 flex justify-between items-center px-4 border-t border-border">
            <span className="text-sm text-muted-foreground">Total NFTs: {nftData.length}</span>
            <Button size="sm" variant="outline" onClick={handleRefresh}>
              Refresh
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export const MyListNft = memo(MyListNftComponent);
export default MyListNft;

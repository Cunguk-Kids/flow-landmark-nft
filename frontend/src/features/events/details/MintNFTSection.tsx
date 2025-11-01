import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Typhography } from '@/components/ui/typhography';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { Sparkles, CheckCircle2, ExternalLink, Shuffle } from 'lucide-react';
import { useFlowMutate, useFlowTransactionStatus } from '@onflow/react-sdk';
import { motion } from 'motion/react';

// Available card images from /public
const CARD_OPTIONS = [
  { id: 1, image: '/card-1.png', name: 'Balinese Woman' },
  { id: 2, image: '/card-2.png', name: 'Candi Borobudur' },
  { id: 3, image: '/card-3.png', name: 'Javanese Woman' },
  { id: 4, image: '/card-4.png', name: 'Wayang' },
  { id: 5, image: '/card-5.png', name: 'Gamelan' },
];

interface MintNFTSectionProps {
  eventId: number;
  eventName: string;
  partnerAddress: string;
  isCheckedIn: boolean;
}

export function MintNFTSection({
  eventId,
  eventName,
  partnerAddress,
  isCheckedIn,
}: MintNFTSectionProps) {
  const [mintedCard, setMintedCard] = useState<(typeof CARD_OPTIONS)[0] | null>(null);
  const [isMinted, setIsMinted] = useState(false);
  const [isOpeningBox, setIsOpeningBox] = useState(false);
  const [showFinalReveal, setShowFinalReveal] = useState(false);
  const [loadingToastId, setLoadingToastId] = useState<string | number | null>(null);

  const { mutateAsync, isPending, data: txId } = useFlowMutate();
  const { transactionStatus } = useFlowTransactionStatus({ id: txId || '' });

  // Watch transaction status
  useEffect(() => {
    if (txId && transactionStatus?.status === 4) {
      // Status 4 = sealed
      const hasError =
        transactionStatus.errorMessage ||
        (transactionStatus.statusCode !== undefined && transactionStatus.statusCode > 1);

      if (hasError) {
        const rawError = transactionStatus.errorMessage || 'Transaction failed';
        let userFriendlyError = rawError;

        const preConditionMatch = rawError.match(/error: pre-condition failed: (.+?)(?:\n|$)/);
        if (preConditionMatch) {
          userFriendlyError = preConditionMatch[1].trim();
        } else {
          const errorMatch = rawError.match(/error: (.+?)(?:\n| {2}-->|$)/);
          if (errorMatch) {
            userFriendlyError = errorMatch[1].trim();
          }
        }

        if (loadingToastId) {
          toast.error(userFriendlyError, {
            id: loadingToastId,
            duration: 10000,
          });
          setLoadingToastId(null);
        } else {
          toast.error(userFriendlyError, { duration: 10000 });
        }
      } else {
        // Success - trigger box opening animation
        if (loadingToastId) {
          toast.success('NFT minted successfully!', { id: loadingToastId });
          setLoadingToastId(null);
        } else {
          toast.success('NFT minted successfully!');
        }

        // Start box opening animation
        setIsOpeningBox(true);

        // After 3.6 seconds (0.6s blur + 3s animation), show final reveal (but don't close)
        setTimeout(() => {
          setShowFinalReveal(true);
        }, 3600);
      }
    } else if (txId && transactionStatus?.status === 5) {
      // Status 5 = expired
      if (loadingToastId) {
        toast.error('Transaction expired. Please try again.', {
          id: loadingToastId,
        });
        setLoadingToastId(null);
      }
    }
  }, [transactionStatus, txId, loadingToastId]);

  const handleMint = async () => {
    // Randomly select a card
    const randomIndex = Math.floor(Math.random() * CARD_OPTIONS.length);
    const card = CARD_OPTIONS[randomIndex];

    setMintedCard(card);

    try {
      await mutateAsync({
        cadence: `
import "EventPlatform"
import "NFTMoment"

transaction(
    eventID: UInt64,
    partnerAddress: Address,
    rarityRawValue: UInt8,
    title: String,
    description: String,
    imageURL: String,
    timestamp: UFix64
) {
    let userAddress: Address

    prepare(signer: auth(Storage, Capabilities) &Account) {
        self.userAddress = signer.address

        // Setup NFTMoment collection if not exists
        if signer.storage.borrow<&NFTMoment.Collection>(from: NFTMoment.CollectionStoragePath) == nil {
            let collection <- NFTMoment.createEmptyCollection(ownerAddress: self.userAddress)
            signer.storage.save(<-collection, to: NFTMoment.CollectionStoragePath)
            signer.capabilities.publish(
                signer.capabilities.storage.issue<&{NFTMoment.CollectionPublic}>(NFTMoment.CollectionStoragePath),
                at: NFTMoment.CollectionPublicPath
            )
        } else if !signer.capabilities.exists(NFTMoment.CollectionPublicPath) {
            signer.capabilities.publish(
                signer.capabilities.storage.issue<&{NFTMoment.CollectionPublic}>(NFTMoment.CollectionStoragePath),
                at: NFTMoment.CollectionPublicPath
            )
        }
    }

    execute {
        // Build metadata with hardcoded optional fields
        let category = NFTMoment.Category.Event
        let thumbnailURL: String? = nil
        let weather: String? = nil
        let temperature: String? = nil
        let location: NFTMoment.Location? = nil
        let altitude: String? = nil
        let windSpeed: String? = nil
        let border = NFTMoment.BorderStyle.Batik
        let sticker: NFTMoment.StickerStyle? = nil
        let filter: NFTMoment.FilterStyle? = nil
        let audio: NFTMoment.AudioStyle? = nil
        let javaneseText: String? = nil
        let tags: [String]? = nil
        let attributes: {String: String}? = nil

        let metadata = NFTMoment.MomentMetadata(
            title: title,
            description: description,
            category: category,
            imageURL: imageURL,
            thumbnailURL: thumbnailURL,
            timestamp: timestamp,
            weather: weather,
            temperature: temperature,
            location: location,
            altitude: altitude,
            windSpeed: windSpeed,
            border: border,
            sticker: sticker,
            filter: filter,
            audio: audio,
            javaneseText: javaneseText,
            tags: tags,
            attributes: attributes
        )

        let rarity = NFTMoment.Rarity(rawValue: rarityRawValue)!

        let newNftID = EventPlatform.claimEventNFT(
            eventID: eventID,
            userAddress: self.userAddress,
            partnerAddress: partnerAddress,
            metadata: metadata,
            rarity: rarity
        )
    }
}
        `,
        args: (arg, t) => [
          arg(String(eventId), t.UInt64),
          arg(partnerAddress, t.Address),
          arg('1', t.UInt8), // Rare rarity
          arg(`${eventName} - ${card.name}`, t.String),
          arg(`Cultural NFT moment from ${eventName}`, t.String),
          arg(card.image, t.String),
          arg(String(Date.now() / 1000), t.UFix64),
        ],
        limit: 999,
      });

      const toastId = toast.loading('Minting NFT on blockchain...');
      setLoadingToastId(toastId);
    } catch (error) {
      console.error('Mint error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to mint NFT');
    }
  };

  if (!isCheckedIn) {
    return null; // Don't show if user hasn't checked in
  }

  const handleClose = () => {
    setIsOpeningBox(false);
    setShowFinalReveal(false);
    setIsMinted(true);
  };

  return (
    <>
      {isOpeningBox && mintedCard && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{
            opacity: 1,
            backdropFilter: 'blur(12px)',
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="fixed h-screen inset-0 z-50 flex items-center justify-center bg-black/80">
          {/* Close Button - Only show after animation completes */}
          {showFinalReveal && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleClose}
              className="absolute top-8 right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-colors group z-50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white group-hover:rotate-90 transition-transform duration-300">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </motion.button>
          )}

          <div className="relative">
            {/* Sparkles Background */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.3 }}>
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-primary rounded-full"
                  initial={{
                    x: 0,
                    y: 0,
                    scale: 0,
                    opacity: 0,
                  }}
                  animate={{
                    x: Math.cos((i * Math.PI * 2) / 20) * 150,
                    y: Math.sin((i * Math.PI * 2) / 20) * 150,
                    scale: [0, 1.5, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 0.6 + i * 0.1,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </motion.div>

            {/* Box Container */}
            <motion.div
              className="relative z-10"
              initial={{ scale: 0.5, rotateY: 0, opacity: 0 }}
              animate={{
                scale: [0.5, 1.2, 1],
                rotateY: [0, 360, 720],
                opacity: 1,
              }}
              transition={{ duration: 2, delay: 0.6, ease: 'easeInOut' }}>
              {/* Mystery Box */}
              <motion.div
                className="w-64 h-64 relative"
                initial={{ opacity: 1 }}
                animate={{ opacity: [1, 1, 0] }}
                transition={{ duration: 2, times: [0, 0.7, 1] }}>
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-purple-500 to-pink-500 rounded-2xl shadow-2xl shadow-primary/50 flex items-center justify-center">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      repeatType: 'reverse',
                    }}>
                    <Sparkles className="text-white fill-white" size={80} />
                  </motion.div>
                </div>

                {/* Box Lid Opening Effect */}
                <motion.div
                  className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-primary to-purple-500 rounded-t-2xl"
                  initial={{ y: 0, rotateX: 0 }}
                  animate={{ y: -100, rotateX: -45 }}
                  transition={{ duration: 0.8, delay: 1.8 }}
                  style={{ transformOrigin: 'bottom' }}
                />
              </motion.div>

              {/* Card Reveal */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, y: 50, scale: 0.5 }}
                animate={{
                  opacity: [0, 0, 1],
                  y: [50, 50, 0],
                  scale: [0.5, 0.5, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  delay: 0.6,
                  times: [0, 0.6, 0.7, 1],
                  ease: 'easeOut',
                }}>
                <div className="relative">
                  {/* Glow Effect */}
                  <motion.div
                    className="absolute inset-0 bg-primary rounded-2xl blur-3xl"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: 'reverse',
                    }}
                  />

                  {/* Card Image */}
                  <motion.div
                    className="relative w-48 h-64 rounded-2xl overflow-hidden border-4 border-primary shadow-2xl shadow-primary/50"
                    animate={{
                      rotateY: [0, 360],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 1,
                      delay: 2.6,
                      ease: 'easeInOut',
                    }}>
                    <img
                      src={mintedCard.image}
                      alt={mintedCard.name}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>

            {/* Card Name Reveal */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 text-center w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: [0, 0, 1], y: [20, 20, 0] }}
              transition={{ duration: 2, delay: 0.6, times: [0, 0.7, 1] }}>
              <Typhography variant="3xl" className="font-bold text-white drop-shadow-lg">
                {mintedCard.name}
              </Typhography>
              <Typhography variant="lg" className="text-primary drop-shadow-lg">
                Rare Cultural NFT
              </Typhography>

              {/* Continue Button - Only show after animation completes */}
              {showFinalReveal && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6">
                  <Button onClick={handleClose} size="lg" className="font-semibold">
                    <CheckCircle2 size={20} />
                    <Typhography variant="lg">Continue</Typhography>
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background/10 backdrop-blur-lg border border-border rounded-xl p-6 space-y-6">
        {isMinted && mintedCard ? (
          <>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/20">
                <CheckCircle2 className="text-primary" size={24} />
              </div>
              <div>
                <Typhography variant="lg" className="font-semibold text-primary">
                  NFT Minted Successfully!
                </Typhography>
                <Typhography variant="t2" className="text-muted-foreground">
                  Your cultural moment has been saved to the blockchain
                </Typhography>
              </div>
            </div>
            {/* Show the minted card */}
            <div className="flex items-center gap-4 bg-primary/5 backdrop-blur-sm rounded-lg p-4">
              <div className="relative w-24 h-32 rounded-lg overflow-hidden border-2 border-primary/50">
                <img
                  src={mintedCard.image}
                  alt={mintedCard.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <Typhography variant="lg" className="font-semibold mb-1">
                  {mintedCard.name}
                </Typhography>
                <Typhography variant="t2" className="text-muted-foreground">
                  Cultural NFT Design
                </Typhography>
              </div>
            </div>
            {txId && (
              <a
                href={`https://testnet.flowscan.io/transaction/${txId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm">
                <Typhography variant="t2" className="font-mono">
                  {txId.slice(0, 8)}...{txId.slice(-6)}
                </Typhography>
                <ExternalLink size={12} />
              </a>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/20">
                <Sparkles className="text-primary" size={24} />
              </div>
              <div>
                <Typhography variant="lg" className="font-semibold">
                  Mint Your Cultural NFT
                </Typhography>
                <Typhography variant="t2" className="text-muted-foreground">
                  Get a random cultural design as your NFT
                </Typhography>
              </div>
            </div>

            {/* Card Preview Grid - Show all available cards */}
            <div className="grid grid-cols-5 gap-3">
              {CARD_OPTIONS.map((card) => (
                <div
                  key={card.id}
                  className="relative aspect-[3/4] rounded-lg overflow-hidden border-2 border-border opacity-60">
                  <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            <div className="bg-primary/5 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3">
              <Shuffle className="text-primary" size={20} />
              <Typhography variant="t1" className="text-muted-foreground">
                You'll receive one of these cultural designs randomly
              </Typhography>
            </div>

            {/* Mint Button */}
            <Button
              size="lg"
              onClick={handleMint}
              disabled={isPending || (!!txId && transactionStatus?.status !== 4)}
              className="w-full font-semibold">
              {isPending || (!!txId && transactionStatus?.status !== 4) ? (
                <>
                  <Spinner />
                  <Typhography variant="lg">
                    {!txId ? 'Minting NFT...' : 'Processing on blockchain...'}
                  </Typhography>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <Typhography variant="lg">Mint Random NFT</Typhography>
                </>
              )}
            </Button>

            <Typhography variant="t2" className="text-muted-foreground text-center">
              Your NFT will be saved to your wallet with a random cultural design
            </Typhography>
          </>
        )}
      </motion.div>
    </>
  );
}

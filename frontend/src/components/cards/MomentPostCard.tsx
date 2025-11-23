import { type Moment } from "@/hooks/api/useGetMoments";
import { User, Heart, MessageCircle, Share2, MapPin, Layers } from "lucide-react";
import { useToggleLike } from "@/hooks/api/useSocialHooks";
import { useFlowCurrentUser } from "@onflow/react-sdk";
import { useState } from "react";
import CommentSection from "../social/CommentSection";
import { cn } from "@/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import CompactProfileCard from "@/components/CompactProfileCard";

interface MomentPostCardProps {
  moment: Moment;
}

export default function MomentPostCard({ moment }: MomentPostCardProps) {
  const { user } = useFlowCurrentUser();
  const toggleLikeMutation = useToggleLike();
  const [showComments, setShowComments] = useState(false);

  const owner = moment.edges.owner;
  const accessories = moment.edges.equipped_accessories || [];
  const eventPass = moment.edges.minted_with_pass;

  const isLiked = moment.is_liked;
  const likeCount = moment.like_count || 0;
  const commentCount = moment.comment_count || 0;

  const handleLike = () => {
    if (!user?.addr) return;
    toggleLikeMutation.mutate({
      momentId: moment.id,
      userAddress: user.addr,
    });
  };

  return (
    <div className="bg-rpn-card border-2 border-rpn-blue/30 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(41,171,226,0.1)] mb-8 transition-all hover:border-rpn-blue hover:shadow-[0_0_30px_rgba(41,171,226,0.2)]">

      {/* --- HEADER: USER INFO --- */}
      <div className="p-4 flex items-center justify-between border-b border-rpn-blue/20 bg-rpn-dark/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="flex items-center gap-3 cursor-pointer group">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-lg bg-rpn-dark border-2 border-rpn-blue overflow-hidden group-hover:scale-105 transition-transform shadow-md">
                  {owner.pfp ? (
                    <img
                      src={owner.pfp}
                      alt={owner.nickname}
                      className="w-full h-full object-cover"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-rpn-blue">
                      <User size={20} />
                    </div>
                  )}
                </div>

                {/* Name & Address */}
                <div>
                  <h3 className="font-bold text-white text-sm leading-none group-hover:text-rpn-blue transition-colors font-pixel uppercase tracking-tight">
                    {owner.nickname || "Anonymous"}
                  </h3>
                  <p className="text-[10px] text-rpn-muted font-mono mt-1 bg-rpn-dark px-1.5 py-0.5 rounded inline-block border border-white/5">
                    {owner.address}
                  </p>
                </div>
              </div>
            </HoverCardTrigger>

            <HoverCardContent className="w-80 p-0 border-none bg-transparent shadow-none z-50" sideOffset={10}>
              <CompactProfileCard
                address={owner.address}
                user={owner}
              />
            </HoverCardContent>
          </HoverCard>
        </div>

        {/* Event Badge */}
        {eventPass && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rpn-blue/10 text-rpn-blue rounded border border-rpn-blue/30 hover:bg-rpn-blue/20 transition-colors cursor-help" title={`Minted at ${eventPass.event?.name}`}>
            <MapPin size={12} />
            <span className="text-[10px] font-bold uppercase tracking-wide truncate max-w-[100px]">
              {eventPass.event?.name || "Event"}
            </span>
          </div>
        )}
      </div>

      {/* --- IMAGE AREA (PAPER DOLL) --- */}
      <div className="relative aspect-square bg-black group overflow-hidden border-b border-rpn-blue/20">

        {/* Layer 1: Moment */}
        <img
          src={moment.thumbnail}
          alt={moment.name}
          className="w-full h-full object-cover absolute inset-0 z-10"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Layer 2: Accessories */}
        {accessories.map((acc, idx) => (
          <img
            key={acc.id}
            src={acc.thumbnail}
            alt={acc.name}
            className="w-full h-full object-contain absolute inset-0 z-20 pointer-events-none"
            style={{ imageRendering: 'pixelated', zIndex: 20 + idx }}
          />
        ))}

        {/* Overlay Info (Hidden by default, show on hover) */}
        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 flex items-end justify-between">
          <div>
            <p className="text-white font-bold font-pixel text-sm">{moment.name}</p>
            <p className="text-rpn-muted text-xs font-mono">#{moment.nft_id}</p>
          </div>
          {accessories.length > 0 && (
            <div className="bg-black/50 backdrop-blur border border-white/20 px-2 py-1 rounded text-[10px] text-white flex items-center gap-1">
              <Layers size={10} /> {accessories.length} Items
            </div>
          )}
        </div>
      </div>

      {/* --- ACTIONS & CONTENT --- */}
      <div className="p-4 bg-rpn-card">

        {/* Action Buttons */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={handleLike}
            disabled={toggleLikeMutation.isPending}
            className={cn(
              "group flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all",
              isLiked
                ? "border-red-500/50 bg-red-500/10 text-red-500"
                : "border-transparent hover:bg-white/5 text-rpn-muted hover:text-white"
            )}
          >
            <Heart
              size={20}
              className={cn(
                "transition-transform group-active:scale-75",
                isLiked ? "fill-current" : ""
              )}
            />
            <span className="text-xs font-bold font-mono">
              {likeCount > 0 ? likeCount : "Like"}
            </span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg border border-transparent hover:bg-white/5 transition-all ${showComments ? 'text-rpn-blue bg-rpn-blue/10 border-rpn-blue/30' : 'text-rpn-muted hover:text-white'}`}
          >
            <MessageCircle size={20} />
            <span className="text-xs font-bold font-mono">
              {commentCount > 0 ? commentCount : "Comment"}
            </span>
          </button>

          <button className="ml-auto text-rpn-muted hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg">
            <Share2 size={20} />
          </button>
        </div>

        {/* Caption */}
        <div className="mb-3 text-sm leading-relaxed">
          <span className="font-bold text-white mr-2 hover:underline cursor-pointer">
            {owner.nickname || "User"}
          </span>
          <span className="text-rpn-muted">{moment.description}</span>
        </div>

        {/* Timestamp */}
        <p className="text-[10px] text-rpn-muted/50 uppercase font-bold tracking-wider font-mono">
          Minted • {new Date().toLocaleDateString()} {/* Ganti dengan created_at dari API jika ada */}
        </p>

        {/* Comment Section (Divider) */}
        {showComments && (
          <CommentSection momentId={moment.id} />
        )}
      </div>
    </div>
  );
}
import { type Moment } from "@/hooks/api/useGetMoments";
import { User, Heart, MessageCircle, Share2, MapPin, ExternalLink } from "lucide-react";
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
import ProfileCard from "@/components/ProfileCard";
import { Link } from "@tanstack/react-router";

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
    if (!user?.addr) return; // TODO: Show login prompt
    toggleLikeMutation.mutate({
      momentId: moment.id,
      userAddress: user.addr,
    });
  };

  return (
    <div className="bg-white border-2 border-rpn-dark rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] mb-8">
      {/* Header: User Info */}
      <div className="p-4 flex items-center justify-between border-b-2 border-rpn-dark/10 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-rpn-blue border-2 border-black overflow-hidden group-hover:scale-105 transition-transform">
                  {owner.pfp ? (
                    <img
                      src={owner.pfp}
                      alt={owner.nickname}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <User size={20} />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-rpn-dark text-sm leading-none group-hover:text-rpn-blue transition-colors">
                    {owner.nickname || owner.address}
                  </h3>
                  <p className="text-[10px] text-rpn-muted font-mono mt-1">
                    {owner.address}
                  </p>
                </div>
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-0 border-none bg-transparent shadow-none">
              <div className="relative w-full h-[400px]">
                <ProfileCard address={owner.address} />
                <div className="absolute bottom-4 right-4 z-50">
                  <Link
                    to="/users/$address"
                    params={{ address: owner.address }}
                    className="flex items-center gap-2 bg-white text-rpn-dark px-3 py-1.5 rounded-full text-xs font-bold border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
                  >
                    <span>Check Detail</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>

        {eventPass && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-green-100 text-green-700 rounded border border-green-200">
            <MapPin size={10} />
            <span className="text-[10px] font-bold uppercase tracking-wide">
              {eventPass.event?.name || "Event"}
            </span>
          </div>
        )}
      </div>

      {/* Image Area */}
      <div className="relative aspect-square bg-gray-100 border-b-2 border-rpn-dark/10 group">
        <img
          src={moment.thumbnail}
          alt={moment.name}
          className="w-full h-full object-cover"
        />

        {/* Accessories Overlay (Simple visualization) */}
        {accessories.length > 0 && (
          <div className="absolute bottom-2 right-2 flex gap-1">
            {accessories.map((acc) => (
              <div
                key={acc.id}
                className="w-8 h-8 rounded-lg bg-black/50 backdrop-blur border border-white/20 p-1"
                title={acc.name}
              >
                <img
                  src={acc.thumbnail}
                  alt={acc.name}
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4">
        {/* Actions */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={handleLike}
            disabled={toggleLikeMutation.isPending}
            className={cn(
              "group flex items-center gap-1.5 transition-colors",
              isLiked ? "text-red-500" : "text-rpn-dark hover:text-red-500"
            )}
          >
            <Heart
              size={20}
              className={cn(
                "transition-all",
                isLiked ? "fill-current" : "group-hover:fill-current"
              )}
            />
            <span className="text-xs font-bold">
              {likeCount > 0 ? `${likeCount} Likes` : "Like"}
            </span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="group flex items-center gap-1.5 text-rpn-dark hover:text-blue-500 transition-colors"
          >
            <MessageCircle size={20} />
            <span className="text-xs font-bold">
              {commentCount > 0 ? `${commentCount} Comments` : "Comment"}
            </span>
          </button>

          <button className="ml-auto text-rpn-muted hover:text-rpn-dark transition-colors">
            <Share2 size={20} />
          </button>
        </div>

        {/* Caption */}
        <div className="mb-2">
          <span className="font-black text-sm mr-2">
            {owner.nickname || "User"}
          </span>
          <span className="text-sm text-rpn-dark/80">{moment.description}</span>
        </div>

        <p className="text-[10px] text-rpn-muted uppercase font-bold tracking-wider">
          Moment #{moment.nft_id} • {moment.name}
        </p>

        {/* Comment Section */}
        {showComments && <CommentSection momentId={moment.id} />}
      </div>
    </div>
  );
}
import { useState } from "react";
import { useAddComment, useGetComments } from "@/hooks/api/useSocialHooks";
import { Loader2, Send, User } from "lucide-react";
import { useFlowCurrentUser } from "@onflow/react-sdk";
import ProfilePopup from "@/components/profile/ProfilePopup";

interface CommentSectionProps {
  momentId: number;
}

export default function CommentSection({ momentId }: CommentSectionProps) {
  const { user } = useFlowCurrentUser();
  const { data, isLoading } = useGetComments(momentId);
  const addCommentMutation = useAddComment();
  const [newComment, setNewComment] = useState("");

  // State untuk Mobile: Melacak ID user mana yang sedang "diklik" (aktif)
  // Di desktop ini tidak dipakai karena pakai HoverCard
  const [activeMobileProfile, setActiveMobileProfile] = useState<string | null>(null);

  const handleAddComment = () => {
    if (!newComment.trim() || !user?.addr) return;
    addCommentMutation.mutate(
      {
        momentId,
        userAddress: user.addr,
        content: newComment,
      },
      {
        onSuccess: () => {
          setNewComment("");
        },
      }
    );
  };

  return (
    <div className="mt-4 pt-4 border-t border-white/10 animate-in slide-in-from-top-2 fade-in duration-300">
      <h4 className="text-xs font-bold mb-3 text-rpn-blue uppercase tracking-wider font-pixel">
        Comments ({data?.data?.length || 0})
      </h4>

      {/* Comment List */}
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-rpn-blue" />
          </div>
        ) : data?.data && data.data.length > 0 ? (
          data.data.map((comment) => (
            <div key={comment.id} className="flex gap-3 text-sm group items-start relative">

              {/* AVATAR + POPUP */}
              <ProfilePopup address={comment.user.address} user={comment.user} side="right" align="start">
                <div
                  className="w-10 h-10 rounded-lg bg-rpn-dark border border-white/10 flex-shrink-0 overflow-hidden cursor-pointer hover:border-rpn-blue transition-colors"
                >
                  {comment.user.pfp ? (
                    <img
                      src={comment.user.pfp}
                      alt={comment.user.nickname}
                      className="w-full h-full object-cover"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-rpn-muted">
                      <User size={12} />
                    </div>
                  )}
                </div>
              </ProfilePopup>

              {/* Content Bubble */}
              <div className="bg-rpn-dark/50 border border-white/5 p-2 rounded-lg rounded-tl-none flex-1 hover:border-rpn-blue/30 transition-colors">
                <div className="flex items-center justify-between mb-0.5">
                  {/* Nama juga bisa di-hover */}
                  <ProfilePopup address={comment.user.address} user={comment.user}>
                    <span className="font-bold text-[10px] text-white font-pixel uppercase cursor-pointer hover:text-rpn-blue hover:underline decoration-1 underline-offset-2 transition-all">
                      {comment.user.nickname || "Anon"}
                    </span>
                  </ProfilePopup>

                  <span className="text-[9px] text-rpn-muted font-mono opacity-70">
                    {new Date(comment.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-gray-300 text-[11px] leading-snug font-sans break-words">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 border-2 border-dashed border-white/5 rounded-lg bg-white/5">
            <p className="text-xs text-rpn-muted italic">
              No signals yet. Be the first to transmit.
            </p>
          </div>
        )}
      </div>

      {/* Add Comment Input (Tetap sama) */}
      {user?.addr ? (
        <div className="flex gap-2 items-center bg-rpn-dark p-1 rounded-xl border border-white/10 focus-within:border-rpn-blue/50 transition-colors shadow-sm">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder:text-gray-600 focus:outline-none font-mono"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddComment();
            }}
          />
          <button
            onClick={handleAddComment}
            disabled={addCommentMutation.isPending || !newComment.trim()}
            className="p-1.5 bg-rpn-blue text-rpn-dark rounded-lg hover:bg-white hover:text-rpn-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {addCommentMutation.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} strokeWidth={2.5} />
            )}
          </button>
        </div>
      ) : (
        <p className="text-[10px] text-center text-rpn-muted bg-white/5 py-2 rounded-lg border border-white/5 uppercase font-bold tracking-wider">
          Connect wallet to join the frequency.
        </p>
      )}
    </div>
  );
}
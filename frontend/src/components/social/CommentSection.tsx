import { useState } from "react";
import { useAddComment, useGetComments } from "@/hooks/api/useSocialHooks";
import { Loader2, Send, User } from "lucide-react";
import { useFlowCurrentUser } from "@onflow/react-sdk";

interface CommentSectionProps {
  momentId: number;
}

export default function CommentSection({ momentId }: CommentSectionProps) {
  const { user } = useFlowCurrentUser();
  const { data, isLoading } = useGetComments(momentId);
  const addCommentMutation = useAddComment();
  const [newComment, setNewComment] = useState("");

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
            <div key={comment.id} className="flex gap-3 text-sm group">

              {/* Avatar */}
              <div className="w-8 h-8 rounded-lg bg-rpn-dark border border-white/10 flex-shrink-0 overflow-hidden">
                {comment.user.pfp ? (
                  <img
                    src={comment.user.pfp}
                    alt={comment.user.nickname}
                    className="w-full h-full object-cover"
                    style={{ imageRendering: 'pixelated' }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-rpn-muted">
                    <User size={14} />
                  </div>
                )}
              </div>

              {/* Content Bubble */}
              <div className="bg-rpn-dark/50 border border-white/5 p-2.5 rounded-lg rounded-tl-none flex-1 hover:border-rpn-blue/30 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-white font-pixel uppercase">
                    {comment.user.nickname || "Anon"}
                  </span>
                  <span className="text-[10px] text-rpn-muted font-mono">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-300 text-xs leading-snug font-sans">
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

      {/* Add Comment Input */}
      {user?.addr ? (
        <div className="flex gap-2 items-center bg-rpn-dark p-1 rounded-xl border border-white/10 focus-within:border-rpn-blue/50 transition-colors">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none font-mono"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddComment();
            }}
          />
          <button
            onClick={handleAddComment}
            disabled={addCommentMutation.isPending || !newComment.trim()}
            className="p-2 bg-rpn-blue text-rpn-dark rounded-lg hover:bg-white hover:text-rpn-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {addCommentMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} strokeWidth={2.5} />
            )}
          </button>
        </div>
      ) : (
        <p className="text-xs text-center text-rpn-muted bg-white/5 py-2 rounded-lg border border-white/5">
          Connect wallet to join the frequency.
        </p>
      )}
    </div>
  );
}
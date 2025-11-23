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
    <div className="mt-4 pt-4 border-t border-gray-100">
      <h4 className="text-sm font-bold mb-3 text-rpn-dark">Comments</h4>

      {/* Comment List */}
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-rpn-muted" />
          </div>
        ) : data?.data && data.data.length > 0 ? (
          data.data.map((comment) => (
            <div key={comment.id} className="flex gap-2 text-sm">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                {comment.user.pfp ? (
                  <img
                    src={comment.user.pfp}
                    alt={comment.user.nickname}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <User size={14} />
                  </div>
                )}
              </div>
              <div className="bg-gray-50 p-2 rounded-lg flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-xs">
                    {comment.user.nickname || comment.user.address}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 leading-snug">{comment.content}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-gray-400 text-center py-2">
            No comments yet. Be the first!
          </p>
        )}
      </div>

      {/* Add Comment Input */}
      {user?.addr ? (
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-rpn-blue transition-colors"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddComment();
            }}
          />
          <button
            onClick={handleAddComment}
            disabled={addCommentMutation.isPending || !newComment.trim()}
            className="p-2 bg-rpn-dark text-white rounded-full hover:bg-rpn-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {addCommentMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
      ) : (
        <p className="text-xs text-center text-rpn-muted bg-gray-50 py-2 rounded-lg">
          Please login to comment
        </p>
      )}
    </div>
  );
}

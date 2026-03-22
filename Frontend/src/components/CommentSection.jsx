import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../utils/axios";
import { Link } from "react-router-dom";
import { formatTimeAgo } from "../utils/timeAgo";

function CommentSection({ videoId }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // --- UI States ---
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [showRepliesFor, setShowRepliesFor] = useState({});
  const [deleteModalId, setDeleteModalId] = useState(null);
  const menuRef = useRef(null);
  const sortRef = useRef(null);

  const [sortBy, setSortBy] = useState("createdAt");
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalComments, setTotalComments] = useState(0);

  const currentUser = useSelector((state) => state.auth.userData);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpenMenuId(null);
      if (sortRef.current && !sortRef.current.contains(event.target)) setIsSortMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleReplies = (commentId) => {
    setShowRepliesFor((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const fetchComments = async (pageNum = 1, append = false) => {
    if (!videoId) return;
    try {
      const res = await axiosInstance.get(`/comments/${videoId}?page=${pageNum}&limit=50&sortBy=${sortBy}`);
      const data = res.data.data;
      const fetchedArray = data.docs || data.comments || [];

      if (append) {
        setComments((prev) => [...prev, ...fetchedArray]);
      } else {
        setComments(fetchedArray);
      }

      setHasNextPage(data.hasNextPage || false);
      setTotalComments(data.totalDocs || data.totalComments || 0);
    } catch (err) {
      console.error("❌ API ERROR:", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    setFetching(true);
    fetchComments(1, false);
  }, [videoId, sortBy]);

  const addComment = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      await axiosInstance.post(`/comments/${videoId}`, { content });
      setContent("");
      fetchComments(1, false);
    } catch (error) {
      console.error("Add comment failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (parentId) => {
    if (!replyContent.trim()) return;
    try {
      await axiosInstance.post(`/comments/${videoId}`, { content: replyContent, parentComment: parentId });
      setReplyContent("");
      setReplyingToId(null);
      setShowRepliesFor((prev) => ({ ...prev, [parentId]: true }));
      fetchComments(1, false);
    } catch (error) {
      console.error("Reply failed:", error);
    }
  };

  const handleUpdate = async (commentId) => {
    if (!editContent.trim()) return;
    try {
      await axiosInstance.patch(`/comments/c/${commentId}`, { content: editContent });
      setComments(comments.map((c) => (c._id === commentId ? { ...c, content: editContent } : c)));
      setEditingId(null);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  // 🚀 UPDATED: handleLikeToggle with Mutual Exclusion
  const handleLikeToggle = async (commentId) => {
    if (!currentUser) return alert("Please login to like comments");
    try {
      const res = await axiosInstance.post(`/likes/toggle/c/${commentId}`);
      if (res.data) {
        setComments(prev => prev.map(c => {
          if (c._id === commentId) {
            const currentlyLiked = c.isLiked;
            return {
              ...c,
              isLiked: !currentlyLiked,
              isDisliked: false, // Mutual exclusion
              likesCount: currentlyLiked ? (c.likesCount - 1) : (c.likesCount + 1)
            };
          }
          return c;
        }));
      }
    } catch (error) {
      console.error("Like toggle failed", error);
    }
  };

  // 🚀 NEW: handleDislikeToggle for comments
  const handleDislikeToggle = async (commentId) => {
    if (!currentUser) return alert("Please login to dislike comments");
    try {
      // Endpoint typically accepts a type or uses a separate dislike route
      const res = await axiosInstance.post(`/likes/toggle/c/${commentId}?type=dislike`);
      if (res.data) {
        setComments(prev => prev.map(c => {
          if (c._id === commentId) {
            const currentlyDisliked = c.isDisliked;
            const wasLiked = c.isLiked;
            return {
              ...c,
              isDisliked: !currentlyDisliked,
              isLiked: false, // Mutual exclusion
              likesCount: wasLiked ? (c.likesCount - 1) : c.likesCount
            };
          }
          return c;
        }));
      }
    } catch (error) {
      console.error("Dislike toggle failed", error);
    }
  };

  const confirmDelete = async () => {
    if (!deleteModalId) return;
    try {
      await axiosInstance.delete(`/comments/c/${deleteModalId}`);
      setComments(comments.filter((c) => c._id !== deleteModalId));
      setTotalComments((prev) => prev - 1);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleteModalId(null);
    }
  };

  if (fetching && page === 1) return <div className="text-slate-400 py-10 text-center italic">Loading comments...</div>;

  return (
    <div className="mt-8 border-t border-slate-700 pt-6 text-white mb-20 relative">
      <div className="flex items-center gap-8 mb-6">
        <h3 className="text-xl font-bold">{totalComments} Comments</h3>
        <div className="relative" ref={sortRef}>
          <button onClick={() => setIsSortMenuOpen(!isSortMenuOpen)} className="flex items-center gap-2 text-sm font-bold hover:bg-slate-800 px-2 py-1 rounded transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25" /></svg>
            Sort by
          </button>
          {isSortMenuOpen && (
            <div className="absolute top-10 left-0 bg-zinc-900 border border-zinc-800 py-2 rounded shadow-2xl z-30 w-40 overflow-hidden">
              <button onClick={() => { setSortBy("likes"); setIsSortMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-800 ${sortBy === "likes" ? "bg-zinc-800 font-bold" : ""}`}>Top comments</button>
              <button onClick={() => { setSortBy("createdAt"); setIsSortMenuOpen(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-800 ${sortBy === "createdAt" ? "bg-zinc-800 font-bold" : ""}`}>Newest first</button>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={addComment} className="flex gap-4 mb-6">
        <img src={currentUser?.avatar || "https://via.placeholder.com/40"} className="h-10 w-10 rounded-full object-cover border border-slate-700" alt="me" />
        <div className="flex-1 flex flex-col gap-2">
          <input type="text" placeholder="Add a comment..." className="bg-transparent border-b border-slate-600 focus:border-orange-500 outline-none py-1 transition-all" value={content} onChange={(e) => setContent(e.target.value)} />
          <div className="flex justify-end">
            <button type="submit" disabled={loading || !content.trim()} className="bg-orange-600 px-5 py-1.5 rounded-full font-bold text-sm hover:bg-orange-700">
              {loading ? "Posting..." : "Comment"}
            </button>
          </div>
        </div>
      </form>

      <div className="h-[1px] bg-slate-700 w-full mb-8 shadow-sm"></div>

      <div className="space-y-8">
        {comments
          .filter((c) => !c.parentComment)
          .map((comment) => {
            const replies = comments.filter((r) => (r.parentComment?._id || r.parentComment) === comment._id);

            return (
              <div key={comment._id} className="flex flex-col gap-4 group">
                <div className="flex gap-4 relative">
                  <Link to={`/user/${comment.owner?._id}`}>
                    <img src={comment.owner?.avatar || "https://via.placeholder.com/40"} className="h-10 w-10 rounded-full object-cover" alt="avatar" />
                  </Link>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">@{comment.owner?.username || "user"}</span>
                        <span className="text-slate-500 text-xs">{formatTimeAgo(comment.createdAt)}</span>
                      </div>
                      {currentUser?._id === (comment.owner?._id || comment.owner) && editingId !== comment._id && (
                        <div className="relative" ref={openMenuId === comment._id ? menuRef : null}>
                          <button onClick={() => setOpenMenuId(openMenuId === comment._id ? null : comment._id)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-800 rounded-full transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" /></svg>
                          </button>
                          {openMenuId === comment._id && (
                            <div className="absolute right-0 mt-2 w-32 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-20 overflow-hidden">
                              <button onClick={() => { setEditingId(comment._id); setEditContent(comment.content); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-800">✏️ Edit</button>
                              <button onClick={() => { setDeleteModalId(comment._id); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-800 text-red-500">🗑️ Delete</button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {editingId === comment._id ? (
                      <div className="mt-2 flex flex-col gap-2">
                        <input className="bg-transparent border-b border-orange-500 outline-none py-1 w-full text-sm" value={editContent} onChange={(e) => setEditContent(e.target.value)} autoFocus />
                        <div className="flex justify-end gap-3 pt-1"><button onClick={() => setEditingId(null)} className="text-xs text-slate-400">Cancel</button><button onClick={() => handleUpdate(comment._id)} className="text-xs font-bold text-orange-500">Save</button></div>
                      </div>
                    ) : (
                      <>
                        <p className="mt-1 text-slate-300 text-sm">{comment.content}</p>
                        
                        {/* Parent Like/Dislike/Reply */}
                        <div className="mt-2 flex items-center gap-1">
                          <button onClick={() => handleLikeToggle(comment._id)} className="p-1.5 hover:bg-white/10 rounded-full transition active:scale-90">
                            <svg xmlns="http://www.w3.org/2000/svg" fill={comment.isLiked ? "white" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 .115-.018.23-.052.339l-1.44 4.33a2.25 2.25 0 0 0 2.138 2.961h3.353c.691 0 1.25.559 1.25 1.25v1.442c0 .285-.113.559-.313.76a1.44 1.44 0 0 1-1.043.435H18.75a.75.75 0 0 0-.75.75v1.442c0 .285-.113.559-.313.76a1.44 1.44 0 0 1-1.043.435h-1.442a.75.75 0 0 0-.75.75v1.442c0 .285-.113.559-.313.76a1.44 1.44 0 0 1-1.043.435H10.5a.75.75 0 0 1-.75-.75v-1.442c0-.285-.113-.559-.313-.76a1.44 1.44 0 0 0-1.043-.435H7.5a.75.75 0 0 1-.75-.75v-1.442c0-.285-.113-.559-.313-.76a1.44 1.44 0 0 0-1.043-.435H3.75a.75.75 0 0 1-.75-.75V11.5c0-.691.559-1.25 1.25-1.25h2.383Z" />
                            </svg>
                          </button>
                          <span className="text-[11px] text-slate-400 min-w-[12px]">{comment.likesCount || 0}</span>
                          
                          {/* 👎 DISLIKE BUTTON */}
                          <button onClick={() => handleDislikeToggle(comment._id)} className="p-1.5 hover:bg-white/10 rounded-full transition active:scale-90">
                            <svg xmlns="http://www.w3.org/2000/svg" fill={comment.isDisliked ? "white" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7.367 13.75c-.806 0-1.533.446-2.031 1.08a9.041 9.041 0 0 1-2.861 2.4c-.723.384-1.35.956-1.653 1.715a4.498 4.498 0 0 0-.322 1.672v.333a.75.75 0 0 0 .75.75 2.25 2.25 0 0 0 2.25-2.25c0-.115.018-.23.052-.339l1.44-4.33a2.25 2.25 0 0 1 2.138-2.961H3.75c-.691 0-1.25-.559-1.25-1.25V9.408c0-.285.113-.559.313-.76a1.44 1.44 0 0 1 1.043-.435H5.25a.75.75 0 0 1 .75-.75V6.021c0-.285.113-.559.313-.76a1.44 1.44 0 0 1 1.043-.435h1.442a.75.75 0 0 1 .75-.75V2.634c0-.285.113-.559.313-.76a1.44 1.44 0 0 1 1.043-.435H13.5a.75.75 0 0 0 .75.75v1.442c0 .285.113.559.313.76a1.44 1.44 0 0 1 1.043.435h2.152c.691 0 1.25.559 1.25 1.25v2.842c0 .691-.559 1.25-1.25 1.25h-2.383Z" />
                            </svg>
                          </button>
                          
                          <button onClick={() => setReplyingToId(comment._id)} className="ml-2 text-xs font-bold text-white hover:bg-white/10 px-3 py-1.5 rounded-full transition">REPLY</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Reply Input... (same as before) */}
                {replyingToId === comment._id && (
                  <div className="ml-14 mt-2 flex gap-3">
                    <img src={currentUser?.avatar} className="h-8 w-8 rounded-full border border-slate-700" alt="me" />
                    <div className="flex-1 flex flex-col gap-2">
                      <input className="bg-transparent border-b border-slate-600 focus:border-white outline-none py-1 text-sm w-full" placeholder="Add a reply..." value={replyContent} onChange={(e) => setReplyContent(e.target.value)} autoFocus />
                      <div className="flex justify-end gap-3"><button onClick={() => setReplyingToId(null)} className="text-xs text-slate-400">Cancel</button><button onClick={() => handleReply(comment._id)} className="text-xs font-bold text-orange-500">Reply</button></div>
                    </div>
                  </div>
                )}

                {/* Replies Map */}
                {replies.length > 0 && (
                  <div className="ml-14">
                    <button onClick={() => toggleReplies(comment._id)} className="text-sm font-bold text-blue-400 hover:bg-blue-400/10 px-2 py-1 rounded-full">{showRepliesFor[comment._id] ? "▼ Hide replies" : `▶ View ${replies.length} replies`}</button>
                    {showRepliesFor[comment._id] && (
                      <div className="mt-4 space-y-6 border-l-2 border-slate-700 pl-4">
                        {replies.map((reply) => (
                          <div key={reply._id} className="flex gap-3 group relative">
                            <img src={reply.owner?.avatar || "https://via.placeholder.com/40"} className="h-6 w-6 rounded-full object-cover flex-shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2"><span className="font-bold text-xs">@{reply.owner?.username || "user"}</span><span className="text-slate-500 text-[10px]">{formatTimeAgo(reply.createdAt)}</span></div>
                                {currentUser?._id === (reply.owner?._id || reply.owner) && editingId !== reply._id && (
                                  <div className="relative" ref={openMenuId === reply._id ? menuRef : null}>
                                    <button onClick={() => setOpenMenuId(openMenuId === reply._id ? null : reply._id)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-800 rounded-full transition-all">
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" /></svg>
                                    </button>
                                    {openMenuId === reply._id && (
                                      <div className="absolute right-0 mt-2 w-32 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-20 overflow-hidden">
                                        <button onClick={() => { setEditingId(reply._id); setEditContent(reply.content); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-xs hover:bg-slate-800">✏️ Edit</button>
                                        <button onClick={() => { setDeleteModalId(reply._id); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-xs hover:bg-slate-800 text-red-500">🗑️ Delete</button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              {editingId === reply._id ? (
                                <div className="mt-2 flex flex-col gap-2">
                                  <input className="bg-transparent border-b border-orange-500 outline-none py-1 w-full text-xs" value={editContent} onChange={(e) => setEditContent(e.target.value)} autoFocus />
                                  <div className="flex justify-end gap-3 pt-1"><button onClick={() => setEditingId(null)} className="text-[10px] text-slate-400">Cancel</button><button onClick={() => handleUpdate(reply._id)} className="text-[10px] text-orange-500 font-bold">Save</button></div>
                                </div>
                              ) : (
                                <>
                                  <p className="text-sm text-slate-300">{reply.content}</p>
                                  {/* Reply Like/Dislike Action Bar */}
                                  <div className="mt-1 flex items-center gap-1">
                                    <button onClick={() => handleLikeToggle(reply._id)} className="p-1 hover:bg-white/10 rounded-full active:scale-90 transition">
                                      <svg xmlns="http://www.w3.org/2000/svg" fill={reply.isLiked ? "white" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 .115-.018.23-.052.339l-1.44 4.33a2.25 2.25 0 0 0 2.138 2.961h3.353c.691 0 1.25.559 1.25 1.25v1.442c0 .285-.113.559-.313.76a1.44 1.44 0 0 1-1.043.435H18.75a.75.75 0 0 0-.75.75v1.442c0 .285-.113.559-.313.76a1.44 1.44 0 0 1-1.043.435h-1.442a.75.75 0 0 0-.75.75v1.442c0 .285-.113.559-.313.76a1.44 1.44 0 0 1-1.043.435H10.5a.75.75 0 0 1-.75-.75v-1.442c0-.285-.113-.559-.313-.76a1.44 1.44 0 0 0-1.043-.435H7.5a.75.75 0 0 1-.75-.75v-1.442c0-.285-.113-.559-.313-.76a1.44 1.44 0 0 0-1.043-.435H3.75a.75.75 0 0 1-.75-.75V11.5c0-.691.559-1.25 1.25-1.25h2.383Z" /></svg>
                                    </button>
                                    <span className="text-[10px] text-slate-400">{reply.likesCount || 0}</span>
                                    <button onClick={() => handleDislikeToggle(reply._id)} className="p-1 hover:bg-white/10 rounded-full active:scale-90 transition">
                                      <svg xmlns="http://www.w3.org/2000/svg" fill={reply.isDisliked ? "white" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M7.367 13.75c-.806 0-1.533.446-2.031 1.08a9.041 9.041 0 0 1-2.861 2.4c-.723.384-1.35.956-1.653 1.715a4.498 4.498 0 0 0-.322 1.672v.333a.75.75 0 0 0 .75.75 2.25 2.25 0 0 0 2.25-2.25c0-.115.018-.23.052-.339l1.44-4.33a2.25 2.25 0 0 1 2.138-2.961H3.75c-.691 0-1.25-.559-1.25-1.25V9.408c0-.285.113-.559.313-.76a1.44 1.44 0 0 1 1.043-.435H5.25a.75.75 0 0 1 .75-.75V6.021c0-.285.113-.559.313-.76a1.44 1.44 0 0 1 1.043-.435h1.442a.75.75 0 0 1 .75-.75V2.634c0-.285.113-.559.313-.76a1.44 1.44 0 0 1 1.043-.435H13.5a.75.75 0 0 0 .75.75v1.442c0 .285.113.559.313.76a1.44 1.44 0 0 1 1.043.435h2.152c.691 0 1.25.559 1.25 1.25v2.842c0 .691-.559 1.25-1.25 1.25h-2.383Z" /></svg>
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* --- Delete Modal (same as before) --- */}
      {deleteModalId && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-[2px]" onClick={() => setDeleteModalId(null)}></div>
          <div className="relative bg-[#282828] p-6 rounded-xl shadow-2xl max-w-[380px] w-full border border-slate-700/50">
            <h2 className="text-xl font-normal text-white mb-4">Delete comment</h2>
            <p className="text-[#aaaaaa] text-sm mb-10 leading-relaxed">Delete your comment permanently?</p>
            <div className="flex justify-end gap-2 font-medium">
              <button onClick={() => setDeleteModalId(null)} className="px-4 py-2 text-sm text-white hover:bg-white/10 rounded-full transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 text-sm text-[#3ea6ff] hover:bg-[#3ea6ff]/10 rounded-full transition-colors font-bold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommentSection;
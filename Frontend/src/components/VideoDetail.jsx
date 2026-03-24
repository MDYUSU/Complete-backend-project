import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInstance from "../utils/axios";
import CommentSection from "./CommentSection";
import PlaylistModal from "./PlaylistModal"; 
import { formatTimeAgo } from "../utils/timeAgo";

function VideoDetail() {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subCount, setSubCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isDisliked, setIsDisliked] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false); 
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [aiSummary, setAiSummary] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const currentUser = useSelector((state) => state.auth.userData);

  // FETCH VIDEO DATA
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setAiSummary(""); 
    window.scrollTo(0, 0);

    axiosInstance
      .get(`/videos/${videoId}`)
      .then((res) => {
        if (!isMounted) return;
        const videoData = res.data.data;
        
        setVideo(videoData);
        setLikesCount(videoData.likesCount || 0);
        setIsLiked(videoData.isLiked || false);
        setIsDisliked(videoData.isDisliked || false);

        if (videoData?.owner?._id) {
          fetchSubscriptionData(videoData.owner._id);
        }
      })
      .catch((err) => {
        console.error("Video Fetch Error:", err);
        if (isMounted) setVideo(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    axiosInstance.get(`/videos/related/${videoId}`)
      .then(res => {
        if (isMounted) setRelatedVideos(res.data.data);
      })
      .catch(err => console.error("Failed to fetch related videos", err));

    return () => { isMounted = false; };
  }, [videoId]);

  // UPDATE WATCH HISTORY
  useEffect(() => {
    if (videoId && currentUser) {
      axiosInstance
        .patch(`/videos/watch/${videoId}`)
        .then(() => console.log("Watch history updated successfully"))
        .catch((err) => console.error("History update failed:", err));
    }
  }, [videoId, currentUser]);

  const handleLikeToggle = async () => {
    if (!currentUser) return alert("Please login to like this video");
    const prevIsLiked = isLiked;
    const prevCount = likesCount;
    
    setIsLiked(!isLiked);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    if (!isLiked && isDisliked) setIsDisliked(false);

    try {
      await axiosInstance.post(`/likes/toggle/v/${videoId}`);
    } catch (error) {
      setIsLiked(prevIsLiked);
      setLikesCount(prevCount);
    }
  };

  const handleDislikeToggle = async () => {
    if (!currentUser) return alert("Please login to dislike");
    const prevDisliked = isDisliked;
    
    setIsDisliked(!isDisliked);
    if (!isDisliked && isLiked) {
      setIsLiked(false);
      setLikesCount((prev) => prev - 1);
    }

    try {
      await axiosInstance.post(`/likes/toggle/v/${videoId}?type=dislike`);
    } catch (error) {
      setIsDisliked(prevDisliked);
    }
  };

  const handleSubscriptionToggle = async () => {
    if (!currentUser) return alert("Please login to subscribe");
    try {
      const res = await axiosInstance.post(`/subscriptions/c/${video.owner._id}`);
      const subscribedStatus = res.data.data.subscribed;
      setIsSubscribed(subscribedStatus);
      setSubCount((prev) => (subscribedStatus ? prev + 1 : prev - 1));
    } catch (error) {
      console.error("Subscription toggle failed", error);
    }
  };

  const fetchSubscriptionData = async (channelId) => {
    try {
      const res = await axiosInstance.get(`/subscriptions/c/${channelId}`);
      const subscribers = res.data.data;
      setSubCount(subscribers.length);
      const isUserSubbed = subscribers.some(
        (sub) => (sub.subscriber?._id || sub.subscriber) === currentUser?._id
      );
      setIsSubscribed(isUserSubbed);
    } catch (error) {
      console.error("Subscription fetch failed", error);
    }
  };

  const handleGenerateSummary = async () => {
    if (!video?.description || !video?.title) return;
    setIsGenerating(true);
    setAiSummary(""); 
    try {
        const res = await axiosInstance.post("/ai/summarize", {
            title: video.title,
            description: video.description
        });
        setAiSummary(res.data.data.summary);
    } catch (error) {
        console.error("AI Error:", error);
        alert("AI Service is busy.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(video.videoFile);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${video.title.replace(/\s+/g, '_')}.mp4`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download video.");
    }
  };

  if (loading) return <div className="text-center py-20 text-white italic animate-pulse">Loading VisionTube...</div>;
  if (!video) return <div className="text-center py-20 text-white font-bold">Video not found</div>;

  return (
    <div className="container mx-auto p-4 mb-20 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 text-white">
          <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800">
            <video src={video.videoFile} controls autoPlay className="w-full h-full" />
          </div>

          <div className="mt-4">
            <h1 className="text-xl md:text-2xl font-bold leading-tight">{video.title}</h1>
            <div className="flex flex-col md:flex-row md:items-center justify-between mt-4 gap-4">
              <div className="flex items-center gap-3">
                <Link to={`/user/${video.owner?._id}`}>
                  <img src={video.owner?.avatar} className="h-11 w-11 rounded-full border border-slate-700 object-cover" alt="avatar" />
                </Link>
                <div>
                  <p className="font-bold text-base leading-tight">{video.owner?.fullName}</p>
                  <p className="text-slate-400 text-xs">{subCount} subscribers</p>
                </div>
                {currentUser?._id !== video.owner?._id && (
                  <button onClick={handleSubscriptionToggle} className={`ml-4 px-4 py-2 rounded-full font-bold text-sm transition-all ${isSubscribed ? "bg-white/10 text-white" : "bg-white text-black"}`}>
                    {isSubscribed ? "Subscribed" : "Subscribe"}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white/10 rounded-full border border-white/5 overflow-hidden">
                  <button onClick={handleLikeToggle} className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 transition border-r border-white/10">
                    <svg xmlns="http://www.w3.org/2000/svg" fill={isLiked ? "white" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 .115-.018.23-.052.339l-1.44 4.33a2.25 2.25 0 0 0 2.138 2.961h3.353c.691 0 1.25.559 1.25 1.25v1.442c0 .285-.113.559-.313.76a1.44 1.44 0 0 1-1.043.435H18.75a.75.75 0 0 0-.75.75v1.442c0 .285-.113.559-.313.76a1.44 1.44 0 0 1-1.043.435h-1.442a.75.75 0 0 0-.75.75v1.442c0 .285-.113.559-.313.76a1.44 1.44 0 0 1-1.043.435H10.5a.75.75 0 0 1-.75-.75v-1.442c0-.285-.113-.559-.313-.76a1.44 1.44 0 0 0-1.043-.435H7.5a.75.75 0 0 1-.75-.75v-1.442c0-.285-.113-.559-.313-.76a1.44 1.44 0 0 0-1.043-.435H3.75a.75.75 0 0 1-.75-.75V11.5c0-.691.559-1.25 1.25-1.25h2.383Z"/></svg>
                    <span className="text-sm font-bold">{likesCount}</span>
                  </button>
                  <button onClick={handleDislikeToggle} className="px-4 py-2 hover:bg-white/10 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" fill={isDisliked ? "white" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M7.367 13.75c-.806 0-1.533.446-2.031 1.08a9.041 9.041 0 0 1-2.861 2.4c-.723.384-1.35.956-1.653 1.715a4.498 4.498 0 0 0-.322 1.672v.333a.75.75 0 0 0 .75.75 2.25 2.25 0 0 0 2.25-2.25c0-.115.018-.23.052-.339l1.44-4.33a2.25 2.25 0 0 1 2.138-2.961H3.75c-.691 0-1.25-.559-1.25-1.25V9.408c0-.285.113-.559.313-.76a1.44 1.44 0 0 1 1.043-.435H5.25a.75.75 0 0 1 .75-.75V6.021c0-.285.113-.559.313-.76a1.44 1.44 0 0 1 1.043-.435h1.442a.75.75 0 0 1 .75-.75V2.634c0-.285.113-.559.313-.76a1.44 1.44 0 0 1 1.043-.435H13.5a.75.75 0 0 0 .75.75v1.442c0 .285.113.559.313.76a1.44 1.44 0 0 1 1.043.435h2.152c.691 0 1.25.559 1.25 1.25v2.842c0 .691-.559 1.25-1.25 1.25h-2.383Z"/></svg>
                  </button>
                </div>

                {/* DOWNLOAD BUTTON */}
                <button 
                  onClick={handleDownload} 
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 font-bold text-sm transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M7.5 12l4.5 4.5m0 0 4.5-4.5M12 3v13.5" />
                  </svg>
                  Download
                </button>

                <button onClick={() => setShowPlaylistModal(true)} className="px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 font-bold text-sm transition">Save</button>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-orange-500/20 bg-slate-900/60 p-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <span>✨</span> AI Insight
                    </h3>
                    {!aiSummary && (
                        <button onClick={handleGenerateSummary} disabled={isGenerating} className="text-[10px] font-bold bg-orange-600 px-3 py-1 rounded-full uppercase">
                            {isGenerating ? "Processing..." : "Summarize"}
                        </button>
                    )}
                </div>
                {aiSummary && <p className="text-sm text-slate-300 leading-relaxed">{aiSummary}</p>}
            </div>

            <div className="mt-4 bg-white/5 p-4 rounded-xl">
              <div className="flex gap-3 text-sm font-bold mb-2 text-slate-300">
                <span>{video.views} views</span>
                <span>{formatTimeAgo(video.createdAt)}</span>
              </div>
              <p className="text-sm text-slate-400 whitespace-pre-wrap">{video.description}</p>
            </div>

            <div className="mt-8">
              <CommentSection videoId={videoId} />
            </div>
          </div>
        </div>

        <div className="hidden lg:block">
           <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 sticky top-24">
              <h3 className="text-white font-bold mb-4">Up Next</h3>
              <div className="flex flex-col gap-4">
                {relatedVideos.map((item) => (
                  <Link key={item._id} to={`/video/${item._id}`} className="flex gap-3 group">
                    <div className="w-40 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-slate-800">
                      <img src={item.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt={item.title} />
                    </div>
                    <div>
                      <h4 className="text-white text-xs font-bold line-clamp-2 leading-snug">{item.title}</h4>
                      <p className="text-slate-400 text-[10px] mt-1">{item.owner?.fullName}</p>
                      <p className="text-slate-500 text-[10px]">{item.views} views</p>
                    </div>
                  </Link>
                ))}
              </div>
           </div>
        </div>
      </div>
      {showPlaylistModal && <PlaylistModal videoId={videoId} onClose={() => setShowPlaylistModal(false)} />}
    </div>
  );
}

export default VideoDetail;
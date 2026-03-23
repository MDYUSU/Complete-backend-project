import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../utils/axios";
import VideoCard from "./VideoCard";

function PlaylistDetail() {
  const { playlistId } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPlaylistData = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/playlist/${playlistId}`);
      setPlaylist(res.data.data);
    } catch (error) {
      console.error("Error fetching playlist", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (playlistId) fetchPlaylistData();
  }, [playlistId]);

  // 🚀 Function to remove a single video from the playlist
  const handleRemoveVideo = async (videoId) => {
    try {
      // Calls your PATCH /playlist/remove/:videoId/:playlistId route
      await axiosInstance.patch(`/playlist/remove/${videoId}/${playlistId}`);

      // Optimistic UI update: remove instantly from state
      setPlaylist((prev) => ({
        ...prev,
        videos: prev.videos.filter((v) => v._id !== videoId),
      }));
    } catch (error) {
      alert("Failed to remove video from playlist");
      console.error(error);
    }
  };

  if (loading) return <div className="text-center py-20 text-white italic animate-pulse">Loading Playlist...</div>;
  if (!playlist) return <div className="text-center py-20 text-white font-bold">Playlist not found</div>;

  return (
    <div className="container mx-auto p-4 mb-20 text-white max-w-7xl">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row gap-6 mb-8 bg-slate-900/50 p-6 rounded-2xl border border-white/10 shadow-xl">
        <div className="w-full md:w-72 aspect-video bg-slate-800 rounded-xl flex items-center justify-center border border-white/5">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-slate-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
           </svg>
        </div>
        <div className="flex-1 flex flex-col justify-end">
          <h1 className="text-3xl font-bold mb-2">{playlist.name}</h1>
          <p className="text-slate-400 mb-4">{playlist.description}</p>
          <div className="flex gap-4 items-center">
            <span className="text-orange-500 font-bold bg-orange-500/10 px-3 py-1 rounded-full text-xs border border-orange-500/20">
               {playlist.videos?.length || 0} Videos
            </span>
            <span className="text-slate-500 text-sm">Updated recently</span>
          </div>
        </div>
      </div>

      {/* VIDEO GRID SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {playlist.videos?.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-slate-900/30 rounded-2xl border border-dashed border-white/10">
            <p className="text-slate-500 italic">This playlist is currently empty.</p>
          </div>
        ) : (
          playlist.videos.map((video) => (
            /* 🚀 FIXED: No more extra wrapper or red button. 
               The VideoCard now handles the "X" button internally. */
            <VideoCard 
              key={video._id} 
              video={video} 
              isPlaylistPage={true} 
              onRemoveFromPlaylist={handleRemoveVideo}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default PlaylistDetail;
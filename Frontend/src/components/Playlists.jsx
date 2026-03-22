import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useSelector((state) => state.auth.userData);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/playlist/user/${currentUser?._id}`);
      setPlaylists(res.data.data);
    } catch (error) {
      console.error("Error fetching playlists", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?._id) fetchPlaylists();
  }, [currentUser?._id]);

  const handleDeletePlaylist = async (e, playlistId) => {
    e.preventDefault(); // 🚀 Prevent navigating into the playlist detail page
    
    if (!window.confirm("Are you sure you want to delete this entire playlist?")) return;

    try {
      // Calls your DELETE /playlist/:playlistId route
      await axiosInstance.delete(`/playlist/${playlistId}`);
      
      // Optimistic UI update: Remove from state immediately
      setPlaylists((prev) => prev.filter((pl) => pl._id !== playlistId));
    } catch (error) {
      alert("Failed to delete playlist");
      console.error(error);
    }
  };

  if (loading) return <div className="text-center py-20 text-white italic">Loading Playlists...</div>;

  return (
    <div className="container mx-auto p-4 mb-20 text-white">
      <h1 className="text-2xl font-bold mb-6 border-b border-white/10 pb-2">My Playlists</h1>
      
      {playlists.length === 0 ? (
        <p className="text-slate-400">You haven't created any playlists yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <div key={playlist._id} className="flex flex-col bg-white/5 rounded-xl border border-white/10 overflow-hidden group">
              <Link 
                to={`/playlist/${playlist._id}`} 
                className="p-4 hover:bg-white/5 transition flex-grow"
              >
                <div className="aspect-video bg-slate-800 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                         <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
                      </svg>
                   </div>
                </div>
                <h3 className="font-bold text-lg">{playlist.name}</h3>
                <p className="text-sm text-slate-400">{playlist.videos?.length || 0} Videos</p>
                <p className="text-xs text-slate-500 mt-2 line-clamp-1">{playlist.description}</p>
              </Link>

              {/* 🚀 DELETE BUTTON: Visible at the bottom of each card */}
              <button
                onClick={(e) => handleDeletePlaylist(e, playlist._id)}
                className="w-full py-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white transition-all text-xs font-bold uppercase tracking-wider border-t border-white/5"
              >
                Delete Playlist
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Playlists;
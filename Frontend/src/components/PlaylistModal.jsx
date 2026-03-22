import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axios";
import { useSelector } from "react-redux";

function PlaylistModal({ videoId, onClose }) {
    const [playlists, setPlaylists] = useState([]);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [showCreateInput, setShowCreateInput] = useState(false);
    const [loading, setLoading] = useState(true);
    const currentUser = useSelector((state) => state.auth.userData);

    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                const res = await axiosInstance.get(`/playlist/user/${currentUser?._id}`);
                setPlaylists(res.data.data);
            } catch (error) {
                console.error("Error fetching playlists", error);
            } finally {
                setLoading(false);
            }
        };
        if (currentUser?._id) fetchPlaylists();
    }, [currentUser?._id]);

    const handleAddToPlaylist = async (playlistId) => {
        try {
            await axiosInstance.patch(`/playlist/add/${videoId}/${playlistId}`);
            alert("Added to playlist!");
            onClose();
        } catch (error) {
            alert("Already in playlist or error occurred");
        }
    };

    const handleCreateAndAdd = async () => {
        if (!newPlaylistName.trim()) return;
        try {
            const res = await axiosInstance.post("/playlist", {
                name: newPlaylistName,
                description: "My favorite videos",
            });
            await handleAddToPlaylist(res.data.data._id);
        } catch (error) {
            console.error("Error creating playlist", error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-xl p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-4 text-white">
                    <h2 className="font-bold text-lg">Save to...</h2>
                    <button onClick={onClose} className="hover:text-red-500">✕</button>
                </div>
                <div className="max-h-60 overflow-y-auto mb-4 text-white">
                    {loading ? <p>Loading...</p> : playlists.map((pl) => (
                        <button key={pl._id} onClick={() => handleAddToPlaylist(pl._id)} className="w-full text-left p-2 hover:bg-white/10 rounded">
                            {pl.name}
                        </button>
                    ))}
                </div>
                {showCreateInput ? (
                    <div className="pt-2 border-t border-slate-700">
                        <input type="text" value={newPlaylistName} onChange={(e) => setNewPlaylistName(e.target.value)} className="w-full bg-black text-white p-2 rounded mb-2 border border-slate-700" placeholder="Playlist name" />
                        <button onClick={handleCreateAndAdd} className="w-full bg-orange-600 text-white py-2 rounded font-bold">Create</button>
                    </div>
                ) : (
                    <button onClick={() => setShowCreateInput(true)} className="text-orange-500 font-bold text-sm">+ Create new playlist</button>
                )}
            </div>
        </div>
    );
}

export default PlaylistModal;
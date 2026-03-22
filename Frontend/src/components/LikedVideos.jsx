import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axios';
import VideoCard from './VideoCard';

function LikedVideos() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLikedVideos = async () => {
        try {
            const res = await axiosInstance.get('/likes/videos');
            // Check your backend response structure - adjust if it's res.data.data.likedVideos
            setVideos(res.data.data);
        } catch (error) {
            console.error("Error fetching liked videos", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLikedVideos();
    }, []);

    const handleUnlike = async (videoId) => {
        try {
            // Trigger the toggle
            await axiosInstance.post(`/likes/toggle/v/${videoId}`);
            
            // Remove from UI immediately
            setVideos((prev) => prev.filter((v) => v._id !== videoId));
        } catch (error) {
            alert("Failed to unlike video");
            console.error(error);
        }
    };

    if (loading) return <div className="text-white text-center py-20">Loading...</div>;

    return (
        <div className="container mx-auto p-4 mb-20">
            <h1 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-4">
                Liked Videos ({videos.length})
            </h1>

            {videos.length === 0 ? (
                <p className="text-slate-500 text-center py-20">No liked videos found.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {videos.map((video) => (
                        <div key={video._id} className="bg-slate-900 rounded-xl overflow-hidden border border-white/5 flex flex-col">
                            {/* The Video Card Component */}
                            <VideoCard video={video} />

                            {/* 🚀 FIXED DELETE BUTTON: Always Visible */}
                            <button
                                onClick={() => handleUnlike(video._id)}
                                className="w-full py-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
                            >
                                Remove from Liked
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default LikedVideos;
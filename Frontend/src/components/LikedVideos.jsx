import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axios';
import VideoCard from './VideoCard';

function LikedVideos() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLikedVideos = async () => {
        try {
            const res = await axiosInstance.get('/likes/videos');
            // Grounding the data: Ensure we are targeting the array correctly
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
            // Trigger the toggle on the backend
            await axiosInstance.post(`/likes/toggle/v/${videoId}`);
            
            // Remove from UI immediately for a snappy feel
            setVideos((prev) => prev.filter((v) => v._id !== videoId));
        } catch (error) {
            alert("Failed to unlike video");
            console.error(error);
        }
    };

    if (loading) return <div className="text-white text-center py-20 italic animate-pulse">Loading Liked Videos...</div>;

    return (
        <div className="container mx-auto p-4 mb-20 max-w-7xl">
            <h1 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-4">
                Liked Videos ({videos.length})
            </h1>

            {videos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <span className="text-4xl mb-4">👍</span>
                    <p className="text-slate-500 text-center">No liked videos yet. Start exploring!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {videos.map((video) => (
                        /* 🚀 PRO-UI: No extra wrapper or red button here anymore */
                        <VideoCard 
                            key={video._id} 
                            video={video} 
                            isLikedPage={true} 
                            onRemoveLike={handleUnlike} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default LikedVideos;
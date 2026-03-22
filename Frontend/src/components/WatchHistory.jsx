import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axios';
import { Link } from 'react-router-dom';
import { formatTimeAgo } from '../utils/timeAgo';

function WatchHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        try {
            const res = await axiosInstance.get('/users/history');
            // Reversing to show most recent at the top
            setHistory([...res.data.data].reverse());
        } catch (error) {
            console.error("Error fetching history", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleRemoveItem = async (e, videoId) => {
        e.preventDefault(); // 🚀 Stops the Link from navigating to the video
        try {
            // Adjust this route to your actual backend remove-from-history route
            await axiosInstance.patch(`/users/history/remove/${videoId}`);
            setHistory(prev => prev.filter(video => video._id !== videoId));
        } catch (error) {
            console.error("Failed to remove item", error);
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm("Are you sure you want to clear your entire watch history?")) return;
        try {
            // Adjust this route to your actual backend clear-history route
            await axiosInstance.delete('/users/history/clear');
            setHistory([]);
        } catch (error) {
            console.error("Failed to clear history", error);
        }
    };

    if (loading) return <div className="text-white text-center py-20 animate-pulse italic">Loading history...</div>;

    return (
        <div className="container mx-auto p-4 max-w-4xl mb-20">
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <h1 className="text-2xl font-bold text-white">Watch History</h1>
                {history.length > 0 && (
                    <button 
                        onClick={handleClearAll}
                        className="text-red-500 hover:text-red-400 text-sm font-bold transition flex items-center gap-2"
                    >
                        Clear All History
                    </button>
                )}
            </div>

            <div className="flex flex-col gap-6">
                {history.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">
                        <p className="text-lg">Your watch history is empty.</p>
                        <Link to="/" className="text-orange-600 hover:underline mt-2 inline-block">Go watch some videos!</Link>
                    </div>
                ) : (
                    history.map((video) => (
                        <div key={video._id} className="relative group">
                            <Link to={`/video/${video._id}`} className="flex flex-col md:flex-row gap-4">
                                <div className="w-full md:w-56 aspect-video bg-slate-800 rounded-xl overflow-hidden flex-shrink-0 border border-white/5">
                                    <img 
                                        src={video.thumbnail} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                                        alt={video.title} 
                                    />
                                </div>
                                <div className="flex flex-col flex-1 pr-10">
                                    <h2 className="text-white font-bold text-lg line-clamp-2 leading-snug group-hover:text-orange-500 transition">
                                        {video.title}
                                    </h2>
                                    <p className="text-slate-400 text-sm mt-1 font-medium">
                                        {video.owner?.fullName} • {video.views} views • {formatTimeAgo(video.createdAt)}
                                    </p>
                                    <p className="text-slate-500 text-xs mt-3 line-clamp-2 leading-relaxed">
                                        {video.description}
                                    </p>
                                </div>
                            </Link>

                            {/* 🚀 Remove Single Item Button */}
                            <button 
                                onClick={(e) => handleRemoveItem(e, video._id)}
                                className="absolute top-0 right-0 p-2 text-slate-500 hover:text-white transition-colors"
                                title="Remove from history"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default WatchHistory;
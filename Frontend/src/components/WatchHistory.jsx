import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axios';
import { Link } from 'react-router-dom';
import { formatTimeAgo } from '../utils/timeAgo';

function WatchHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosInstance.get('/users/history') // Adjust to your route
            .then(res => setHistory(res.data.data.reverse())) // Newest first
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-white text-center py-20">Loading history...</div>;

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-2xl font-bold text-white mb-8">Watch History</h1>
            <div className="flex flex-col gap-6">
                {history.map((video) => (
                    <Link key={video._id} to={`/video/${video._id}`} className="flex gap-4 group">
                        <div className="w-48 aspect-video bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={video.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition" alt="" />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-white font-bold text-lg line-clamp-2">{video.title}</h2>
                            <p className="text-slate-400 text-sm mt-1">
                                {video.owner.fullName} • {video.views} views • {formatTimeAgo(video.createdAt)}
                            </p>
                            <p className="text-slate-500 text-xs mt-2 line-clamp-1">{video.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default WatchHistory;
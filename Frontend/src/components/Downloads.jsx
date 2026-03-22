import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatTimeAgo } from '../utils/timeAgo';

function Downloads() {
    const [downloadedVideos, setDownloadedVideos] = useState([]);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem("visionTube_downloads") || "[]");
        setDownloadedVideos(saved);
    }, []);

    const removeDownload = (e, videoId) => {
        e.preventDefault(); 
        const updated = downloadedVideos.filter(v => v._id !== videoId);
        setDownloadedVideos(updated);
        localStorage.setItem("visionTube_downloads", JSON.stringify(updated));
    };

    return (
        <div className="container mx-auto p-4 mb-20 max-w-6xl">
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-orange-600 p-2 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Offline Library</h1>
                </div>
            </div>

            {downloadedVideos.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <p className="text-slate-500 text-lg">Your library is empty.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {downloadedVideos.map((video) => (
                        <div key={video._id} className="bg-slate-900 rounded-2xl overflow-hidden border border-white/5 flex flex-col group relative">
                            <Link to={`/video/${video._id}`}>
                                {/* 🖼️ Image Container - Simplified */}
                                <div className="aspect-video w-full overflow-hidden bg-slate-800">
                                    <img 
                                        src={video.thumbnail} 
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                                        alt="" 
                                    />
                                </div>
                                
                                <div className="p-4 bg-slate-900/50">
                                    <h3 className="text-white font-bold text-sm line-clamp-2 mb-1 group-hover:text-orange-500 transition">
                                        {video.title}
                                    </h3>
                                    <p className="text-slate-400 text-xs font-medium">
                                        {video.owner?.fullName || "VisionTube User"}
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-bold mt-3 uppercase">
                                        Saved {formatTimeAgo(video.createdAt)}
                                    </p>
                                </div>
                            </Link>

                            {/* ❌ Delete Button */}
                            <button 
                                onClick={(e) => removeDownload(e, video._id)}
                                className="absolute top-2 right-2 bg-black/70 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-red-600 transition shadow-lg"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Downloads;
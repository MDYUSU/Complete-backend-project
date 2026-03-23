import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axios';
import { formatTimeAgo } from '../utils/timeAgo';
import { Link } from 'react-router-dom';

function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const statsRes = await axiosInstance.get('/dashboard/stats');
            setStats(statsRes.data.data);

            const videosRes = await axiosInstance.get('/dashboard/videos');
            setVideos(videosRes.data.data);
        } catch (error) {
            console.error("Dashboard data fetch error", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleDeleteVideo = async (videoId) => {
        if (!window.confirm("Are you sure you want to delete this video permanently?")) return;
        try {
            await axiosInstance.delete(`/videos/${videoId}`);
            setVideos(prev => prev.filter(v => v._id !== videoId));
        } catch (error) {
            alert("Delete failed");
        }
    };

    const togglePublishStatus = async (videoId) => {
        try {
            await axiosInstance.patch(`/videos/toggle/publish/${videoId}`);
            setVideos(prev => prev.map(v => 
                v._id === videoId ? { ...v, isPublished: !v.isPublished } : v
            ));
        } catch (error) {
            console.error("Toggle status failed", error);
        }
    };

    if (loading) return <div className="text-white text-center py-20 animate-pulse font-bold">Initializing Creator Studio...</div>;

    const statCards = [
        { label: "Total Views", value: stats?.totalViews || 0, color: "from-blue-400 to-blue-600", icon: "📊" },
        { label: "Subscribers", value: stats?.totalSubscribers || 0, color: "from-purple-400 to-purple-600", icon: "👥" },
        { label: "Total Videos", value: stats?.totalVideos || 0, color: "from-orange-400 to-orange-600", icon: "📹" },
        { label: "Total Likes", value: stats?.totalLikes || 0, color: "from-pink-400 to-pink-600", icon: "❤️" },
    ];

    return (
        <div className="container mx-auto p-6 text-white mb-20 max-w-7xl">
            <header className="mb-10">
                <h1 className="text-3xl font-black tracking-tighter">Channel Dashboard</h1>
                <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">Welcome back, Creator.</p>
            </header>
            
            {/* 🚀 PREMIUM STATS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {statCards.map((card, i) => (
                    <div key={i} className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl shadow-2xl hover:border-white/10 transition-all group relative overflow-hidden">
                        {/* Background Glow Decoration */}
                        <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-gradient-to-br ${card.color} opacity-[0.03] blur-2xl group-hover:opacity-10 transition-opacity`}></div>
                        
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">{card.label}</p>
                            <span className="text-xl group-hover:scale-110 transition-transform duration-300">{card.icon}</span>
                        </div>
                        
                        <div className="relative z-10">
                            <h2 className={`text-5xl font-light tracking-tighter bg-gradient-to-br ${card.color} bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]`}>
                                {card.value < 10 ? `0${card.value}` : card.value.toLocaleString()}
                            </h2>
                            <div className="mt-4 h-[2px] w-8 rounded-full bg-slate-800 overflow-hidden">
                                <div className={`h-full w-0 group-hover:w-full transition-all duration-700 ease-out bg-gradient-to-r ${card.color}`}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Video Management Table */}
            <div className="bg-slate-900/60 rounded-3xl border border-white/5 overflow-hidden shadow-2xl backdrop-blur-sm">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <h2 className="text-lg font-bold tracking-tight">Recent Uploads</h2>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.15em] border-b border-white/5">
                                <th className="px-6 py-5">Status</th>
                                <th className="px-6 py-5">Video</th>
                                <th className="px-6 py-5">Date</th>
                                <th className="px-6 py-5">Views</th>
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {videos.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center text-slate-500 italic text-sm">No videos uploaded yet.</td>
                                </tr>
                            ) : (
                                videos.map((video) => (
                                    <tr key={video._id} className="hover:bg-white/[0.03] transition-colors group">
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => togglePublishStatus(video._id)}
                                                className={`text-[9px] font-black px-2.5 py-1 rounded-full border tracking-tighter transition-all ${
                                                    video.isPublished 
                                                    ? "text-green-400 border-green-400/20 bg-green-400/5 hover:bg-green-400/10" 
                                                    : "text-orange-400 border-orange-400/20 bg-orange-400/5 hover:bg-orange-400/10"
                                                }`}
                                            >
                                                {video.isPublished ? "PUBLISHED" : "PRIVATE"}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="relative flex-shrink-0">
                                                    <img src={video.thumbnail} className="w-20 h-11 object-cover rounded-lg border border-white/10" alt="" />
                                                    <div className="absolute inset-0 bg-black/20 rounded-lg group-hover:opacity-0 transition-opacity"></div>
                                                </div>
                                                <span className="font-semibold text-sm line-clamp-1 max-w-[200px] text-slate-200 group-hover:text-white transition-colors">{video.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                                            {formatTimeAgo(video.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-blue-400/80">
                                            {video.views.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Link to={`/edit-video/${video._id}`} className="p-2.5 hover:bg-white/5 rounded-xl transition-all text-slate-400 hover:text-blue-400">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                    </svg>
                                                </Link>
                                                <button onClick={() => handleDeleteVideo(video._id)} className="p-2.5 hover:bg-white/5 rounded-xl transition-all text-slate-400 hover:text-red-400">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
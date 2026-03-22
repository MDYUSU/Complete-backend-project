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
            // 1. Fetch Aggregated Stats
            const statsRes = await axiosInstance.get('/dashboard/stats');
            setStats(statsRes.data.data);

            // 2. Fetch Channel Videos (Your uploads)
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
        { label: "Total Views", value: stats?.totalViews || 0, color: "text-blue-500", icon: "📊" },
        { label: "Subscribers", value: stats?.totalSubscribers || 0, color: "text-purple-500", icon: "👥" },
        { label: "Total Videos", value: stats?.totalVideos || 0, color: "text-orange-500", icon: "📹" },
        { label: "Total Likes", value: stats?.totalLikes || 0, color: "text-red-500", icon: "❤️" },
    ];

    return (
        <div className="container mx-auto p-6 text-white mb-20 max-w-7xl">
            <header className="mb-10">
                <h1 className="text-3xl font-black tracking-tight">Channel Dashboard</h1>
                <p className="text-slate-400 mt-1">Welcome back, Creator.</p>
            </header>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {statCards.map((card, i) => (
                    <div key={i} className="bg-slate-900 border border-white/10 p-6 rounded-2xl shadow-2xl hover:border-white/20 transition">
                        <div className="flex justify-between items-start">
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{card.label}</p>
                            <span className="text-xl">{card.icon}</span>
                        </div>
                        <p className={`text-4xl font-black mt-3 ${card.color}`}>{card.value.toLocaleString()}</p>
                    </div>
                ))}
            </div>

            {/* Video Management Table */}
            <div className="bg-slate-900 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h2 className="text-xl font-bold">Recent Uploads</h2>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-white/10">
                                <th className="px-6 py-4 font-bold">Status</th>
                                <th className="px-6 py-4 font-bold">Video</th>
                                <th className="px-6 py-4 font-bold">Date</th>
                                <th className="px-6 py-4 font-bold">Views</th>
                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {videos.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-slate-500 italic">No videos uploaded yet.</td>
                                </tr>
                            ) : (
                                videos.map((video) => (
                                    <tr key={video._id} className="hover:bg-white/5 transition group">
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => togglePublishStatus(video._id)}
                                                className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                                                    video.isPublished 
                                                    ? "text-green-500 border-green-500/30 bg-green-500/10" 
                                                    : "text-orange-500 border-orange-500/30 bg-orange-500/10"
                                                }`}
                                            >
                                                {video.isPublished ? "PUBLISHED" : "PRIVATE"}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={video.thumbnail} className="w-16 h-9 object-cover rounded border border-white/10" alt="" />
                                                <span className="font-medium text-sm line-clamp-1 max-w-[200px]">{video.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400">
                                            {formatTimeAgo(video.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-blue-400">
                                            {video.views}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-3">
                                                <Link to={`/edit-video/${video._id}`} className="p-2 hover:bg-blue-500/20 rounded-full transition text-blue-400">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                    </svg>
                                                </Link>
                                                <button onClick={() => handleDeleteVideo(video._id)} className="p-2 hover:bg-red-500/20 rounded-full transition text-red-400">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
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
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axiosInstance from '../utils/axios'
import VideoCard from './VideoCard'
import Container from './Container'

function UserProfile() {
    const { userId } = useParams()
    const [user, setUser] = useState(null)
    const [videos, setVideos] = useState([])
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [subCount, setSubCount] = useState(0)
    const [loading, setLoading] = useState(true)

    const currentUser = useSelector((state) => state.auth.userData)

    useEffect(() => {
        setLoading(true)
        
        // 1. Fetch User Data (You can use your getUserById or getChannelProfile route)
        // For now, we'll fetch via the subscription check to get the info
        const fetchData = async () => {
            try {
                // Fetch videos by this user using your existing getAllVideos logic
                const videoRes = await axiosInstance.get(`/videos?userId=${userId}`)
                setVideos(videoRes.data.data.docs || [])

                // Fetch subscription info
                const subRes = await axiosInstance.get(`/subscriptions/c/${userId}`)
                const subs = subRes.data.data
                setSubCount(subs.length)
                setIsSubscribed(subs.some(s => s.subscriber._id === currentUser?._id))

                // Get user details from the first video or a specific user route
                if (videoRes.data.data.docs.length > 0) {
                    setUser(videoRes.data.data.docs[0].owner)
                }
            } catch (error) {
                console.error("Profile fetch failed", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [userId, currentUser?._id])

    const handleSubscribe = async () => {
        try {
            const res = await axiosInstance.post(`/subscriptions/c/${userId}`)
            const status = res.data.data.subscribed
            setIsSubscribed(status)
            setSubCount(prev => status ? prev + 1 : prev - 1)
        } catch (error) {
            console.error("Toggle failed", error)
        }
    }

    if (loading) return <div className="text-center py-20 text-white">Loading Profile...</div>

    return (
        <Container>
            <div className="py-10">
                {/* 🏷️ CHANNEL HEADER */}
                <div className="flex flex-col md:flex-row items-center gap-6 border-b border-slate-800 pb-10 mb-10">
                    <img 
                        src={user?.avatar || "https://via.placeholder.com/150"} 
                        className="w-32 h-32 rounded-full border-4 border-orange-500 object-cover"
                    />
                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-4xl font-bold text-white">{user?.fullName || "Channel Name"}</h1>
                        <p className="text-slate-400">@{user?.username} • {subCount} Subscribers</p>
                        
                        {currentUser?._id !== userId && (
                            <button 
                                onClick={handleSubscribe}
                                className={`mt-4 px-8 py-2 rounded-full font-bold transition-all ${
                                    isSubscribed 
                                    ? "bg-slate-700 text-slate-300" 
                                    : "bg-white text-black hover:bg-slate-200"
                                }`}
                            >
                                {isSubscribed ? "Subscribed" : "Subscribe"}
                            </button>
                        )}
                    </div>
                </div>

                {/* 🎥 CHANNEL VIDEOS */}
                <h2 className="text-2xl font-bold text-white mb-6">Videos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {videos.map((video) => (
                        <VideoCard key={video._id} video={video} />
                    ))}
                </div>
                {videos.length === 0 && (
                    <p className="text-slate-500 italic">This creator hasn't uploaded any videos yet.</p>
                )}
            </div>
        </Container>
    )
}

export default UserProfile
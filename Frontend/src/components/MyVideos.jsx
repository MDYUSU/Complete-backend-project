import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import axiosInstance from '../utils/axios'
import VideoCard from './VideoCard'
import Container from './Container'

function MyVideos() {
    const [videos, setVideos] = useState([])
    const [loading, setLoading] = useState(true)
    const userData = useSelector((state) => state.auth.userData)

    const fetchMyVideos = () => {
        if (userData?._id) {
            axiosInstance.get(`/videos?userId=${userData._id}`)
                .then((res) => setVideos(res.data.data?.docs || []))
                .finally(() => setLoading(false))
        }
    }

    useEffect(() => {
        fetchMyVideos()
    }, [userData?._id])

    // 🔄 THE TOGGLE PUBLISH FUNCTION
    const handleTogglePublish = async (videoId) => {
        try {
            await axiosInstance.patch(`/videos/toggle/publish/${videoId}`);
            
            // Update the local state to flip the isPublished boolean
            setVideos(prev => prev.map(video => 
                video._id === videoId 
                ? { ...video, isPublished: !video.isPublished } 
                : video
            ));
        } catch (error) {
            console.error("Toggle publish failed", error);
            alert("Failed to update visibility status");
        }
    }

    // 🗑️ THE DELETE FUNCTION
    const handleDeleteVideo = async (videoId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this video? This cannot be undone.")
        
        if (confirmDelete) {
            try {
                await axiosInstance.delete(`/videos/${videoId}`)
                setVideos(prev => prev.filter(v => v._id !== videoId))
                alert("Video deleted successfully")
            } catch (error) {
                console.error("Delete failed", error)
                alert("Failed to delete video")
            }
        }
    }

    if (loading) return <div className="text-center py-20 text-white">Loading your channel...</div>

    return (
        <Container>
            <div className="py-8">
                <h1 className="text-3xl font-bold text-white mb-8">My Uploads</h1>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {videos.map((video) => (
                        <VideoCard 
                            key={video._id} 
                            video={video} 
                            isOwner={true} 
                            onDelete={handleDeleteVideo}
                            onTogglePublish={handleTogglePublish} // <--- Added this prop
                        />
                    ))}
                </div>

                {videos.length === 0 && (
                    <p className="text-slate-500 italic mt-10 text-center">No uploads found. Start sharing your work!</p>
                )}
            </div>
        </Container>
    )
}

export default MyVideos
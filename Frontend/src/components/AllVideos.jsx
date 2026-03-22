import React, { useState, useEffect } from 'react'
import axiosInstance from '../utils/axios'
import VideoCard from './VideoCard'

function AllVideos() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

useEffect(() => {
    axiosInstance.get("/videos")
      .then((res) => {
        // Look at your console log: the array is inside res.data.data.docs
        if (res.data?.data?.docs) {
          setVideos(res.data.data.docs); 
        }
      })
      .catch((err) => {
        console.error("Error fetching videos:", err);
      })
      .finally(() => setLoading(false))
}, [])

  if (loading) return <div className="text-center py-20 text-xl">Loading videos...</div>

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8">All Videos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>
    </div>
  )
}

export default AllVideos
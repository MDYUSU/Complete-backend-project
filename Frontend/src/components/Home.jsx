import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import axiosInstance from '../utils/axios'
import VideoCard from './VideoCard'
import Container from './Container'

function Home() {
    const [videos, setVideos] = useState([])
    const [loading, setLoading] = useState(true)

    const [searchParams] = useSearchParams()
    const queryTerm = searchParams.get("query") || ""

  useEffect(() => {
        setLoading(true)
        
        // 3. Send the query to your backend controller
        axiosInstance.get(`/videos?query=${queryTerm}`)
            .then((res) => {
                setVideos(res.data.data?.docs || [])
            })
            .finally(() => setLoading(false))
            
    }, [queryTerm]) // 4. Re-run whenever the search term changes!

    if (loading) return <div className="text-center py-20 text-white">Searching VisionTube...</div>

    return (
        <Container>
            <div className="py-8">
                <h1 className="text-2xl font-bold text-white mb-6">Discovery Feed</h1>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {videos.map((video) => (
                        <VideoCard key={video._id} video={video} />
                    ))}
                </div>

                {videos.length === 0 && (
                    <div className="text-center py-20 text-slate-500">
                        <p className="text-xl">No videos found. Be the first to upload!</p>
                    </div>
                )}
            </div>
        </Container>
    )
}

export default Home
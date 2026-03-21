import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import axiosInstance from '../utils/axios'
import { useNavigate } from 'react-router-dom'

function VideoUpload() {
    const { register, handleSubmit, formState: { errors } } = useForm()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const navigate = useNavigate()

    const publishVideo = async (data) => {
        setError("")
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append("title", data.title)
            formData.append("description", data.description)
            
            // Getting the actual files from the FileList
            formData.append("videoFile", data.videoFile[0])
            formData.append("thumbnail", data.thumbnail[0])

            // Adjust this URL to match your video route (e.g., /videos)
            const response = await axiosInstance.post("/videos", formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            if (response.data) {
                console.log("Video Published:", response.data)
                navigate("/") // Go home once done
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to upload video")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-6 bg-slate-800 rounded-lg shadow-xl text-white">
            <h2 className="text-2xl font-bold mb-6">Upload Video</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}

            <form onSubmit={handleSubmit(publishVideo)} className="space-y-4">
                {/* Title */}
                <div>
                    <label className="block mb-1">Title</label>
                    <input 
                        className="w-full p-2 rounded bg-slate-700 border border-slate-600 outline-none"
                        {...register("title", { required: true })}
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block mb-1">Description</label>
                    <textarea 
                        className="w-full p-2 rounded bg-slate-700 border border-slate-600 outline-none h-24"
                        {...register("description", { required: true })}
                    />
                </div>

                {/* Video File */}
                <div>
                    <label className="block mb-1">Video File</label>
                    <input 
                        type="file" 
                        accept="video/*"
                        className="w-full cursor-pointer"
                        {...register("videoFile", { required: true })}
                    />
                </div>

                {/* Thumbnail */}
                <div>
                    <label className="block mb-1">Thumbnail</label>
                    <input 
                        type="file" 
                        accept="image/*"
                        className="w-full cursor-pointer"
                        {...register("thumbnail", { required: true })}
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full py-3 bg-orange-600 rounded font-bold hover:bg-orange-700 transition ${loading ? "opacity-50" : ""}`}
                >
                    {loading ? "Uploading (This might take a minute)..." : "Publish Video"}
                </button>
            </form>
        </div>
    )
}

export default VideoUpload
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import axiosInstance from '../utils/axios'
import { useNavigate } from 'react-router-dom'

function VideoUpload() {
    const { register, handleSubmit, watch, formState: { errors } } = useForm()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [thumbnailPreview, setThumbnailPreview] = useState(null)
    const navigate = useNavigate()

    // Watch file fields to show selection status/preview
    const watchedThumbnail = watch("thumbnail")
    const watchedVideo = watch("videoFile")

    useEffect(() => {
        if (watchedThumbnail && watchedThumbnail.length > 0) {
            const file = watchedThumbnail[0]
            setThumbnailPreview(URL.createObjectURL(file))
        }
    }, [watchedThumbnail])

    const publishVideo = async (data) => {
        setError("")
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append("title", data.title)
            formData.append("description", data.description)
            formData.append("videoFile", data.videoFile[0])
            formData.append("thumbnail", data.thumbnail[0])

            const response = await axiosInstance.post("/videos", formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            if (response.data) {
                navigate("/admin/dashboard") 
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to upload video")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto p-6 flex justify-center mb-20">
            <div className="w-full max-w-2xl bg-slate-900/60 border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-md text-white">
                <header className="mb-8">
                    <h2 className="text-2xl font-black tracking-tighter">Upload Video</h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Share your content with the world</p>
                </header>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(publishVideo)} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">Video Title</label>
                        <input 
                            className={`w-full bg-slate-800/50 border ${errors.title ? 'border-red-500/50' : 'border-white/5'} rounded-xl px-4 py-3 outline-none focus:border-orange-500 transition-all`}
                            placeholder="e.g. My Awesome Travel Vlog"
                            {...register("title", { required: "Title is required" })}
                        />
                        {errors.title && <span className="text-[10px] text-red-500 mt-1 uppercase font-bold">{errors.title.message}</span>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">Description</label>
                        <textarea 
                            className={`w-full bg-slate-800/50 border ${errors.description ? 'border-red-500/50' : 'border-white/5'} rounded-xl px-4 py-3 outline-none focus:border-orange-500 transition-all h-28 resize-none`}
                            placeholder="Tell viewers about your video..."
                            {...register("description", { required: "Description is required" })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Video File Dropzone */}
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">Video File</label>
                            <label className={`relative flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${watchedVideo?.length > 0 ? 'border-green-500/40 bg-green-500/5' : 'border-white/10 hover:border-orange-500/40 hover:bg-white/5'}`}>
                                <input 
                                    type="file" 
                                    accept="video/*"
                                    className="hidden"
                                    {...register("videoFile", { required: "Video is required" })}
                                />
                                {watchedVideo?.length > 0 ? (
                                    <div className="text-center px-4">
                                        <span className="text-2xl">🎬</span>
                                        <p className="text-[10px] font-bold text-green-400 mt-2 truncate uppercase tracking-tighter">{watchedVideo[0].name}</p>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <span className="text-2xl opacity-50">📤</span>
                                        <p className="text-[10px] text-slate-400 mt-2 font-black uppercase tracking-widest">Select Video</p>
                                    </div>
                                )}
                            </label>
                            {errors.videoFile && <p className="text-[10px] text-red-500 mt-1 font-bold uppercase">{errors.videoFile.message}</p>}
                        </div>

                        {/* Thumbnail Dropzone */}
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">Thumbnail</label>
                            <label className={`relative flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-2xl cursor-pointer overflow-hidden transition-all ${watchedThumbnail?.length > 0 ? 'border-blue-500/40' : 'border-white/10 hover:border-orange-500/40 hover:bg-white/5'}`}>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    className="hidden"
                                    {...register("thumbnail", { required: "Thumbnail is required" })}
                                />
                                {thumbnailPreview ? (
                                    <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center">
                                        <span className="text-2xl opacity-50">🖼️</span>
                                        <p className="text-[10px] text-slate-400 mt-2 font-black uppercase tracking-widest">Select Cover</p>
                                    </div>
                                )}
                            </label>
                            {errors.thumbnail && <p className="text-[10px] text-red-500 mt-1 font-bold uppercase">{errors.thumbnail.message}</p>}
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all active:scale-[0.98] ${loading ? "bg-slate-800 text-slate-600 cursor-not-allowed" : "bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white shadow-xl shadow-orange-950/20"}`}
                    >
                        {loading ? "Uploading Masterpiece..." : "Publish Video"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default VideoUpload
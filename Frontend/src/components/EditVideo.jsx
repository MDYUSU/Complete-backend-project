import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axiosInstance from '../utils/axios'
import Container from './Container'

function EditVideo() {
    const { videoId } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    
    const [formData, setFormData] = useState({
        title: "",
        description: ""
    })
    
    // NEW: State for thumbnail file and preview URL
    const [thumbnail, setThumbnail] = useState(null)
    const [preview, setPreview] = useState(null)

    useEffect(() => {
        axiosInstance.get(`/videos/${videoId}`)
            .then((res) => {
                const videoData = res.data.data;
                setFormData({
                    title: videoData.title,
                    description: videoData.description
                })
                // Set initial preview to current thumbnail
                setPreview(videoData.thumbnail)
            })
            .finally(() => setLoading(false))
    }, [videoId])

    // Handle file selection and create local preview
    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setThumbnail(file)
            setPreview(URL.createObjectURL(file)) // Creates a temporary browser URL for the image
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        
        try {
            const data = new FormData();
            data.append("title", formData.title.trim());
            data.append("description", formData.description.trim());
            
            // Only append thumbnail if a new one was selected
            if (thumbnail) {
                data.append("thumbnail", thumbnail);
            }

            await axiosInstance.patch(`/videos/${videoId}`, data);
            
            alert("Video updated successfully!");
            navigate('/my-videos');
        } catch (error) {
            console.error("Update failed:", error.response?.data || error.message);
            alert(error.response?.data?.message || "Failed to update video");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-white">Loading video details...</div>

    return (
        <Container>
            <div className="max-w-2xl mx-auto py-10">
                <h1 className="text-3xl font-bold text-white mb-8">Edit Video Details</h1>
                
                <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-2xl">
                    
                    {/* THUMBNAIL PREVIEW & INPUT */}
                    <div>
                        <label className="text-slate-400 block mb-2">Thumbnail</label>
                        <div className="relative group w-full aspect-video bg-slate-800 rounded-lg overflow-hidden border-2 border-dashed border-slate-700 hover:border-orange-500 transition-colors">
                            {preview && (
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            )}
                            <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white">
                                <span className="text-2xl">📸</span>
                                <span className="text-sm font-semibold">Change Thumbnail</span>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 italic">Click the image to upload a new thumbnail (optional)</p>
                    </div>

                    {/* TITLE INPUT */}
                    <div>
                        <label className="text-slate-400 block mb-2 font-medium">Title</label>
                        <input 
                            type="text" 
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-orange-500 transition-all"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            required
                        />
                    </div>

                    {/* DESCRIPTION INPUT */}
                    <div>
                        <label className="text-slate-400 block mb-2 font-medium">Description</label>
                        <textarea 
                            rows="5"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-orange-500 transition-all resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            required
                        />
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex gap-4 pt-4">
                        <button 
                            type="submit" 
                            disabled={updating}
                            className="flex-[2] bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg active:scale-95 disabled:bg-slate-700 disabled:cursor-not-allowed"
                        >
                            {updating ? "Updating..." : "Save Changes"}
                        </button>
                        <button 
                            type="button"
                            onClick={() => navigate('/admin/dashboard')}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg border border-slate-700 transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </Container>
    )
}

export default EditVideo
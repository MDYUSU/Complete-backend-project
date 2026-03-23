import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import axiosInstance from '../utils/axios.js' 

function Signup() {
    const { register, handleSubmit, watch, formState: { errors } } = useForm()
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [avatarPreview, setAvatarPreview] = useState(null)
    const navigate = useNavigate()

    // Watch the avatar field to generate a live preview
    const watchedAvatar = watch("avatar")

    useEffect(() => {
        if (watchedAvatar && watchedAvatar.length > 0) {
            const file = watchedAvatar[0]
            setAvatarPreview(URL.createObjectURL(file))
        }
    }, [watchedAvatar])

    const createAccount = async (data) => {
        setError("")
        setLoading(true)
        try {
            const formData = new FormData();
            formData.append("fullName", data.fullName);
            formData.append("email", data.email);
            formData.append("username", data.username);
            formData.append("password", data.password);

            if (data.avatar && data.avatar[0]) {
                formData.append("avatar", data.avatar[0]);
            }

            const response = await axiosInstance.post("/users/register", formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data) {
                navigate("/login"); 
            }
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred during signup");
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
            {/* 🚀 PRO-UI GLASS CARD */}
            <div className="w-full max-w-lg bg-slate-900/60 border border-white/10 p-10 rounded-[2.5rem] shadow-2xl backdrop-blur-xl text-white">
                
                <header className="text-center mb-8">
                    <h1 className="text-3xl font-black tracking-tighter">Create Account</h1>
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em] mt-2">
                        Join the VisionTube creator community
                    </p>
                </header>

                {error && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs text-center font-bold uppercase tracking-tight">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(createAccount)} className="space-y-5">
                    
                    {/* AVATAR UPLOAD SECTION */}
                    <div className="flex flex-col items-center mb-6">
                        <label className="relative group cursor-pointer">
                            <div className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${avatarPreview ? 'border-orange-500' : 'border-white/20 hover:border-orange-500/50'}`}>
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl opacity-30">👤</span>
                                )}
                            </div>
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                {...register("avatar", { required: "Profile picture is required" })} 
                            />
                            <div className="absolute bottom-0 right-0 bg-orange-600 rounded-full p-1.5 shadow-lg border-2 border-slate-900">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-3 h-3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            </div>
                        </label>
                        <p className="text-[9px] uppercase font-black text-slate-500 mt-2 tracking-widest">Upload Avatar</p>
                        {errors.avatar && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.avatar.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Full Name */}
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5 ml-1">Full Name</label>
                            <input
                                placeholder="John Doe"
                                className="w-full bg-slate-800/50 border border-white/5 rounded-2xl px-4 py-3 text-white outline-none focus:border-orange-500 transition-all placeholder:text-slate-600 text-sm"
                                {...register("fullName", { required: true })}
                            />
                        </div>

                        {/* Username */}
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5 ml-1">Username</label>
                            <input
                                placeholder="johndoe_01"
                                className="w-full bg-slate-800/50 border border-white/5 rounded-2xl px-4 py-3 text-white outline-none focus:border-orange-500 transition-all placeholder:text-slate-600 text-sm"
                                {...register("username", { required: true })}
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5 ml-1">Email Address</label>
                        <input
                            placeholder="name@example.com"
                            type="email"
                            className="w-full bg-slate-800/50 border border-white/5 rounded-2xl px-5 py-3 text-white outline-none focus:border-orange-500 transition-all placeholder:text-slate-600 text-sm"
                            {...register("email", { required: true })}
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5 ml-1">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full bg-slate-800/50 border border-white/5 rounded-2xl px-5 py-3 text-white outline-none focus:border-orange-500 transition-all placeholder:text-slate-600 text-sm"
                            {...register("password", { required: true })}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 mt-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-[0.98] shadow-xl ${
                            loading 
                            ? "bg-slate-800 text-slate-600 cursor-not-allowed" 
                            : "bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white shadow-orange-950/20"
                        }`}
                    >
                        {loading ? "Creating Masterpiece..." : "Create Account"}
                    </button>
                </form>

                <footer className="mt-8 text-center">
                    <p className="text-slate-500 text-xs font-medium">
                        Already have an account? {' '}
                        <Link to="/login" className="text-orange-500 font-black hover:underline transition-all">
                            Sign In
                        </Link>
                    </p>
                </footer>
            </div>
        </div>
    )
}

export default Signup
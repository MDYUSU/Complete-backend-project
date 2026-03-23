import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login as authLogin } from '../store/authSlice' 
import { useDispatch } from 'react-redux'
import axiosInstance from "../utils/axios"
import { useForm } from "react-hook-form"

function Login() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { register, handleSubmit, formState: { errors } } = useForm()
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const login = async (data) => {
        setError("")
        setLoading(true)
        try {
            const response = await axiosInstance.post("/users/login", data)
            
            if (response.data) {
                // 1. Update Redux store with user info
                dispatch(authLogin(response.data.data.user))
                
                // 2. Redirect to home page
                navigate("/")
            }
        } catch (error) {
            setError(error.response?.data?.message || "Invalid email or password")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            {/* 🚀 GLASSMORPHISM CARD */}
            <div className="w-full max-w-md bg-slate-900/60 border border-white/10 p-10 rounded-[2.5rem] shadow-2xl backdrop-blur-xl text-white">
                
                <header className="text-center mb-10">
                    <h1 className="text-3xl font-black tracking-tighter">Welcome Back</h1>
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em] mt-2">
                        Sign in to your VisionTube account
                    </p>
                </header>

                {error && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs text-center font-bold uppercase tracking-tight animate-pulse">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(login)} className="space-y-6">
                    {/* Email Input */}
                    <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2 ml-1">
                            Email Address
                        </label>
                        <input 
                            type="email"
                            placeholder="name@example.com"
                            className={`w-full bg-slate-800/50 border ${errors.email ? 'border-red-500/50' : 'border-white/5'} rounded-2xl px-5 py-4 text-white outline-none focus:border-orange-500 transition-all placeholder:text-slate-600`}
                            {...register("email", { 
                                required: "Email is required",
                                pattern: {
                                    value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                                    message: "Email address must be a valid address",
                                }
                            })}
                        />
                        {errors.email && <p className="text-[10px] text-red-500 mt-1 ml-1 font-bold">{errors.email.message}</p>}
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                        <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2 ml-1">
                            Password
                        </label>
                        <input 
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className={`w-full bg-slate-800/50 border ${errors.password ? 'border-red-500/50' : 'border-white/5'} rounded-2xl px-5 py-4 text-white outline-none focus:border-orange-500 transition-all placeholder:text-slate-600`}
                            {...register("password", { required: "Password is required" })}
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 bottom-4 text-slate-500 hover:text-white transition-colors text-[10px] font-black tracking-tighter"
                        >
                            {showPassword ? "HIDE" : "SHOW"}
                        </button>
                    </div>

                    {/* <div className="flex justify-end">
                        <Link to="/forgot-password" size="xs" className="text-[10px] font-bold text-slate-500 hover:text-orange-500 transition-colors uppercase tracking-tight">
                            Forgot Password?
                        </Link>
                    </div> */}

                    {/* Submit Button */}
                    <button 
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all active:scale-[0.98] shadow-xl ${
                            loading 
                            ? "bg-slate-800 text-slate-600 cursor-not-allowed" 
                            : "bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white shadow-orange-900/20"
                        }`}
                    >
                        {loading ? "Authenticating..." : "Sign In"}
                    </button>
                </form>

                <footer className="mt-8 text-center">
                    <p className="text-slate-500 text-xs font-medium">
                        Don't have an account? {' '}
                        <Link to="/signup" className="text-orange-500 font-black hover:underline transition-all">
                            Create Account
                        </Link>
                    </p>
                </footer>
            </div>
        </div>
    )
}

export default Login
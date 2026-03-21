import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login as authLogin } from '../store/authSlice' 
import { useDispatch } from 'react-redux'
import axiosInstance from "../utils/axios"
import { useForm } from "react-hook-form"

function Login() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { register, handleSubmit } = useForm()
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const login = async (data) => {
        setError("")
        setLoading(true)
        try {
            // This hits http://localhost:8001/api/v1/users/login
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
        <div className='flex items-center justify-center w-full py-8'>
            <div className={`mx-auto w-full max-w-lg bg-gray-100 rounded-xl p-10 border border-black/10`}>
                <h2 className="text-center text-2xl font-bold leading-tight">Sign in to your account</h2>
                
                {error && <p className="text-red-600 mt-8 text-center">{error}</p>}
                
                <form onSubmit={handleSubmit(login)} className='mt-8'>
                    <div className='space-y-5 text-black'>
                        <div>
                            <label className="block mb-1 font-medium">Email:</label>
                            <input
                                placeholder="Enter your email"
                                type="email"
                                className="px-3 py-2 rounded-lg bg-white text-black outline-none focus:bg-gray-50 duration-200 border border-gray-200 w-full"
                                {...register("email", { required: true })}
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Password:</label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                className="px-3 py-2 rounded-lg bg-white text-black outline-none focus:bg-gray-50 duration-200 border border-gray-200 w-full"
                                {...register("password", { required: true })}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 transition-colors ${loading ? "opacity-50" : ""}`}
                        >
                            {loading ? "Logging in..." : "Sign In"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login
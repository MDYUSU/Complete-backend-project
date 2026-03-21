import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import axiosInstance from '../utils/axios.js' 

function Signup() {
    const { register, handleSubmit, formState: { errors } } = useForm()
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const createAccount = async (data) => {
        setError("")
        setLoading(true)
        try {
            // 1. Initialize FormData (This is the key for file uploads)
            const formData = new FormData();
            
            // 2. Append all text fields
            formData.append("fullName", data.fullName);
            formData.append("email", data.email);
            formData.append("username", data.username);
            formData.append("password", data.password);

            // 3. Append the Avatar file
            // data.avatar is a FileList, so we take the first file [0]
            if (data.avatar && data.avatar[0]) {
                formData.append("avatar", data.avatar[0]);
            }

            // 4. Send the POST request to your backend
            const response = await axiosInstance.post("/users/register", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data) {
                console.log("Signup successful:", response.data);
                navigate("/login"); // Redirect to login page on success
            }
        } catch (err) {
            // Catching backend errors (like "User already exists")
            setError(err.response?.data?.message || "An error occurred during signup");
            console.error("Signup error details:", err);
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center w-full py-8">
            <div className={`mx-auto w-full max-w-lg bg-gray-100 rounded-xl p-10 border border-black/10`}>
                <h2 className="text-center text-2xl font-bold leading-tight">Sign up to create account</h2>
                <p className="mt-2 text-center text-base text-black/60">
                    Already have an account?&nbsp;
                    <Link to="/login" className="font-medium text-primary transition-all duration-200 hover:underline">
                        Sign In
                    </Link>
                </p>

                {error && <p className="text-red-600 mt-8 text-center">{error}</p>}

                <form onSubmit={handleSubmit(createAccount)} className="mt-8">
                    <div className="space-y-5 text-black">
                        {/* Full Name */}
                        <div>
                            <label className="block mb-1 font-medium">Full Name:</label>
                            <input
                                className="px-3 py-2 rounded-lg bg-white text-black outline-none focus:bg-gray-50 duration-200 border border-gray-200 w-full"
                                placeholder="Enter your full name"
                                {...register("fullName", { required: true })}
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block mb-1 font-medium">Email:</label>
                            <input
                                className="px-3 py-2 rounded-lg bg-white text-black outline-none focus:bg-gray-50 duration-200 border border-gray-200 w-full"
                                placeholder="Enter your email"
                                type="email"
                                {...register("email", { required: true })}
                            />
                        </div>

                        {/* Username */}
                        <div>
                            <label className="block mb-1 font-medium">Username:</label>
                            <input
                                className="px-3 py-2 rounded-lg bg-white text-black outline-none focus:bg-gray-50 duration-200 border border-gray-200 w-full"
                                placeholder="Enter your username"
                                {...register("username", { required: true })}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block mb-1 font-medium">Password:</label>
                            <input
                                className="px-3 py-2 rounded-lg bg-white text-black outline-none focus:bg-gray-50 duration-200 border border-gray-200 w-full"
                                placeholder="Enter your password"
                                type="password"
                                {...register("password", { required: true })}
                            />
                        </div>

                        {/* Avatar File Upload (THE MISSING PIECE) */}
                        <div>
                            <label className="block mb-1 font-medium">Avatar (Profile Picture):</label>
                            <input
                                className="px-3 py-2 rounded-lg bg-white text-black outline-none focus:bg-gray-50 duration-200 border border-gray-200 w-full"
                                type="file"
                                accept="image/png, image/jpg, image/jpeg"
                                {...register("avatar", { required: true })}
                            />
                            {errors.avatar && <span className="text-red-500 text-sm">Avatar is required</span>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 transition-colors ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Signup
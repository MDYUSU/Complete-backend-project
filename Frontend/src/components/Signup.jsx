import React, {useState} from 'react'
import axiosInstance from '../utils/axios'
import {Link, useNavigate} from 'react-router-dom'
import {login} from '../store/authSlice'
import { Input } from "./index"; // We'll add Button in a sec
import {useDispatch} from 'react-redux'
import {useForm} from 'react-hook-form'

function Signup() {
    const navigate = useNavigate()
    const [error, setError] = useState("")
    const dispatch = useDispatch()
    const {register, handleSubmit} = useForm()

    const create = async(data) => {
        setError("")
        try {
            const userData = await axiosInstance.post("/users/register", data)
            if (userData) {
                // After signup, we usually redirect to login
                navigate("/login")
            }
        } catch (error) {
            setError(error.response.data.message)
        }
    }

  return (
    <div className="flex items-center justify-center">
            <div className={`mx-auto w-full max-w-lg bg-slate-800 rounded-xl p-10 border border-slate-700`}>
            <h2 className="text-center text-2xl font-bold leading-tight text-white">Sign up to create account</h2>
            <p className="mt-2 text-center text-base text-slate-400">
                Already have an account?&nbsp;
                <Link to="/login" className="font-medium text-orange-500 transition-all duration-200 hover:underline">
                    Sign In
                </Link>
            </p>
            {error && <p className="text-red-600 mt-8 text-center">{error}</p>}

            <form onSubmit={handleSubmit(create)}>
                <div className='space-y-5'>
                    <Input
                    label="Full Name: "
                    placeholder="Enter your full name"
                    {...register("fullName", { required: true })}
                    />
                    <Input
                    label="Email: "
                    placeholder="Enter your email"
                    type="email"
                    {...register("email", {
                        required: true,
                        validate: {
                            matchPatern: (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                            "Email address must be a valid address",
                        }
                    })}
                    />
                    <Input
                    label="Username: "
                    placeholder="Enter your username"
                    {...register("username", { required: true })}
                    />
                    <Input
                    label="Password: "
                    type="password"
                    placeholder="Enter your password"
                    {...register("password", { required: true })}
                    />
                    <button type="submit" className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700">
                        Create Account
                    </button>
                </div>
            </form>
        </div>
    </div>
  )
}

export default Signup
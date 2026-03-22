import React, { useState, useEffect } from 'react'
import axiosInstance from '../utils/axios'

function LikeButton({ id, type, initialLikes = 0, initialIsLiked = false }) {
    const [isLiked, setIsLiked] = useState(initialIsLiked)
    const [likesCount, setLikesCount] = useState(initialLikes)

    // Toggle Like Logic
    const toggleLike = async () => {
        try {
            // URL logic based on type (video or comment)
            const endpoint = type === 'video' 
                ? `/likes/toggle/v/${id}` 
                : `/likes/toggle/c/${id}`;
            
            const res = await axiosInstance.post(endpoint);
            
            if (res.data) {
                setIsLiked(!isLiked);
                setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
            }
        } catch (error) {
            console.error("Like toggle failed:", error);
        }
    }

    return (
        <div className="flex items-center gap-2">
            <button 
                onClick={toggleLike}
                className="flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 rounded-full transition"
            >
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill={isLiked ? "white" : "none"} 
                    viewBox="0 0 24 24" 
                    strokeWidth={1.5} 
                    stroke="currentColor" 
                    className="w-6 h-6"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 .115-.018.23-.052.339l-1.44 4.33a2.25 2.25 0 0 0 2.138 2.961h3.353c.691 0 1.25.559 1.25 1.25v1.442c0 .285-.113.559-.313.76a1.44 1.44 0 0 1-1.043.435H18.75a.75.75 0 0 0-.75.75v1.442c0 .285-.113.559-.313.76a1.44 1.44 0 0 1-1.043.435h-1.442a.75.75 0 0 0-.75.75v1.442c0 .285-.113.559-.313.76a1.44 1.44 0 0 1-1.043.435H10.5a.75.75 0 0 1-.75-.75v-1.442c0-.285-.113-.559-.313-.76a1.44 1.44 0 0 0-1.043-.435H7.5a.75.75 0 0 1-.75-.75v-1.442c0-.285-.113-.559-.313-.76a1.44 1.44 0 0 0-1.043-.435H3.75a.75.75 0 0 1-.75-.75V11.5c0-.691.559-1.25 1.25-1.25h2.383Z" />
                </svg>
                <span className="text-sm font-bold">{likesCount}</span>
            </button>
            
            {/* 👎 Dislike Placeholder (UI only, or add backend toggle if ready) */}
            <button className="hover:bg-white/10 px-3 py-1.5 rounded-full transition border-l border-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.367 13.75c-.806 0-1.533.446-2.031 1.08a9.041 9.041 0 0 1-2.861 2.4c-.723.384-1.35.956-1.653 1.715a4.498 4.498 0 0 0-.322 1.672v.333a.75.75 0 0 0 .75.75 2.25 2.25 0 0 0 2.25-2.25c0-.115.018-.23.052-.339l1.44-4.33a2.25 2.25 0 0 1 2.138-2.961H3.75c-.691 0-1.25-.559-1.25-1.25V9.408c0-.285.113-.559.313-.76a1.44 1.44 0 0 1 1.043-.435H5.25a.75.75 0 0 1 .75-.75V6.021c0-.285.113-.559.313-.76a1.44 1.44 0 0 1 1.043-.435h1.442a.75.75 0 0 1 .75-.75V2.634c0-.285.113-.559.313-.76a1.44 1.44 0 0 1 1.043-.435H13.5a.75.75 0 0 0 .75.75v1.442c0 .285.113.559.313.76a1.44 1.44 0 0 1 1.043.435h2.152c.691 0 1.25.559 1.25 1.25v2.842c0 .691-.559 1.25-1.25 1.25h-2.383Z" />
                </svg>
            </button>
        </div>
    )
}

export default LikeButton
import React from 'react'
import { useNavigate } from 'react-router-dom'

function VideoCard({ video, isOwner = false, onDelete, onTogglePublish }) {
  const navigate = useNavigate()

  return (
    <div className='w-full bg-slate-800 rounded-xl overflow-hidden shadow-lg group relative border border-slate-700'>
      
      {/* 🔒 PRIVATE BADGE */}
      {!video.isPublished && (
        <div className="absolute top-2 left-2 bg-red-600/90 text-[10px] font-bold px-2 py-1 rounded text-white z-10 uppercase backdrop-blur-sm">
          Private
        </div>
      )}

      {/* 🚀 FIXED: Changed /watch/ to /video/ to match your routes */}
      <div 
        onClick={() => navigate(`/video/${video._id}`)} 
        className='cursor-pointer'
      >
        <div className="relative aspect-video">
            <img 
            src={video.thumbnail} 
            alt={video.title} 
            className='w-full h-full object-cover' 
            />
        </div>
        <div className='p-3'>
          <h3 className='text-white font-bold truncate'>{video.title}</h3>
          <p className='text-slate-400 text-sm'>@{video.owner?.username || "mdyusu"}</p>
        </div>
      </div>

      {/* 🛠️ OWNER ACTIONS */}
      {isOwner && (
        <div className='absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
          
          <button 
            onClick={() => onTogglePublish(video._id)}
            className={`${video.isPublished ? 'bg-green-600 hover:bg-green-500' : 'bg-slate-600 hover:bg-slate-500'} p-2 rounded-full shadow-md transition-colors`}
            title={video.isPublished ? "Make Private" : "Make Public"}
          >
            {video.isPublished ? "🌐" : "🔒"}
          </button>

          <button 
            onClick={() => navigate(`/edit-video/${video._id}`)}
            className='bg-blue-600 p-2 rounded-full hover:bg-blue-500 shadow-md transition-colors'
            title="Edit Video"
          >
            ✏️
          </button>

          <button 
            onClick={() => onDelete(video._id)}
            className='bg-red-600 p-2 rounded-full hover:bg-red-500 shadow-md transition-colors'
            title="Delete Video"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  )
}

export default VideoCard
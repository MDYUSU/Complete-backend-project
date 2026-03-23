import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function VideoCard({ video, isOwner = false, onDelete, onTogglePublish, isLikedPage = false, onRemoveLike }) {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  // 🛡️ Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    /* 🚀 UI FIX: Removed overflow-hidden so the menu can "pop out" of the card */
    <div className='w-full bg-slate-800 rounded-xl shadow-lg group relative border border-slate-700 hover:border-slate-500 transition-all z-10 hover:z-20'>
      
      {/* 🔒 PRIVATE BADGE */}
      {!video.isPublished && (
        <div className="absolute top-2 left-2 bg-red-600/90 text-[10px] font-bold px-2 py-1 rounded text-white z-30 uppercase backdrop-blur-sm">
          Private
        </div>
      )}

      {/* THUMBNAIL - Keep overflow-hidden ONLY here to clip the image corners */}
      <div 
        onClick={() => navigate(`/video/${video._id}`)} 
        className='cursor-pointer aspect-video overflow-hidden rounded-t-xl'
      >
        <img 
          src={video.thumbnail} 
          alt={video.title} 
          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300' 
        />
      </div>

      {/* INFO AREA */}
      <div className='p-3 relative flex justify-between items-start gap-2 bg-slate-800 rounded-b-xl'>
        <div 
          onClick={() => navigate(`/video/${video._id}`)} 
          className='cursor-pointer flex-1 min-w-0'
        >
          <h3 className='text-white font-bold truncate text-sm'>{video.title}</h3>
          <p className='text-slate-400 text-xs mt-1'>@{video.owner?.username || "mdyusu"}</p>
        </div>

        {/* 🚀 THREE DOTS MENU */}
        <div className="relative" ref={menuRef}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
            </svg>
          </button>

          {/* DROPDOWN MENU - High z-index and absolute positioning */}
          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-[100] py-1 shadow-black overflow-hidden">
              
              {isLikedPage && (
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    onRemoveLike(video._id); 
                    setShowMenu(false); 
                  }}
                  className="w-full text-left px-4 py-3 text-xs text-red-500 hover:bg-slate-800 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <span>🗑️</span> Remove from Liked
                </button>
              )}

              {isOwner && (
                <>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onTogglePublish(video._id); setShowMenu(false); }}
                    className="w-full text-left px-4 py-3 text-xs text-white hover:bg-slate-800 transition-colors flex items-center gap-2"
                  >
                    {video.isPublished ? "🔒 Make Private" : "🌐 Make Public"}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate(`/edit-video/${video._id}`); }}
                    className="w-full text-left px-4 py-3 text-xs text-white hover:bg-slate-800 transition-colors flex items-center gap-2"
                  >
                    <span>✏️</span> Edit Video
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(video._id); setShowMenu(false); }}
                    className="w-full text-left px-4 py-3 text-xs text-red-500 hover:bg-slate-800 transition-colors flex items-center gap-2 border-t border-slate-800"
                  >
                    <span>🗑️</span> Delete Permanently
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VideoCard
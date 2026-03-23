import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Add the new props: isLikedPage and onRemoveLike
function VideoCard({ video, isOwner = false, onDelete, onTogglePublish, isLikedPage = false, onRemoveLike }) {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  // 🛡️ Logic to close the menu if you click anywhere else
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
    <div className='w-full bg-slate-800 rounded-xl overflow-hidden shadow-lg group relative border border-slate-700 hover:border-slate-500 transition-all'>
      
      {/* 🔒 PRIVATE BADGE */}
      {!video.isPublished && (
        <div className="absolute top-2 left-2 bg-red-600/90 text-[10px] font-bold px-2 py-1 rounded text-white z-10 uppercase backdrop-blur-sm">
          Private
        </div>
      )}

      {/* THUMBNAIL */}
      <div 
        onClick={() => navigate(`/video/${video._id}`)} 
        className='cursor-pointer aspect-video overflow-hidden'
      >
        <img 
          src={video.thumbnail} 
          alt={video.title} 
          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300' 
        />
      </div>

      {/* INFO AREA */}
      <div className='p-3 relative flex justify-between items-start gap-2'>
        <div 
          onClick={() => navigate(`/video/${video._id}`)} 
          className='cursor-pointer flex-1 overflow-hidden'
        >
          <h3 className='text-white font-bold truncate text-sm'>{video.title}</h3>
          <p className='text-slate-400 text-xs mt-1'>@{video.owner?.username || "mdyusu"}</p>
        </div>

        {/* 🚀 THE THREE DOTS MENU (Always rendered, but content depends on props) */}
        {(isOwner || isLikedPage) && (
          <div className="relative" ref={menuRef}>
            <button 
              onClick={(e) => {
                e.stopPropagation(); // Prevents opening the video
                setShowMenu(!showMenu);
              }}
              className="p-1 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
              </svg>
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 py-1 overflow-hidden">
                
                {/* Option for Liked Videos Page */}
                {isLikedPage && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onRemoveLike(video._id); setShowMenu(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs text-red-500 hover:bg-slate-800 transition-colors flex items-center gap-2"
                  >
                    <span>🗑️</span> Remove from Liked
                  </button>
                )}

                {/* Options for Owner (Dashboard/My Content) */}
                {isOwner && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onTogglePublish(video._id); setShowMenu(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs text-white hover:bg-slate-800 transition-colors flex items-center gap-2"
                    >
                      {video.isPublished ? "🔒 Make Private" : "🌐 Make Public"}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/edit-video/${video._id}`); }}
                      className="w-full text-left px-4 py-2.5 text-xs text-white hover:bg-slate-800 transition-colors flex items-center gap-2"
                    >
                      <span>✏️</span> Edit Video
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(video._id); setShowMenu(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs text-red-500 hover:bg-slate-800 transition-colors flex items-center gap-2 border-t border-slate-800"
                    >
                      <span>🗑️</span> Delete Permanently
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🛠️ OLD OWNER ACTIONS (Keep or remove based on preference - usually hidden now) */}
      {isOwner && !showMenu && (
        <div className='absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
            {/* You can keep these if you want the hover shortcut, or remove them to rely ONLY on the 3 dots */}
        </div>
      )}
    </div>
  )
}

export default VideoCard
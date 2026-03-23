import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axiosInstance from "../../utils/axios"
import { Container, LogoutBtn } from "../index"

function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("") 
  
  // 🚀 Autocomplete States
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const authStatus = useSelector((state) => state.auth.status)
  const userData = useSelector((state) => state.auth.userData)
  const navigate = useNavigate()
  
  const dropdownRef = useRef(null)
  const searchRef = useRef(null)

  // 1. Sidebar Toggle Logic
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  // 2. 🚀 Debounced Search Suggestions
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      axiosInstance.get(`/videos/suggestions?query=${searchTerm}`)
        .then(res => {
          setSuggestions(res.data.data);
          setShowSuggestions(true);
        })
        .catch(err => console.error("Autocomplete Error:", err));
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // 3. Close Menus on Outside Click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = (e, selectedQuery) => {
    const query = selectedQuery || searchTerm;
    if (e?.key === "Enter" || e?.type === "click" || selectedQuery) {
      if (query.trim()) {
        setShowSuggestions(false);
        navigate(`/?query=${query.trim()}`);
      }
    }
  }

  const navItems = [
    { name: "Login", slug: "/login", active: !authStatus },
    { name: "Signup", slug: "/signup", active: !authStatus },
    { 
      customComponent: (
        <button 
          onClick={() => navigate('/add-video')}
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white pl-3 pr-4 py-2 rounded-full transition-all active:scale-95 border border-white/5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="font-semibold text-sm">Create</span>
        </button>
      ), 
      active: authStatus 
    },
  ]

  return (
    <>
      <header className='py-3 shadow bg-slate-900 border-b border-slate-800 sticky top-0 z-50'>
        <Container>
          <nav className='flex items-center gap-4'>
            
            <button onClick={toggleSidebar} className='p-2 hover:bg-slate-800 rounded-full text-white transition-all active:scale-90'>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            <div className='flex-shrink-0'>
              <Link to='/'>
                <span className="text-orange-600 font-bold text-2xl tracking-tight">VisionTube</span>
              </Link>
            </div>

            {/* 🔍 SEARCH BAR WITH AUTOCOMPLETE */}
            <div className='hidden md:flex flex-1 max-w-xl mx-auto items-center relative' ref={searchRef}>
              <div className="flex w-full">
                <input 
                  type="text" 
                  placeholder="Search" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  onKeyDown={handleSearch}
                  className='w-full bg-black border border-slate-700 text-white px-4 py-2 rounded-l-full focus:outline-none focus:border-blue-500 transition-colors text-sm'
                />
                <button onClick={handleSearch} className='bg-slate-800 border border-l-0 border-slate-700 px-5 py-2 rounded-r-full hover:bg-slate-700 transition'>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                </button>
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute top-full left-0 w-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-[100] overflow-hidden">
                  {suggestions.map((s) => (
                    <li 
                      key={s._id}
                      onClick={() => {
                        setSearchTerm(s.title);
                        handleSearch(null, s.title);
                      }}
                      className="px-4 py-2.5 hover:bg-white/10 text-white cursor-pointer flex items-center gap-3 transition text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197" />
                      </svg>
                      <span className="truncate">{s.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <ul className='flex ml-auto items-center gap-4'>
              {navItems.map((item, index) => 
                item.active ? (
                  <li key={index} className='hidden sm:block'>
                    {item.customComponent || (
                      <button onClick={() => navigate(item.slug)} className='px-4 py-2 hover:bg-slate-800 rounded-full text-white text-sm font-medium transition'>
                        {item.name}
                      </button>
                    )}
                  </li>
                ) : null
              )}

              {authStatus && (
                <li className='relative' ref={dropdownRef}>
                  <img 
                    src={userData?.avatar} 
                    alt="profile" 
                    className='w-9 h-9 rounded-full object-cover border-2 border-slate-700 cursor-pointer hover:border-orange-600 transition'
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                  />

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                         <p className="text-white font-bold truncate text-sm">{userData?.fullName}</p>
                         <p className="text-slate-400 text-xs truncate">@{userData?.username}</p>
                      </div>

                      <button 
                        onClick={() => { navigate(`/user/${userData._id}`); setIsProfileOpen(false); }}
                        className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-white/10 transition flex items-center gap-3"
                      >
                         <span>👤</span> Your Profile
                      </button>

                      <button 
                        onClick={() => { navigate('/login'); setIsProfileOpen(false); }}
                        className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-white/10 transition flex items-center gap-3"
                      >
                         <span>🔄</span> Switch Account
                      </button>

                      <div className="border-t border-white/5 mt-1 pt-1">
                        <div onClick={() => setIsProfileOpen(false)}>
                           <LogoutBtn className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-white/10 transition flex items-center gap-3" />
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              )}
            </ul>
          </nav>
        </Container>
      </header>

      {/* --- SIDEBAR SECTION --- */}
   {/* --- SIDEBAR SECTION --- */}
     {/* --- SIDEBAR SECTION --- */}
{isSidebarOpen && (
  <div className="fixed inset-0 bg-black/70 z-[60] backdrop-blur-[1px]" onClick={toggleSidebar}></div>
)}

<aside className={`fixed top-0 left-0 h-full w-64 bg-slate-900 z-[70] transform transition-transform duration-300 ease-in-out border-r border-slate-800 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
  <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-800">
    <button onClick={toggleSidebar} className="text-white hover:bg-slate-800 p-1 rounded-full">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
    </button>
    <span className="text-orange-600 font-bold text-xl">VisionTube</span>
  </div>

  <div className="flex flex-col p-2 text-white overflow-y-auto h-[calc(100%-65px)]">
    <Link to="/" onClick={toggleSidebar} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-800 rounded-lg transition text-sm font-medium">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
      Home
    </Link>
    
    {authStatus && (
      <>
        <Link to="/subscriptions" onClick={toggleSidebar} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-800 rounded-lg transition text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
          Subscriptions
        </Link>

        <div className="px-4 pt-4 pb-2 text-[10px] uppercase font-bold text-slate-500 tracking-widest">Library</div>
        <Link to="/history" onClick={toggleSidebar} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-800 rounded-lg transition text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
          History
        </Link>
        <Link to="/liked-videos" onClick={toggleSidebar} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-800 rounded-lg transition text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
          Liked Videos
        </Link>
        {/* FIXED: Path is /playlists */}
        <Link to="/playlists" onClick={toggleSidebar} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-800 rounded-lg transition text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5-3.75h16.5m-16.5 7.5h16.5" /></svg>
          Playlists
        </Link>

        <div className="px-4 pt-4 pb-2 text-[10px] uppercase font-bold text-slate-500 tracking-widest">Local</div>
        <Link to="/downloads" onClick={toggleSidebar} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-800 rounded-lg transition text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
          Downloads
        </Link>

        <div className="px-4 pt-4 pb-2 text-[10px] uppercase font-bold text-slate-500 tracking-widest">Creator Studio</div>
        <Link to="/admin/dashboard" onClick={toggleSidebar} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-800 rounded-lg transition text-sm font-medium text-orange-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0V3m7.5 0v13.5M6 7.5h3m-3 3h3m6-3h3m-3 3h3" /></svg>
          Dashboard
        </Link>
        {/* FIXED: Path is /my-videos */}
        <Link to="/my-videos" onClick={toggleSidebar} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-800 rounded-lg transition text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125Z" /></svg>
          My Content
        </Link>
      </>
    )}
  </div>
</aside>
    
    
    
    
    
    
    
    </>
  )
}

export default Header
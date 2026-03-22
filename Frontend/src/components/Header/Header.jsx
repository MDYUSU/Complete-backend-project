import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Container, LogoutBtn } from '../index'

function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("") // 🚀 Added state for search
  const authStatus = useSelector((state) => state.auth.status)
  const userData = useSelector((state) => state.auth.userData)
  const navigate = useNavigate()

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  // 🚀 Logic to trigger search
  const handleSearch = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      if (searchTerm.trim()) {
        navigate(`/?query=${searchTerm.trim()}`)
      } else {
        navigate("/")
      }
    }
  }

  const navItems = [
    { name: "Login", slug: "/login", active: !authStatus },
    { name: "Signup", slug: "/signup", active: !authStatus },
    { name: "Subscriptions", slug: "/subscriptions", active: authStatus },
    { name: "My Videos", slug: "/my-videos", active: authStatus },
    { name: "Add Video", slug: "/add-video", active: authStatus },
  ]

  return (
    <>
      <header className='py-3 shadow bg-slate-900 border-b border-slate-800 sticky top-0 z-50'>
        <Container>
          <nav className='flex items-center gap-4'>
            
            {/* 🍔 HAMBURGER ICON */}
            <button 
              onClick={toggleSidebar}
              className='p-2 hover:bg-slate-800 rounded-full text-white transition-all active:scale-90'
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            {/* 🏠 LOGO */}
            <div className='flex-shrink-0'>
              <Link to='/'>
                <span className="text-orange-600 font-bold text-2xl tracking-tight">VisionTube</span>
              </Link>
            </div>

            {/* 🔍 FUNCTIONAL SEARCH BAR */}
            <div className='hidden md:flex flex-1 max-w-xl mx-auto items-center'>
              <input 
                type="text" 
                placeholder="Search" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch}
                className='w-full bg-black border border-slate-700 text-white px-4 py-1.5 rounded-l-full focus:outline-none focus:border-blue-500 transition-colors'
              />
              <button 
                onClick={handleSearch}
                className='bg-slate-800 border border-l-0 border-slate-700 px-5 py-1.5 rounded-r-full hover:bg-slate-700 transition active:bg-slate-600'
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </button>
            </div>

            {/* 📋 NAV ITEMS */}
            <ul className='flex ml-auto items-center gap-2'>
              {navItems.map((item) => 
                item.active ? (
                  <li key={item.name} className='hidden lg:block'>
                    <button
                      onClick={() => navigate(item.slug)}
                      className='inline-block px-4 py-2 duration-200 hover:bg-slate-800 rounded-full text-white font-medium text-sm'
                    >
                      {item.name}
                    </button>
                  </li>
                ) : null
              )}

              {authStatus && (
                <li className='flex items-center gap-4 ml-4'>
                  <LogoutBtn />
                  {userData?.avatar && (
                    <img 
                      src={userData.avatar} 
                      alt="profile" 
                      className='w-9 h-9 rounded-full object-cover border border-slate-700 hidden sm:block'
                    />
                  )}
                </li>
              )}
            </ul>
          </nav>
        </Container>
      </header>

      {/* --- SIDEBAR SECTION --- */}
      
      {/* Background Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-[60] backdrop-blur-[1px] transition-opacity"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar Drawer */}
      <aside 
        className={`fixed top-0 left-0 h-full w-64 bg-slate-900 z-[70] transform transition-transform duration-300 ease-in-out border-r border-slate-800 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-800">
          <button onClick={toggleSidebar} className="text-white hover:bg-slate-800 p-1 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <span className="text-orange-600 font-bold text-xl">VisionTube</span>
        </div>

        <div className="flex flex-col p-2 text-white">
          <Link 
            to="/" 
            onClick={toggleSidebar}
            className="flex items-center gap-4 px-4 py-3 hover:bg-slate-800 rounded-lg transition text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
            Home
          </Link>

          <Link 
            to="/history" 
            onClick={toggleSidebar}
            className="flex items-center gap-4 px-4 py-3 hover:bg-slate-800 rounded-lg transition text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
            History
          </Link>

          <div className="flex items-center gap-4 px-4 py-3 text-slate-500 cursor-not-allowed italic text-sm">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
             Liked Videos
          </div>

          <div className="flex items-center gap-4 px-4 py-3 text-slate-500 cursor-not-allowed italic text-sm">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" /></svg>
             Playlists
          </div>
        </div>
      </aside>
    </>
  )
}

export default Header
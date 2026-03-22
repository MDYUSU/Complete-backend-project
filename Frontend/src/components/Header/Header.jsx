import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Container, LogoutBtn } from '../index'

function Header() {
  const authStatus = useSelector((state) => state.auth.status)
  const userData = useSelector((state) => state.auth.userData)
  const navigate = useNavigate()

  // Removed "Home" from here because the Logo handles it!
  const navItems = [
    {
      name: "Login",
      slug: "/login",
      active: !authStatus,
    },
    {
      name: "Signup",
      slug: "/signup",
      active: !authStatus,
    },
    {
      name: "Subscriptions",
      slug: "/subscriptions",
      active: authStatus,
    },
    {
      name: "My Videos",
      slug: "/my-videos",
      active: authStatus,
    },
    {
      name: "Add Video",
      slug: "/add-video",
      active: authStatus,
    },
  ]

  return (
    <header className='py-3 shadow bg-slate-900 border-b border-slate-800 sticky top-0 z-50'>
      <Container>
        <nav className='flex items-center'>
          {/* 🏠 The Logo IS your Home button now */}
          <div className='mr-4'>
            <Link to='/'>
               <span className="text-orange-600 font-bold text-2xl tracking-tight">VisionTube</span>
            </Link>
          </div>

          <ul className='flex ml-auto items-center gap-2'>
            {navItems.map((item) => 
              item.active ? (
                <li key={item.name}>
                  <button
                    onClick={() => navigate(item.slug)}
                    className='inline-block px-4 py-2 duration-200 hover:bg-slate-800 rounded-full text-white font-medium text-sm md:text-base'
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
                    className='w-10 h-10 rounded-full object-cover border border-slate-700 hidden sm:block'
                  />
                )}
              </li>
            )}
          </ul>
        </nav>
      </Container>
    </header>
  )
}

export default Header
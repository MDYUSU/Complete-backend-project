import React from 'react'
import { Container, LogoutBtn } from '../index' // Adjust paths based on your folder structure
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

function Header() {
  // 1. Get the login status from Redux
  const authStatus = useSelector((state) => state.auth.status)
  const navigate = useNavigate()

  // 2. Define the navigation items
  const navItems = [
    {
      name: 'Home',
      slug: "/",
      active: true
    }, 
    {
      name: "Login",
      slug: "/login",
      active: !authStatus, // Only show if NOT logged in
    },
    {
      name: "Signup",
      slug: "/signup",
      active: !authStatus, // Only show if NOT logged in
    },
    {
      name: "All Videos",
      slug: "/all-videos",
      active: authStatus, // Only show if logged in
    },
    {
      name: "Add Video",
      slug: "/add-video",
      active: authStatus, // Only show if logged in
    },
  ]

  return (
    <header className='py-3 shadow bg-slate-900 text-white'>
      <Container>
        <nav className='flex items-center'>
          <div className='mr-4'>
            <Link to='/'>
              <span className='font-bold text-xl text-orange-500'>ChaiTube</span>
            </Link>
          </div>

          <ul className='flex ml-auto space-x-4'>
            {/* 3. Loop through navItems and show only active ones */}
            {navItems.map((item) => 
              item.active ? (
                <li key={item.name}>
                  <button
                    onClick={() => navigate(item.slug)}
                    className='inline-block px-6 py-2 duration-200 hover:bg-slate-700 rounded-full'
                  >
                    {item.name}
                  </button>
                </li>
              ) : null
            )}

            {/* 4. Show Logout button only if logged in */}
            {authStatus && (
              <li>
                <LogoutBtn />
              </li>
            )}
          </ul>
        </nav>
      </Container>
    </header>
  )
}

export default Header
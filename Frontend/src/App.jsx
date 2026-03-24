import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import axiosInstance from './utils/axios'
import { login, logout } from './store/authSlice'
import Header from './components/Header/Header'
import { Outlet } from 'react-router-dom'

function App() {
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()

  useEffect(() => {
    // This function checks the "Room Key" (Cookies) as soon as the site loads
    const checkUser = async () => {
      try {
        const response = await axiosInstance.get("/users/current-user")
        
        // If the backend says "Yes, I know this user"
        if (response.data?.data) {
          dispatch(login(response.data.data))
        } else {
          dispatch(logout())
        }
      } catch (error) {
        // If the cookie is expired or missing, we log out
        console.log("App :: Session Check Error", error)
        dispatch(logout())
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [dispatch])

  // If we are still checking the cookies, show the spinning loader
  if (loading) {
    return (
      <div className="h-screen w-full bg-slate-950 flex items-center justify-center">
         <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            <p className="text-slate-400 font-medium">Loading VisionTube...</p>
         </div>
      </div>
    )
  }

  // If loading is finished, show the actual website
  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white">
      <div className="w-full block">
        <Header />
        <main className="py-8 px-4">
          {/* This is where Home, Login, Signup, etc. will appear */}
          <Outlet /> 
        </main>
      </div>
    </div>
  )
}

export default App
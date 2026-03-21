import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import axiosInstance from './utils/axios'
import { login, logout } from './store/authSlice'
import Header from './components/Header/Header'
// import Footer from './components/Footer/Footer' // Uncomment this once you create Footer
import { Outlet } from 'react-router-dom'

function App() {
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()

  useEffect(() => {
    // 1. As soon as the app loads, check if the user is already logged in
    axiosInstance.get("/users/current-user")
      .then((response) => {
        if (response.data.data) {
          // 2. If backend returns user data, update Redux Store
          dispatch(login(response.data.data))
        } else {
          // 3. If no user data, ensure Redux state is logged out
          dispatch(logout())
        }
      })
      .catch((error) => {
        console.log("App :: useEffect :: getCurrentUser error", error)
        dispatch(logout())
      })
      .finally(() => setLoading(false))
  }, [dispatch])

  // Conditional Rendering: Show a loader until the auth check is finished
  return !loading ? (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white">
      <div className="w-full block">
        <Header />
        <main className="py-8 px-4">
          {/* Outlet is where your nested routes (Login, Home, etc.) will render */}
          <Outlet /> 
        </main>
        {/* <Footer /> */}
      </div>
    </div>
  ) : (
    <div className="h-screen w-full bg-slate-950 flex items-center justify-center">
       <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          <p className="text-slate-400 font-medium">Loading ChaiTube...</p>
       </div>
    </div>
  )
}

export default App
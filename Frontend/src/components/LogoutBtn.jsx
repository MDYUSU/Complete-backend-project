import React from 'react'
import {useDispatch} from 'react-redux'
import axiosInstance from '../utils/axios'
import {logout} from '../store/authSlice'
import { useNavigate } from 'react-router-dom'

function LogoutBtn() {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const logoutHandler = () => {
        // 1. Call the backend to clear cookies and DB
        axiosInstance.post('/users/logout')
            .then(() => {
                // 2. Clear Redux state
                dispatch(logout())
                // 3. Redirect to login
                navigate("/")
            })
            .catch((err) => {
                console.log("Logout error:", err);
            })
    }

  return (
    <button
    className='inline-block px-6 py-2 duration-200 hover:bg-blue-100 rounded-full'
    onClick={logoutHandler}
    >Logout</button>
  )
}

export default LogoutBtn
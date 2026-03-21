import React from 'react'
import {useDispatch} from 'react-redux'
import axiosInstance from '../../utils/axios'
import {logout} from '../../store/authSlice'

function LogoutBtn() {
    const dispatch = useDispatch()
    const logoutHandler = () => {
        axiosInstance.post("/users/logout")
            .then(() => {
                dispatch(logout())
            })
    }
  return (
    <button
    className='inline-bock px-6 py-2 duration-200 hover:bg-slate-700 rounded-full text-white'
    onClick={logoutHandler}
    >Logout</button>
  )
}

export default LogoutBtn
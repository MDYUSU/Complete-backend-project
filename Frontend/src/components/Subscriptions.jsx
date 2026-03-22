import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../utils/axios'
import Container from './Container'

function Subscriptions() {
    const [channels, setChannels] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const userData = useSelector((state) => state.auth.userData)

    useEffect(() => {
        if (userData?._id) {
            setLoading(true)
            // Using your route: /subscriptions/u/:subscriberId
            axiosInstance.get(`/subscriptions/u/${userData._id}`)
                .then((res) => {
                    // Your controller projects this as { channel: { ...details } }
                    setChannels(res.data.data || [])
                })
                .catch((err) => console.error("Error fetching subscriptions:", err))
                .finally(() => setLoading(false))
        }
    }, [userData?._id])

    if (loading) return <div className="text-center py-20 text-white">Loading your subscriptions...</div>

    return (
        <Container>
            <div className="py-8">
                <h1 className="text-3xl font-bold text-white mb-8">Subscribed Channels</h1>

                {channels.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {channels.map((item) => (
                            <div 
                                key={item._id}
                                onClick={() => navigate(`/user/${item.channel._id}`)} // Redirect to user profile
                                className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col items-center gap-4 hover:border-orange-500 transition-all cursor-pointer group"
                            >
                                <img 
                                    src={item.channel.avatar} 
                                    alt={item.channel.username} 
                                    className="w-24 h-24 rounded-full object-cover border-2 border-slate-700 group-hover:border-orange-500"
                                />
                                <div className="text-center">
                                    <h3 className="text-white font-bold text-lg">{item.channel.fullName}</h3>
                                    <p className="text-slate-400 text-sm">@{item.channel.username}</p>
                                </div>
                                <button className="mt-2 w-full bg-slate-800 text-white py-2 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors">
                                    View Channel
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-slate-500 text-xl italic">You haven't subscribed to any channels yet.</p>
                        <button 
                            onClick={() => navigate('/')}
                            className="mt-4 text-orange-500 hover:underline"
                        >
                            Explore some videos to find creators!
                        </button>
                    </div>
                )}
            </div>
        </Container>
    )
}

export default Subscriptions
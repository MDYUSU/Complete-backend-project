import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axios';

function Healthcheck() {
    const [status, setStatus] = useState(null);

    useEffect(() => {
        axiosInstance.get('/healthcheck')
            .then(res => setStatus(res.data))
            .catch(err => setStatus({ status: "Offline", message: "Server unreachable" }));
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
            <div className={`p-10 rounded-full border-4 ${status?.status === "OK" ? "border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.5)]" : "border-red-500"}`}>
                <h1 className="text-4xl font-black">{status?.status || "Checking..."}</h1>
            </div>
            <p className="mt-4 text-slate-400">{status?.message || "Pinging the server..."}</p>
        </div>
    );
}

export default Healthcheck;
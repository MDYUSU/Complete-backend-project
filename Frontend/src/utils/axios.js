import axios from "axios";

const axiosInstance = axios.create({
    // 🚀 Update this to your live Render URL
    baseURL: "https://visiontube-backend-y4ug.onrender.com/api/v1", 
    withCredentials: true
});

export default axiosInstance;
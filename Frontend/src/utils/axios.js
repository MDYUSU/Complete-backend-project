import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:8001/api/v1", // Check your backend port!
    withCredentials: true
});

export default axiosInstance;
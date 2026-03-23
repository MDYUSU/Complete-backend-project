import axios from "axios";

const axiosInstance = axios.create({
    // 🚀 Your live Render URL
    baseURL: "https://visiontube-backend-y4ug.onrender.com/api/v1", 
    withCredentials: true
});

// 🛡️ GLOBAL HTTPS INTERCEPTOR
// This automatically converts all insecure Cloudinary links to secure ones
axiosInstance.interceptors.response.use(
    (response) => {
        // We convert the data to a string to do a global find-and-replace
        let stringifiedData = JSON.stringify(response.data);

        if (stringifiedData.includes("http://res.cloudinary.com")) {
            // Replace all occurrences of http with https for Cloudinary
            stringifiedData = stringifiedData.replace(
                /http:\/\/res\.cloudinary\.com/g, 
                "https://res.cloudinary.com"
            );
            // Parse it back into a JavaScript object
            response.data = JSON.parse(stringifiedData);
        }
        
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Provider } from "react-redux";
import store from "./store/store.js";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

// 1. All Component Imports
import Home from './components/Home.jsx'
import MyVideos from './components/MyVideos.jsx'
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";
import VideoUpload from "./components/VideoUpload.jsx";
import VideoDetail from './components/VideoDetail.jsx';
import EditVideo from './components/EditVideo.jsx'
import Subscriptions from './components/Subscriptions.jsx'
import UserProfile from './components/UserProfile.jsx'
import WatchHistory from './components/WatchHistory.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        // Now shows the Discovery Feed component instead of just text
        element: <Home />, 
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
      {
        path: "/add-video",
        element: <VideoUpload />,
      },
      {
        // Renamed from /all-videos to /my-videos to match your new Header
        path: "/my-videos",
        element: <MyVideos />,
      },
      {
        // Dynamic route for watching a specific video
        path: "/video/:videoId",
        element: <VideoDetail />,
      },
      { path: "/edit-video/:videoId", element: <EditVideo /> },
      { path: "/subscriptions", element: <Subscriptions /> },
      { path: "/user/:userId", element: <UserProfile /> },
      {
            path: "/history",
            element: <WatchHistory />,
        },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>,
);
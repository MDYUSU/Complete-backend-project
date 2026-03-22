import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Provider } from "react-redux";
import store from "./store/store.js";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

// 1. Component Imports
import Home from "./components/Home.jsx";
import MyVideos from "./components/MyVideos.jsx";
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";
import VideoUpload from "./components/VideoUpload.jsx";
import VideoDetail from "./components/VideoDetail.jsx";
import EditVideo from "./components/EditVideo.jsx";
import Subscriptions from "./components/Subscriptions.jsx";
import UserProfile from "./components/UserProfile.jsx";
import WatchHistory from "./components/WatchHistory.jsx";
import LikedVideos from "./components/LikedVideos.jsx";
import Playlists from "./components/Playlists.jsx";
import PlaylistDetail from "./components/PlaylistDetail.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import Healthcheck from "./components/Healthcheck.jsx";
import Downloads from "./components/Downloads.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
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
        path: "/my-videos",
        element: <MyVideos />,
      },
      {
        path: "/video/:videoId",
        element: <VideoDetail />,
      },
      {
        path: "/edit-video/:videoId",
        element: <EditVideo />,
      },
      {
        path: "/subscriptions",
        element: <Subscriptions />,
      },
      {
        path: "/user/:userId",
        element: <UserProfile />,
      },
      {
        path: "/history",
        element: <WatchHistory />,
      },
      {
        path: "/liked-videos",
        element: <LikedVideos />,
      },
      {
        path: "/playlists",
        element: <Playlists />,
      },
      {
        // 🚀 FIXED: Removed the placeholder duplicate.
        // Now it correctly points to the PlaylistDetail component.
        path: "/playlist/:playlistId",
        element: <PlaylistDetail />,
      },
      {
        path: "/admin/dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "/support/healthcheck",
        element: <Healthcheck />,
      },
      {
        path: "/downloads",
        element: <Downloads />,
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

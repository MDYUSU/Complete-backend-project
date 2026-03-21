import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Provider } from 'react-redux'
import store from './store/store.js'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

// Import your components/pages here
// import Login from './components/Login.jsx'
import Signup from './components/Signup.jsx' 

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
        {
            path: "/",
            element: (
                <div className="text-center py-20">
                    <h1 className="text-3xl font-bold">Welcome to ChaiTube Home Feed</h1>
                    <p className="text-slate-400 mt-4">Videos will appear here soon!</p>
                </div>
            ),
        },
  // {
  //     path: "/login",
  //    element: <Login />,
  // },
   {
    path: "/signup",
     element: <Signup />,
   },
   ],
   },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router}/>
    </Provider>
  </React.StrictMode>,
)
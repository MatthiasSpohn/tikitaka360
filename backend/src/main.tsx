import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import App from "@/App.tsx";
import { LoginForm } from "@/components/pages/LoginForm.tsx";
import ErrorBoundary from "@/components/ErrorBoundary.tsx";
import { Dashboard } from "@/components/pages/Dashboard.tsx";
import { SignUp } from "@/components/pages/SignUp.tsx";
import ProtectedRoutes from "@/components/ProtectedRoutes.tsx";
import { Buffer } from "buffer"; window.Buffer = Buffer;

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <LoginForm />,
      },
      {
        path: '/signup',
        element: <SignUp />,
      },
      {
        element: <ProtectedRoutes />,
        children: [
          {
            path: "/dashboard",
            element: <Dashboard />,
          },
        ],
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </React.StrictMode>,
)

import './styles/global.css'
import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import ErrorPage from "@/error-page.tsx";
import Root from './routes/root'
import App from './App.tsx'
import About from "@/components/pages/about.tsx";
import Account from "@/components/pages/account.tsx";

const router = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: '/',
                element: <App />,
            },
            {
                path: '/about',
                element: <About />,
            },
            {
                path: '/account',
                element: <Account />,
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

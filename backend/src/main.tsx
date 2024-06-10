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
import { LeaguesComponent } from "@/components/pages/leagues-component.tsx";
import { TeamsComponent } from "@/components/pages/teams-component.tsx";
import { PlayerComponent } from "@/components/pages/player-component.tsx";
import { StatisticsComponent } from "@/components/pages/statistics-component.tsx";
import { axiosHeaders, baseURL } from "@/utils/common-axios.ts";
import axios from "axios";
window.Buffer = Buffer;

const headers = axiosHeaders;
const baseUrl: string = baseURL;

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
            children: [
              {
                path: "/dashboard/leagues",
                element: <LeaguesComponent />
              },
              {
                element: <TeamsComponent />,
                path: "/dashboard/teams/:season/:league",
                loader: async ({ params }) => {
                  return await axios.get(`${baseUrl}/team?leagueId=${params.league}&season=${params.season}`, { headers })
                },
              },
              {
                element: <PlayerComponent />,
                path: "/dashboard/players/:season/:team",
                loader: async ({ params }) => {
                  return {
                    data: await axios.get(`${baseUrl}/player?season=${params.season}&teamId=${params.team}&offset=0`, { headers }),
                    season: params.season,
                    teamId: params.team,
                  };
                },
              },
              {
                path: "/dashboard/statistics",
                element: <StatisticsComponent  reload={0}/>
              },
            ]
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

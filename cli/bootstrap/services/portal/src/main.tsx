import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/style.css'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import LoginPage from './pages/LoginPage/LoginPage.tsx'
import PortalLayout from './layouts/PortalLayout/PortalLayout.tsx'
import DashboardPage from './pages/DashboardPage/DashboardPage.tsx'
import UsersPage from './pages/UsersPage/UsersPage.tsx'

const router = createBrowserRouter([
    {
        path: "portal",
        element: <App />,
        children: [
            {
                path: "login",
                element: <LoginPage />,
            },
            {
                path: "",
                element: <PortalLayout />,
                //loader: portalLoader,
                children: [
                    { index: true, element: <DashboardPage /> },
                    { path: "dashboard", element: <DashboardPage /> },
                    { path: "users", element: <UsersPage /> }
                ],
            }
        ]
    }
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
)

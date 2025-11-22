import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/style.css'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import LoginPage from './pages/LoginPage/LoginPage.tsx'
import PortalLayout from './layouts/PortalLayout/PortalLayout.tsx'
import DashboardPage from './pages/DashboardPage/DashboardPage.tsx'
import UsersPage from './pages/UsersPage/UsersPage.tsx'
import UserSinglePage from './pages/UserSinglePage/UserSinglePage.tsx'

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
                children: [
                    { index: true, element: <DashboardPage /> },
                    { path: "dashboard", element: <DashboardPage /> },
                    { path: "users", element: <UsersPage /> },
                    { path: "users/:userId", element: <UserSinglePage /> }
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

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import LoginPage from './pages/LoginPage/LoginPage.tsx'
//import PortalLayout, { portalLoader } from './layouts/PortalLayout.tsx'
//import DashboardPage from './pages/DashboardPage.tsx'

const router = createBrowserRouter([
    {
        path: "portal",
        element: <App />,
        children: [
            {
                path: "login",
                element: <LoginPage />,
            },
            // {
            //     path: "",
            //     element: <PortalLayout />,
            //     loader: portalLoader,
            //     children: [
            //         { index: true, element: <DashboardPage /> },
            //         { path: "dashboard", element: <DashboardPage /> }
            //     ],
            // }
        ]
    }
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
)

import { useSelector } from 'react-redux'
import { Navigate, useLocation, Outlet } from 'react-router-dom'

export default function AuthGuard() {
    const auth = useSelector(state => state.auth)
    const isAuthenticated = !!auth?.accessToken && !!auth?.authUser;
    const location = useLocation()

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/portal/login"
                replace
                state={{ from: location }}
            />
        );
    }

    return (
        <Outlet />
    );
}

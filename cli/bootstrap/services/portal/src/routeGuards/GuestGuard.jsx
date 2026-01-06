import { useSelector } from 'react-redux';
import { Navigate, useLocation, Outlet } from 'react-router-dom';

export default function GuestGuard() {
    const auth = useSelector((state) => state.auth);
    const isAuthenticated = !!auth.authUser && !!auth.accessToken;
    const location = useLocation();

    if (isAuthenticated) {
        return (
            <Navigate
                to={'/portal/'}
                replace
                state={{ from: location }}
            />
        );
    }

    return (
        <Outlet />
    );
}

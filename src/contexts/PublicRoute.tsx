import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

type RouteProps = {
    children: React.ReactNode;
}

export default function PublicRoute({ children }: RouteProps) {
    const { user, authReady } = useAuth();

    if (!authReady) {
        return <div>Loading...</div>;
    }

    if (user) {
        return (
            <Navigate to="/" replace />
        );
    }

    return children;
}
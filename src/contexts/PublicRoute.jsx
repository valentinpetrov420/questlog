import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function PublicRoute({ children }) {
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
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({children}){
    const { user, authReady } = useAuth();

    if(!authReady){
        return <div>Loading...</div>;
    }

    if (user){
        return children;
    } else {
        return (
            <Navigate to="/login" replace />
        )
    }

}
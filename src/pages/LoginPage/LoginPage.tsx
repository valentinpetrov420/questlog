import './LoginPage.css';
import GoogleSignInButton from "../../components/GoogleSignInButton/GoogleSignInButton";

import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
    const { continueAsGuest, authReady, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        console.log("user: ", user);
    }, [user]);

    async function handleContinueAsGuest() {
        await continueAsGuest();
        console.log("authReady: " + authReady);
        navigate("/");
    }

    //todo: implement Continue as Guest app behavior, gating firestore services if theres no user (use localStorage instead)
    return <div className="login-card-container">
        <h1 className="login-branding">Questlog</h1>
        <p className="login-description">Organize anything as pages or tasks - nested, shareable, yours.</p>
        <GoogleSignInButton />
        <div className='login-guest'>
            <p>or</p>
            <span className='continue-as-guest' onClick={handleContinueAsGuest}>Continue as Guest</span>
        </div>
    </div>
}
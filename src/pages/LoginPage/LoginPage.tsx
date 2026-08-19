import './LoginPage.css';
import GoogleSignInButton from "../../components/GoogleSignInButton/GoogleSignInButton";

export default function LoginPage() {

    function continueAsGuest() {
        //interact with authcontext
    }

    //todo: implement Continue as Guest app behavior, gating firestore services if theres no user (use localStorage instead)
    return <div className="login-card-container">
        <h1 className="login-branding">Questlog</h1>
        <p className="login-description">Organize anything as pages or tasks - nested, shareable, yours.</p>
        <GoogleSignInButton />
        {import.meta.env.DEV && (
            <div className='login-guest'>
                <p>or</p>
                <span className='continue-as-guest' onClick={continueAsGuest}>Continue as Guest</span>
            </div>
        )}
    </div>
}
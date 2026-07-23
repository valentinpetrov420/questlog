import { useNavigate } from "react-router-dom";

type LoginPageProps = {
    loginWithGoogle: () => void,
}

export default function LoginPage(props: LoginPageProps){
    const navigate = useNavigate();

    async function handleLogin(){
        await props.loginWithGoogle();
        navigate("/");
    }

    return <button onClick={handleLogin}>Login with Google</button>
}
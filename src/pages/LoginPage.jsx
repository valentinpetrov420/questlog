import { useNavigate } from "react-router-dom";

export default function LoginPage(props){
    const navigate = useNavigate();

    async function handleLogin(){
        await props.loginWithGoogle();
        navigate("/");
    }

    return <button onClick={handleLogin}>Login with Google</button>
}
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault()

        setError("")

        try {
            const response = await fetch("http://localhost:3002/pg/user/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message);
                return;
            }

            localStorage.setItem("token", data.token);

            //Backend returns role info and we check and give access accordingly
            if(data.role === "Admin"){
                navigate("/admindashboard")
            }
            else navigate("/userdashboard")

        }
        catch (error) {
            setError("Unable to connect to backend");
        }
    }



    return (<>
        <div className="login-page">
            <div className="login-box">
                <h1>Login</h1>

                <form onSubmit={handleLogin}>
                    <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="submit">Login</button>
                </form>
                {error && <p className="error">{error}</p>}
                <p>
                    Dont have an account? <Link to="/register">Create Account</Link>
                </p>
            </div>
        </div>
    </>)
}

export default Login; 
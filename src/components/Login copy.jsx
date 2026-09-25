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
        <div className="auth-page">
            <div className="auth-box">
                <div className="auth-box-header">
                    <span className="auth-tag">Account access</span>
                    <h1>Welcome back</h1>
                </div>

                <form onSubmit={handleLogin} className="auth-form">
                    <div className="field">
                        <label htmlFor="login-email">Email address</label>
                        <input id="login-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>

                    <div className="field">
                        <label htmlFor="login-password">Password</label>
                        <input id="login-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>

                    <button type="submit">Log in</button>
                </form>

                {error && <p className="error">{error}</p>}

                <p className="auth-switch">
                    Don't have an account? <Link to="/register">Create one</Link>
                </p>
            </div>
        </div>
    </>)
}

export default Login;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [avatar, setAvatar] = useState(null);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        try {
            //We use formdata for multipart form submission to account for file handling
            const formData = new FormData(); 
            formData.append("name", name);
            formData.append("email", email);
            formData.append("password", password);

            if (avatar) {
                formData.append("avatar", avatar);
            }

            const response = await fetch("http://localhost:3002/pg/user/registration", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message);
                return;
            }

            navigate("/login");

        } catch (error) {
            setError("Unable to connect to backend");
        }
    };

    return (
        <>
            <div className="auth-page">
                <div className="auth-box">

                    <div className="auth-box-header">
                        <span className="auth-tag">New account</span>
                        <h1>Create your account</h1>
                    </div>

                    <form onSubmit={handleRegister} className="auth-form">

                        <div className="field">
                            <label htmlFor="register-name">Name</label>
                            <input
                                id="register-name"
                                type="text"
                                placeholder="Your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="register-email">Email address</label>
                            <input
                                id="register-email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="register-password">Password</label>
                            <input
                                id="register-password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="register-confirm">Confirm password</label>
                            <input
                                id="register-confirm"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="avatar-upload">
                            <label htmlFor="avatar">Profile picture</label>
                            <div className="avatar-upload-row">
                                {preview && (
                                    <img src={preview} alt="avatar preview" width="48" height="48" />
                                )}
                                <input
                                    type="file"
                                    id="avatar"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                />
                            </div>
                        </div>

                        <button type="submit">
                            Create account
                        </button>

                    </form>

                    {error && <p className="error">{error}</p>}

                    <p className="auth-switch">
                        Already have an account?{" "}
                        <Link to="/login">Log in</Link>
                    </p>

                </div>
            </div>
        </>
    );
};

export default Register;

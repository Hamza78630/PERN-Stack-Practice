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
            <div className="login-page">
                <div className="login-box">

                    <h1>Create Account</h1>

                    <form onSubmit={handleRegister}>

                        <input
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />

                        <div className="avatar-upload">
                            <label htmlFor="avatar">Profile Picture</label>
                            <input
                                type="file"
                                id="avatar"
                                accept="image/*"
                                onChange={handleAvatarChange}
                            />
                            {preview && (
                                <img src={preview} alt="avatar preview" width="80" />
                            )}
                        </div>

                        <button type="submit">
                            Create Account
                        </button>

                    </form>

                    {error && <p className="error">{error}</p>}

                    <p>
                        Already have an account?{" "}
                        <Link to="/login">Login</Link>
                    </p>

                </div>
            </div>
        </>
    );
};

export default Register;
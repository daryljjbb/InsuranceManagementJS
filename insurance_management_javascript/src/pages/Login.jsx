import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState(""); // We won't really validate this for now
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username === "admin") { // Simple check
            login(username);
            navigate("/");
        } else {
            alert("Use 'admin' as username");
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-4">
                    <form className="card p-4 shadow" onSubmit={handleSubmit}>
                        <h3>Login</h3>
                        <input
                            className="form-control mb-2"
                            placeholder="Username (admin)"
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <input
                            className="form-control mb-3"
                            type="password"
                            placeholder="Password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button className="btn btn-primary w-100">Sign In</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;

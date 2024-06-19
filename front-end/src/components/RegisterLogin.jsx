import React, { useState } from 'react';
import { register, login } from '../services/ApiServices';

function RegisterLogin({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegister, setIsRegister] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isRegister) {
                const response = await register(email, password);
                if (response.message === "Email already registered") {
                    setIsRegister(false);
                    setErrorMessage("Email already registered. Please log in.");
                } else {
                    onLogin();
                }
            } else {
                const response = await login(email, password);
                if (response.message === "Invalid credentials") {
                    setErrorMessage("Invalid credentials. Please try again.");
                } else {
                    onLogin();
                }
            }
        } catch (error) {
            setErrorMessage('Failed to ' + (isRegister ? 'register' : 'login') + ': ' + error.message);
        }
    };

    return (
        <div className="container mt-5">
            <h2>{isRegister ? 'Register' : 'Login'}</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <input
                        type="password"
                        className="form-control"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                <button type="submit" className="btn btn-primary">{isRegister ? 'Register' : 'Login'}</button>
                <button
                    type="button"
                    className="btn btn-link"
                    onClick={() => {
                        setIsRegister(!isRegister);
                        setErrorMessage('');
                    }}
                >
                    {isRegister ? 'Switch to Login' : 'Switch to Register'}
                </button>
            </form>
        </div>
    );
}

export default RegisterLogin;

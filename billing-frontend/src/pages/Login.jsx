import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/login', {
                email: email,
                password: password
            });

            if (response.data.access_token) {
                localStorage.setItem('auth_token', response.data.access_token);
                // navigate to dashboard
                navigate('/dashboard');
            }
        } catch (error) {
            console.error("Login Error:", error.response?.data);
            alert(error.response?.data?.message || 'Invalid credentials, please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="card login-card">
                <div className="login-header">
                    <div className="logo-icon">📄</div>
                    <h2 className="title">Welcome Back</h2>
                    <p className="subtitle">Billing System - Graduation Project</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@company.com"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <div className="label-row">
                            <label>Password</label>
                            {/* <a href="#" className="forgot-password">Forgot password?</a> */}
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary login-btn">
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>

                    <p className="footer-link">
                        Don't have an account? <span className="link-text">Contact Administrator</span>
                    </p>
                </form>
            </div>

            <style>{`
                .login-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                    padding: 1rem;
                }
                .login-card {
                    width: 100%;
                    max-width: 420px;
                    padding: 2.5rem;
                }
                .login-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }
                .logo-icon {
                    font-size: 2.5rem;
                    margin-bottom: 1rem;
                    background: white;
                    width: 64px;
                    height: 64px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 1rem;
                    margin-inline: auto;
                    box-shadow: var(--shadow);
                }
                .title {
                    font-size: 1.5rem;
                    margin-bottom: 0.5rem;
                    letter-spacing: -0.025em;
                }
                .subtitle {
                    color: var(--text-muted);
                    font-size: 0.875rem;
                }
                .login-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }
                .input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .label-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                label {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #475569;
                }
                .login-btn {
                    width: 100%;
                    margin-top: 0.5rem;
                    height: 2.75rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .footer-link {
                    text-align: center;
                    font-size: 0.875rem;
                    color: var(--text-muted);
                    margin-top: 1.5rem;
                }
                .link-text {
                    color: var(--primary);
                    font-weight: 500;
                    cursor: pointer;
                }
                .forgot-password {
                    font-size: 0.75rem;
                    color: var(--primary);
                    text-decoration: none;
                }
            `}</style>
        </div>
    );
};

export default Login;
import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; // Adjust if backend port differs

const SignupPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        // role: '',
        goal: '',
        fitnessLevel: ''
    });

    const [response, setResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const autofill = () => {
        const randomStr = Math.random().toString(36).substring(7);
        setFormData({
            email: `test-${randomStr}@example.com`,
            password: 'Password123!',
            name: 'Debug User',
            goal: 'fat_loss',
            fitnessLevel: 'beginner'
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setResponse(null);

        try {
            const res = await axios.post(`${API_BASE_URL}/auth/signup`, formData, {
                headers: { 'Content-Type': 'application/json' }
            });
            setResponse({
                status: res.status,
                statusText: res.statusText,
                headers: res.headers,
                data: res.data
            });
        } catch (err) {
            setResponse({
                status: err.response?.status || 'NETWORK_ERROR',
                statusText: err.response?.statusText || 'Error',
                headers: err.response?.headers || {},
                data: err.response?.data || { message: err.message }
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="diagnostic-container">
            <header style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <a href="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>← Back to Dashboard</a>
                <h1>Endpoint: POST /auth/signup</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Diagnostic tool for user registration verification.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Request Side */}
                <section>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3>Request Payload</h3>
                        <button onClick={autofill} type="button">Auto-fill Valid Data</button>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem' }}>Email (required)</label>
                            <input
                                type="text"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem' }}>Password (Joi says 6, Service says 8)</label>
                            <input
                                type="text"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem' }}>Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                style={{ width: '100%' }}
                            />
                        </div>

                        {/* <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem' }}>Role (Test Mass Assignment)</label>
                            <input
                                type="text"
                                name="role"
                                placeholder="e.g. admin"
                                value={formData.role || ''}
                                onChange={handleInputChange}
                                style={{ width: '100%' }}
                            />
                        </div> */}

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem' }}>Goal</label>
                            <select
                                name="goal"
                                value={formData.goal}
                                onChange={handleInputChange}
                                style={{ width: '100%', background: 'var(--bg-secondary)', color: 'var(--text-primary)', padding: '0.5rem', border: '1px solid var(--border)' }}
                            >
                                <option value="">Select Goal</option>
                                <option value="fat_loss">Fat Loss</option>
                                <option value="muscle_gain">Muscle Gain</option>
                                <option value="endurance">Endurance</option>
                                <option value="invalid_option">Invalid Option (Test)</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem' }}>Fitness Level</label>
                            <select
                                name="fitnessLevel"
                                value={formData.fitnessLevel}
                                onChange={handleInputChange}
                                style={{ width: '100%', background: 'var(--bg-secondary)', color: 'var(--text-primary)', padding: '0.5rem', border: '1px solid var(--border)' }}
                            >
                                <option value="">Select Level</option>
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    flex: 2,
                                    background: isLoading ? 'var(--border)' : 'var(--accent)',
                                    color: '#000',
                                    fontWeight: 'bold'
                                }}
                            >
                                {isLoading ? 'EXECUTING REQUEST...' : 'SEND POST REQUEST'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setResponse(null)}
                                style={{ flex: 1 }}
                            >
                                CLEAR
                            </button>
                        </div>
                    </form>
                </section>

                {/* Response Side */}
                <section>
                    <h3>Backend Response</h3>
                    {!response && !isLoading && (
                        <div style={{ padding: '2rem', border: '1px dashed var(--border)', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            No request sent yet. Form data will be sent to the backend and response shown here.
                        </div>
                    )}

                    {isLoading && (
                        <div style={{ padding: '2rem', textAlign: 'center', border: '1px solid var(--accent)' }}>
                            <span style={{ color: 'var(--accent)' }}>●</span> Waiting for backend response...
                        </div>
                    )}

                    {response && (
                        <div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '0.5rem',
                                background: response.status >= 400 ? 'rgba(255, 75, 75, 0.2)' : 'rgba(0, 255, 65, 0.2)',
                                borderLeft: `4px solid ${response.status >= 400 ? 'var(--error)' : 'var(--accent)'}`,
                                marginBottom: '1rem'
                            }}>
                                <span><strong>STATUS:</strong> {response.status} {response.statusText}</span>
                            </div>

                            <div className="raw-response">
                                <div style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>// Headers</div>
                                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(response.headers, null, 2)}</pre>

                                <div style={{ margin: '1rem 0 0.5rem', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>// Body</div>
                                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(response.data, null, 2)}</pre>
                            </div>
                        </div>
                    )}
                </section >
            </div >
        </div >
    );
};

export default SignupPage;

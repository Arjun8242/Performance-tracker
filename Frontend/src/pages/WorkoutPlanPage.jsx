import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const WorkoutPlanPage = () => {
    // Initial valid template based on backend validation
    const defaultPlan = {
        name: "Hypertrophy Phase 1",
        week: 1,
        workouts: [
            {
                day: "Monday",
                name: "Upper Body A",
                exercises: [
                    { name: "Bench Press", sets: 3, reps: 10, weight: 60 },
                    { name: "Pull Ups", sets: 3, reps: 8 }
                ]
            }
        ]
    };

    const [jsonPayload, setJsonPayload] = useState(JSON.stringify(defaultPlan, null, 2));
    const [targetPlanId, setTargetPlanId] = useState('');
    const [response, setResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('debug_token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const handleAction = async (method, path, body = null) => {
        setIsLoading(true);
        setResponse(null);
        try {
            const config = {
                method,
                url: `${API_BASE_URL}${path}`,
                headers: {
                    ...getAuthHeaders()
                }
            };

            if (body) {
                config.data = body;
                config.headers['Content-Type'] = 'application/json';
            }

            const res = await axios(config);
            setResponse({
                method,
                url: path,
                status: res.status,
                statusText: res.statusText,
                headers: res.headers,
                data: res.data
            });
        } catch (err) {
            setResponse({
                method,
                url: path,
                status: err.response?.status || 'NETWORK_ERROR',
                statusText: err.response?.statusText || 'Error',
                headers: err.response?.headers || {},
                data: err.response?.data || { message: err.message }
            });
        } finally {
            setIsLoading(false);
        }
    };

    const captureIdFromResponse = () => {
        // Attempt to find an ID in common backend response structures
        const id = response?.data?.id || response?.data?._id || response?.data?.plan?.id || response?.data?.plan?._id;
        if (id) {
            setTargetPlanId(id);
        } else {
            alert('No ID found in the current response body.');
        }
    };

    return (
        <div className="diagnostic-container">
            <header style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <a href="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>← Back to Dashboard</a>
                <h1>Workout Plan Verification</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Probe for POST/GET/PUT/DELETE /workouts/plan</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Control Side */}
                <section>
                    <div style={{ marginBottom: '2rem' }}>
                        <h3>1. Global Configuration</h3>
                        <div style={{ background: 'var(--bg-secondary)', padding: '1rem', border: '1px solid var(--border)' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Target Plan ID (for GET/PUT/DELETE)</label>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <input
                                    type="text"
                                    placeholder="Paste ID here or 'Capture'"
                                    value={targetPlanId}
                                    onChange={(e) => setTargetPlanId(e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                <button onClick={captureIdFromResponse} style={{ fontSize: '0.7rem' }}>CAPTURE FROM RESP</button>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3>2. Request Payload (JSON)</h3>
                            <button onClick={() => setJsonPayload(JSON.stringify(defaultPlan, null, 2))} style={{ fontSize: '0.7rem' }}>RESET TEMPLATE</button>
                        </div>
                        <textarea
                            value={jsonPayload}
                            onChange={(e) => setJsonPayload(e.target.value)}
                            style={{
                                width: '100%',
                                height: '200px',
                                background: '#000',
                                color: 'var(--accent)',
                                fontFamily: 'monospace',
                                padding: '1rem',
                                border: '1px solid var(--border)',
                                marginTop: '0.5rem'
                            }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <button
                            onClick={() => handleAction('POST', '/workouts/plan', JSON.parse(jsonPayload))}
                            style={{ background: 'var(--accent)', color: '#000', fontWeight: 'bold' }}
                        >
                            CREATE (POST /plan)
                        </button>
                        <button
                            onClick={() => handleAction('GET', '/workouts/plan')}
                        >
                            FETCH ACTIVE (GET /plan)
                        </button>
                        <button
                            onClick={() => {
                                if (!targetPlanId) return alert('Target ID required');
                                handleAction('PUT', `/workouts/plan/${targetPlanId}`, JSON.parse(jsonPayload));
                            }}
                        >
                            UPDATE (PUT /plan/:id)
                        </button>
                        <button
                            onClick={() => {
                                if (!targetPlanId) return alert('Target ID required');
                                handleAction('DELETE', `/workouts/plan/${targetPlanId}`);
                            }}
                            style={{ borderColor: 'var(--error)', color: 'var(--error)' }}
                        >
                            DELETE (DELETE /plan/:id)
                        </button>
                    </div>
                </section>

                {/* Status Side */}
                <section>
                    <h3>Live Response Truth</h3>
                    {!response && !isLoading && (
                        <div style={{ padding: '2rem', border: '1px dashed var(--border)', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            Perform an action to see the direct backend response. Ensure you are logged in.
                        </div>
                    )}

                    {isLoading && (
                        <div style={{ padding: '2rem', textAlign: 'center', border: '1px solid var(--accent)' }}>
                            <span style={{ color: 'var(--accent)' }}>●</span> Sending encrypted request...
                        </div>
                    )}

                    {response && (
                        <div>
                            <div style={{
                                padding: '0.5rem',
                                background: response.status >= 400 ? 'rgba(255, 75, 75, 0.2)' : 'rgba(0, 255, 65, 0.2)',
                                borderLeft: `4px solid ${response.status >= 400 ? 'var(--error)' : 'var(--accent)'}`,
                                marginBottom: '1rem'
                            }}>
                                <div><strong>{response.method}</strong> {response.url}</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{response.status} {response.statusText}</div>
                            </div>

                            <div className="raw-response">
                                <div style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>// Response Headers</div>
                                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(response.headers, null, 2)}</pre>

                                <div style={{ margin: '1rem 0 0.5rem', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>// Response Body</div>
                                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(response.data, null, 2)}</pre>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default WorkoutPlanPage;

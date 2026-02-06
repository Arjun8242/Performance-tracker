import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const WorkoutLoggingPage = () => {
    // Default valid template for a completed workout
    const defaultLog = {
        workoutId: "", // Should be captured from a workout plan
        date: new Date().toISOString().split('T')[0],
        status: "completed",
        performedExercises: [
            { name: "Bench Press", sets: 3, reps: 10, weight: 65 }
        ],
        notes: "Feeling strong today."
    };

    const [jsonPayload, setJsonPayload] = useState(JSON.stringify(defaultLog, null, 2));
    const [queryParams, setQueryParams] = useState({
        from: '',
        to: '',
        page: 1,
        limit: 10
    });

    const [response, setResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('debug_token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const handleLogWorkout = async () => {
        setIsLoading(true);
        setResponse(null);
        try {
            const res = await axios.post(`${API_BASE_URL}/workouts/log`, JSON.parse(jsonPayload), {
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                }
            });
            setResponse({
                method: 'POST',
                url: '/workouts/log',
                status: res.status,
                statusText: res.statusText,
                headers: res.headers,
                data: res.data
            });
        } catch (err) {
            setResponse({
                method: 'POST',
                url: '/workouts/log',
                status: err.response?.status || 'NETWORK_ERROR',
                statusText: err.response?.statusText || 'Error',
                headers: err.response?.headers || {},
                data: err.response?.data || { message: err.message }
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFetchLogs = async () => {
        setIsLoading(true);
        setResponse(null);

        // Clean empty params
        const params = Object.fromEntries(
            Object.entries(queryParams).filter(([_, v]) => v !== '')
        );

        try {
            const res = await axios.get(`${API_BASE_URL}/workouts/logs`, {
                headers: getAuthHeaders(),
                params
            });
            setResponse({
                method: 'GET',
                url: '/workouts/logs',
                status: res.status,
                statusText: res.statusText,
                headers: res.headers,
                data: res.data
            });
        } catch (err) {
            setResponse({
                method: 'GET',
                url: '/workouts/logs',
                status: err.response?.status || 'NETWORK_ERROR',
                statusText: err.response?.statusText || 'Error',
                headers: err.response?.headers || {},
                data: err.response?.data || { message: err.message }
            });
        } finally {
            setIsLoading(false);
        }
    };

    const autoFillWorkoutId = () => {
        // Try to find a workout ID from previous workout plan responses if available in session? 
        // For simplicity, we just prompt or allow manual entry in JSON.
        // Actually, let's keep it manual in the JSON to expose the validation requirement.
    };

    return (
        <div className="diagnostic-container">
            <header style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <a href="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>← Back to Dashboard</a>
                <h1>Workout Logging Verification</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Diagnostic probe for POST /log and GET /logs</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Control Side */}
                <section>
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3>1. Log Entry Payload (JSON)</h3>
                            <button onClick={() => setJsonPayload(JSON.stringify(defaultLog, null, 2))} style={{ fontSize: '0.7rem' }}>RESET TEMPLATE</button>
                        </div>
                        <textarea
                            value={jsonPayload}
                            onChange={(e) => setJsonPayload(e.target.value)}
                            style={{
                                width: '100%',
                                height: '220px',
                                background: '#000',
                                color: 'var(--accent)',
                                fontFamily: 'monospace',
                                padding: '1rem',
                                border: '1px solid var(--border)',
                                marginTop: '0.5rem'
                            }}
                        />
                        <button
                            onClick={handleLogWorkout}
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                marginTop: '1rem',
                                background: 'var(--accent)',
                                color: '#000',
                                fontWeight: 'bold'
                            }}
                        >
                            SUBMIT LOG (POST /log)
                        </button>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                        <h3>2. History Filters (Query Params)</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>From (ISO)</label>
                                <input
                                    type="text"
                                    placeholder="2024-01-01"
                                    value={queryParams.from}
                                    onChange={(e) => setQueryParams({ ...queryParams, from: e.target.value })}
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>To (ISO)</label>
                                <input
                                    type="text"
                                    placeholder="2024-12-31"
                                    value={queryParams.to}
                                    onChange={(e) => setQueryParams({ ...queryParams, to: e.target.value })}
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Page</label>
                                <input
                                    type="number"
                                    value={queryParams.page}
                                    onChange={(e) => setQueryParams({ ...queryParams, page: e.target.value })}
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Limit (max 100)</label>
                                <input
                                    type="number"
                                    value={queryParams.limit}
                                    onChange={(e) => setQueryParams({ ...queryParams, limit: e.target.value })}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleFetchLogs}
                            disabled={isLoading}
                            style={{ width: '100%', marginTop: '1rem' }}
                        >
                            FETCH HISTORY (GET /logs)
                        </button>
                    </div>
                </section>

                {/* Status Side */}
                <section>
                    <h3>Live Response Truth</h3>
                    {!response && !isLoading && (
                        <div style={{ padding: '2rem', border: '1px dashed var(--border)', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            Awaiting action. Log entries or history query results will appear here verbatim.
                        </div>
                    )}

                    {isLoading && (
                        <div style={{ padding: '2rem', textAlign: 'center', border: '1px solid var(--accent)' }}>
                            <span style={{ color: 'var(--accent)' }}>●</span> Querying backend state...
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

export default WorkoutLoggingPage;

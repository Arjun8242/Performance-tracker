import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const ProgressPage = () => {
    const [summaryWeek, setSummaryWeek] = useState('1');
    const [response, setResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [responseTime, setResponseTime] = useState(null);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('debug_token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const handleAction = async (path, params = {}) => {
        setIsLoading(true);
        setResponse(null);
        setResponseTime(null);
        const startTime = Date.now();

        try {
            const res = await axios.get(`${API_BASE_URL}${path}`, {
                headers: getAuthHeaders(),
                params: params
            });
            setResponseTime(Date.now() - startTime);
            setResponse({
                url: path,
                params: params,
                status: res.status,
                statusText: res.statusText,
                headers: res.headers,
                data: res.data
            });
        } catch (err) {
            setResponseTime(Date.now() - startTime);
            setResponse({
                url: path,
                params: params,
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
                <h1>Progress & Analytics Verification</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Diagnostic probes for /streak and /summary aggregation logic.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Controls */}
                <section>
                    <div style={{ marginBottom: '2rem' }}>
                        <h3>1. Streak Probe</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Calculates consecutive days with completed workouts.</p>
                        <button
                            onClick={() => handleAction('/progress/streak')}
                            disabled={isLoading}
                            style={{ width: '100%', background: 'var(--accent)', color: '#000', fontWeight: 'bold' }}
                        >
                            FETCH STREAK (GET /streak)
                        </button>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                        <h3>2. Weekly Summary Probe</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Aggregates completion percentage for a given workout week.</p>

                        <div style={{ margin: '1rem 0' }}>
                            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Week Number (optional)</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="number"
                                    value={summaryWeek}
                                    onChange={(e) => setSummaryWeek(e.target.value)}
                                    style={{ flex: 1 }}
                                    placeholder="Enter week (e.g. 1)"
                                />
                                <button onClick={() => setSummaryWeek('')} style={{ fontSize: '0.7rem' }}>OMIT WEEK</button>
                            </div>
                        </div>

                        <button
                            onClick={() => handleAction('/progress/summary', summaryWeek ? { week: summaryWeek } : {})}
                            disabled={isLoading}
                            style={{ width: '100%' }}
                        >
                            FETCH SUMMARY (GET /summary)
                        </button>
                    </div>

                    <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                        <h4>Diagnostic Tips:</h4>
                        <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem' }}>
                            <li>Test <strong>Week 0</strong> or <strong>negative value</strong> to check Joi validation.</li>
                            <li>Log a workout and immediately fetch streak to check cache/persistence lag.</li>
                            <li>Test summary with a week that has no plan to check error handling.</li>
                        </ul>
                    </div>
                </section>

                {/* Results */}
                <section>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3>Live Aggregation Truth</h3>
                        {responseTime && <span style={{ color: 'var(--accent)', fontSize: '0.7rem' }}>Latency: {responseTime}ms</span>}
                    </div>

                    {!response && !isLoading && (
                        <div style={{ padding: '2rem', border: '1px dashed var(--border)', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            Select a probe to inspect the backend response logic.
                        </div>
                    )}

                    {isLoading && (
                        <div style={{ padding: '2rem', textAlign: 'center', border: '1px solid var(--accent)' }}>
                            <span style={{ color: 'var(--accent)' }}>●</span> Aggregating database records...
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
                                <div><strong>GET</strong> {response.url}</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{response.status} {response.statusText}</div>
                            </div>

                            <div className="raw-response">
                                {response.params && Object.keys(response.params).length > 0 && (
                                    <>
                                        <div style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>// Query Params</div>
                                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(response.params, null, 2)}</pre>
                                        <div style={{ margin: '1rem 0' }}></div>
                                    </>
                                )}

                                <div style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>// Response Body</div>
                                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(response.data, null, 2)}</pre>

                                <div style={{ margin: '1rem 0 0.5rem', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>// Audit Headers</div>
                                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(response.headers, null, 2)}</pre>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default ProgressPage;

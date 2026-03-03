import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Error Boundary Component
 * Catches unhandled render errors and displays a recovery UI instead of a white screen.
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-neutral-50 dark:bg-black flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-white dark:bg-neutral-900 rounded-[3rem] p-10 border border-neutral-200 dark:border-neutral-800 shadow-2xl text-center space-y-8">
                        <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto">
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                        </div>

                        <div className="space-y-3">
                            <h1 className="text-3xl font-black text-black dark:text-white uppercase tracking-tight">System Crash</h1>
                            <p className="text-neutral-500 font-medium italic">
                                "Mental resilience is the first step to physical dominance."
                            </p>
                            <p className="text-neutral-400 text-sm">
                                An unexpected error occurred in the training module.
                            </p>
                        </div>

                        <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-700">
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">Error Signature</p>
                            <p className="text-xs font-mono text-red-500 break-all">{this.state.error?.message || 'Unknown Error'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex items-center justify-center gap-2 py-4 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-neutral-200 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" /> Reload
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="flex items-center justify-center gap-2 py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-orange-500 transition-colors shadow-lg shadow-black/10"
                            >
                                Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

import React from 'react';

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
	errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<
	{ children: React.ReactNode },
	ErrorBoundaryState
> {
	constructor(props: { children: React.ReactNode }) {
		super(props);
		this.state = { hasError: false, error: null, errorInfo: null };
	}

	static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		this.setState({ errorInfo });
		console.error('ErrorBoundary caught:', error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div
					style={{
						padding: '20px',
						margin: '20px',
						border: '1px solid #f5c6cb',
						borderRadius: '4px',
						backgroundColor: '#f8d7da',
						color: '#721c24',
						fontFamily: 'monospace',
						whiteSpace: 'pre-wrap',
						overflow: 'auto',
					}}
				>
					<h2 style={{ margin: '0 0 10px 0' }}>Something went wrong</h2>
					<p>
						<strong>{this.state.error?.toString()}</strong>
					</p>
					{this.state.errorInfo?.componentStack && (
						<details open>
							<summary>Component Stack</summary>
							<pre>{this.state.errorInfo.componentStack}</pre>
						</details>
					)}
					<button
						onClick={() => window.location.reload()}
						style={{
							marginTop: '10px',
							padding: '8px 16px',
							cursor: 'pointer',
						}}
					>
						Reload Page
					</button>
				</div>
			);
		}

		return this.props.children;
	}
}

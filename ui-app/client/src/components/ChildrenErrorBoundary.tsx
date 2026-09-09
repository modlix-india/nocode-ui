import React from 'react';

interface ChildrenErrorBoundaryState {
	error: Error | null;
}

/**
 * Bounds a render failure to one container's child list.
 *
 * Without this the only boundary in the app is the root one in App/ErrorBoundary,
 * so a single component throwing while it renders - most often a binding
 * expression that will not evaluate - replaced the ENTIRE page with the
 * "Something went wrong" card. One bad binding should cost the container it is
 * in, not the page.
 *
 * Deliberately per-container rather than per-component: Children.tsx dropped a
 * per-component wrapper because it cost an element, a fiber and a render pass on
 * every component, and a boundary has to be a class, so one per container keeps
 * that saving while still containing the damage.
 *
 * While authoring, the failure is shown in place so the broken container is
 * findable. At runtime it renders nothing and logs, because a blank region beats
 * a dead page.
 */
export class ChildrenErrorBoundary extends React.Component<
	{ children: React.ReactNode; pageName?: string },
	ChildrenErrorBoundaryState
> {
	constructor(props: { children: React.ReactNode; pageName?: string }) {
		super(props);
		this.state = { error: null };
	}

	static getDerivedStateFromError(error: Error): ChildrenErrorBoundaryState {
		return { error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error(
			`Component render failed in page "${this.props.pageName ?? 'unknown'}":`,
			error,
			errorInfo?.componentStack,
		);
	}

	render() {
		if (!this.state.error) return this.props.children;

		if (globalThis.designMode !== 'PAGE') return null;

		return (
			<div
				style={{
					padding: '8px 10px',
					border: '1px dashed #f5c6cb',
					borderRadius: '4px',
					backgroundColor: '#f8d7da',
					color: '#721c24',
					font: '11px/1.4 monospace',
					whiteSpace: 'pre-wrap',
					overflow: 'auto',
					maxHeight: '160px',
				}}
			>
				{this.state.error.message || String(this.state.error)}
			</div>
		);
	}
}

export default ChildrenErrorBoundary;

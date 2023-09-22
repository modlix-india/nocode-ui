import React from 'react';

export function IconHelper({
	className = '',
	children,
	viewBox,
}: {
	className?: string;
	iconClass?: string;
	children?: React.ReactNode;
	viewBox?: string;
}) {
	if (!children) {
		return null;
	}

	if (typeof children === 'string') {
		return <i className={`${className} ${children}`} />;
	}

	return (
		<svg className={`_iconHelperSVG ${className}`} viewBox={viewBox}>
			{children}
		</svg>
	);
}

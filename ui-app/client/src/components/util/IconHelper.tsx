import React from 'react';

export function IconHelper({
	className = '',
	children,
	viewBox,
}: Readonly<{
	className?: string;
	iconClass?: string;
	children?: React.ReactNode;
	viewBox?: string;
}>) {
	if (!children) {
		return undefined;
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

import React from 'react';

export function IconHelper({
	className = '',
	children,
	viewBox,
	id,
}: Readonly<{
	className?: string;
	iconClass?: string;
	children?: React.ReactNode;
	viewBox?: string;
	id?: string;
}>) {
	if (!children) {
		return undefined;
	}

	if (typeof children === 'string') {
		return <i id={id} className={`${className} ${children}`} />;
	}

	return (
		<svg id={id} className={`_iconHelperSVG ${className}`} viewBox={viewBox}>
			{children}
		</svg>
	);
}

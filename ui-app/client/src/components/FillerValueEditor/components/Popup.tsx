import React from 'react';

export function Popup({
	children,
	onClose,
}: Readonly<{
	children?: React.JSX.Element | React.JSX.Element[] | undefined;
	onClose: () => void;
}>) {
	return (
		<div className="_popupContainer" onClick={onClose} onKeyDown={() => {}}>
			<div className="_popup">{children}</div>
		</div>
	);
}

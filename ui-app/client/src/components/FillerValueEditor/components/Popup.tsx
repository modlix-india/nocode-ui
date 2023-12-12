import React from 'react';
import { SectionDefinition } from './fillerCommons';

export function Popup({
	children,
	onClose,
}: Readonly<{
	children?: React.JSX.Element | React.JSX.Element[] | undefined;
	onClose: () => void;
}>) {
	return (
		<div className="_popupContainer" onClick={onClose} onKeyDown={() => {}}>
			<div
				className="_popup"
				onClick={e => {
					e.stopPropagation();
					e.preventDefault();
				}}
			>
				{children}
			</div>
		</div>
	);
}

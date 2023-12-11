import React, { CSSProperties } from 'react';

export function ImageEditor({
	value,
	onDelete,
	onPopup,
}: Readonly<{
	value: string | undefined;
	onDelete: (v: string | undefined) => void;
	onPopup: () => void;
}>) {
	const style: CSSProperties = {};

	let controls: React.JSX.Element | undefined = undefined;

	if (value) {
		style.backgroundImage = 'url(' + value + ')';
		controls = (
			<div className="_imageControls">
				<button onClick={() => onPopup()}>Replace</button>
				<button onClick={() => onDelete(undefined)}>Remove</button>
			</div>
		);
	} else {
		controls = (
			<div className="_imageControls _show">
				<button onClick={() => onPopup()}>Add</button>
			</div>
		);
	}

	return (
		<div className="_imageEditor" style={style}>
			{controls}
		</div>
	);
}

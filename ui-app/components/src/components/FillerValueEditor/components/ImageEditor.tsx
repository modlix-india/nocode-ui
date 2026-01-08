import React, { CSSProperties } from 'react';

export function ImageEditor({
	value,
	onDelete,
	onPopup,
	draggable,
	onDragStart,
	onDragOver,
	onDrop,
}: Readonly<{
	value: string | undefined;
	onDelete: () => void;
	onPopup: () => void;
	draggable?: boolean;
	onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
	onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
	onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
}>) {
	const style: CSSProperties = {};

	let controls: React.JSX.Element | undefined = undefined;

	if (value) {
		style.backgroundImage = 'url(' + value + ')';
		controls = (
			<div className="_imageControls">
				<button onClick={() => onPopup()}>Replace</button>
				<button onClick={() => onDelete()}>Remove</button>
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
		<div
			className="_imageEditor"
			style={style}
			draggable={draggable}
			onDragStart={onDragStart}
			onDragOver={onDragOver}
			onDrop={onDrop}
		>
			{controls}
		</div>
	);
}

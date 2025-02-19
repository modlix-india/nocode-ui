import React, { useRef } from 'react';

interface FilterPanelButtonsProps {
	onFormatClick: (command: string, value?: string | { url: string; text: string }) => void;
	position: { x: number; y: number } | null;
	isVisible: boolean;
	onPositionChange: (position: { x: number; y: number }) => void;
	styleProperties: any;
}

export function FilterPanelButtons({
	onFormatClick,
	position,
	isVisible,
	onPositionChange,
	styleProperties,
}: Readonly<FilterPanelButtonsProps>) {
	const panelRef = useRef<any>(null);

	return (
		<div
			className="_filterPanel"
			ref={panelRef}
			style={{
				...styleProperties.filterPanel,
				transform: position ? `translate(${position.x}px, ${position.y}px)` : 'none',
				display: isVisible ? 'flex' : 'none',
				position: 'fixed',
				top: 0,
				left: 0,
			}}
			onMouseDown={ev => {
				if (ev.buttons !== 1 || !panelRef.current || !position) return;
				const currentLocation = { x: ev.clientX, y: ev.clientY };
				let newX = position.x;
				let newY = position.y;

				const mouseMove = (ev: MouseEvent) => {
					if (ev.buttons !== 1) return;
					newX = position.x + ev.clientX - currentLocation.x;
					newY = position.y + ev.clientY - currentLocation.y;
					panelRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
				};

				const mouseUp = () => {
					onPositionChange({ x: newX, y: newY });
					document.removeEventListener('mousemove', mouseMove);
					document.removeEventListener('mouseup', mouseUp);
				};

				document.addEventListener('mousemove', mouseMove);
				document.addEventListener('mouseup', mouseUp);
			}}
		>
			<div className="_buttonGroup">
				<button onClick={() => onFormatClick('bold')} className="_button" title="Bold">
					<strong>B</strong>
				</button>
				<button onClick={() => onFormatClick('italic')} className="_button" title="Italic">
					<em>I</em>
				</button>
			</div>

			<div className="_buttonSeperator" />

			<div className="_buttonGroup">
				<button
					onClick={() => onFormatClick('strikethrough')}
					className="_button"
					title="Strikethrough"
				>
					<s>S</s>
				</button>
				<button
					onClick={() => onFormatClick('code')}
					className="_button"
					title="Inline Code"
				>
					<code>{`<>`}</code>
				</button>
				<button onClick={() => onFormatClick('link')} className="_button" title="Add Link">
					🔗
				</button>
			</div>
		</div>
	);
}

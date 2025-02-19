import React, { useRef, useState, useEffect } from 'react';

interface FilterPanelButtonsProps {
	onFormatClick: (command: string, value?: string | { url: string; text: string }) => void;
	textAreaRef: any;
	styleProperties: any;
}

export function FilterPanelButtons({
	onFormatClick,
	styleProperties,
	textAreaRef,
}: Readonly<FilterPanelButtonsProps>) {
	const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
	const panelRef = useRef<any>(null);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		if (textAreaRef?.current && !position) {
			const rect = textAreaRef.current.getBoundingClientRect();
			const panelWidth = panelRef.current?.offsetWidth || 300;
			setPosition({ x: rect.left + rect.width / 2 - panelWidth / 2, y: rect.top + 10 });
		}
	}, [textAreaRef?.current]);

	useEffect(() => {
		const handleSelection = () => {
			if (!textAreaRef?.current) return;
			const { selectionStart, selectionEnd } = textAreaRef.current;

			if (selectionStart !== selectionEnd && !position) {
				const rect = textAreaRef.current.getBoundingClientRect();
				const panelWidth = panelRef.current?.offsetWidth || 300;
				setPosition({
					x: rect.left + rect.width / 2 - panelWidth / 2,
					y: rect.top + 10,
				});
			}
			setIsVisible(selectionStart !== selectionEnd);
		};

		textAreaRef?.current?.addEventListener('select', handleSelection);
		textAreaRef?.current?.addEventListener('mouseup', handleSelection);
		textAreaRef?.current?.addEventListener('keyup', handleSelection);

		return () => {
			textAreaRef?.current?.removeEventListener('select', handleSelection);
			textAreaRef?.current?.removeEventListener('mouseup', handleSelection);
			textAreaRef?.current?.removeEventListener('keyup', handleSelection);
		};
	}, [textAreaRef?.current]);

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
					setPosition({ x: newX, y: newY });
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

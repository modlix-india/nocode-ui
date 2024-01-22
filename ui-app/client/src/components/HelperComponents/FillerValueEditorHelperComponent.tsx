import React, { CSSProperties, MouseEvent, ReactNode, useEffect, useState } from 'react';
import { ComponentDefinition } from '../../types/common';

export function FillerValueEditorHelperComponent({
	definition: { key },
}: Readonly<{
	definition: ComponentDefinition;
	children?: ReactNode;
	showNameLabel?: boolean;
	onMouseOver?: (e: MouseEvent) => void;
	onMouseOut?: (e: MouseEvent) => void;
	onClick?: (e: MouseEvent) => void;
	onDoubleClick?: (e: MouseEvent) => void;
}>) {
	const { selectedSectionNumber, selectedComponent } = window.fillerValueEditor ?? {};
	const [lastChanged, setLastChanged] = useState(Date.now());

	useEffect(() => {
		function onMessageRecieved(e: MessageEvent) {
			const { data: { type } = {} } = e;

			if (!e.origin) return;

			if (!type?.startsWith('EDITOR_')) return;
			setLastChanged(Date.now());
		}
		window.addEventListener('message', onMessageRecieved);
		return () => window.removeEventListener('message', onMessageRecieved);
	}, [setLastChanged]);

	const [borderRef, setBorderRef] = useState<HTMLDivElement | null>();

	useEffect(() => {
		if (!borderRef) return;

		function onScroll() {
			setLastChanged(Date.now());
		}

		window.addEventListener('scroll', onScroll);
		return () => window.removeEventListener('scroll', onScroll);
	}, [borderRef]);

	if (!selectedComponent || selectedComponent.indexOf(key) == -1) return <></>;

	const rect = borderRef?.getBoundingClientRect();
	let left = -4;
	let top = -4;
	let width = 8;
	let height = 8;

	if (rect) {
		if (rect.left < 8) {
			left += 8;
			width -= 8;
		}
		if (rect.top < 8) {
			top += 8;
			height -= 8;
		}
		if (rect.right > window.innerWidth - 16) width -= 8;
	}

	const style = {
		all: 'initial',
		fontFamily: 'Arial',
		position: 'absolute',
		border: `2px dashed #427EE4`,
		height: `calc( 100% + ${height}px)`,
		width: `calc( 100% + ${width}px)`,
		top: top + 'px',
		left: left + 'px',
		// zIndex: '6',
		minWidth: '10px',
		boxSizing: 'border-box',
		WebkitUserDrag: 'element',
		borderRadius: '6px',
		pointerEvents: 'none',
	};

	const numberBlobStyle = {
		fontFamily: 'Arial',
		position: 'absolute',
		backgroundColor: '#427EE4',
		fontSize: '14px',
		fontWeight: '700',
		color: '#FFFFFF',
		height: '24px',
		width: '24px',
		borderRadius: '100%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		top: '-12px',
		left: '-12px',
		boxShadow: '0px 1px 4px 0px #00000025',
	};

	return (
		<div style={style as CSSProperties} className="_helper" ref={r => setBorderRef(r)}>
			<div style={numberBlobStyle as CSSProperties}>{(selectedSectionNumber ?? 0) + 1}</div>
		</div>
	);
}

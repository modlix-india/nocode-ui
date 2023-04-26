import React, { CSSProperties, MouseEvent, ReactNode, useEffect, useState } from 'react';
import { DRAG_CD_KEY } from '../constants';
import { getDataFromPath } from '../context/StoreContext';
import { messageToMaster } from '../slaveFunctions';
import { ComponentDefinition } from '../types/common';
import ComponentDefinitions from '.';
interface HelperComponentPropsType {
	definition: ComponentDefinition;
	children?: ReactNode;
	showNameLabel?: boolean;
	onMouseOver?: (e: MouseEvent) => void;
	onMouseOut?: (e: MouseEvent) => void;
	onClick?: (e: MouseEvent) => void;
	onDoubleClick?: (e: MouseEvent) => void;
}

function HelperComponentInternal({
	definition,
	children,
	showNameLabel = true,
	onMouseOver,
	onMouseOut,
	onClick,
	onDoubleClick,
}: HelperComponentPropsType) {
	const [dragOver, setDragOver] = useState(false);
	const [, setLastChanged] = useState(Date.now());
	const [hover, setHover] = useState(false);

	useEffect(() => {
		function onMessageRecieved(e: MessageEvent) {
			const { data: { type } = {} } = e;

			if (!type || !type.startsWith('EDITOR_')) return;
			setLastChanged(Date.now());
		}
		window.addEventListener('message', onMessageRecieved);
		return () => window.removeEventListener('message', onMessageRecieved);
	}, [setLastChanged]);

	const {
		editingPageDefinition: { name = '', componentDefinition = {} } = {},
		selectedComponent,
		personalization: { slave: { highlightColor = '#b2d33f', noSelection = false } = {} } = {},
	} = window.pageEditor ?? {};

	const currentPage = getDataFromPath(`Store.urlDetails.pageName`, []);

	if (noSelection || !componentDefinition?.[definition.key] || name !== currentPage) return <></>;

	let style = {
		all: 'initial',
		fontFamily: 'Arial',
		position: 'absolute',
		border: `2px solid ${highlightColor}`,
		height: 'calc( 100% - 2px)',
		width: 'calc( 100% - 2px)',
		top: '1px',
		left: '1px',
		zIndex: '6',
		minWidth: '10px',
		opacity: '0',
		boxSizing: 'border-box',
		backgroundColor: '#ffffff03',
		WebkitUserDrag: 'element',
	};

	let labelStyle: CSSProperties = {
		padding: '3px',
		fontSize: '10px',
		backgroundColor: `${highlightColor}`,
		color: 'white',
		position: 'absolute',
		fontWeight: 'normal',
		letterSpacing: '0.1em',
		textTransform: 'uppercase',
		whiteSpace: 'nowrap',
		cursor: 'pointer',
		display: showNameLabel ? 'inline-block' : 'none',
	};

	if (hover) {
		labelStyle.right = '0px';
	}

	if (selectedComponent?.endsWith(definition.key) || dragOver)
		style.opacity = children ? '1' : '0.6';

	if (children) {
		labelStyle.top = '0px';
		labelStyle.transform = 'translateY(-100%)';
	}

	return (
		<div
			style={style as CSSProperties}
			draggable="true"
			className="opacityShowOnHover"
			onDragStart={e =>
				e.dataTransfer.items.add(`${DRAG_CD_KEY}${definition.key}`, 'text/plain')
			}
			onDragOver={e => {
				e.preventDefault();
				setDragOver(true);
			}}
			onDragLeave={() => setDragOver(false)}
			onDrop={e => {
				e.dataTransfer.items[0].getAsString(dragData => {
					messageToMaster({
						type: 'SLAVE_DROPPED_SOMETHING',
						payload: { componentKey: definition.key, droppedData: dragData },
					});
				});
				setDragOver(false);
			}}
			onMouseUp={e => {
				e.stopPropagation();
				e.preventDefault();
				messageToMaster({ type: 'SLAVE_SELECTED', payload: definition.key });
			}}
			onClick={e => {
				if (e.target === e.currentTarget) {
					e.stopPropagation();
					e.preventDefault();
				}
				onClick?.(e);
			}}
			onDoubleClick={e => {
				e.stopPropagation();
				e.preventDefault();
				if (!onDoubleClick && definition.key === selectedComponent)
					messageToMaster({ type: 'SLAVE_SELECTED', payload: '' });
				else onDoubleClick?.(e);
			}}
			onContextMenu={e => {
				e.stopPropagation();
				e.preventDefault();
				messageToMaster({
					type: 'SLAVE_CONTEXT_MENU',
					payload: {
						componentKey: definition.key,
						menuPosition: { x: e.screenX, y: e.screenY },
					},
				});
			}}
			onMouseOver={e => onMouseOver?.(e)}
			onMouseOut={e => onMouseOut?.(e)}
			onMouseMove={e => {
				const x = e.clientX - e.currentTarget.getBoundingClientRect().left;
				const y = e.clientY - e.currentTarget.getBoundingClientRect().top;

				if (x < 50 && y < 20) {
					if (!hover) setHover(true);
				} else {
					if (hover) setHover(false);
				}
			}}
			onMouseLeave={() => setHover(false)}
			title={`${definition.name} - ${definition.key}`}
		>
			<div style={labelStyle}>
				<i className={ComponentDefinitions.get(definition.type)?.icon} />
				{ComponentDefinitions.get(definition.type)?.displayName}
			</div>
			{children}
		</div>
	);
}

export function HelperComponent(props: HelperComponentPropsType) {
	return window.designMode === 'PAGE' ? <HelperComponentInternal {...props} /> : <></>;
}

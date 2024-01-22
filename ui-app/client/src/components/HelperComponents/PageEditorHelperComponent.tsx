import React, { CSSProperties, MouseEvent, ReactNode, useEffect, useState } from 'react';
import { DRAG_CD_KEY } from '../../constants';
import { getDataFromPath } from '../../context/StoreContext';
import { messageToMaster } from '../../slaveFunctions';
import { ComponentDefinition } from '../../types/common';
import ComponentDefinitions from '..';

export function PageEditorHelperComponent({
	definition,
	children,
	showNameLabel = true,
	onMouseOver,
	onMouseOut,
	onClick,
	onDoubleClick,
}: Readonly<{
	definition: ComponentDefinition;
	children?: ReactNode;
	showNameLabel?: boolean;
	onMouseOver?: (e: MouseEvent) => void;
	onMouseOut?: (e: MouseEvent) => void;
	onClick?: (e: MouseEvent) => void;
	onDoubleClick?: (e: MouseEvent) => void;
}>) {
	const [dragOver, setDragOver] = useState(false);
	const [, setLastChanged] = useState(Date.now());
	const [hover, setHover] = useState(false);

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

	const {
		editingPageDefinition: { name = '', componentDefinition = {} } = {},
		selectedComponents,
		personalization: {
			preview = false,
			slave: { highlightColor = '#52BD94', noSelection = false } = {},
		} = {},
	} = window.pageEditor ?? {};

	const currentPage = getDataFromPath(`Store.urlDetails.pageName`, []);

	if (noSelection || preview || !componentDefinition?.[definition.key] || name !== currentPage)
		return <></>;

	let style = {
		all: 'initial',
		fontFamily: 'Arial',
		position: 'absolute',
		border: `2px solid ${highlightColor}`,
		height: 'calc( 100% + 0px)',
		width: 'calc( 100% + 0px)',
		top: '0px',
		left: '0px',
		// zIndex: '6',
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

	const middle = selectedComponents?.some(x => x.endsWith(definition.key));

	if (middle || dragOver) style.opacity = children ? '1' : '0.6';

	if (children || middle) {
		labelStyle.top = '0px';
		labelStyle.transform = 'translateY(-100%)';
	}

	let shownChildren = children;
	if (selectedComponents?.length != 1) shownChildren = undefined;

	return (
		<div
			id={`helper_component_key_${definition.key}`}
			style={style as CSSProperties}
			draggable="true"
			className="opacityShowOnHover _helper"
			onDragStart={e => {
				if (e.dataTransfer.items.length) return;
				e.dataTransfer.items.add(`${DRAG_CD_KEY}${definition.key}`, 'text/plain');
			}}
			onDragOver={e => {
				e.preventDefault();
				setDragOver(true);
			}}
			onDragEnd={() => setDragOver(false)}
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
				e.preventDefault();
				messageToMaster({
					type: e.metaKey || e.ctrlKey ? 'SLAVE_SELECTED_MULTI' : 'SLAVE_SELECTED',
					payload: definition.key,
				});
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
				if (!onDoubleClick && selectedComponents?.indexOf(definition.key) != -1)
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
						menuPosition: window.determineRightClickPosition(e.nativeEvent),
					},
				});
			}}
			onKeyDown={() => {}}
			onFocus={() => {}}
			onBlur={() => {}}
			onMouseOver={e => onMouseOver?.(e)}
			onMouseOut={e => onMouseOut?.(e)}
			onMouseMove={e => {
				const x = e.clientX - e.currentTarget.getBoundingClientRect().left;
				const y = e.clientY - e.currentTarget.getBoundingClientRect().top;

				if (x < 50 && y < 20) {
					if (!hover) setHover(true);
				} else if (hover) {
					setHover(false);
				}
			}}
			onMouseLeave={() => setHover(false)}
			title={`${definition.name} - ${definition.key}`}
		>
			<div
				style={labelStyle}
				onClick={e => {
					e.stopPropagation();
					e.preventDefault();
				}}
				onKeyDown={() => {}}
				onMouseUp={e => {
					e.stopPropagation();
					e.preventDefault();
					messageToMaster({
						type: e.metaKey || e.ctrlKey ? 'SLAVE_SELECTED_MULTI' : 'SLAVE_SELECTED',
						payload: definition.key,
					});
				}}
			>
				{typeof ComponentDefinitions.get(definition.type)?.subComponentDefinition?.[0]
					.icon === 'string' ? (
					<i
						className={`fa ${
							ComponentDefinitions.get(definition.type)?.subComponentDefinition?.[0]
								.icon
						}`}
					/>
				) : (
					ComponentDefinitions.get(definition.type)?.subComponentDefinition?.[0].icon
				)}
				{ComponentDefinitions.get(definition.type)?.displayName}
			</div>
			<div className="_helperChildren">{shownChildren}</div>
		</div>
	);
}

import React, { CSSProperties, MouseEvent, ReactNode, useEffect, useRef, useState } from 'react';
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

function PageEditorHelperComponent({
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
		selectedComponents,
		personalization: {
			preview = false,
			slave: { highlightColor = '#b2d33f', noSelection = false } = {},
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
				e.stopPropagation();
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
						menuPosition: {
							x: e.screenX - window.screenX,
							y:
								e.screenY -
								window.screenY -
								((window.top?.outerHeight ?? 0) - (window.top?.innerHeight ?? 0)),
						},
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
			<div
				style={labelStyle}
				onClick={e => {
					e.stopPropagation();
					e.preventDefault();
				}}
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

function FillerValueEditorHelperComponent({ definition: { key } }: HelperComponentPropsType) {
	const { selectedSectionNumber, selectedComponent } = window.fillerValueEditor ?? {};
	const [, setLastChanged] = useState(Date.now());

	useEffect(() => {
		function onMessageRecieved(e: MessageEvent) {
			const { data: { type } = {} } = e;

			if (!type || !type.startsWith('EDITOR_')) return;
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

export function HelperComponent(props: HelperComponentPropsType) {
	if (window.designMode === 'PAGE') return <PageEditorHelperComponent {...props} />;
	else if (window.designMode === 'FILLER_VALUE_EDITOR')
		return <FillerValueEditorHelperComponent {...props} />;
	return <></>;
}

import React, { Children, CSSProperties, useEffect, useState } from 'react';
import { getDataFromPath } from '../context/StoreContext';
import { messageToMaster } from '../slaveFunctions';
import { ComponentDefinition } from '../types/common';
import { camelCaseToUpperSpaceCase } from '../functions/utils';

interface SubHelperComponentPropsType {
	definition: ComponentDefinition;
	children?: React.ReactNode;
	subComponentName: string;
	style?: React.CSSProperties;
	className?: string;
}

function SubHelperComponentInternal({
	definition,
	subComponentName,
	children,
	style: upperStyle = {},
	className,
}: SubHelperComponentPropsType) {
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
		selectedSubComponent = '',
		personalization: { slave: { highlightColor = '#3fa4d3', noSelection = false } = {} } = {},
	} = window.pageEditor ?? {};

	const currentPage = getDataFromPath(`Store.urlDetails.pageName`, []);

	if (
		noSelection ||
		!componentDefinition?.[definition.key] ||
		name !== currentPage ||
		selectedComponent !== definition.key
	)
		return <>{children}</>;

	let style: CSSProperties = {
		...upperStyle,
		outline:
			hover || selectedSubComponent.endsWith(subComponentName)
				? `2px solid ${highlightColor}`
				: '',
		borderRadius: '3px',
		zIndex: '6',
		pointerEvents: 'all',
		height: '100%',
		width: '100%',
		left: '0px',
		top: '0px',
		position: 'absolute',
		cursor: 'pointer',
		border: 'none',
		background: 'none',
	};

	return (
		<div
			style={style}
			className={`${className ?? ''} disableChildrenEvents `}
			onMouseEnter={e => setHover(true)}
			onMouseLeave={e => setHover(false)}
			onClick={e => {
				e.stopPropagation();
				e.preventDefault();
				messageToMaster({
					type: 'SLAVE_SELECTED_SUB',
					payload: `${definition.key}:${subComponentName}`,
				});
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
			onDoubleClick={e => {
				e.stopPropagation();
				e.preventDefault();
				messageToMaster({
					type: 'SLAVE_SELECTED_SUB',
					payload: '',
				});
			}}
			title={camelCaseToUpperSpaceCase(subComponentName)}
		>
			{children}
		</div>
	);
}

export function SubHelperComponent(props: SubHelperComponentPropsType) {
	let { children } = props;

	return window.designMode === 'PAGE' ? <SubHelperComponentInternal {...props} /> : <></>;
}

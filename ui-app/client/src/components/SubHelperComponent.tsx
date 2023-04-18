import React, { Children, CSSProperties, useEffect, useState } from 'react';
import { getDataFromPath } from '../context/StoreContext';
import { messageToMaster } from '../slaveFunctions';
import { ComponentDefinition } from '../types/common';

interface SubHelperComponentPropsType {
	definition: ComponentDefinition;
	children?: React.ReactNode;
	subComponentName: string;
}

function SubHelperComponentInternal({
	definition,
	subComponentName,
	children,
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
	};

	return (
		<div
			style={style}
			className="disableChildrenEvents"
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
			onDoubleClick={e => {
				e.stopPropagation();
				e.preventDefault();
				messageToMaster({
					type: 'SLAVE_SELECTED_SUB',
					payload: '',
				});
			}}
			title={subComponentName.toUpperCase()}
		>
			{children}
		</div>
	);
}

export function SubHelperComponent(props: SubHelperComponentPropsType) {
	let { children } = props;

	return window.designMode === 'PAGE' ? <SubHelperComponentInternal {...props} /> : <></>;
}

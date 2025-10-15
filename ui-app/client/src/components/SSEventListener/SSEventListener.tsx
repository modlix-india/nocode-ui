import React, { useEffect, useRef } from 'react';
import { getDataFromPath, getPathFromLocation, PageStoreExtractor, setData } from '../../context/StoreContext';
import { ComponentProps } from '../../types/common';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import SSEventListenerStyle from './SSEventListenerStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './sseventListenerProperties';
import { styleProperties, styleDefaults } from './sseventListenerStyleProperties';
import { IconHelper } from '../util/IconHelper';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { messageToMaster } from '../../slaveFunctions';
import { duplicate } from '@fincity/kirun-js';

function SSEventListener(props: Readonly<ComponentProps>) {
	const { definition, pageDefinition, locationHistory, context, definition: { bindingPath }, } = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		properties: {
			url,
			eventName,
			onEvent,
			left = 0,
			top = 0,
		} = {},
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	let bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	useEffect(() => {
		if (!bindingPath || !url || !onEvent || !pageDefinition.eventFunctions?.[onEvent]) return;

		const eventFunction = pageDefinition.eventFunctions?.[onEvent];
		const es = new EventSource(url,{ withCredentials: true });  

		const func = (event: MessageEvent) => {
			const data = event

			let value = getDataFromPath(bindingPathPath, locationHistory, pageExtractor);

			value = value ? duplicate(value) : [];
			value.push(data);

			setData(bindingPathPath!, value, pageExtractor.getPageName());

			if (!eventFunction) return;
			runEvent(eventFunction, onEvent, context.pageName, locationHistory, pageDefinition);
		};

		if (Array.isArray(eventName)) {
			eventName.forEach(name => {
				es.addEventListener(name, func);
			});
		} else if (typeof eventName === 'string') {
			es.addEventListener(eventName, func);
		}
		
		es.onerror = (e) => console.error("SSE error (auto-retrying)", e);

		return () => es.close();
	}, [bindingPathPath, url, onEvent, eventName]);

	const ref = useRef<HTMLDivElement>(null);

	return globalThis.designMode ? (
		<div
			className="comp compSSEventListener"
			ref={ref}
			style={{ transform: `translate(${left}px, ${top}px)` }}
			onMouseDown={ev => {
				ev.preventDefault();
				ev.stopPropagation();

				if (!ref.current || ev.button !== 0) return;

				let startX = ev.clientX;
				let startY = ev.clientY;
				let newX = left;
				let newY = top;

				const mouseUpHandler = (e: MouseEvent) => {
					e.preventDefault();
					e.stopPropagation();
					document.body.removeEventListener('mousemove', mouseMoveHandler);
					document.body.removeEventListener('mouseup', mouseUpHandler);

					messageToMaster({
						type: 'SLAVE_COMP_PROP_CHANGED',
						payload: {
							key: props.definition.key,
							properties: [
								{
									name: 'left',
									value: newX,
								},
								{
									name: 'top',
									value: newY,
								},
							],
						},
					});
				};

				const mouseMoveHandler = (e: MouseEvent) => {
					e.preventDefault();
					e.stopPropagation();
					if (!ref.current) return;

					newX = left + e.clientX - startX;
					newY = top + e.clientY - startY;
					const style = `translate(${newX}px, ${newY}px)`;
					ref.current.style.transform = style;
				};

				document.body.addEventListener('mousemove', mouseMoveHandler);
				document.body.addEventListener('mouseup', mouseUpHandler);
			}}
		>
			{component.subComponentDefinition[0].icon}
			<HelperComponent context={context} definition={definition} />
		</div>
	) : (
		<></>
	);
}

const component = {
	name: 'SSEventListener',
	displayName: 'SSEventListener',
	description: 'SSEventListener component with user-defined function execution',
	component: SSEventListener,
	styleComponent: SSEventListenerStyle,
	styleDefaults: styleDefaults,
	propertyValidation: () => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	bindingPaths: {
		bindingPath: { name: 'Events Binding' },
	},
	defaultTemplate: {
		key: '',
		type: 'SSEventListener',
		name: 'SSEventListener',
		properties: {},
	},
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',

			icon: (
				<IconHelper viewBox="0 0 30 30">
					<path d="M15 0L5 10V20L15 30L25 20V10L15 0Z" fill="#FF7599" />
				</IconHelper>
			),
			mainComponent: true,
		},
	],
	stylePropertiesForTheme: styleProperties,
};

export default component;

import React, { useEffect, useRef } from 'react';
import {
	getDataFromPath,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { ComponentProps } from '../../types/common';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './sseventListenerProperties';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { messageToMaster } from '../../slaveFunctions';
import { duplicate } from '@fincity/kirun-js';

export default function SSEventListener(props: Readonly<ComponentProps>) {
	const {
		definition,
		pageDefinition,
		locationHistory,
		context,
		definition: { bindingPath },
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
	const { properties: { url, eventName, onEvent, left = 0, top = 0 } = {} } = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
	);

	let bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	useEffect(() => {
		if (!bindingPath || !url || !onEvent || !pageDefinition.eventFunctions?.[onEvent]) return;

		const eventFunction = pageDefinition.eventFunctions?.[onEvent];
		const es = new EventSource(url, { withCredentials: true });

		const func = (event: MessageEvent) => {
			const data = event.data;

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

		es.onerror = e => console.error('SSE error (auto-retrying)', e);

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
			<HelperComponent context={context} definition={definition} />
		</div>
	) : (
		<></>
	);
}

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
import { openEventStream, StreamMessage } from './authedEventStream';
import { createSerialQueue, eventArguments } from './eventDelivery';

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

	let eventNames: string[] = [];
	if (Array.isArray(eventName)) eventNames = eventName;
	else if (typeof eventName === 'string') eventNames = [eventName];
	// A string key, so a new array with the same names does not reopen the stream.
	const eventNamesKey = JSON.stringify(eventNames);

	// Read at run time, so a run uses the page as it is when the event arrives, not as it was
	// when the stream opened.
	const latest = useRef({ pageDefinition, locationHistory });
	latest.current = { pageDefinition, locationHistory };

	const hasEventFunction = !!(onEvent && pageDefinition.eventFunctions?.[onEvent]);

	useEffect(() => {
		// The binding path is optional: url, onEvent and its function are enough.
		if (!url || !onEvent || !hasEventFunction) return;

		// One run per event, in arrival order, each awaited before the next starts.
		const queue = createSerialQueue(e => console.error('SSE onEvent failed', e));

		const deliver = async (message: StreamMessage, receivedAt: number) => {
			const { pageDefinition: pageDef, locationHistory: history } = latest.current;

			if (bindingPathPath) {
				// Unchanged from before the Arguments existed: the raw data string is appended,
				// so pages that read the array (the leadzumptwo shell) keep working.
				let value = getDataFromPath(bindingPathPath, history, pageExtractor);
				value = value ? duplicate(value) : [];
				value.push(message.data);
				setData(bindingPathPath, value, pageExtractor.getPageName());
			}

			const eventFunction = pageDef.eventFunctions?.[onEvent];
			if (!eventFunction) return;
			await runEvent(
				eventFunction,
				onEvent,
				context.pageName,
				history,
				pageDef,
				eventArguments(message, receivedAt),
			);
		};

		// Not EventSource: it cannot send the Authorization header, so without the cookie every
		// stream 401'd (QA-0369). See authedEventStream.
		const close = openEventStream(url, {
			eventNames: JSON.parse(eventNamesKey),
			onMessage: message => {
				const receivedAt = Date.now();
				queue.push(() => deliver(message, receivedAt));
			},
			onError: e => console.error('SSE error (auto-retrying)', e),
		});

		return () => {
			close();
			queue.close();
		};
	}, [bindingPathPath, url, onEvent, eventNamesKey, hasEventFunction]);

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

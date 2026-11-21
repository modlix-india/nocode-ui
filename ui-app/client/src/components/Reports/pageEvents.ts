import { useCallback, useRef } from 'react';
import { ComponentProps } from '../../types/common';
import { runEvent } from '../util/runEvent';

/**
 * A page event function by property value, as a callback, or undefined when the property is
 * not set (so a menu item for it is only shown when the page handles it).
 */
export function usePageEvents(props: Readonly<ComponentProps>) {
	const latest = useRef(props);
	latest.current = props;
	const fire = useCallback(async (eventName: string | undefined) => {
		const { pageDefinition, definition, context, locationHistory } = latest.current;
		const fn = eventName ? pageDefinition?.eventFunctions?.[eventName] : undefined;
		if (!fn) return;
		await runEvent(fn, definition.key, context.pageName, locationHistory, pageDefinition);
	}, []);
	return useCallback(
		(eventName: string | undefined): (() => void) | undefined => {
			if (!eventName || !latest.current.pageDefinition?.eventFunctions?.[eventName])
				return undefined;
			return () => void fire(eventName);
		},
		[fire],
	);
}

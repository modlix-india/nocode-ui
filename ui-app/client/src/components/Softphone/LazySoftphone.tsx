import React, { useEffect, useRef } from 'react';
import { STORE_PREFIX } from '../../constants';
import { PageStoreExtractor, setData, UrlDetailsExtractor } from '../../context/StoreContext';
import { messageToMaster } from '../../slaveFunctions';
import { softphoneRegistry } from '../../softphone/registry';
import { SoftphoneState } from '../../softphone/types';
import { ComponentProperty, ComponentProps, PageDefinition } from '../../types/common';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './softphoneProperties';
import {
	awaitingConnectionBinding,
	changedKeys,
	detectTransitions,
	elapsedSince,
} from './softphoneUtils';

/**
 * Mirrors the registry into the store and fires the page's events. The session lives in the
 * registry, so unmounting must not drop a call: nothing here calls `stop()`.
 */

/** `Store.`, not `Page.`: the shell renders under the global context. */
const SOFTPHONE_PATH = `${STORE_PREFIX}.softphone`;

/**
 * The live call clock, `{ seconds, formatted }`. Owned here, not in `SoftphoneState`, so the
 * interval has an owner to tear it down and the per-key state write never clobbers a tick.
 */
const DURATION_PATH = `${SOFTPHONE_PATH}.duration`;

const IDLE_DURATION = { seconds: 0, formatted: '00:00' };

export default function Softphone(props: Readonly<ComponentProps>) {
	const { definition, pageDefinition, locationHistory, context } = props;

	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);

	const {
		properties: {
			connectionName,
			autoRegister = true,
			sdkUrl,
			onIncomingCall,
			onCallConnected,
			onCallEnded,
			onRegistrationChange,
			onError,
			left = 0,
			top = 0,
		} = {},
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
	);

	// Refs, so renaming an event function does not rebuild the subscription mid-call.
	const eventsRef = useRef({
		onIncomingCall,
		onCallConnected,
		onCallEnded,
		onRegistrationChange,
		onError,
		pageDefinition,
		locationHistory,
		pageName: context.pageName,
	});
	eventsRef.current = {
		onIncomingCall,
		onCallConnected,
		onCallEnded,
		onRegistrationChange,
		onError,
		pageDefinition,
		locationHistory,
		pageName: context.pageName,
	};

	const previousRef = useRef<SoftphoneState | undefined>(undefined);

	const tickRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
	const tickingForRef = useRef<string | undefined>(undefined);

	const waitingForConnection = awaitingConnectionBinding(
		definition.properties?.connectionName as ComponentProperty<string> | undefined,
		connectionName,
	);

	useEffect(() => {
		if (waitingForConnection) return;

		// Started with no connection too: the backend then answers for the agent's own.
		void softphoneRegistry.start(
			connectionName || undefined,
			autoRegister !== false,
			sdkUrl || undefined,
		);
		// Deliberately no teardown: the phone outlives this component.
	}, [connectionName, autoRegister, sdkUrl, waitingForConnection]);

	useEffect(() => {
		/**
		 * Driven off state, not events, so every path (snapshot, logout, second call) is covered.
		 * Defined here, its only user, as is `stopClock`: both read only refs.
		 */
		function syncClock(state: SoftphoneState) {
			const startedAt = state.inCall ? state.startedAt : undefined;

			if (!startedAt) {
				if (tickingForRef.current === undefined) return;
				stopClock();
				tickingForRef.current = undefined;
				setData(DURATION_PATH, IDLE_DURATION);
				return;
			}

			// Keyed on the timestamp, so a new call restarts the clock.
			if (tickingForRef.current === startedAt) return;

			stopClock();
			tickingForRef.current = startedAt;

			setData(DURATION_PATH, elapsedSince(startedAt));
			tickRef.current = setInterval(
				() => setData(DURATION_PATH, elapsedSince(startedAt)),
				1000,
			);
		}

		function stopClock() {
			if (!tickRef.current) return;
			clearInterval(tickRef.current);
			tickRef.current = undefined;
		}

		// Otherwise a connection switch diffs against the old phone and fires stale transitions.
		previousRef.current = undefined;

		const unsubscribe = softphoneRegistry.subscribe(state => {
			const previous = previousRef.current;

			// One write for the first reading, then per key (see changedKeys). The store deletes a
			// key written as undefined, so both produce the same shape.
			if (!previous) setData(SOFTPHONE_PATH, state);
			else
				for (const key of changedKeys(previous, state))
					setData(`${SOFTPHONE_PATH}.${key}`, state[key]);

			previousRef.current = state;

			syncClock(state);

			const events = eventsRef.current;

			for (const transition of detectTransitions(previous, state)) {
				switch (transition) {
					case 'registrationChange':
						fire(events.onRegistrationChange, events);
						break;
					case 'incomingCall':
						fire(events.onIncomingCall, events);
						break;
					case 'callConnected':
						fire(events.onCallConnected, events);
						break;
					case 'callEnded':
						fire(events.onCallEnded, events);
						break;
					case 'error':
						fire(events.onError, events);
						break;
					default: {
						// Not thrown: that would break the registry's other subscribers.
						const unhandled: never = transition;
						console.warn('Ignoring an unrecognised softphone transition', unhandled);
					}
				}
			}
		});

		// After subscribing: its synchronous first write replaces `Store.softphone`, duration
		// included.
		setData(DURATION_PATH, IDLE_DURATION);

		return () => {
			unsubscribe();

			// Nothing maintains the clock once unmounted, and a frozen value reads as live.
			stopClock();
			tickingForRef.current = undefined;
			setData(DURATION_PATH, IDLE_DURATION);
		};
	}, [connectionName]);

	const ref = useRef<HTMLDivElement>(null);

	return globalThis.designMode ? (
		<div
			className="comp compSoftphone"
			ref={ref}
			style={{ transform: `translate(${left}px, ${top}px)` }}
			title="Softphone"
			onMouseDown={ev => {
				ev.preventDefault();
				ev.stopPropagation();

				if (!ref.current || ev.button !== 0) return;

				const startX = ev.clientX;
				const startY = ev.clientY;
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
								{ name: 'left', value: newX },
								{ name: 'top', value: newY },
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
					ref.current.style.transform = `translate(${newX}px, ${newY}px)`;
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

function fire(
	eventName: string | undefined,
	events: {
		pageDefinition: PageDefinition;
		locationHistory: ComponentProps['locationHistory'];
		pageName: string;
	},
) {
	if (!eventName) return;
	const eventFunction = events.pageDefinition.eventFunctions?.[eventName];
	if (!eventFunction) return;

	void runEvent(
		eventFunction,
		eventName,
		events.pageName,
		events.locationHistory,
		events.pageDefinition,
	);
}

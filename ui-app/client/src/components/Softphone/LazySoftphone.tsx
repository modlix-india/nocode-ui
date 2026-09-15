import React, { useEffect, useRef } from 'react';
import { STORE_PREFIX } from '../../constants';
import { PageStoreExtractor, setData, UrlDetailsExtractor } from '../../context/StoreContext';
import { messageToMaster } from '../../slaveFunctions';
import { softphoneRegistry } from '../../softphone/registry';
import { SoftphoneState } from '../../softphone/types';
import { ComponentProps, PageDefinition } from '../../types/common';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './softphoneProperties';
import { changedKeys, detectTransitions, elapsedSince } from './softphoneTransitions';

/**
 * Binds the softphone to the page.
 *
 * A controller and nothing more: it subscribes to the registry, writes what it hears to the store,
 * and fires the page's event functions. The session itself lives in the registry, so this
 * component unmounting - on a page with `wrapShell: false`, or on a remount - does not drop a call.
 * That is why nothing here calls `stop()`.
 */

/**
 * Where the page reads the phone from.
 *
 * An explicit `Store.` path rather than a `Page.` one, because the shell renders under the global
 * context: a `Page.` write here would land somewhere no ordinary page could bind to.
 */
const SOFTPHONE_PATH = `${STORE_PREFIX}.softphone`;

/**
 * The live call clock: `{ seconds, formatted }`, updated once a second while a call is connected.
 *
 * Owned by this component rather than by the registry, and deliberately not part of
 * `SoftphoneState`. Two reasons. An interval needs tearing down when the thing that started it
 * goes away, which a component has and a module singleton does not. And keeping it out of the
 * registry's state means the per-key write never touches this path, so a tick cannot be clobbered
 * by an unrelated state change - a mute toggle mid-call would otherwise blank the clock until the
 * next second.
 *
 * A page binds a text component straight to `Store.softphone.duration.formatted`. Nothing else is
 * needed: no Timer component, no event function, no date arithmetic.
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

	// Read through refs inside the subscription so that renaming an event function does not tear
	// down and rebuild the subscription - which, mid-call, would drop the state the UI renders.
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
	/** Which call the clock is currently running for, so a new one restarts it. */
	const tickingForRef = useRef<string | undefined>(undefined);

	useEffect(() => {
		if (!connectionName) return;
		void softphoneRegistry.start(connectionName, autoRegister !== false, sdkUrl || undefined);
		// Deliberately no teardown. The phone is meant to outlive this component; the registry ends
		// the session itself when the user's own session ends.
	}, [connectionName, autoRegister, sdkUrl]);

	useEffect(() => {
		if (!connectionName) return;

		// Forget the last connection's phone. Without this, switching connections compares the new
		// phone's first reading against the old one's last, and fires a burst of transitions - a
		// "call ended" for a call that belonged to a connection no longer in use.
		previousRef.current = undefined;

		const unsubscribe = softphoneRegistry.subscribe(state => {
			const previous = previousRef.current;

			// Per key once there is something to compare against, but one write for the first
			// reading.
			//
			// The store notifies a listener when the written path is that path or an ancestor of
			// it. So a write of `Store.softphone` wakes everything bound to any part of it - a
			// caller-id label re-rendering because the mute flag moved - which is why updates go
			// key by key. But the first reading has every key "changed", and writing nine of them
			// separately notifies a whole-object binding nine times instead of once. One write is
			// strictly better there, and the isolation only matters once calls start.
			//
			// The store deletes a key written as undefined, so either path produces the same shape.
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
						// Exhaustiveness: a new transition without a case here is a compile error,
						// which is the only thing that catches it - the loop would otherwise skip
						// the transition and simply not fire the page's event.
						//
						// Not thrown: this runs inside the registry's subscriber, and throwing
						// would take the remaining subscribers and the store write down with it.
						const unhandled: never = transition;
						console.warn('Ignoring an unrecognised softphone transition', unhandled);
					}
				}
			}
		});

		// After subscribing, not before: `subscribe` calls back synchronously, and that first
		// whole-object write replaces `Store.softphone` - deleting a `duration` written earlier.
		// Established here so a label bound to it reads 00:00 rather than blank before any call.
		setData(DURATION_PATH, IDLE_DURATION);

		return () => {
			unsubscribe();

			// Nothing maintains the clock once this unmounts, and a frozen 01:23 reads as live in a
			// way 00:00 does not. Navigating to a page that opts out of the shell is the case.
			stopClock();
			tickingForRef.current = undefined;
			setData(DURATION_PATH, IDLE_DURATION);
		};
	}, [connectionName]);

	/**
	 * Starts, restarts or stops the clock to match the call.
	 *
	 * Driven off the state rather than off specific events, so every path is covered by
	 * construction - answered, ended, a second call, a logout, a tab that opened mid-call and
	 * adopted a snapshot.
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

		// Keyed on the timestamp: a new call must restart the clock rather than keep counting
		// from the previous one.
		if (tickingForRef.current === startedAt) return;

		stopClock();
		tickingForRef.current = startedAt;

		// Written immediately as well as on the interval, so the clock reads 00:00 the moment the
		// call connects instead of staying blank for a second.
		setData(DURATION_PATH, elapsedSince(startedAt));
		tickRef.current = setInterval(() => setData(DURATION_PATH, elapsedSince(startedAt)), 1000);
	}

	function stopClock() {
		if (!tickRef.current) return;
		clearInterval(tickRef.current);
		tickRef.current = undefined;
	}

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

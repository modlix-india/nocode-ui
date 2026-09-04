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
import { detectTransitions, shouldRing } from './softphoneTransitions';

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

export default function Softphone(props: Readonly<ComponentProps>) {
	const { definition, pageDefinition, locationHistory, context } = props;

	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);

	const {
		properties: {
			connectionName,
			autoRegister = true,
			audioRingtoneUrl,
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

	const ringtoneRef = useRef<string | undefined>(audioRingtoneUrl);
	ringtoneRef.current = audioRingtoneUrl;

	const previousRef = useRef<SoftphoneState | undefined>(undefined);
	const audioRef = useRef<HTMLAudioElement | undefined>(undefined);

	useEffect(() => {
		if (!connectionName) return;
		void softphoneRegistry.start(connectionName, autoRegister !== false);
		// Deliberately no teardown. The phone is meant to outlive this component; the registry ends
		// the session itself when the user's own session ends.
	}, [connectionName, autoRegister]);

	useEffect(() => {
		if (!connectionName) return;

		// Forget the last connection's phone. Without this, switching connections compares the new
		// phone's first reading against the old one's last, and fires a burst of transitions - a
		// "call ended" for a call that belonged to a connection no longer in use.
		previousRef.current = undefined;

		const unsubscribe = softphoneRegistry.subscribe(state => {
			// The store is written before any event runs, so an event function can read
			// Store.softphone rather than needing the state handed to it - which is how every
			// other component in this codebase passes information to a page.
			setData(SOFTPHONE_PATH, state);

			const previous = previousRef.current;
			previousRef.current = state;

			const events = eventsRef.current;

			for (const transition of detectTransitions(previous, state)) {
				switch (transition) {
					case 'registrationChange':
						fire(events.onRegistrationChange, events);
						break;
					case 'incomingCall':
						startRinging(state);
						fire(events.onIncomingCall, events);
						break;
					case 'callConnected':
						stopRinging();
						fire(events.onCallConnected, events);
						break;
					case 'callEnded':
						stopRinging();
						fire(events.onCallEnded, events);
						break;
					case 'error':
						fire(events.onError, events);
						break;
				}
			}
		});

		return () => {
			unsubscribe();
			stopRinging();
		};
	}, [connectionName]);

	function startRinging(state: SoftphoneState) {
		const url = ringtoneRef.current;
		if (!shouldRing(state, url)) return;

		stopRinging();
		const audio = new Audio(url);
		audio.loop = true;
		audioRef.current = audio;
		// Autoplay can be refused when the agent has not interacted with the page yet. The call is
		// still ringing on screen, so a silent ring is a degradation, not a failure.
		audio.play().catch(() => {});
	}

	function stopRinging() {
		const audio = audioRef.current;
		if (!audio) return;
		audio.pause();
		audio.currentTime = 0;
		audioRef.current = undefined;
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

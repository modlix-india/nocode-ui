import React, { useEffect, useState } from 'react';
import { STORE_PATH_APP_MESSAGE_TIMEOUT, STORE_PATH_MESSAGES } from '../../constants';
import {
	addListenerAndCallImmediately,
	getDataFromPath,
	setData,
} from '../../context/StoreContext';
import { duplicate } from '@fincity/kirun-js';
import { takeSocialArrivalMessage } from '../../sso/ssoModule';
import { CopyErrorId } from './CopyErrorId';
import { messageDetails } from './messageDetails';

export function Messages() {
	const [msgs, setMsgs] = useState<any[]>([]);
	const [showStackTraceId, setShowStackTraceId] = useState<string | undefined>(undefined);

	useEffect(
		() =>
			addListenerAndCallImmediately(
				undefined,
				(_, m) => setMsgs(m ?? []),
				STORE_PATH_MESSAGES,
			),
		[],
	);

	// A social sign-in that could not be turned into a session has no way to say so itself:
	// `ssoModule` runs before React, where `addMessage` would write the store during the
	// bootstrap and leave `App.tsx` acting on empty values. It parks the text instead, and this
	// is the first moment it is safe to show. Taken once, so it does not reappear on a later
	// mount belonging to a different sign-in.
	useEffect(() => {
		const pending = takeSocialArrivalMessage();
		if (pending) addMessage(MESSAGE_TYPE.ERROR, pending, true, '');
	}, []);

	const lift = useMessagesLift();

	const msgComps = msgs.map((e: any, i: number) => {
		// `UIEngine.Message` declares its four types as ERROR | WARNING | INFO |
		// SUCCESS (`functions/Message.ts`), and a value outside that enum is
		// rejected before the step runs -- so INFO is the only informational type
		// a page definition can ask for. This component spells the same meaning
		// INFORMATION, in `MESSAGE_TYPE`, in `ICONS`, and in the theme's
		// `._message.INFORMATION` selector. The two never met: an INFO toast got
		// `ICONS['INFO']`, which is undefined, so it rendered `class="fa-xl
		// undefined"` with no glyph and fell through to the untinted `._message`
		// ground. Normalised on the way in rather than by widening the function's
		// enum, because the definitions already stored say INFO.
		const type = e.type === 'INFO' ? MESSAGE_TYPE.INFORMATION : e.type;
		// The text, the next step and the error id, from whatever shape the message came in
		// (a string, a service's error body, a fetch error, a thrown axios error).
		const details = messageDetails(e.msg, type);
		const debugMessageCaret = details.debugMessage ? (
			<i
				className={`fa _pointer fa-solid fa-angle-${e.isOpened?.status ? 'down' : 'right'}`}
				onClick={() => {
					const lMsgs = duplicate(msgs);
					lMsgs[i] = {
						...lMsgs[i],
						isOpened: { status: !e.isOpened?.status },
					};
					setData(STORE_PATH_MESSAGES, lMsgs);
				}}
			/>
		) : undefined;
		const debugMessage =
			details.debugMessage && e.isOpened?.status ? (
				<div className="_msgString _msgDebug">{details.debugMessage}</div>
			) : undefined;
		const stackTraceIcon = details.stackTrace ? (
			<i
				className="fa _pointer fa-solid  fa-arrow-up-right-from-square"
				onClick={() => {
					const lMsgs = duplicate(msgs);

					lMsgs[i] = {
						...lMsgs[i],
						isOpened: { status: e.isOpened?.status },
					};
					setShowStackTraceId(showStackTraceId === e.id ? undefined : e.id);
					setData(STORE_PATH_MESSAGES, lMsgs);
				}}
			/>
		) : undefined;

		let stackTrace = undefined;
		if (e.id === showStackTraceId) {
			const msg = msgs.find((e: any) => e.id === showStackTraceId);
			if (msg)
				stackTrace = (
					<div className={`_msgStackTrace ${type}`}>
						<div className="_stackTrace">{details.stackTrace}</div>
					</div>
				);
		}

		return (
			<React.Fragment key={e.id}>
				<div key={e.id} data-custom={e.id} className={`_message ${type}`}>
					<i className={`fa-xl ${ICONS[type]} _msgIcon`} />
					<div className="_msgStringContainer">
						<div className="_msgString">
							{debugMessageCaret}
							{details.text}
							{stackTraceIcon}
						</div>
						{details.action ? (
							<div className="_msgString _msgAction">{details.action}</div>
						) : undefined}
						{details.errorId ? <CopyErrorId errorId={details.errorId} /> : undefined}
						{debugMessage}
					</div>
					<i
						className="fa fa-solid fa-circle-xmark _msgCloseIcon"
						tabIndex={0}
						onClick={() => removeMessage(e.id)}
					/>
				</div>
				{stackTrace}
			</React.Fragment>
		);
	});

	return (
		<div
			className="comp compMessages"
			style={lift ? { translate: `0px -${lift}` } : undefined}
			data-lift={lift}
		>
			{msgComps}
		</div>
	);
}

/**
 * Opt-in, per page: a page whose own bar sits where the theme puts the toasts (a sticky footer
 * with a Back button in the bottom left, say) sets `Page.messagesLift` to a length (a number is
 * pixels, or a string such as "88px" or "5rem") and the toasts move up by that much while that
 * page is the one in the URL. `translate` adds to whatever the theme positions with (top, bottom
 * or transform). Unset, or any other value, keeps the theme's place.
 */
export const MESSAGES_LIFT_KEY = 'messagesLift';

export function messagesLiftValue(v: any): string | undefined {
	if (typeof v === 'number') return Number.isFinite(v) && v > 0 ? `${v}px` : undefined;
	if (typeof v !== 'string') return undefined;
	const s = v.trim();
	return /^\d+(\.\d+)?(px|rem|em|vh)$/.test(s) && Number.parseFloat(s) > 0 ? s : undefined;
}

function useMessagesLift(): string | undefined {
	const [lift, setLift] = useState<string | undefined>(undefined);
	useEffect(() => {
		let offPage: (() => void) | undefined;
		const offUrl = addListenerAndCallImmediately(
			undefined,
			(_, pageName) => {
				offPage?.();
				offPage = undefined;
				if (!pageName) {
					setLift(undefined);
					return;
				}
				offPage = addListenerAndCallImmediately(
					undefined,
					(_p, v) => setLift(messagesLiftValue(v)),
					`Store.pageData.${pageName}.${MESSAGES_LIFT_KEY}`,
				);
			},
			'Store.urlDetails.pageName',
		);
		return () => {
			offUrl();
			offPage?.();
		};
	}, []);
	return lift;
}

export enum MESSAGE_TYPE {
	ERROR = 'ERROR',
	WARNING = 'WARNING',
	INFORMATION = 'INFORMATION',
	SUCCESS = 'SUCCESS',
}

const ICONS: any = {
	[MESSAGE_TYPE.ERROR]: 'fa-solid fa-triangle-exclamation',
	[MESSAGE_TYPE.WARNING]: 'fa-solid fa-exclamation',
	[MESSAGE_TYPE.INFORMATION]: 'fa-solid fa-info',
	[MESSAGE_TYPE.SUCCESS]: 'fa-solid fa-circle-check',
};

export function addMessage(type: MESSAGE_TYPE, msg: any, isGlobalScope: boolean, pageName: string) {
	const messages = getDataFromPath(STORE_PATH_MESSAGES, []) ?? [];

	const key = `${Date.now()}-${Math.round(Math.random() * 10000)}`;
	setData(STORE_PATH_MESSAGES, [
		...messages,
		{ id: key, when: Date.now(), type, msg, isGlobalScope },
	]);
}

export function removeMessage(id: string) {
	const messages = getDataFromPath(STORE_PATH_MESSAGES, []) ?? [];

	if (messages.length === 0) return;

	const newMsgs = messages.filter((e: any) => e.id !== id);

	setData(STORE_PATH_MESSAGES, newMsgs);
}

setInterval(() => {
	const messages = [...(getDataFromPath(STORE_PATH_MESSAGES, []) ?? [])];

	if (messages.length === 0) return;

	let timeout = parseInt(getDataFromPath(STORE_PATH_APP_MESSAGE_TIMEOUT, []) ?? '10000');
	if (isNaN(timeout)) timeout = 10000;

	const now = Date.now();

	const newMsgs = messages.filter((e: any) => !!e.isOpened || e.when + timeout > now);

	if (messages.length === newMsgs.length) return;

	setData(STORE_PATH_MESSAGES, newMsgs);
}, 1000);

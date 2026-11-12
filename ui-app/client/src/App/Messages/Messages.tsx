import React, { useEffect, useState } from 'react';
import {
	GLOBAL_CONTEXT_NAME,
	STORE_PATH_APP_MESSAGE_TIMEOUT,
	STORE_PATH_MESSAGES,
} from '../../constants';
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

		// Opt-in (UIEngine.Message `actions`, `details`): buttons such as Undo, and a Details
		// button that opens extra lines inside the toast. A toast without them renders as before.
		const extraLines: string[] = Array.isArray(e.details) ? e.details : [];
		const actionList: ToastAction[] = Array.isArray(e.actions) ? e.actions : [];
		const toastButtons =
			actionList.length || extraLines.length ? (
				<div className="_msgString _msgActions">
					{extraLines.length ? (
						<button
							type="button"
							className="_msgActionBtn _msgDetailsBtn"
							aria-expanded={!!e.detailsOpen}
							onClick={() => toggleDetails(e.id)}
						>
							{e.detailsOpen ? 'Hide details' : 'Details'}
						</button>
					) : undefined}
					{actionList.map((a, j) => (
						<button
							type="button"
							key={`${j}-${a.label}`}
							className="_msgActionBtn"
							onClick={() => runToastAction(e, a)}
						>
							{a.label}
						</button>
					))}
				</div>
			) : undefined;
		const toastDetailsList =
			extraLines.length && e.detailsOpen ? (
				<ul className="_msgString _msgDetails">
					{extraLines.map((l, j) => (
						<li key={j}>{l}</li>
					))}
				</ul>
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
				<div
					key={e.id}
					data-custom={e.id}
					className={`_message ${type}${e.sticky ? ' _sticky' : ''}${
						e.detailsOpen ? ' _detailsOpen' : ''
					}`}
				>
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
						{toastDetailsList}
					</div>
					{toastButtons}
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

/**
 * A button on a toast (UIEngine.Message `actions`). A click writes `value` to `path` when a path
 * is given (so the button carries THIS toast's data, say the campaigns this Undo turns back on,
 * even if a newer action changed the page since), then runs the page event `eventFunction` (its
 * key or its name) of the page that raised the toast, or else the function `function`
 * (`Namespace.Name`), and closes the toast.
 */
export interface ToastAction {
	label: string;
	eventFunction?: string;
	function?: string;
	path?: string;
	value?: any;
}

/** Extra options of a toast; all optional, and a toast without them is the old toast. */
export interface ToastOptions {
	actions?: ToastAction[];
	/** Stays until dismissed (its close icon or one of its actions), never on the timer. */
	sticky?: boolean;
	/** Lines behind a Details button. */
	details?: string[];
	/** The page whose event raised the toast; actions run there. */
	page?: string;
}

/** The usable actions in what a page passed: a label and something to do. */
export function toastActions(v: any): ToastAction[] {
	if (!Array.isArray(v)) return [];
	return v
		.map(a => (a instanceof Map ? Object.fromEntries(a) : a))
		.filter(
			a =>
				a &&
				typeof a === 'object' &&
				typeof a.label === 'string' &&
				a.label.trim() !== '' &&
				(typeof a.eventFunction === 'string' ||
					typeof a.function === 'string' ||
					typeof a.path === 'string'),
		)
		.map(a => {
			const out: ToastAction = { label: a.label };
			if (typeof a.eventFunction === 'string' && a.eventFunction)
				out.eventFunction = a.eventFunction;
			if (typeof a.function === 'string' && a.function) out.function = a.function;
			if (typeof a.path === 'string' && a.path) {
				out.path = a.path;
				out.value = a.value === undefined ? undefined : duplicate(a.value);
			}
			return out;
		});
}

/** Details as lines: a string splits on new lines, an array keeps its printable items. */
export function toastDetails(v: any): string[] {
	const list = typeof v === 'string' ? v.split('\n') : Array.isArray(v) ? v : [];
	return list
		.map(l => (typeof l === 'string' || typeof l === 'number' ? String(l) : undefined))
		.filter((l): l is string => l !== undefined && l.trim() !== '');
}

export function addMessage(
	type: MESSAGE_TYPE,
	msg: any,
	isGlobalScope: boolean,
	pageName: string,
	options?: ToastOptions,
) {
	const messages = getDataFromPath(STORE_PATH_MESSAGES, []) ?? [];

	const key = `${Date.now()}-${Math.round(Math.random() * 10000)}`;
	const extra: Record<string, any> = {};
	if (options?.actions?.length) extra.actions = options.actions;
	if (options?.sticky) extra.sticky = true;
	if (options?.details?.length) extra.details = options.details;
	if (options?.page && (extra.actions || extra.details)) extra.page = options.page;
	setData(STORE_PATH_MESSAGES, [
		...messages,
		{ id: key, when: Date.now(), type, msg, isGlobalScope, ...extra },
	]);
}

function toggleDetails(id: string) {
	const messages = getDataFromPath(STORE_PATH_MESSAGES, []) ?? [];
	setData(
		STORE_PATH_MESSAGES,
		messages.map((m: any) =>
			// Reading the details keeps the toast up, as an opened caret does.
			m.id === id ? { ...m, detailsOpen: !m.detailsOpen, isOpened: m.isOpened ?? true } : m,
		),
	);
}

/** Runs one toast button: the write, then the event or the function, then the toast closes. */
export async function runToastAction(message: any, action: ToastAction) {
	removeMessage(message.id);
	const page: string = message.page ?? GLOBAL_CONTEXT_NAME;
	if (action.path) setData(action.path, action.value, page);
	let def: any;
	let pageDefinition: any;
	if (action.eventFunction) {
		pageDefinition = getDataFromPath(`Store.pageDefinition.${page}`, []);
		const events = pageDefinition?.eventFunctions ?? {};
		def =
			events[action.eventFunction] ??
			Object.values(events).find((f: any) => f?.name === action.eventFunction);
	} else if (action.function) {
		const dot = action.function.lastIndexOf('.');
		if (dot > 0)
			def = {
				name: 'toastAction',
				namespace: 'UIEngine',
				steps: {
					run: {
						statementName: 'run',
						namespace: action.function.substring(0, dot),
						name: action.function.substring(dot + 1),
						parameterMap: {},
					},
				},
			};
	}
	if (!def) return;
	// Imported when used: runEvent imports this module for its own error toasts.
	const { runEvent } = await import('../../components/util/runEvent');
	await runEvent(def, `toast-${message.id}`, page, [], pageDefinition);
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

	const newMsgs = messages.filter(
		(e: any) => !!e.isOpened || !!e.sticky || e.when + timeout > now,
	);

	if (messages.length === newMsgs.length) return;

	setData(STORE_PATH_MESSAGES, newMsgs);
}, 1000);

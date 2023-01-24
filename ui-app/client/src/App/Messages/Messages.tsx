import React, { useEffect, useState } from 'react';
import { STORE_PATH_APP_MESSAGE_TIMEOUT, STORE_PATH_MESSAGES } from '../../constants';
import {
	addListenerAndCallImmediately as alci,
	getDataFromPath,
	setData,
} from '../../context/StoreContext';

export function Messages() {
	const [msgs, setMsgs] = useState([]);

	useEffect(() => alci((_, m) => setMsgs(m ?? []), undefined, STORE_PATH_MESSAGES), []);

	const msgComps = msgs.map((e: any) => (
		<div key={e.id} className={`_message ${e.type}`}>
			<div className="_msgString">{typeof e.msg === 'object' ? e.msg.message : e.msg}</div>
			<i className="fa fa-solid fa-close" />
		</div>
	));

	return <div className="comp compMessages">{msgComps}</div>;
}

export enum MESSAGE_TYPE {
	ERROR = 'ERROR',
	WARNING = 'WARNING',
	INFORMATION = 'INFORMATION',
	SUCCESS = 'SUCCESS',
}

export function addMessage(type: MESSAGE_TYPE, msg: any, isGlobalScope: boolean, pageName: string) {
	const messages = getDataFromPath(STORE_PATH_MESSAGES, []) ?? [];

	setData(STORE_PATH_MESSAGES, [...messages, { id: Date.now(), type, msg, isGlobalScope }]);
}

export function removeMessage(id: number) {
	const messages = getDataFromPath(STORE_PATH_MESSAGES, []) ?? [];

	if (messages.length === 0) return;

	const newMsgs = messages.filter((e: any) => e.id !== id);

	setData(STORE_PATH_MESSAGES, newMsgs);
}

// setInterval(() => {
// 	const messages = [...(getDataFromPath(STORE_PATH_MESSAGES, []) ?? [])];

// 	if (messages.length === 0) return;

// 	let timeout = parseInt(getDataFromPath(STORE_PATH_APP_MESSAGE_TIMEOUT, []) ?? '10000');
// 	if (isNaN(timeout)) timeout = 10000;

// 	const now = Date.now();

// 	const newMsgs = messages.filter((e: any) => e.id + timeout > now);
// 	console.log(newMsgs.length, messages.length);

// 	if (messages.length === newMsgs.length) return;

// 	setData(STORE_PATH_MESSAGES, newMsgs);
// }, 1000);

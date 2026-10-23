/**
 * The ad card sends the value the creative agent understands when a picture or
 * button is tapped. The text the user sees stays short.
 */

import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { AdSlotCard, AdSlotCardPayload } from '../components/AdSlotCard';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
	container = document.createElement('div');
	document.body.appendChild(container);
	root = createRoot(container);
});

afterEach(() => {
	act(() => root.unmount());
	container.remove();
});

function payload(): AdSlotCardPayload {
	return {
		type: 'adslot',
		rev: 2,
		title: 'Meta Ctwa ad',
		format: { key: 'meta/ctwa' },
		account_name: 'New Account',
		slots: [
			{
				key: 'image',
				label: 'Image',
				min: 1,
				max: 1,
				required: true,
				placed: [],
				choices: [
					{
						asset_id: 7,
						name: 'ad.jpg',
						shape: '9:16',
						pick: 'pick:image:7',
					},
				],
			},
		],
		text: [],
		cta: {
			value: 'WHATSAPP_MESSAGE',
			required: false,
			choices: [
				{
					value: 'WHATSAPP_MESSAGE',
					label: 'Send WhatsApp message',
					pick: 'pick:cta:WHATSAPP_MESSAGE',
				},
			],
		},
		chat: { value: 'Hi', required: true, written: true },
		extras: [],
		owed: [],
		checks: [],
		facts: [],
	};
}

it('sends the picture pick and a readable label', () => {
	const onPick = jest.fn();
	act(() => {
		root.render(<AdSlotCard payload={payload()} onPick={onPick} />);
	});
	const choice = container.querySelector('._adChoice') as HTMLButtonElement;
	act(() => {
		choice.click();
	});
	expect(onPick).toHaveBeenCalledWith('pick:image:7', 'Use ad.jpg', {
		asset_id: 7,
		slot: 'image',
	});
});

it('sends the button pick from its chip', () => {
	const onPick = jest.fn();
	act(() => {
		root.render(<AdSlotCard payload={payload()} onPick={onPick} />);
	});
	const chip = container.querySelector('._adChip') as HTMLButtonElement;
	act(() => {
		chip.click();
	});
	expect(onPick).toHaveBeenCalledWith(
		'pick:cta:WHATSAPP_MESSAGE',
		'Button: Send WhatsApp message',
		{ cta: 'WHATSAPP_MESSAGE' },
	);
});

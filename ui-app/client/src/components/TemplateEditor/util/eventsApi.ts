// Events a template can render against. Two sources:
//  1. A built-in catalog of platform events raised by backend services (security/billing), with the
//     payload shapes those services actually send (see commons-mq EventNames + the *Service callers).
//     Kept on the frontend so no extra backend endpoint is needed.
//  2. The app's own event definitions (/api/core/eventDefinitions), fetched best-effort.
//
// An event's payload IS the FreeMarker render context (EventEmailService passes queObject.getData()),
// so an event's payload schema is exactly the template's variable schema.

import axios from 'axios';
import { PreviewHeaders } from './previewApi';

export interface EventOption {
	name: string;
	id?: string;
	source: 'app' | 'platform';
}

// --- Kirun schema shorthands ---
const S = { type: ['STRING'] };
const I = { type: ['INTEGER'] };
const D = { type: ['DOUBLE'] };
const obj = (properties: Record<string, any>) => ({ type: ['OBJECT'], properties });

// Curated, template-useful fields of the security User / Client DTOs.
const USER = obj({
	userName: S,
	emailId: S,
	phoneNumber: S,
	firstName: S,
	lastName: S,
	middleName: S,
	localeCode: S,
	clientCode: S,
});
const CLIENT = obj({
	code: S,
	name: S,
	typeCode: S,
	localeCode: S,
	businessType: S,
	businessSize: S,
	industry: S,
});

export interface PlatformEvent {
	name: string;
	schema: any;
}

// Payload shapes taken from the security services that raise these events.
export const PLATFORM_EVENT_CATALOG: PlatformEvent[] = [
	{
		name: 'USER_OTP_GENERATE',
		schema: obj({ appName: S, email: S, otp: S, otpPurpose: S, expireInterval: I }),
	},
	{
		name: 'INVOICE_GENERATED',
		schema: obj({
			invoiceId: S,
			invoiceNumber: S,
			appCode: S,
			clientCode: S,
			tokensPurchased: I,
			baseAmount: D,
			gstPercentage: D,
			gstAmount: D,
			totalAmount: D,
			currency: S,
			sellerLegalName: S,
			sellerGstin: S,
			sellerAddress: S,
			buyerLegalName: S,
			buyerGstin: S,
			buyerAddress: S,
			pdfFileKey: S,
		}),
	},
	{ name: 'WALLET_LOW_BALANCE', schema: obj({ walletId: S, appCode: S, clientCode: S, balance: D }) },
	{ name: 'WALLET_SUSPENDED', schema: obj({ walletId: S, appCode: S, clientCode: S, balance: D }) },
	{ name: 'CLIENT_REGISTERED', schema: obj({ client: CLIENT, subDomain: S, urlPrefix: S }) },
	{
		name: 'USER_REGISTERED',
		schema: obj({ client: CLIENT, subDomain: S, urlPrefix: S, user: USER, token: S, passwordUsed: S }),
	},
	{ name: 'USER_PASSWORD_CHANGED', schema: obj({ user: USER }) },
	{ name: 'USER_PASSWORD_RESET_DONE', schema: obj({ user: USER }) },
];

export function platformEventSchema(name: string): any {
	return PLATFORM_EVENT_CATALOG.find(e => e.name === name)?.schema;
}

function clean(h: PreviewHeaders): Record<string, string> {
	const out: Record<string, string> = {};
	if (h.Authorization) out.Authorization = h.Authorization;
	if (h.clientCode) out.clientCode = h.clientCode;
	if (h.appCode) out.appCode = h.appCode;
	return out;
}

// Best-effort list of the app's event definitions (names + ids). Returns [] on any failure.
export async function fetchEventDefinitions(headers: PreviewHeaders): Promise<EventOption[]> {
	try {
		const res = await axios.get('api/core/eventDefinitions', {
			headers: clean(headers),
			params: { size: 200 },
		});
		const content = res.data?.content ?? (Array.isArray(res.data) ? res.data : []);
		return content
			.filter((e: any) => e?.name)
			.map((e: any) => ({ name: e.name, id: e.id, source: 'app' as const }));
	} catch {
		return [];
	}
}

// Fetches one app event definition's Kirun payload schema.
export async function fetchEventSchema(id: string, headers: PreviewHeaders): Promise<any> {
	const res = await axios.get(`api/core/eventDefinitions/${id}`, { headers: clean(headers) });
	return res.data?.schema;
}

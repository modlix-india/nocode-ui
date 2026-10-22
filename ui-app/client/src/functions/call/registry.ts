import { CallAdapterFactory } from './types';

/**
 * Providers by name (lower case). The built in adapters are separate chunks, so a page that
 * never connects a call downloads neither of them, and neither SDK.
 */
const providers = new Map<string, CallAdapterFactory>([
	[
		'exotel',
		() =>
			import(/* webpackChunkName: "callExotel" */ './exotelAdapter').then(m =>
				m.createExotelAdapter(),
			),
	],
	[
		'telecmi',
		() =>
			import(/* webpackChunkName: "callTelecmi" */ './telecmiAdapter').then(m =>
				m.createTelecmiAdapter(),
			),
	],
]);

export function registerCallProvider(name: string, factory: CallAdapterFactory): void {
	providers.set(name.trim().toLowerCase(), factory);
}

export function unregisterCallProvider(name: string): void {
	providers.delete(name.trim().toLowerCase());
}

export function getCallProvider(name: string): CallAdapterFactory | undefined {
	return providers.get((name ?? '').trim().toLowerCase());
}

export function callProviderNames(): string[] {
	return [...providers.keys()];
}

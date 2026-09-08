/**
 * Importing `getAppDefinition` must not evaluate StoreContext.
 *
 * StoreContext's module body builds `storeInitialObject` from
 * `globalThis.appDefinitionResponse`, and index.tsx does not assign that until
 * after the app definition, page definition and theme have been fetched. The
 * store is seeded before React mounts only because StoreContext is first
 * evaluated by the `await import('./App/App')` that comes after the assignment.
 *
 * index.tsx imports `./App/appDefinition` statically. Any value import from
 * there into StoreContext hoists StoreContext's evaluation to module init, and
 * the store then seeds empty: no `Store.application`, no `Store.theme`, no
 * `Store.selectedTheme` at first render, so the app paints unthemed and corrects
 * itself a frame later. Nothing throws; the only symptom is the flash. That is
 * why this is a test.
 *
 * This asserts the runtime fact rather than reading the source, so a type-only
 * import (`types/common.ts` has one, elided at emit) correctly does not trip it.
 */

const evaluated = { storeContext: false };

jest.mock('../../context/StoreContext', () => {
	evaluated.storeContext = true;
	return {
		getDataFromPath: jest.fn(),
		setData: jest.fn(),
		PageStoreExtractor: class {},
		UrlDetailsExtractor: class {},
		addListenerAndCallImmediately: jest.fn(() => jest.fn()),
	};
});

jest.mock('axios');

describe('the boot import graph', () => {
	it('does not evaluate StoreContext when appDefinition is imported', () => {
		jest.isolateModules(() => {
			require('../../App/appDefinition');
		});

		expect(evaluated.storeContext).toBe(false);
	});

	it('still reaches StoreContext from the App chunk, where it belongs', () => {
		jest.isolateModules(() => {
			require('../selectTheme');
		});

		// Proves the check above is meaningful rather than a mock that never fires.
		expect(evaluated.storeContext).toBe(true);
	});
});

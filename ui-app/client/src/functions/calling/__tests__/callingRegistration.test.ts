import { UIFunctionRepository } from '../..';

/**
 * That the calling functions are actually reachable from a page.
 *
 * The unit tests next door prove each class behaves; none of them would notice a missing line in
 * `all.ts`. The failure mode is quiet in the worst way - everything compiles, the editor shows
 * nothing, and a Call button on a page does nothing at all with no error to chase.
 */

const CALLING_FUNCTIONS = [
	'MakeCall',
	'AnswerCall',
	'HangupCall',
	'ToggleHold',
	'ToggleMute',
	'SendDTMF',
	'SetSoftphoneAvailability',
];

describe('calling function registration', () => {
	const repository = new UIFunctionRepository();

	it.each(CALLING_FUNCTIONS)('UIEngine.%s resolves from the repository', async name => {
		const fn = await repository.find('UIEngine', name);

		expect(fn).toBeDefined();
		expect(fn?.getSignature().getFullName()).toBe(`UIEngine.${name}`);
	});

	it('lists the calling functions when the editor searches for them', async () => {
		const found = await repository.filter('call');

		// This is what the KIRun editor's autocomplete calls, so a function missing here is a
		// function nobody building a page will discover.
		expect(found).toEqual(
			expect.arrayContaining([
				'UIEngine.MakeCall',
				'UIEngine.AnswerCall',
				'UIEngine.HangupCall',
			]),
		);
	});
});

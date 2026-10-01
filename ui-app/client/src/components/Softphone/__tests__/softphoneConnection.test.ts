import { awaitingConnectionBinding } from '../softphoneConnection';

/**
 * When the Softphone waits for its connection, and when it starts at once.
 *
 * The case that matters is a binding that has not resolved yet: started then, the phone comes up on
 * the agent's own connection and is torn down again a moment later, when the binding names the one
 * the page meant.
 */
describe('awaitingConnectionBinding', () => {
	it('starts at once when the property is left blank, so the agent gets their own connection', () => {
		expect(awaitingConnectionBinding(undefined, undefined)).toBe(false);
		expect(awaitingConnectionBinding({}, undefined)).toBe(false);
		expect(awaitingConnectionBinding({ value: '' }, '')).toBe(false);
	});

	it('starts at once on a fixed connection name', () => {
		expect(awaitingConnectionBinding({ value: 'exotelConnection' }, 'exotelConnection')).toBe(
			false,
		);
	});

	it('waits while an expression binding has not resolved yet', () => {
		const bound = {
			location: { type: 'EXPRESSION' as const, expression: 'Store.selectedConnection' },
		};

		expect(awaitingConnectionBinding(bound, undefined)).toBe(true);
		expect(awaitingConnectionBinding(bound, '')).toBe(true);
	});

	it('waits while a store-path binding has not resolved yet', () => {
		const bound = { location: { type: 'VALUE' as const, value: 'Page.connectionName' } };

		expect(awaitingConnectionBinding(bound, undefined)).toBe(true);
	});

	it('starts once the binding names a connection', () => {
		// The render sequence of a binding that loads after the page: waits, then starts - once, on
		// the connection it names, and never on the agent's own in between.
		const bound = {
			location: { type: 'EXPRESSION' as const, expression: 'Store.selectedConnection' },
		};
		const renders = [undefined, '', 'telecmiCalls', 'telecmiCalls'];

		const startedOn = renders.filter(resolved => !awaitingConnectionBinding(bound, resolved));

		expect(startedOn).toEqual(['telecmiCalls', 'telecmiCalls']);
	});

	it('does not wait on a binding with nothing in it', () => {
		// An editor can leave an empty location behind; that is a blank property, not a binding.
		expect(
			awaitingConnectionBinding(
				{ location: { type: 'EXPRESSION', expression: '  ' } },
				undefined,
			),
		).toBe(false);
		expect(
			awaitingConnectionBinding({ location: { type: 'VALUE', value: '' } }, undefined),
		).toBe(false);
	});

	it('does not wait while getData supplies the fallback value for a null binding', () => {
		// getData hands the component the property's own value while the binding gives null or
		// undefined, so what arrives here is that value, and there is a connection to start on.
		expect(
			awaitingConnectionBinding(
				{
					value: 'exotelConnection',
					location: { type: 'EXPRESSION', expression: 'Store.selectedConnection' },
				},
				'exotelConnection',
			),
		).toBe(false);
	});

	it('waits on a binding that gives an empty string, fallback value or not', () => {
		// '' is not null to getData, so it returns the '' and never the fallback: the component
		// has no connection to start on, and the binding has not named one.
		expect(
			awaitingConnectionBinding(
				{
					value: 'exotelConnection',
					location: { type: 'EXPRESSION', expression: 'Store.selectedConnection' },
				},
				'',
			),
		).toBe(true);
	});
});

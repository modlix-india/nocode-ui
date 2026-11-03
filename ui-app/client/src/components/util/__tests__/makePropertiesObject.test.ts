import { TokenValueExtractor } from '@fincity/kirun-js';
import { makePropertiesObject } from '../make';

class Extractor extends TokenValueExtractor {
	constructor(
		private readonly obj: any,
		private readonly prefix: string,
	) {
		super();
	}
	protected getValueInternal(token: string): any {
		return this.retrieveElementFrom(token, TokenValueExtractor.splitPath(token), 1, this.obj);
	}
	getPrefix(): string {
		return this.prefix;
	}
	getStore(): any {
		return this.obj;
	}
}

test('one property that will not evaluate falls back to its default; the others still resolve', () => {
	const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
	// A number where the expression expects a string: `.length` throws in KIRun.
	const page = new Extractor({ incoming: { customerPhone: 919108489008, dealName: 'Asha' } }, 'Page.');
	const props = makePropertiesObject(
		[
			{ name: 'text', defaultValue: '' } as any,
			{ name: 'label', defaultValue: 'x' } as any,
		],
		{
			text: {
				location: {
					type: 'EXPRESSION',
					expression: "Page.incoming.customerPhone.length = 13 ? 'a' : 'b'",
				},
				value: 'fallback',
			},
			label: { location: { type: 'EXPRESSION', expression: 'Page.incoming.dealName' } },
		},
		[],
		[page],
	);
	expect(props.text).toBe('');
	expect(props.label).toBe('Asha');
	expect(spy).toHaveBeenCalled();
	spy.mockRestore();
});

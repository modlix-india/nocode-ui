import { deepEqual } from '@fincity/kirun-js';
import { createNewState } from '../commons';
import { PageStoreExtractor, setData } from '../../../../context/StoreContext';

const PAGE = 'bpForgetPassword';

/** The OTP boxes: "Invalid OTP" shows when the page writes isInvalidOtp after a failed verify. */
const definition: any = {
	key: 'otp',
	type: 'Otp',
	properties: {
		validation: {
			invalid: {
				key: 'invalid',
				order: 1,
				property: {
					value: {
						type: 'BOOLEAN_CONDITION',
						condition: {
							value: true,
							location: {
								type: 'EXPRESSION',
								expression:
									'Page.isInvalidOtp != undefined and Page.isInvalidOtp = true',
							},
						},
						message: { value: 'Invalid OTP' },
					},
				},
			},
		},
	},
	bindingPath: { type: 'VALUE', value: 'Page.otp' },
};

const propertyDefs: any = [
	{ name: 'validation', multiValued: true, editor: 'VALIDATION', schema: { name: 'validation' } },
];

function state() {
	const pe = PageStoreExtractor.getForContext(PAGE);
	return createNewState(definition, propertyDefs, {} as any, [], [pe as any]);
}

beforeEach(() => {
	setData(`Store.pageData.${PAGE}.otp`, '123456');
	setData(`Store.pageData.${PAGE}.isInvalidOtp`, false);
});

describe('a validation rule gated on the store', () => {
	// The bug: the rule reaches the component unevaluated, so the resolved state
	// did not change when the page wrote isInvalidOtp, the render was skipped
	// and the component never re-ran its validation. "Invalid OTP" never showed.
	it('produces a different state when its condition flips', () => {
		const before = state();
		setData(`Store.pageData.${PAGE}.isInvalidOtp`, true);
		const after = state();

		expect(deepEqual(before, after)).toBe(false);
		expect(after.validationState).toContain('invalid.condition=true');
	});

	it('stays equal when nothing the rule reads changed', () => {
		expect(deepEqual(state(), state())).toBe(true);
	});

	it('stays equal when only an unrelated store value changes', () => {
		const before = state();
		setData(`Store.pageData.${PAGE}.somethingElse`, 'x');
		expect(deepEqual(before, state())).toBe(true);
	});
});

describe('components without validation', () => {
	it('carries no validation state', () => {
		const plain: any = { ...definition, properties: {} };
		const pe = PageStoreExtractor.getForContext(PAGE);
		expect(
			createNewState(plain, propertyDefs, {} as any, [], [pe as any]).validationState,
		).toBeUndefined();
	});
});

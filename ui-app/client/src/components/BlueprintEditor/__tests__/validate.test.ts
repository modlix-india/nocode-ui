import {
	validateBlueprint,
	mintUid,
	nextOrder,
	orderBetween,
	UID_PATTERN,
	ORDER_GAP,
} from '../validate';

describe('validateBlueprint — arrays', () => {
	// The rule the whole schema is shaped around, and the one that fails
	// silently in production if it is broken.
	it('refuses an array at the top level', () => {
		// Reported as "not an object" rather than "no arrays": at the root the
		// shape is simply wrong, and that says so more plainly.
		expect(validateBlueprint([])[0].message).toMatch(/must be an object/);
	});

	it('refuses an array nested deep inside a plan', () => {
		const issues = validateBlueprint({
			plan: { objects: { aOne: { order: 1000, tags: ['x', 'y'] } } },
		});
		expect(issues).toHaveLength(1);
		expect(issues[0].path).toBe('plan.objects.aOne.tags');
		expect(issues[0].message).toMatch(/uid-keyed map with an order integer/);
	});

	it('accepts the keyed-map shape that replaces an array', () => {
		expect(
			validateBlueprint({
				plan: {
					objects: {
						aOne: { order: 1000, kind: 'page', name: 'home' },
						bTwo: { order: 2000, kind: 'page', name: 'about' },
					},
				},
			}),
		).toEqual([]);
	});
});

describe('validateBlueprint — key charset', () => {
	it('refuses a key with a dot, which would nest instead of address', () => {
		const issues = validateBlueprint({ plan: { sections: { 'a.b': { order: 1000 } } } });
		expect(issues[0].message).toMatch(/dot nests/);
	});

	it('refuses a key with a hyphen, which is read as subtraction', () => {
		const issues = validateBlueprint({ plan: { sections: { 'a-b': { order: 1000 } } } });
		expect(issues[0].path).toBe('plan.sections.a-b');
	});

	it('refuses a leading digit', () => {
		// shortUUID is base62 with digits leading its alphabet, so about one key
		// in six would land here if we used it unmodified.
		const issues = validateBlueprint({ plan: { sections: { '7abc': { order: 1000 } } } });
		expect(issues).toHaveLength(1);
	});

	it('leaves reserved schema keys alone', () => {
		expect(
			validateBlueprint({
				schemaVersion: 1,
				intent: 'x',
				plan: { role: 'landing', layout: 'L3' },
			}),
		).toEqual([]);
	});

	it('only polices keys of maps that are actually uid-keyed', () => {
		// brand.palette keys are colour role names, not minted uids.
		expect(
			validateBlueprint({ plan: { brand: { palette: { 'primary-ink': '#000' } } } }),
		).toEqual([]);
	});
});

describe('validateBlueprint — order', () => {
	it('refuses a non-integer order', () => {
		const issues = validateBlueprint({ plan: { sections: { aOne: { order: 1.5 } } } });
		expect(issues[0].message).toMatch(/must be an integer/);
	});

	it('reports every issue rather than stopping at the first', () => {
		const issues = validateBlueprint({
			plan: { sections: { 'a-b': { order: 'x', list: [] } } },
		});
		expect(issues.length).toBeGreaterThanOrEqual(3);
	});
});

describe('validateBlueprint — size', () => {
	it('refuses rather than truncates, because a shortened plan is worse than none', () => {
		const big: any = { plan: { sections: {} } };
		for (let i = 0; i < 4000; i++) {
			big.plan.sections[`k${i}`] = { order: i * 1000, purpose: 'x'.repeat(80) };
		}
		const issues = validateBlueprint(big);
		expect(issues.some(i => /budget/.test(i.message))).toBe(true);
	});
});

describe('validateBlueprint — nothing to check', () => {
	it('treats null and undefined as no plan recorded, not as an error', () => {
		expect(validateBlueprint(null)).toEqual([]);
		expect(validateBlueprint(undefined)).toEqual([]);
	});
});

describe('mintUid', () => {
	it('always produces a key the validator accepts', () => {
		for (let i = 0; i < 500; i++) {
			const uid = mintUid();
			expect(UID_PATTERN.test(uid)).toBe(true);
			expect(uid[0]).toMatch(/[a-z]/);
		}
	});
});

describe('order helpers', () => {
	it('starts at the gap and steps by it', () => {
		expect(nextOrder(undefined)).toBe(ORDER_GAP);
		expect(nextOrder({})).toBe(ORDER_GAP);
		expect(nextOrder({ a: { order: 1000 }, b: { order: 3000 } })).toBe(4000);
	});

	it('inserts between two neighbours in one write', () => {
		expect(orderBetween(1000, 2000)).toBe(1500);
		expect(orderBetween(undefined, 1000)).toBe(500);
		expect(orderBetween(2000, undefined)).toBe(3000);
	});

	it('says when there is no room, rather than colliding silently', () => {
		expect(orderBetween(1000, 1001)).toBeNull();
		expect(orderBetween(1000, 1000)).toBeNull();
	});
});

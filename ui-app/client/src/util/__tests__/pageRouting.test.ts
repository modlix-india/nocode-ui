import {
	experimentTagFor,
	PageRouting,
	PageRouteRequest,
	classifyDevice,
	parseCookieHeader,
	parseRouteAssignments,
	routeQueryFields,
	resolvePageRoute,
	serializeRouteAssignments,
} from '../pageRouting';

/** A random that hands back a fixed sequence, so every draw in a test is pinned. */
const pinned = (...values: Array<number>) => {
	let i = 0;
	return () => values[Math.min(i++, values.length - 1)];
};

const req = (r: Partial<PageRouteRequest> = {}): PageRouteRequest => ({ pageName: 'pricing', ...r });

describe('resolvePageRoute — the requested name', () => {
	it('returns the requested page when there is no routing at all', () => {
		expect(resolvePageRoute(undefined, undefined, req()).pageName).toBe('pricing');
		expect(resolvePageRoute({}, undefined, req()).pageName).toBe('pricing');
	});

	it('substitutes the default page for an empty name and for `index`', () => {
		expect(resolvePageRoute({}, 'home', req({ pageName: '' })).pageName).toBe('home');
		expect(resolvePageRoute({}, 'home', req({ pageName: 'index' })).pageName).toBe('home');
		expect(resolvePageRoute({}, 'home', req({ pageName: undefined })).pageName).toBe('home');
	});

	it('leaves the name alone when there is no default page to substitute', () => {
		expect(resolvePageRoute({}, undefined, req({ pageName: '' })).pageName).toBe('');
	});
});

const campaignRoute = (target: string): PageRouting => ({
	pricing: {
		rules: {
			r1: {
				type: 'PERSONALIZATION',
				page: target,
				conditions: {
					c1: { source: 'QUERY', field: 'utm_campaign', operator: 'EQUALS', value: 'dentists' },
				},
			},
		},
	},
});

describe('resolvePageRoute — routing outranks the page name', () => {
	it('routes even though a page of the requested name exists', () => {
		const result = resolvePageRoute(campaignRoute('pricing_dentists'), undefined, req({
			query: { utm_campaign: 'dentists' },
		}));
		expect(result.pageName).toBe('pricing_dentists');
		expect(result.routeKey).toBe('pricing');
		expect(result.ruleKey).toBe('r1');
	});

	it('falls back to the requested name when no rule matches', () => {
		const result = resolvePageRoute(campaignRoute('pricing_dentists'), undefined, req({
			query: { utm_campaign: 'clinics' },
		}));
		expect(result.pageName).toBe('pricing');
		expect(result.routeKey).toBeUndefined();
	});

	it('serves a route that has no page of its own', () => {
		const routing: PageRouting = {
			'summer-offer': {
				rules: { r1: { type: 'SPLIT', variants: { a: { page: 'offer_a' } } } },
			},
		};
		expect(resolvePageRoute(routing, undefined, req({ pageName: 'summer-offer' })).pageName).toBe(
			'offer_a',
		);
	});

	it('applies a route keyed by the default page, so the home page can be personalized', () => {
		const routing: PageRouting = {
			home: {
				rules: {
					r1: {
						type: 'PERSONALIZATION',
						page: 'home_in',
						conditions: { c1: { source: 'GEO', operator: 'EQUALS', value: 'IN' } },
					},
				},
			},
		};
		const result = resolvePageRoute(routing, 'home', req({ pageName: 'index', country: 'IN' }));
		expect(result.pageName).toBe('home_in');
		expect(result.routeKey).toBe('home');
	});

	it('resolves a single hop — the page a rule selects is never itself routed', () => {
		const routing: PageRouting = {
			pricing: {
				rules: {
					r1: {
						type: 'PERSONALIZATION',
						page: 'pricing_b',
						conditions: { c1: { source: 'QUERY', field: 'x', operator: 'EXISTS' } },
					},
				},
			},
			// If resolution chained, this would take pricing_b on to pricing_c.
			pricing_b: {
				rules: {
					r1: {
						type: 'PERSONALIZATION',
						page: 'pricing_c',
						conditions: { c1: { source: 'QUERY', field: 'x', operator: 'EXISTS' } },
					},
				},
			},
		};
		expect(resolvePageRoute(routing, undefined, req({ query: { x: '1' } })).pageName).toBe('pricing_b');
	});
});

describe('resolvePageRoute — rule selection', () => {
	const twoRules = (orderA: number, orderB: number): PageRouting => ({
		pricing: {
			rules: {
				zzz: {
					order: orderA,
					type: 'PERSONALIZATION',
					page: 'page_a',
					conditions: { c: { source: 'QUERY', field: 'x', operator: 'EXISTS' } },
				},
				aaa: {
					order: orderB,
					type: 'PERSONALIZATION',
					page: 'page_b',
					conditions: { c: { source: 'QUERY', field: 'x', operator: 'EXISTS' } },
				},
			},
		},
	});

	it('takes the first rule by `order`, not by map key', () => {
		expect(resolvePageRoute(twoRules(1, 0), undefined, req({ query: { x: '1' } })).pageName).toBe(
			'page_b',
		);
		expect(resolvePageRoute(twoRules(0, 1), undefined, req({ query: { x: '1' } })).pageName).toBe(
			'page_a',
		);
	});

	it('keeps written order when no rule carries one', () => {
		const routing: PageRouting = {
			pricing: {
				rules: {
					first: {
						type: 'PERSONALIZATION',
						page: 'page_a',
						conditions: { c: { source: 'QUERY', field: 'x', operator: 'EXISTS' } },
					},
					second: {
						type: 'PERSONALIZATION',
						page: 'page_b',
						conditions: { c: { source: 'QUERY', field: 'x', operator: 'EXISTS' } },
					},
				},
			},
		};
		expect(resolvePageRoute(routing, undefined, req({ query: { x: '1' } })).pageName).toBe('page_a');
	});

	it('skips a disabled rule and a disabled route', () => {
		const routing = campaignRoute('pricing_dentists');
		routing.pricing.rules!.r1.enabled = false;
		expect(
			resolvePageRoute(routing, undefined, req({ query: { utm_campaign: 'dentists' } })).pageName,
		).toBe('pricing');

		const disabledRoute = campaignRoute('pricing_dentists');
		disabledRoute.pricing.enabled = false;
		expect(
			resolvePageRoute(disabledRoute, undefined, req({ query: { utm_campaign: 'dentists' } }))
				.pageName,
		).toBe('pricing');
	});

	it('never matches a personalization rule that has no conditions yet', () => {
		const routing: PageRouting = {
			pricing: { rules: { r1: { type: 'PERSONALIZATION', page: 'pricing_b' } } },
		};
		expect(resolvePageRoute(routing, undefined, req()).pageName).toBe('pricing');
	});

	it('ignores a personalization rule with conditions but no target page', () => {
		const routing: PageRouting = {
			pricing: {
				rules: {
					r1: {
						type: 'PERSONALIZATION',
						conditions: { c: { source: 'QUERY', field: 'x', operator: 'EXISTS' } },
					},
				},
			},
		};
		expect(resolvePageRoute(routing, undefined, req({ query: { x: '1' } })).pageName).toBe('pricing');
	});

	it('requires every condition under ALL and one under ANY', () => {
		const build = (conditionMatch: 'ALL' | 'ANY'): PageRouting => ({
			pricing: {
				rules: {
					r1: {
						type: 'PERSONALIZATION',
						page: 'pricing_b',
						conditionMatch,
						conditions: {
							c1: { source: 'QUERY', field: 'a', operator: 'EQUALS', value: '1' },
							c2: { source: 'QUERY', field: 'b', operator: 'EQUALS', value: '2' },
						},
					},
				},
			},
		});

		const half = req({ query: { a: '1' } });
		expect(resolvePageRoute(build('ALL'), undefined, half).pageName).toBe('pricing');
		expect(resolvePageRoute(build('ANY'), undefined, half).pageName).toBe('pricing_b');

		const both = req({ query: { a: '1', b: '2' } });
		expect(resolvePageRoute(build('ALL'), undefined, both).pageName).toBe('pricing_b');
	});
});

describe('conditions', () => {
	const match = (condition: any, request: Partial<PageRouteRequest>) =>
		resolvePageRoute(
			{ pricing: { rules: { r1: { type: 'PERSONALIZATION', page: 'hit', conditions: { c: condition } } } } },
			undefined,
			req(request),
		).pageName === 'hit';

	it('compares query values, folding case unless told not to', () => {
		expect(match({ source: 'QUERY', field: 'c', operator: 'EQUALS', value: 'Dentists' }, { query: { c: 'dentists' } })).toBe(true);
		expect(
			match(
				{ source: 'QUERY', field: 'c', operator: 'EQUALS', value: 'Dentists', caseSensitive: true },
				{ query: { c: 'dentists' } },
			),
		).toBe(false);
	});

	it('lower-cases the header field name rather than trusting the author', () => {
		expect(
			match({ source: 'HEADER', field: 'Referer', operator: 'CONTAINS', value: 'google' }, {
				headers: { referer: 'https://www.google.com/' },
			}),
		).toBe(true);
	});

	it('reads cookies, device and country', () => {
		expect(match({ source: 'COOKIE', field: 'plan', operator: 'EQUALS', value: 'pro' }, { cookies: { plan: 'pro' } })).toBe(true);
		expect(match({ source: 'DEVICE', operator: 'EQUALS', value: 'MOBILE' }, { device: 'MOBILE' })).toBe(true);
		expect(match({ source: 'GEO', operator: 'IN', value: 'IN, LK, BD' }, { country: 'LK' })).toBe(true);
	});

	it('renders AUTH as a string, and distinguishes anonymous from undetermined', () => {
		expect(match({ source: 'AUTH', operator: 'EQUALS', value: 'true' }, { authenticated: true })).toBe(true);
		expect(match({ source: 'AUTH', operator: 'EQUALS', value: 'false' }, { authenticated: false })).toBe(true);
		expect(match({ source: 'AUTH', operator: 'EXISTS' }, { authenticated: false })).toBe(true);
		expect(match({ source: 'AUTH', operator: 'EXISTS' }, {})).toBe(false);
	});

	it('treats an empty string as absent', () => {
		expect(match({ source: 'QUERY', field: 'c', operator: 'EXISTS' }, { query: { c: '' } })).toBe(false);
		expect(match({ source: 'QUERY', field: 'c', operator: 'NOT_EXISTS' }, { query: { c: '' } })).toBe(true);
	});

	it('satisfies only the negative operators when the value is missing', () => {
		expect(match({ source: 'QUERY', field: 'c', operator: 'NOT_EQUALS', value: 'x' }, {})).toBe(true);
		expect(match({ source: 'QUERY', field: 'c', operator: 'NOT_CONTAINS', value: 'x' }, {})).toBe(true);
		expect(match({ source: 'QUERY', field: 'c', operator: 'NOT_IN', value: 'x,y' }, {})).toBe(true);
		expect(match({ source: 'QUERY', field: 'c', operator: 'EQUALS', value: 'x' }, {})).toBe(false);
		expect(match({ source: 'QUERY', field: 'c', operator: 'CONTAINS', value: 'x' }, {})).toBe(false);
		expect(match({ source: 'QUERY', field: 'c', operator: 'STARTS_WITH', value: 'x' }, {})).toBe(false);
	});

	it('supports the string operators', () => {
		const q = { query: { c: 'summer-sale-2026' } };
		expect(match({ source: 'QUERY', field: 'c', operator: 'CONTAINS', value: 'sale' }, q)).toBe(true);
		expect(match({ source: 'QUERY', field: 'c', operator: 'STARTS_WITH', value: 'summer' }, q)).toBe(true);
		expect(match({ source: 'QUERY', field: 'c', operator: 'ENDS_WITH', value: '2026' }, q)).toBe(true);
		expect(match({ source: 'QUERY', field: 'c', operator: 'NOT_CONTAINS', value: 'winter' }, q)).toBe(true);
	});

	it('takes IN values from a list or a comma-separated string, trimming', () => {
		expect(match({ source: 'QUERY', field: 'c', operator: 'IN', values: ['a', 'b'] }, { query: { c: 'b' } })).toBe(true);
		expect(match({ source: 'QUERY', field: 'c', operator: 'IN', value: 'a , b' }, { query: { c: 'b' } })).toBe(true);
		expect(match({ source: 'QUERY', field: 'c', operator: 'NOT_IN', value: 'a,b' }, { query: { c: 'c' } })).toBe(true);
	});

	it('matches a regular expression, case-insensitively by default', () => {
		expect(match({ source: 'QUERY', field: 'c', operator: 'MATCHES', value: '^dent' }, { query: { c: 'Dentists' } })).toBe(true);
		expect(
			match({ source: 'QUERY', field: 'c', operator: 'MATCHES', value: '^dent', caseSensitive: true }, { query: { c: 'Dentists' } }),
		).toBe(false);
	});

	it('does not throw on an unparseable pattern — it must not take the page down', () => {
		expect(() => match({ source: 'QUERY', field: 'c', operator: 'MATCHES', value: '([' }, { query: { c: 'x' } })).not.toThrow();
		expect(match({ source: 'QUERY', field: 'c', operator: 'MATCHES', value: '([' }, { query: { c: 'x' } })).toBe(false);
	});

	it('refuses an over-long pattern', () => {
		expect(match({ source: 'QUERY', field: 'c', operator: 'MATCHES', value: 'x'.repeat(513) }, { query: { c: 'x'.repeat(513) } })).toBe(false);
	});

	it('does not match a field-less QUERY, HEADER or COOKIE condition', () => {
		expect(match({ source: 'QUERY', operator: 'EXISTS' }, { query: { c: '1' } })).toBe(false);
		expect(match({ source: 'COOKIE', operator: 'EXISTS' }, { cookies: { c: '1' } })).toBe(false);
	});
});

const split = (variants: any, extra: any = {}): PageRouting => ({
	pricing: { rules: { exp1: { type: 'SPLIT', variants, ...extra } } },
});

describe('splits', () => {
	const threeWay = {
		a: { page: 'pricing', weight: 50, order: 0 },
		b: { page: 'pricing_b', weight: 30, order: 1 },
		c: { page: 'pricing_c', weight: 20, order: 2 },
	};

	it('draws by weight across any number of arms', () => {
		const at = (r: number) => resolvePageRoute(split(threeWay), undefined, req(), { random: pinned(r) });

		expect(at(0).pageName).toBe('pricing');
		expect(at(0.49).pageName).toBe('pricing');
		expect(at(0.5).pageName).toBe('pricing_b');
		expect(at(0.79).pageName).toBe('pricing_b');
		expect(at(0.8).pageName).toBe('pricing_c');
		expect(at(0.999).pageName).toBe('pricing_c');
	});

	it('reports the arm it drew so the caller can store it', () => {
		const result = resolvePageRoute(split(threeWay), undefined, req(), { random: pinned(0.6) });
		expect(result.variantKey).toBe('b');
		expect(result.newAssignment).toEqual({ ruleKey: 'exp1', variantKey: 'b' });
	});

	it('treats a missing weight as 1 and drops zero or negative ones', () => {
		const routing = split({ a: { page: 'page_a', order: 0 }, b: { page: 'page_b', order: 1 } });
		expect(resolvePageRoute(routing, undefined, req(), { random: pinned(0.4) }).pageName).toBe('page_a');
		expect(resolvePageRoute(routing, undefined, req(), { random: pinned(0.6) }).pageName).toBe('page_b');

		const zeroed = split({ a: { page: 'page_a', weight: 0, order: 0 }, b: { page: 'page_b', weight: 5, order: 1 } });
		expect(resolvePageRoute(zeroed, undefined, req(), { random: pinned(0) }).pageName).toBe('page_b');
	});

	it('does not draw when the visitor already holds an assignment, and writes nothing', () => {
		const result = resolvePageRoute(split(threeWay), undefined, req({ assignments: { exp1: 'c' } }), {
			random: pinned(0),
		});
		expect(result.pageName).toBe('pricing_c');
		expect(result.variantKey).toBe('c');
		expect(result.newAssignment).toBeUndefined();
	});

	it('redraws when the stored arm has since been deleted', () => {
		const result = resolvePageRoute(split(threeWay), undefined, req({ assignments: { exp1: 'gone' } }), {
			random: pinned(0),
		});
		expect(result.pageName).toBe('pricing');
		expect(result.newAssignment).toEqual({ ruleKey: 'exp1', variantKey: 'a' });
	});

	it('honours a stored assignment without redrawing, and writes nothing', () => {
		const result = resolvePageRoute(
			split(threeWay),
			undefined,
			req({ assignments: { exp1: 'b' } }),
			{ random: pinned(0) },
		);
		expect(result.pageName).toBe('pricing_b');
		expect(result.newAssignment).toBeUndefined();
	});

	// Consent used to gate the draw, on the reasoning that drawing means storing
	// the assignment. The effect was that a site without a working consent banner
	// -- most of them -- served one arm to everybody for ever and never rendered
	// the second page. Kiran's call 2026-09-20: the split runs for everyone.
	it('draws for a visitor who has refused cookies, exactly as for anyone else', () => {
		const routing = split({
			a: { page: 'pricing', weight: 50, order: 0 },
			b: { page: 'pricing_b', weight: 50, order: 1 },
		});
		expect(resolvePageRoute(routing, undefined, req(), { random: pinned(0.1) }).pageName).toBe('pricing');
		expect(resolvePageRoute(routing, undefined, req(), { random: pinned(0.9) }).pageName).toBe('pricing_b');
	});

	it('records the assignment it drew, so the arm survives the next click', () => {
		const result = resolvePageRoute(split(threeWay), undefined, req(), { random: pinned(0.99) });
		expect(result.newAssignment).toEqual({ ruleKey: 'exp1', variantKey: 'c' });
	});

	it('still does not apply when there is no arm that could be served', () => {
		const result = resolvePageRoute(split({}), undefined, req());
		expect(result.pageName).toBe('pricing');
		expect(result.ruleKey).toBeUndefined();
	});

	it('falls through to a later rule rather than shadowing it', () => {
		const routing: PageRouting = {
			pricing: {
				rules: {
					exp1: { order: 0, type: 'SPLIT', variants: {} },
					r2: {
						order: 1,
						type: 'PERSONALIZATION',
						page: 'pricing_in',
						conditions: { c: { source: 'GEO', operator: 'EQUALS', value: 'IN' } },
					},
				},
			},
		};
		expect(resolvePageRoute(routing, undefined, req({ country: 'IN' })).pageName).toBe('pricing_in');
	});

	it('can be narrowed by conditions, unlike a personalization rule', () => {
		const routing = split(threeWay, {
			conditions: { c: { source: 'DEVICE', operator: 'EQUALS', value: 'MOBILE' } },
		});
		expect(resolvePageRoute(routing, undefined, req({ device: 'DESKTOP' })).pageName).toBe('pricing');
		expect(
			resolvePageRoute(routing, undefined, req({ device: 'MOBILE' }), { random: pinned(0.6) }).pageName,
		).toBe('pricing_b');
	});

	it('stays total when random returns exactly 1', () => {
		expect(resolvePageRoute(split(threeWay), undefined, req(), { random: pinned(1) }).pageName).toBe(
			'pricing_c',
		);
	});

	// A text input writes a string, and several writers reach this document. Left
	// uncoerced the weights summed by concatenation -- '2' and '1' totalled 21 --
	// so the draw ran over a range twenty times too wide and the first arm took
	// almost everything, with the rule reading as correct on screen.
	it('draws correctly when the weights were written as strings', () => {
		const routing = split({
			a: { page: 'page_a', weight: '2' as unknown as number, order: 0 },
			b: { page: 'page_b', weight: '1' as unknown as number, order: 1 },
		});
		const at = (r: number) => resolvePageRoute(routing, undefined, req(), { random: pinned(r) }).pageName;

		expect(at(0)).toBe('page_a');
		expect(at(0.66)).toBe('page_a');
		expect(at(0.67)).toBe('page_b');
		expect(at(0.999)).toBe('page_b');
	});

	it('drops an arm weighted with the string zero, as it does the number', () => {
		const routing = split({
			a: { page: 'page_a', weight: '0' as unknown as number, order: 0 },
			b: { page: 'page_b', weight: '5' as unknown as number, order: 1 },
		});
		expect(resolvePageRoute(routing, undefined, req(), { random: pinned(0) }).pageName).toBe('page_b');
	});

	it('falls back to one for a weight that is not a number at all', () => {
		const routing = split({
			a: { page: 'page_a', weight: 'lots' as unknown as number, order: 0 },
			b: { page: 'page_b', weight: 1, order: 1 },
		});
		expect(resolvePageRoute(routing, undefined, req(), { random: pinned(0.4) }).pageName).toBe('page_a');
		expect(resolvePageRoute(routing, undefined, req(), { random: pinned(0.6) }).pageName).toBe('page_b');
	});

	it('orders arms written with string orders numerically, not as text', () => {
		// '10' sorts before '9' as text, which would put the tenth arm first.
		const routing = split({
			a: { page: 'page_tenth', weight: 1, order: '10' as unknown as number },
			b: { page: 'page_ninth', weight: 1, order: '9' as unknown as number },
		});
		expect(resolvePageRoute(routing, undefined, req(), { random: pinned(0) }).pageName).toBe(
			'page_ninth',
		);
	});
});

describe('assignment cookie', () => {
	it('round-trips', () => {
		const assignments = { exp1: 'b', 'pricing-q4': 'control' };
		expect(parseRouteAssignments(serializeRouteAssignments(assignments))).toEqual(assignments);
	});

	it('yields nothing for absent, malformed or wrongly-shaped values', () => {
		expect(parseRouteAssignments(undefined)).toEqual({});
		expect(parseRouteAssignments('')).toEqual({});
		expect(parseRouteAssignments('not json')).toEqual({});
		expect(parseRouteAssignments('[1,2]')).toEqual({});
		expect(parseRouteAssignments('"a string"')).toEqual({});
		expect(parseRouteAssignments('null')).toEqual({});
	});

	it('drops non-string and empty entries instead of rejecting the whole cookie', () => {
		expect(parseRouteAssignments('{"a":"x","b":2,"c":null,"d":""}')).toEqual({ a: 'x' });
	});

	it('caps how much it will read back', () => {
		const huge: { [key: string]: string } = {};
		for (let i = 0; i < 200; i++) huge[`r${i}`] = 'v';
		expect(Object.keys(parseRouteAssignments(JSON.stringify(huge)))).toHaveLength(50);
	});
});

describe('routeQueryFields', () => {
	it('collects every query field the rules test, once each', () => {
		const routing: PageRouting = {
			pricing: {
				rules: {
					r1: {
						type: 'PERSONALIZATION',
						page: 'x',
						conditions: {
							a: { source: 'QUERY', field: 'utm_campaign', operator: 'EQUALS', value: 'd' },
							b: { source: 'HEADER', field: 'referer', operator: 'CONTAINS', value: 'g' },
							c: { source: 'GEO', operator: 'EQUALS', value: 'IN' },
						},
					},
					r2: {
						type: 'SPLIT',
						conditions: {
							d: { source: 'QUERY', field: 'utm_campaign', operator: 'EXISTS' },
							e: { source: 'QUERY', field: 'utm_source', operator: 'EXISTS' },
						},
					},
				},
			},
		};
		expect(routeQueryFields(routing).sort()).toEqual(['utm_campaign', 'utm_source']);
	});

	it('is empty for no routing, and for rules that test nothing from the query', () => {
		expect(routeQueryFields(undefined)).toEqual([]);
		expect(routeQueryFields({ p: { rules: { r: { type: 'SPLIT' } } } })).toEqual([]);
	});
});

describe('parseCookieHeader', () => {
	it('reads a header into a map, decoding values', () => {
		expect(parseCookieHeader('a=1; b=hello%20world')).toEqual({ a: '1', b: 'hello world' });
	});

	it('keeps the first occurrence of a repeated name', () => {
		expect(parseCookieHeader('a=first; a=second')).toEqual({ a: 'first' });
	});

	it('keeps everything after the first = , so a JSON value survives', () => {
		expect(parseCookieHeader('v=%7B%22exp1%22%3A%22b%22%7D')).toEqual({ v: '{"exp1":"b"}' });
		expect(parseCookieHeader('a=x=y')).toEqual({ a: 'x=y' });
	});

	it('survives a malformed escape rather than losing the header', () => {
		expect(parseCookieHeader('a=%E0%A4%A; b=2')).toEqual({ a: '%E0%A4%A', b: '2' });
	});

	it('ignores empty segments and valueless names', () => {
		expect(parseCookieHeader('')).toEqual({});
		expect(parseCookieHeader(undefined)).toEqual({});
		expect(parseCookieHeader('; ; a=1; novalue; =orphan')).toEqual({ a: '1' });
	});
});

describe('classifyDevice', () => {
	it('calls an Android tablet a tablet, since it also matches the phone patterns', () => {
		expect(
			classifyDevice('Mozilla/5.0 (Linux; Android 13; SM-X710) AppleWebKit/537.36 Safari/537.36'),
		).toBe('TABLET');
		expect(classifyDevice('Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) Safari/605.1.15')).toBe('TABLET');
	});

	it('recognises phones', () => {
		expect(classifyDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Safari/604.1')).toBe('MOBILE');
		expect(
			classifyDevice('Mozilla/5.0 (Linux; Android 13; Pixel 7) Mobile Safari/537.36'),
		).toBe('MOBILE');
	});

	it('falls back to desktop, and says nothing without a user agent', () => {
		expect(classifyDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15')).toBe('DESKTOP');
		expect(classifyDevice(undefined)).toBeUndefined();
		expect(classifyDevice('')).toBeUndefined();
	});
});

describe('experimentTagFor', () => {
	it('names the rule by key, which a rename cannot move', () => {
		const tag = experimentTagFor({ pageName: 'homeTwo', ruleKey: 'exp1', variantKey: 'b' });
		expect(tag).toEqual({ experiment: 'exp1', variant: 'exp1:homeTwo' });
	});

	it('carries the experiment inside the variant, so two tests never collide', () => {
		const a = experimentTagFor({ pageName: 'shared', ruleKey: 'expA', variantKey: 'x' });
		const b = experimentTagFor({ pageName: 'shared', ruleKey: 'expB', variantKey: 'y' });
		expect(a!.variant).not.toBe(b!.variant);
	});

	it('is nothing for a personalization rule, which has no arm to compare', () => {
		expect(experimentTagFor({ pageName: 'home_member', ruleKey: 'm' })).toBeUndefined();
	});

	it('is nothing when no rule applied, and nothing for no resolution at all', () => {
		expect(experimentTagFor({ pageName: 'home' })).toBeUndefined();
		expect(experimentTagFor(undefined)).toBeUndefined();
	});
});

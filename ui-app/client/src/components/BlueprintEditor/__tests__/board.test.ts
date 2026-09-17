import { buildBoard, sectionsOf, readableName, tileDate } from '../board';
import { ComponentDefinition } from '../../../types/common';

/** A page shaped the way the platform stores one: a root whose children are the sections. */
function page(name: string, sections: Array<Partial<ComponentDefinition>>, blueprint?: any) {
	const componentDefinition: { [k: string]: ComponentDefinition } = {
		root: { key: 'root', name: 'root', type: 'Grid', children: {} },
	};
	sections.forEach((s, i) => {
		const key = s.key ?? `c${i}`;
		componentDefinition.root.children![key] = true;
		componentDefinition[key] = {
			key,
			name: s.name ?? key,
			type: s.type ?? 'Grid',
			displayOrder: s.displayOrder ?? i,
		};
	});
	return { name, rootComponent: 'root', componentDefinition, blueprint };
}

describe('sectionsOf', () => {
	it("returns the root's direct children in display order", () => {
		const p = page('home', [
			{ key: 'b', name: 'Second', displayOrder: 2 },
			{ key: 'a', name: 'First', displayOrder: 1 },
		]);
		expect(sectionsOf(p).map(d => d.name)).toEqual(['First', 'Second']);
	});

	it('is empty rather than throwing when a page has no root or no children', () => {
		expect(sectionsOf({})).toEqual([]);
		expect(sectionsOf({ rootComponent: 'missing', componentDefinition: {} })).toEqual([]);
	});

	it('ignores a child switched off', () => {
		const p = page('home', [{ key: 'a', name: 'Kept' }]);
		p.componentDefinition.root.children!['ghost'] = false;
		expect(sectionsOf(p)).toHaveLength(1);
	});
});

describe('readableName', () => {
	it('keeps a name somebody chose', () => {
		expect(readableName({ key: 'k', name: 'Hero', type: 'Grid' }, 0)).toBe('Hero');
	});

	it('falls back to the type when the name says nothing', () => {
		// Deliberately dumb. Naming a section properly is a derivation, which
		// costs tokens and is therefore explicit, never automatic.
		expect(readableName({ key: 'k', name: 'Grid', type: 'Grid' }, 0)).toBe('Grid 1');
		expect(readableName({ key: 'k', name: '_grid3', type: 'Grid' }, 4)).toBe('Grid 5');
		expect(readableName({ key: 'k', name: '', type: 'Text' }, 1)).toBe('Text 2');
		expect(readableName({ key: 'abc', name: 'abc', type: 'Grid' }, 0)).toBe('Grid 1');
	});
});

describe('buildBoard with NO blueprint anywhere', () => {
	// This is the day-one case for every existing site, so it is the first test.
	const model = buildBoard({
		appName: 'Northside Dental',
		pages: [
			page('home', [
				{ key: 'nav', name: 'Nav' },
				{ key: 'hero', name: 'Hero' },
				{ key: 'foot', name: 'Footer' },
			]),
			page('contact', [{ key: 'form', name: 'Form' }]),
		],
		storages: [{ name: 'Enquiry', schema: { properties: { phone: {}, day: {} } } }],
	});

	it('still renders a board', () => {
		expect(model.bands.map(b => b.kind)).toEqual(['page', 'storage']);
		expect(model.bands[0].columns.map(c => c.title)).toEqual(['home', 'contact']);
	});

	it('titles cards from the definition and leaves the second line empty', () => {
		const home = model.bands[0].columns[0];
		expect(home.cards.map(c => c.title)).toEqual(['Nav', 'Hero', 'Footer']);
		expect(home.cards.every(c => c.description === '')).toBe(true);
		expect(home.cards.every(c => c.unplanned)).toBe(true);
		expect(home.cards.every(c => c.status === 'none')).toBe(true);
	});

	it('marks nav and footer as chrome, and nothing else', () => {
		const home = model.bands[0].columns[0];
		expect(home.cards.filter(c => c.chrome).map(c => c.title)).toEqual(['Nav', 'Footer']);
	});

	it('turns a storage schema into field cards', () => {
		expect(model.bands[1].columns[0].cards.map(c => c.title)).toEqual(['phone', 'day']);
	});

	it('reports that the app has no plan, so the offer can be shown', () => {
		expect(model.unplannedApp).toBe(true);
		expect(model.features).toEqual([]);
	});
});

describe('buildBoard with a blueprint', () => {
	const appBlueprint = {
		plan: {
			title: 'Northside Dental',
			intent: 'Six pages whose only job is a booked consultation.',
			features: { fbl: { order: 1000, name: 'Blog', intent: 'Show we know our stuff.' } },
			objects: {
				pHome: { order: 1000, kind: 'page', name: 'home', purpose: 'Convert a stranger' },
				pGone: { order: 2000, kind: 'page', name: 'careers', purpose: 'Hiring' },
			},
		},
	};
	const pageBlueprint = {
		plan: {
			sections: {
				kHero: {
					order: 1000,
					name: 'Hero',
					purpose: 'Get them to the form without scrolling twice',
					componentKey: 'hero',
					feature: 'fbl',
				},
				kGhost: { order: 5000, name: 'Testimonials', describes: 'Three quotes' },
			},
		},
	};
	const model = buildBoard({
		appBlueprint,
		pages: [page('home', [{ key: 'hero', name: 'Grid' }], pageBlueprint)],
	});
	const home = model.bands[0].columns.find(c => c.name === 'home')!;

	it('takes the column heading and purpose from the app plan index', () => {
		expect(model.title).toBe('Northside Dental');
		expect(home.purpose).toBe('Convert a stranger');
	});

	it('lets the plan name a card the definition called Grid', () => {
		const hero = home.cards.find(c => c.componentKey === 'hero')!;
		expect(hero.title).toBe('Hero');
		expect(hero.description).toBe('Get them to the form without scrolling twice');
		expect(hero.stated).toBe(true);
		expect(hero.unplanned).toBe(false);
	});

	it('shows a planned section that nothing is built for, as pending', () => {
		const ghost = home.cards.find(c => c.uid === 'kGhost')!;
		expect(ghost.status).toBe('pending');
		expect(ghost.componentKey).toBeUndefined();
		// describes is used only when nobody has stated a purpose
		expect(ghost.description).toBe('Three quotes');
		expect(ghost.stated).toBe(false);
	});

	it('shows a planned PAGE that does not exist, so it is not forgotten', () => {
		const careers = model.bands[0].columns.find(c => c.name === 'careers')!;
		expect(careers.planned).toBe(true);
		expect(careers.cards).toEqual([]);
	});

	it('counts what each feature claims, for the lens', () => {
		expect(model.features).toEqual([
			{ uid: 'fbl', name: 'Blog', intent: 'Show we know our stuff.', count: 1 },
		]);
	});

	it('prefers a stated purpose over a derived description', () => {
		const m = buildBoard({
			pages: [
				page('p', [{ key: 'k', name: 'X' }], {
					plan: {
						sections: {
							u: {
								order: 1000,
								componentKey: 'k',
								purpose: 'Stated',
								describes: 'Derived',
							},
						},
					},
				}),
			],
		});
		expect(m.bands[0].columns[0].cards[0].description).toBe('Stated');
		expect(m.bands[0].columns[0].cards[0].stated).toBe(true);
	});
});

describe('buildBoard status', () => {
	/** A page whose plan claims component `k`, with the two fingerprints set. */
	function planned(agreed?: number, live?: number) {
		const p: any = page('p', [{ key: 'k', name: 'X' }], {
			reconciled: agreed === undefined ? {} : { u: agreed },
			plan: { sections: { u: { order: 1000, componentKey: 'k' } } },
		});
		if (live !== undefined) p.componentVersions = { k: live };
		return p;
	}

	it('is clean while the plan and the definition agree', () => {
		expect(buildBoard({ pages: [planned(3, 3)] }).bands[0].columns[0].cards[0].status).toBe(
			'clean',
		);
	});

	it('is drifted once the section is edited past the version the plan agreed at', () => {
		// Resolved by MOVING THE PLAN. Treating this as pending would rebuild over
		// somebody's edit, which is the whole reason the two are never merged.
		expect(buildBoard({ pages: [planned(3, 4)] }).bands[0].columns[0].cards[0].status).toBe(
			'drifted',
		);
	});

	it('is drifted when nothing has ever been reconciled', () => {
		// Needs no fourth word: the definition is what is real either way.
		expect(
			buildBoard({ pages: [planned(undefined, 4)] }).bands[0].columns[0].cards[0].status,
		).toBe('drifted');
	});

	it('is clean on a legacy page that tracks no component versions at all', () => {
		// Marking every card on such a page as edited would be a false alarm on
		// every page written before per-component versioning existed.
		expect(
			buildBoard({ pages: [planned(undefined, undefined)] }).bands[0].columns[0].cards[0]
				.status,
		).toBe('clean');
	});

	it('is pending for a plan entry nothing was built for', () => {
		// The opposite direction: resolved by BUILDING.
		const m = buildBoard({
			pages: [page('p', [], { plan: { sections: { u: { order: 1000 } } } })],
		});
		expect(m.bands[0].columns[0].cards[0].status).toBe('pending');
	});

	it('says nothing about a section no plan entry claims', () => {
		const m = buildBoard({ pages: [page('p', [{ key: 'k', name: 'X' }])] });
		expect(m.bands[0].columns[0].cards[0].status).toBe('none');
	});

	it('lets the host override what it worked out, for kinds with no fingerprint', () => {
		const m = buildBoard({ pages: [planned(3, 3)], status: { u: 'drifted' } });
		expect(m.bands[0].columns[0].cards[0].status).toBe('drifted');
	});
});

describe('buildBoard with lazily loaded detail', () => {
	// The only list route the platform exposes is the LRO projection, which
	// carries names but no componentDefinition. So a column renders from the
	// list first and its cards arrive when it is opened.
	const listOnly = { name: 'home' };

	it('renders a column with no cards from a list row alone', () => {
		const m = buildBoard({ pages: [listOnly] });
		expect(m.bands[0].columns[0].title).toBe('home');
		expect(m.bands[0].columns[0].cards).toEqual([]);
	});

	it('fills the cards in once the detail arrives, without touching the list', () => {
		const m = buildBoard({
			pages: [listOnly],
			loaded: {
				home: {
					rootComponent: 'root',
					componentDefinition: {
						root: { key: 'root', name: 'root', type: 'Grid', children: { a: true } },
						a: { key: 'a', name: 'Hero', type: 'Grid', displayOrder: 0 },
					},
				},
			},
		});
		expect(m.bands[0].columns[0].cards.map(c => c.title)).toEqual(['Hero']);
	});

	it('ignores detail for an object that is not listed', () => {
		const m = buildBoard({
			pages: [listOnly],
			loaded: { somethingElse: { rootComponent: 'r' } },
		});
		expect(m.bands[0].columns).toHaveLength(1);
	});
});

/**
 * The site tiles caption themselves with a date, and the two lists feeding them
 * date things differently. Getting this wrong is not an error anywhere: the
 * caption silently falls back to the app code, which looks like a design choice
 * rather than a bug, which is exactly what happened.
 */
describe('tileDate', () => {
	it('reads the ISO string the recents document stores', () => {
		expect(tileDate('2026-09-17T13:18:43.182+05:30')?.getUTCFullYear()).toBe(2026);
	});

	it('reads epoch SECONDS off a platform row, which is a number', () => {
		// A security application row dates itself this way. As milliseconds this
		// would be January 1970.
		expect(tileDate('1789560982')?.getUTCFullYear()).toBe(2026);
	});

	it('reads epoch milliseconds too', () => {
		expect(tileDate(String(Date.UTC(2026, 8, 17)))?.getUTCFullYear()).toBe(2026);
	});

	it('is undefined for blank and for nonsense, never a guess', () => {
		expect(tileDate('')).toBeUndefined();
		expect(tileDate('   ')).toBeUndefined();
		expect(tileDate('whenever')).toBeUndefined();
	});
});

/**
 * Storage fields, which rendered as bare names for a while.
 *
 * The column was reading a `why` key that nothing writes, so a plan could
 * describe every field of a storage and the board would show none of it. The
 * failure is invisible — a card with no second line looks like a card nobody
 * has described yet — which is exactly why it is pinned here.
 */
describe('storage fields', () => {
	const storage = {
		name: 'Task',
		schema: { properties: { title: {}, status: {} } },
		blueprint: {
			plan: {
				fields: {
					fo1aq2rp: { order: 1000, name: 'title', describes: 'the short line' },
					hol7rtug: { order: 2000, name: 'status', purpose: 'what the baker sorts by' },
				},
			},
		},
	};

	it('shows a derived line against the field it describes', () => {
		const m = buildBoard({ storages: [storage] });
		const cards = m.bands[0].columns[0].cards;
		expect(cards.map(c => c.title)).toEqual(['title', 'status']);
		expect(cards[0].description).toBe('the short line');
		expect(cards[0].stated).toBe(false);
	});

	it('lets a stated purpose outrank a derived line, as a page section does', () => {
		const m = buildBoard({ storages: [storage] });
		const status = m.bands[0].columns[0].cards[1];
		expect(status.description).toBe('what the baker sorts by');
		expect(status.stated).toBe(true);
	});

	it('still lists a field the schema has and the plan does not', () => {
		const m = buildBoard({
			storages: [{ ...storage, schema: { properties: { title: {}, extra: {} } } }],
		});
		const cards = m.bands[0].columns[0].cards;
		const extra = cards.find(c => c.title === 'extra');
		expect(extra?.unplanned).toBe(true);
		expect(extra?.description).toBe('');
	});
});

/**
 * The two bands that are not object kinds.
 *
 * Both are in the mockup and neither was built, and the second is the one that
 * matters: a request a site cannot satisfy has to stay visible with its reason,
 * or the same conversation happens again in three weeks.
 */
describe('the bands that come from the app plan', () => {
	const appBlueprint = {
		plan: {
			delivery: {
				domains: {
					dmn1: {
						order: 1000,
						host: 'crumbco.sitezump.ai',
						purpose: 'Until a real domain points here',
					},
				},
			},
			security: {
				access: { acc1: { order: 1000, who: 'Everyone', purpose: 'A site is public' } },
			},
		},
		decisions: {
			dec1: {
				order: 1000,
				area: 'security',
				choice: 'Customers sign in to see past orders',
				because: 'Accounts and roles make it an application, not a site.',
				status: 'rejected',
			},
			dec2: {
				order: 2000,
				choice: 'Teal and slate',
				because: 'Calm, not clinical',
				status: 'active',
			},
		},
	};

	it('shows where it will live and who can read it', () => {
		const m = buildBoard({ appBlueprint });
		const band = m.bands.find(b => b.kind === 'delivery');
		expect(band?.heading).toBe('When you build it');
		expect(band?.columns.map(c => c.title)).toEqual(['The address', 'Who sees it']);
		expect(band?.columns[0].cards[0].title).toBe('crumbco.sitezump.ai');
	});

	it('keeps a rejected ask on the board with its reason', () => {
		const m = buildBoard({ appBlueprint });
		const band = m.bands.find(b => b.kind === 'boundary');
		expect(band?.columns).toHaveLength(1);
		expect(band?.columns[0].title).toBe('Customers sign in to see past orders');
		expect(band?.columns[0].cards[0].description).toContain('not a site');
	});

	it('leaves decisions that were KEPT off that band', () => {
		// Every decision on the board would make it a changelog. Only the ones
		// somebody was told no about belong at the foot of the plan.
		const m = buildBoard({ appBlueprint });
		const band = m.bands.find(b => b.kind === 'boundary');
		expect(band?.columns.map(c => c.title)).not.toContain('Teal and slate');
	});

	it('shows neither band when the plan says nothing about either', () => {
		const m = buildBoard({ appBlueprint: { plan: {} } });
		expect(m.bands.find(b => b.kind === 'delivery')).toBeUndefined();
		expect(m.bands.find(b => b.kind === 'boundary')).toBeUndefined();
	});
});

// ── Every kind, not just the two that are easy to picture ────────────────
//
// A board of pages and storages describes a site that does nothing: the
// functions are where the work happens, the uripaths are the addresses other
// systems call, and the templates are what the customer actually receives.
// Those are also the parts nobody can reconstruct by looking at the site.

describe('the kinds beyond pages and storages', () => {
	it('draws a band per kind, in the order the bands stack', () => {
		const m = buildBoard({
			objects: {
				page: [page('home', [])],
				function: [{ name: 'sendEnquiry' }],
				theme: [{ name: 'crumb' }],
			},
		});
		expect(m.bands.map(b => b.kind)).toEqual(['page', 'function', 'theme']);
		expect(m.bands[1].heading).toBe('Work it does on the server');
	});

	it("draws a function's steps as its cards, with no plan and no AI call", () => {
		const m = buildBoard({
			objects: { function: [{ name: 'sendEnquiry' }] },
			loaded: { function: { sendEnquiry: { definition: { steps: { load: {}, mail: {} } } } } },
		});
		const column = m.bands[0].columns[0];
		expect(column.cards.map(c => c.title)).toEqual(['load', 'mail']);
		// Nothing in the plan claims them, which is the ordinary state.
		expect(column.cards.every(c => c.unplanned)).toBe(true);
	});

	it('puts a plan line under the step it describes', () => {
		const m = buildBoard({
			objects: { function: [{ name: 'sendEnquiry' }] },
			loaded: {
				function: {
					sendEnquiry: {
						definition: { steps: { mail: {} } },
						blueprint: {
							plan: {
								steps: {
									s1: { order: 1000, step: 'mail', describes: 'sends it on' },
								},
							},
						},
					},
				},
			},
		});
		const card = m.bands[0].columns[0].cards[0];
		expect(card.description).toBe('sends it on');
		expect(card.unplanned).toBe(false);
	});

	it('reads a template by its parts and a notification by its channels', () => {
		const m = buildBoard({
			objects: { template: [{ name: 'welcome' }], notification: [{ name: 'newEnquiry' }] },
			loaded: {
				template: { welcome: { templateParts: { SUBJECT: {}, BODY: {} } } },
				notification: { newEnquiry: { channelDetails: { EMAIL: {} } } },
			},
		});
		expect(m.bands[0].columns[0].cards.map(c => c.title)).toEqual(['SUBJECT', 'BODY']);
		expect(m.bands[1].columns[0].cards.map(c => c.title)).toEqual(['EMAIL']);
	});

	it('does not call a theme entry "not built" when the theme is right there', () => {
		// A theme has no parts to match against — a couple of hundred variables
		// is not a board — so its one planned entry is the theme itself, and
		// marking it pending would say the site has no theme.
		const m = buildBoard({
			objects: { theme: [{ name: 'crumb' }] },
			loaded: {
				theme: {
					crumb: {
						blueprint: {
							plan: {
								parts: { p1: { order: 1000, part: 'crumb', describes: 'warm' } },
							},
						},
					},
				},
			},
		});
		const card = m.bands[0].columns[0].cards[0];
		expect(card.status).toBe('clean');
		expect(card.title).toBe('crumb');
	});

	it('keeps two objects of different kinds sharing a name apart', () => {
		// Keyed by name alone, opening the storage overwrote the page's document
		// and the page column redrew itself with the storage's fields.
		const m = buildBoard({
			objects: { page: [{ name: 'blog' }], storage: [{ name: 'blog' }] },
			loaded: {
				page: { blog: page('blog', [{ key: 'cHero', name: 'Hero' }]) },
				storage: { blog: { schema: { properties: { title: { type: 'string' } } } } },
			},
		});
		expect(m.bands[0].columns[0].cards.map(c => c.title)).toEqual(['Hero']);
		expect(m.bands[1].columns[0].cards.map(c => c.title)).toEqual(['title']);
	});

	it('still reads the two named lists a host set before the rest existed', () => {
		const m = buildBoard({ pages: [page('home', [])], storages: [{ name: 'enquiry' }] });
		expect(m.bands.map(b => b.kind)).toEqual(['page', 'storage']);
	});
});

// ── What does not exist yet ───────────────────────────────────────────────
//
// A blueprint is a field on a document, so anything nobody has created has
// nowhere of its own to keep a plan. The app's own plan is that somewhere.

describe('things that have not been built', () => {
	it('shows the sections a planned page is supposed to have', () => {
		// Without this a planned page is a column with a name and nothing in it,
		// which says "we are adding a blog list page" and not what goes on it.
		const m = buildBoard({
			appBlueprint: {
				plan: {
					objects: {
						o1: {
							order: 1000,
							kind: 'page',
							name: 'blogList',
							purpose: 'Somewhere to find posts',
							status: 'planned',
							spec: {
								sections: {
									s1: { order: 1000, name: 'Latest', purpose: 'Newest three' },
									s2: { order: 2000, name: 'Archive', purpose: 'Everything else' },
								},
							},
						},
					},
				},
			},
		});
		const column = m.bands[0].columns[0];
		expect(column.planned).toBe(true);
		expect(column.cards.map(c => c.title)).toEqual(['Latest', 'Archive']);
		// Nothing is built, so every card says so.
		expect(column.cards.every(c => c.status === 'pending')).toBe(true);
	});

	it('keeps a picture somebody asked for, which is never a document', () => {
		const m = buildBoard({
			appBlueprint: {
				plan: {
					objects: {
						a1: {
							order: 1000,
							kind: 'asset',
							name: 'favicon',
							asset: {
								use: 'Favicon',
								intent: 'A cinnamon roll in a circle, flat, two colours',
								assetId: null,
							},
						},
					},
				},
			},
		});
		const band = m.bands.find(b => b.kind === 'asset');
		expect(band?.columns[0].title).toBe('To be made');
		expect(band?.columns[0].cards[0].title).toBe('Favicon');
		expect(band?.columns[0].cards[0].description).toContain('cinnamon roll');
		expect(band?.columns[0].cards[0].status).toBe('pending');
	});

	it('stops calling a picture pending once the file exists', () => {
		const m = buildBoard({
			appBlueprint: {
				plan: {
					objects: {
						a1: { order: 1000, kind: 'asset', name: 'favicon',
							asset: { use: 'Favicon', intent: 'x', assetId: 'f-1' } },
					},
				},
			},
		});
		expect(m.bands.find(b => b.kind === 'asset')?.columns[0].cards[0].status).toBe('clean');
	});

	it('never gives an asset a column of its own', () => {
		// One column per favicon is a board about the favicon.
		const m = buildBoard({
			appBlueprint: {
				plan: {
					objects: {
						a1: { order: 1000, kind: 'asset', name: 'favicon', asset: { use: 'Favicon' } },
						a2: { order: 2000, kind: 'asset', name: 'logo', asset: { use: 'Logo' } },
					},
				},
			},
		});
		const band = m.bands.find(b => b.kind === 'asset');
		expect(band?.columns).toHaveLength(1);
		expect(band?.columns[0].cards).toHaveLength(2);
	});

	it("reads a column's line off the index, without opening the object", () => {
		// The summary lives in the app plan precisely so forty columns do not
		// cost forty full documents to draw a second line each.
		const m = buildBoard({
			objects: { page: [{ name: 'home' }] },
			appBlueprint: {
				plan: {
					objects: {
						o1: { order: 1000, kind: 'page', name: 'home',
							summary: 'The front door, pushing people to book' },
					},
				},
			},
		});
		expect(m.bands[0].columns[0].purpose).toBe('The front door, pushing people to book');
	});

	it('lets what a person said outrank what was derived about it', () => {
		const m = buildBoard({
			objects: { page: [{ name: 'home' }] },
			appBlueprint: {
				plan: {
					objects: {
						o1: { order: 1000, kind: 'page', name: 'home',
							purpose: 'So a nervous first-timer books without scrolling twice',
							summary: 'A hero, three cards and a form' },
					},
				},
			},
		});
		expect(m.bands[0].columns[0].purpose).toContain('nervous first-timer');
	});
});

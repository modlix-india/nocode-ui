import {
	absoluteUrl,
	buildBoard,
	connectionIndex,
	sectionsOf,
	readableName,
	streamUrlFor,
	tileDate,
} from '../board';
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

describe('objects whose names contain a dot', () => {
	it('finds a namespaced function that the store nested rather than keyed', () => {
		// A server function is called `crumbco.createBlogPost`. The host writes it
		// with a path built by concatenation, and a store path is split on '.',
		// so it landed as loaded.function.crumbco.createBlogPost — four nested
		// objects. Read back as one key it found nothing, so every function
		// column stayed empty however many times it was opened.
		const m = buildBoard({
			objects: { function: [{ name: 'crumbco.createBlogPost' }] },
			loaded: {
				function: {
					crumbco: {
						createBlogPost: { definition: { steps: { save: {}, mail: {} } } },
					},
				},
			},
		});
		expect(m.bands[0].columns[0].cards.map(c => c.title)).toEqual(['save', 'mail']);
	});

	it('still finds an ordinary one-segment name', () => {
		const m = buildBoard({
			objects: { storage: [{ name: 'orderRequest' }] },
			loaded: { storage: { orderRequest: { schema: { properties: { email: {} } } } } },
		});
		expect(m.bands[0].columns[0].cards.map(c => c.title)).toEqual(['email']);
	});
});

describe('what Build is allowed to offer', () => {
	function planWith(pending: number) {
		return {
			objects: { page: [{ name: 'blogList' }] },
			appBlueprint: {
				plan: {
					objects: {
						o1: { order: 1000, kind: 'page', name: 'blogList', status: 'built', pending },
					},
				},
			},
		};
	}

	it('counts unbuilt work inside a column nobody has opened', () => {
		// A column's cards arrive only when it is opened, so on a freshly
		// loaded board the component can see that a page exists and cannot see
		// that three of its sections were never built. Build then says
		// "nothing to build" over a plan with outstanding work, which is the
		// worst sentence that button has.
		expect(buildBoard(planWith(3)).outstanding).toBe(3);
	});

	it('trusts the cards over the index once a column is open', () => {
		// Never both: an opened column would be counted twice, once from what
		// it has and once from what the last sweep recorded about it.
		const m = buildBoard({
			...planWith(3),
			loaded: {
				page: {
					blogList: {
						...page('blogList', [{ key: 'cHero', name: 'Hero' }]),
						blueprint: {
							plan: {
								sections: {
									s1: { order: 1000, name: 'Hero', componentKey: 'cHero' },
									s2: { order: 2000, name: 'Later' },
								},
							},
						},
					},
				},
			},
		});
		expect(m.outstanding).toBe(1);
	});

	it('offers nothing when there is nothing outstanding', () => {
		expect(buildBoard(planWith(0)).outstanding).toBe(0);
	});

	it('never counts an address or a refused request as work', () => {
		const m = buildBoard({
			appBlueprint: {
				plan: {
					delivery: { d1: { order: 1000, host: 'x.example' } },
					objects: {
						a1: { order: 1000, kind: 'asset', name: 'favicon', asset: { use: 'Favicon' } },
					},
				},
				decisions: {
					dec1: { order: 1000, choice: 'Customer logins', because: 'not a site', status: 'rejected' },
				},
			},
		});
		// An address is not waiting to be built, and a request the product
		// turned down is never going to be.
		expect(m.outstanding).toBe(0);
	});
});

describe('the decisions view', () => {
	const appBlueprint = {
		plan: {},
		decisions: {
			d1: {
				order: 1000,
				choice: 'Teal and slate, no stock photographs',
				because: 'Every other practice nearby uses the same smiling stock images',
				status: 'active',
				area: 'The look',
				by: 'You · 12 September',
			},
			d2: {
				order: 2000,
				choice: 'A separate page for each service',
				because: 'Five thin pages with almost nothing on each',
				status: 'superseded',
				area: 'The pages',
			},
			d3: {
				order: 3000,
				choice: 'Customers sign in to see past orders',
				because: 'A site has no accounts',
				status: 'rejected',
				area: 'Accounts',
			},
		},
	};

	it('keeps every decision, whatever became of it', () => {
		// A replaced decision is the most useful thing anybody can know before
		// proposing it again, which is exactly what deleting it destroys.
		const m = buildBoard({ appBlueprint });
		expect(m.decisions.map(d => d.status)).toEqual(['active', 'superseded', 'rejected']);
		expect(m.decisions[0].attribution).toBe('You · 12 September');
		expect(m.decisions[0].area).toBe('The look');
	});

	it('still shows only the refusals on the board itself', () => {
		// The boundary band is about a product boundary somebody keeps walking
		// into. The full record is a different screen.
		const m = buildBoard({ appBlueprint });
		const band = m.bands.find(b => b.kind === 'boundary');
		expect(band?.columns.map(c => c.title)).toEqual(['Customers sign in to see past orders']);
	});

	it('has no decisions to show when the plan records none', () => {
		expect(buildBoard({ appBlueprint: { plan: {} } }).decisions).toEqual([]);
	});
});

describe('links the host hands in', () => {
	it('makes a bare hostname absolute', () => {
		// The platform's draft record is a hostname, and an href with no scheme
		// is a RELATIVE path — so the link went to a page inside the studio and
		// still looked like a working button.
		expect(absoluteUrl('d919c9caa0589913175cc4b86fd4832cd.local.modlix.com')).toBe(
			'https://d919c9caa0589913175cc4b86fd4832cd.local.modlix.com',
		);
	});

	it('leaves a real url alone', () => {
		expect(absoluteUrl('https://crumbco.sitezump.ai')).toBe('https://crumbco.sitezump.ai');
		expect(absoluteUrl('http://localhost:8080/x')).toBe('http://localhost:8080/x');
	});

	it('leaves a root-relative path alone', () => {
		expect(absoluteUrl('/sitezump/SYSTEM/page/home')).toBe('/sitezump/SYSTEM/page/home');
	});

	it('gives nothing back for nothing', () => {
		expect(absoluteUrl('')).toBe('');
		expect(absoluteUrl('   ')).toBe('');
	});
});


describe('the connection graph', () => {
	const relations = {
		r1: {
			order: 1000,
			from: 'page:orderForm',
			to: 'storage:orderRequest',
			how: 'writes to',
			where: 'submit/save',
		},
		r2: {
			order: 2000,
			from: 'function:crumbco.dailyDigest',
			to: 'storage:orderRequest',
			how: 'reads',
			where: 'readPage',
		},
		r3: { order: 3000, from: 'page:home', to: 'page:orderForm', how: 'goes to', where: 'nav' },
	};

	it('indexes both ends of every edge', () => {
		const index = connectionIndex(relations);
		// The storage knows what reaches it, which is the question people ask
		// and the direction no object can work out about itself.
		const incoming = index.get('storage:orderRequest')!;
		expect(incoming.map(c => `${c.name} ${c.how}`).sort()).toEqual([
			'crumbco.dailyDigest reads',
			'orderForm writes to',
		]);
		expect(incoming.every(c => c.direction === 'in')).toBe(true);

		// And the page knows both: what it writes to, and that home links to it.
		const both = index.get('page:orderForm')!;
		expect(both.map(c => c.direction)).toEqual(['out', 'in']);
	});

	it('keeps the verb rather than collapsing it to "connected"', () => {
		// A page that READS a storage survives it being emptied; one that
		// DELETES from it is the reason it empties. Same edge shape, opposite
		// answer to "can we drop this".
		const index = connectionIndex(relations);
		const hows = index.get('storage:orderRequest')!.map(c => c.how);
		expect(new Set(hows)).toEqual(new Set(['writes to', 'reads']));
	});

	it('carries where it was found, so a connection can be checked', () => {
		const index = connectionIndex(relations);
		expect(index.get('page:orderForm')![0].where).toBe('submit/save');
	});

	it('survives a graph that is missing or malformed', () => {
		expect(connectionIndex(undefined).size).toBe(0);
		// A half-written edge is dropped rather than rendered as a connection to
		// nothing, which would read as a dependency nobody can find.
		expect(connectionIndex({ bad: { from: 'page:home' }, worse: {} } as any).size).toBe(0);
	});

	it('puts a column\'s connections on the column', () => {
		const model = buildBoard({
			pages: [page('orderForm', [{ key: 'form', name: 'Form' }])],
			storages: [{ name: 'orderRequest', schema: { properties: { email: {} } } }],
			appBlueprint: { plan: { relations } },
		} as any);

		const pageColumn = model.bands
			.find(b => b.kind === 'page')!
			.columns.find(c => c.name === 'orderForm')!;
		expect(pageColumn.connections.map(c => c.name)).toEqual(['orderRequest', 'home']);

		const storageColumn = model.bands.find(b => b.kind === 'storage')!.columns[0];
		expect(storageColumn.connections.map(c => c.direction)).toEqual(['in', 'in']);
	});

	it('gives every column an empty list when no graph has been derived', () => {
		// Empty is a real answer — nothing in the app names it — and must not be
		// undefined, or every render site needs its own guard.
		const model = buildBoard({ pages: [page('home', [])] } as any);
		expect(model.bands.find(b => b.kind === 'page')!.columns[0].connections).toEqual([]);
	});
});


describe('which stream watches a job', () => {
	const PLAN = '/api/ai/blueprint/plan/{job}/stream';
	const BUILD = '/api/ai/blueprint/build/{job}/stream';

	it('sends a build to the build stream', () => {
		// Measured against the running service: /plan/{a build job}/stream is a
		// 404 and /build/{the same job}/stream is a 200. They are separate
		// registries and a job id from one means nothing to the other.
		expect(streamUrlFor({ kind: 'build', job: 'abc' }, PLAN, BUILD)).toBe(
			'/api/ai/blueprint/build/abc/stream',
		);
	});

	it('sends a sweep to the plan stream', () => {
		expect(streamUrlFor({ job: 'abc' }, PLAN, BUILD)).toBe(
			'/api/ai/blueprint/plan/abc/stream',
		);
		expect(streamUrlFor({ kind: 'plan', job: 'abc' }, PLAN, BUILD)).toBe(
			'/api/ai/blueprint/plan/abc/stream',
		);
	});

	it('asks for nothing when there is no job', () => {
		expect(streamUrlFor(undefined, PLAN, BUILD)).toBe('');
		expect(streamUrlFor({ kind: 'build' }, PLAN, BUILD)).toBe('');
	});

	it('asks for nothing when the host configured no endpoint', () => {
		// Better than fetching the literal "{job}" and reporting a lost job.
		expect(streamUrlFor({ kind: 'build', job: 'abc' }, PLAN, '')).toBe('');
	});
});

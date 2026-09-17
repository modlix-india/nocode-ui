import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	addListenerAndCallImmediately,
	addListenerAndCallImmediatelyWithChildrenActivity,
	getDataFromPath,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { usedComponents } from '../../App/usedComponents';
import CommonInputText from '../../commonComponents/CommonInputText';
import { ComponentProps } from '../../types/common';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './blueprintEditorProperties';
import {
	BoardCard,
	BoardColumn,
	BoardModel,
	BoardSources,
	buildBoard,
	CardStatus,
	tileDate,
} from './board';

/**
 * The prompt is a separate chunk on purpose.
 *
 * It carries a fetch reader, a stream parser and a growing textarea, and the
 * board is the thing people are waiting to see. Splitting it means the cards
 * paint first and the bar arrives a beat later, rather than the whole surface
 * waiting on code some visitors never type into.
 */
const BoardChat = React.lazy(() => import('./components/BoardChat'));

/** What a selected thing looks like to the prompt, and to the host. */
interface Selected {
	uid: string;
	kind: 'card' | 'column';
	title: string;
	/** For a column: the object's own name, which is what the host fetches by. */
	name?: string;
	/** For a column: page, storage, and so on. The host needs it to know where to look. */
	objectKind?: string;
	/** The column a card belongs to, so "Hero on Home" is nameable. */
	parent?: string;
	componentKey?: string;
}

/**
 * The words for each state, and they are deliberately not symmetrical.
 *
 * `pending` and `drifted` point in OPPOSITE directions: one is resolved by
 * building, the other by moving the plan. Wording them as two shades of "out of
 * sync" is how somebody presses the wrong button and overwrites the edit the
 * mark existed to report.
 */
/**
 * Search results shown at once.
 *
 * Small on purpose. If the right site is not in the first dozen the answer is a
 * better query, not a longer list — scrolling two hundred near-identical names
 * is the thing the search replaced.
 */
const MAX_APP_MATCHES = 12;

/** Recent sites offered before anybody types. Five is what App Builder keeps. */
const MAX_RECENT_APPS = 5;

/**
 * Bounds on the chat pane, as a percentage of the board.
 *
 * A floor because a two-word-wide chat is not a chat, and a ceiling because the
 * board is the thing the conversation is about: a chat allowed to take the whole
 * width would reproduce the problem the split was made to fix.
 */
const MIN_CHAT_PCT = 20;
/**
 * The plan keeps at least half the screen, whatever anybody drags.
 *
 * It is the thing the conversation is about, and the reason this stopped being
 * a strip across the foot was a reply covering the board. A chat that can take
 * two thirds is the same mistake rotated ninety degrees.
 */
const MAX_CHAT_PCT = 48;
const DEFAULT_CHAT_PCT = 28;

/** Shortest the board is allowed to be, whatever the window says. */
const MIN_BOARD_HEIGHT = 420;

/**
 * The box this component actually scrolls inside, if it is not the page.
 *
 * A host can put this anywhere, and the platform in fact puts it inside a
 * scrolling page wrapper. Sizing against the window rather than against that
 * box is how a component ends up taller than the space it was given, which
 * shows up as a second scrollbar rather than as anything obviously broken.
 */
function scrollParentOf(el: HTMLElement): HTMLElement | null {
	let node = el.parentElement;
	while (node) {
		const overflowY = getComputedStyle(node).overflowY;
		if (overflowY === 'auto' || overflowY === 'scroll') return node;
		node = node.parentElement;
	}
	return null;
}

/**
 * Bands read off the app plan rather than off a list of objects.
 *
 * Nothing in them is addable: "+ Add a section" under the address a site
 * answers on would be an affordance for a thing that does not exist, and the
 * product boundary is a record of an answer rather than a list to extend.
 */
const DERIVED_BANDS = new Set(['asset', 'delivery', 'boundary']);

/**
 * The icon for each object kind the board draws beyond pages and storages.
 *
 * Every class here is published by the MATERIAL_SYMBOLS pack, which is the only
 * thing that makes an icon appear: a name the pack does not carry renders as
 * nothing at all, with no error anywhere.
 */
const KIND_ICONS: Record<string, string> = {
	function: 'ms material-symbols-outlined mso-function',
	uifunction: 'ms material-symbols-outlined mso-ads_click',
	uripath: 'ms material-symbols-outlined mso-api',
	template: 'ms material-symbols-outlined mso-mail',
	notification: 'ms material-symbols-outlined mso-notifications',
	theme: 'ms material-symbols-outlined mso-palette',
	style: 'ms material-symbols-outlined mso-brush',
	asset: 'ms material-symbols-outlined mso-image',
};

const STATUS_WORDS: Record<CardStatus, string> = {
	clean: '',
	pending: 'not on the site yet',
	drifted: 'changed outside the plan',
	none: '',
};

export default function LazyBlueprintEditor(props: Readonly<ComponentProps>) {
	const {
		definition,
		definition: { bindingPath, bindingPath2, bindingPath3, bindingPath4 },
		locationHistory,
		context,
		pageDefinition,
	} = props;

	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);

	const {
		properties: {
			mode = '_prose',
			bands: bandsProp = '',
			readOnly = false,
			allowAdd = true,
			showLens = true,
			agentEndpoint = '/api/ai/appbuilder/chat',
			contextSurface = '',
			askPlaceholder = 'Ask for a change. "Make the hero shorter." "Drop the testimonials, we have none yet."',
			pickTitle = 'Which site are we working on?',
			pickText = 'AI Studio plans one site at a time. Choose the one you want to talk about.',
			pickPlaceholder = 'Search your sites by name',
			appTileImage = '',
			newTitle = 'What are we building?',
			newText = 'Describe it the way you would to someone building it for you. What the business is, who it is for, what you want people to do. You will see the whole plan and change anything you like before a single page is built.',
			newPlaceholder = 'A dental practice in north Bengaluru. Family dentistry plus implants. We want people to book a first consultation online.',
			newSubmitLabel = 'Make a plan',
			derivedTitle = 'This site has no plan yet',
			derivedText = 'There is a site here already, but nothing records what it is meant to be, so there is nothing to work from. Let me read it and write the plan down, or tell me in your own words and I will start from that.',
			derivedSubmitLabel = 'Read the site and write the plan',
			regenerateLabel = 'Read the site again',
			sendLabel = 'Send',
			progressEndpoint = '/api/ai/blueprint/plan/{job}/stream',
			noteMessage = '',
			pageIcon = 'ms material-symbols-outlined mso-description',
			storageIcon = 'ms material-symbols-outlined mso-database',
			deliveryIcon = 'ms material-symbols-outlined mso-language',
			boundaryIcon = 'ms material-symbols-outlined mso-person_add',
			chromeIcon = 'ms material-symbols-outlined mso-menu',
			menuIcon = 'ms material-symbols-outlined mso-more_horiz',
			searchIcon = 'fa fa-solid fa-magnifying-glass',
			addIcon = 'ms material-symbols-outlined mso-add',
			onChange,
			onSelect,
			onOpen,
			onApply,
			onUpdatePlan,
			onExplain,
			onNeedObject,
			onPickApp,
			onSearchApps,
			onGeneratePlan,
			onRefresh,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
	);

	const sourcesPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;
	const statusPath = bindingPath2
		? getPathFromLocation(bindingPath2, locationHistory, pageExtractor)
		: undefined;
	const selectionPath = bindingPath3
		? getPathFromLocation(bindingPath3, locationHistory, pageExtractor)
		: undefined;
	// Where an event's payload is written just before the event runs. A page
	// event function cannot read a callback argument, so the platform pattern
	// (Table does this for pagination) is to put the payload on a bound path
	// and let the event read it from there.
	const payloadPath = bindingPath4
		? getPathFromLocation(bindingPath4, locationHistory, pageExtractor)
		: undefined;

	const [sources, setSources] = useState<BoardSources>({});
	const [status, setStatus] = useState<{ [uid: string]: CardStatus }>({});
	const [selected, setSelected] = useState<Selected[]>([]);
	const [expanded, setExpanded] = useState<string>('');
	const [lens, setLens] = useState<string>('');
	const [appQuery, setAppQuery] = useState<string>('');
	/**
	 * How wide the chat pane is, as a percentage of the component.
	 *
	 * The chat used to sit in a strip across the foot, which is fine for one
	 * line and wrong for what the agent actually writes: a considered answer
	 * about a plan runs to several paragraphs, and the strip grew until it had
	 * eaten the board the answer was about. Side by side, each half scrolls on
	 * its own and a long reply costs the board width rather than all of it.
	 *
	 * Remembered per viewer, because a preferred split is a habit and asking
	 * somebody to re-drag it on every visit is the kind of small rudeness that
	 * makes a tool feel unfinished. localStorage can throw or come back empty
	 * (a private window, cleared site data), so every read and write is
	 * guarded and the default is a perfectly good screen.
	 */
	// Version in the key. The panes swapped sides and the bounds changed, so a
	// width stored against the old arrangement is not a preference for this one
	// — it would just be a number that happened to survive.
	const SPLIT_KEY = `bpChatSplit2_${definition.key}`;
	const [chatWidth, setChatWidth] = useState<number>(() => {
		try {
			const kept = Number(window.localStorage.getItem(SPLIT_KEY));
			if (Number.isFinite(kept) && kept >= MIN_CHAT_PCT && kept <= MAX_CHAT_PCT) return kept;
		} catch {
			// No stored preference is not a problem worth reporting.
		}
		return DEFAULT_CHAT_PCT;
	});
	/**
	 * The board's root, as a callback ref rather than a plain one.
	 *
	 * The first render of this component is usually one of the screens BEFORE
	 * the board — the picker or the gate — and neither attaches this ref. An
	 * effect that read `ref.current` on mount therefore found null, measured
	 * nothing, and with an empty dependency list never ran again: the board
	 * arrived a second later at its natural content height with no idea it was
	 * supposed to fill anything. A callback ref re-runs the effects the moment
	 * the node exists.
	 */
	const [splitNode, setSplitNode] = useState<HTMLDivElement | null>(null);
	const [dragging, setDragging] = useState(false);

	/**
	 * Height, measured rather than declared.
	 *
	 * Two panes that scroll on their own need a definite height to be a
	 * percentage OF, and nothing above this component has one: a page is a
	 * column of grids that grows with its content. So the height is whatever is
	 * left of the window below wherever this component starts, re-measured when
	 * the window changes. `height: 100%` on an auto-height parent silently
	 * collapses to the content height, which is how the board ended up 520px
	 * tall in a 980px window with the conversation floating in the middle of it.
	 */
	const [fitHeight, setFitHeight] = useState<number | undefined>(undefined);
	useEffect(() => {
		const measure = () => {
			const el = splitNode;
			if (!el) return;
			// Against the SCROLLER, not the window.
			//
			// The platform wraps a page in `.comp.compPage`, which is itself an
			// `overflow-y: auto` box shorter than the viewport by the header
			// above it. Measuring the window gave a height 60px too tall, that
			// box then scrolled to show the overhang, and the screen had two
			// scrollbars: this component's pane and the page around it.
			const scroller = scrollParentOf(el);
			const box = el.getBoundingClientRect();
			const room = scroller
				? scroller.clientHeight - (box.top - scroller.getBoundingClientRect().top)
				: window.innerHeight - box.top;
			// A floor, so a component in a short window or a scrolled container
			// is still usable rather than a sliver.
			const next = Math.max(MIN_BOARD_HEIGHT, Math.round(room));
			// Only on a real change: this runs from a ResizeObserver that our own
			// height feeds, and writing the same number back would spin.
			setFitHeight(current => (current === next ? current : next));
		};

		measure();
		// Re-measured rather than measured once. The first run can land while
		// this component is still the gate screen — a different height at a
		// different offset — and nothing about a one-shot read on mount would
		// ever notice the board replacing it.
		if (!splitNode) return;
		const observer = new ResizeObserver(measure);
		observer.observe(splitNode);
		const scroller = scrollParentOf(splitNode);
		if (scroller) observer.observe(scroller);
		window.addEventListener('resize', measure);
		return () => {
			observer.disconnect();
			window.removeEventListener('resize', measure);
		};
		// Keyed on the node, so this runs when the board appears rather than
		// when the component mounts. The observer handles everything after.
	}, [splitNode]);

	const startDrag = useCallback(() => setDragging(true), []);
	useEffect(() => {
		if (!dragging) return;
		// Listeners on the WINDOW, not the handle: a drag that leaves the 5px
		// handle must keep dragging, and the mouse leaves it immediately.
		const move = (e: MouseEvent) => {
			const box = splitNode?.getBoundingClientRect();
			if (!box || box.width < 1) return;
			// From the LEFT edge, because the conversation is the left pane.
			const fromLeft = ((e.clientX - box.left) / box.width) * 100;
			setChatWidth(Math.min(MAX_CHAT_PCT, Math.max(MIN_CHAT_PCT, fromLeft)));
		};
		const up = () => setDragging(false);
		window.addEventListener('mousemove', move);
		window.addEventListener('mouseup', up);
		// While dragging, the cursor and the no-select go on the BODY. Without
		// it every text run the pointer crosses highlights as you drag.
		document.body.style.cursor = 'col-resize';
		document.body.style.userSelect = 'none';
		return () => {
			window.removeEventListener('mousemove', move);
			window.removeEventListener('mouseup', up);
			document.body.style.cursor = '';
			document.body.style.userSelect = '';
		};
	}, [dragging, splitNode]);

	useEffect(() => {
		try {
			window.localStorage.setItem(SPLIT_KEY, String(Math.round(chatWidth)));
		} catch {
			// A viewer with storage blocked keeps the default next time.
		}
	}, [SPLIT_KEY, chatWidth]);

	// Guards the single-site redirect. It fires during render, so without this
	// every re-render before the navigation lands would fire it again.
	const soleAppSentRef = useRef(false);

	/**
	 * Watch the sources.
	 *
	 * The host fills these in piece by piece — `.pages`, `.storages`,
	 * `.appBlueprint`, `.apps`, and one entry per lazily loaded object — so a
	 * plain listener on the parent path alone never fires: it only sees a write
	 * to that exact path. Both are registered: the children-activity listener
	 * for anything nested (notably `loaded.<name>`), and an explicit listener on
	 * each key this component knows about, which is the behaviour that is
	 * certain. Either way the PARENT is re-read, because the callback is handed
	 * the child's value, not the whole object.
	 */
	useEffect(() => {
		if (!sourcesPath) return;
		// The SPREAD is load-bearing. The store mutates the object at this path in
		// place, so getDataFromPath hands back the same reference every time and
		// React's Object.is check bails out of the render — the data arrives and
		// nothing on screen changes. A fresh shallow copy per notification is what
		// makes the update visible.
		const reread = () =>
			setSources({ ...(getDataFromPath(sourcesPath, locationHistory, pageExtractor) ?? {}) });
		const stops = [
			addListenerAndCallImmediatelyWithChildrenActivity(
				context.pageName,
				reread,
				sourcesPath,
			),
			addListenerAndCallImmediately(
				context.pageName,
				reread,
				`${sourcesPath}.appName`,
				`${sourcesPath}.appTitle`,
				`${sourcesPath}.appBlueprint`,
				`${sourcesPath}.apps`,
				`${sourcesPath}.recents`,
				`${sourcesPath}.pages`,
				`${sourcesPath}.storages`,
				`${sourcesPath}.objects`,
				`${sourcesPath}.loaded`,
				`${sourcesPath}.progress`,
			),
		];
		return () => stops.forEach(stop => stop());
	}, [sourcesPath, context.pageName, locationHistory, pageExtractor]);

	// The search field borrows the platform TextBox's own classes, and a site
	// tile borrows the Grid's, so both stylesheets have to be on the page.
	// Declared the way Table declares the column components it renders: a
	// component asks for what it draws, rather than hoping a page author happens
	// to have used it.
	//
	// Grid is there for one declaration and it is worth the whole borrow: the
	// tile's shadow is `Grid.boxShadowLightLow`, a themed value, which is why a
	// tile here and a project tile on the account screen cast the same shadow
	// without either one naming a colour.
	useEffect(() => {
		usedComponents.using('TextBox');
		usedComponents.using('Grid');
	}, []);

	useEffect(() => {
		if (!statusPath) return;
		return addListenerAndCallImmediatelyWithChildrenActivity(
			context.pageName,
			() =>
				setStatus({
					...(getDataFromPath(statusPath, locationHistory, pageExtractor) ?? {}),
				}),
			statusPath,
		);
	}, [statusPath, context.pageName, locationHistory, pageExtractor]);

	// The board is derived, never stored: definitions are the always-present
	// half and a blueprint only fills in the second line of each card, so
	// recomputing is both cheap and the only way the no-plan case stays first
	// class rather than a fallback.
	const model: BoardModel = useMemo(() => buildBoard({ ...sources, status }), [sources, status]);

	const visibleBands = useMemo(() => {
		const wanted = bandsProp
			.split(',')
			.map((s: string) => s.trim())
			.filter(Boolean);
		if (!wanted.length) return model.bands;
		return wanted
			.map((k: string) => model.bands.find(b => b.kind === k))
			.filter(Boolean) as typeof model.bands;
	}, [model.bands, bandsProp]);

	const fire = useCallback(
		(eventKey: string | undefined, data: any) => {
			if (!eventKey) return;
			const ev = pageDefinition.eventFunctions?.[eventKey];
			if (!ev) return;
			// Write the payload BEFORE running, so the event can read it on its
			// first step rather than racing the store.
			if (payloadPath) setData(payloadPath, data, context.pageName);
			(async () =>
				await runEvent(ev, eventKey, context.pageName, locationHistory, pageDefinition))();
		},
		[pageDefinition, context.pageName, locationHistory, payloadPath],
	);

	/**
	 * Publish the selection.
	 *
	 * It stays in component state because the prompt now lives inside this
	 * component and reads it directly. The bound path is written as well, for a
	 * canvas or a page elsewhere that wants to follow along — but nothing here
	 * depends on the round trip any more.
	 */
	const publish = useCallback(
		(next: Selected[]) => {
			setSelected(next);
			if (selectionPath) setData(selectionPath, next, context.pageName);
			fire(onSelect, { selection: next });
		},
		[selectionPath, context.pageName, fire, onSelect],
	);

	const pick = useCallback(
		(item: Selected, multi: boolean) => {
			if (multi) {
				// Several cards cannot all be expanded, and the point of a multi
				// selection is to talk about them together, so expansion closes.
				setExpanded('');
				const had = selected.some(s => s.uid === item.uid);
				publish(had ? selected.filter(s => s.uid !== item.uid) : [...selected, item]);
				return;
			}
			const onlyThis = selected.length === 1 && selected[0].uid === item.uid;
			if (onlyThis && expanded === item.uid) {
				setExpanded('');
				publish([]);
				return;
			}
			setExpanded(item.kind === 'card' ? item.uid : '');
			publish([item]);
			if (item.kind === 'card')
				fire(onOpen, { uid: item.uid, componentKey: item.componentKey });
			else {
				// Only when the detail is not already here. A column carries
				// nothing but its name until it is opened, because the list
				// routes are the LRO projection: no definition, no plan.
				const name = item.name ?? item.title;
				const kind = item.objectKind ?? 'page';
				// Kind AND name: a site with a `blog` page and a `blog` storage
				// would otherwise see the first one's document and never ask for
				// the second's.
				const already = sources.loaded?.[kind]?.[name] ?? sources.loaded?.[name];
				if (!already) fire(onNeedObject, { name, kind });
			}
		},
		[selected, expanded, publish, fire, onOpen, onNeedObject, sources.loaded],
	);

	const clear = useCallback(() => {
		setExpanded('');
		publish([]);
	}, [publish]);

	/**
	 * Ask the platform to search, a beat after the typing stops.
	 *
	 * Debounced rather than per keystroke: "crumbco" is seven characters and
	 * seven filtered queries for one answer, six of which nobody reads. The
	 * trailing edge is the one that matters, so the timer is reset on each key
	 * and only the last one fires.
	 */
	const searchTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const askServerToSearch = useCallback(
		(text: string) => {
			if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
			const q = text.trim();
			if (!q) return;
			searchTimerRef.current = setTimeout(() => fire(onSearchApps, { query: q }), 350);
		},
		[fire, onSearchApps],
	);
	useEffect(
		() => () => {
			if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
		},
		[],
	);

	/**
	 * Empty the search box when the host reloads the board under it.
	 *
	 * The typed text is this component's own state and the results it filters
	 * are not: they live in the page store. A host that forces its onLoad on
	 * every arrival (SiteZump's AI Studio does, so that leaving a site and
	 * coming back is a clean screen) wipes that store and refills it, and the
	 * field is left reading "site" over a list that no longer exists — text on
	 * screen filtering nothing, with no way to tell it has gone stale.
	 *
	 * `apps` going ABSENT is precisely that event and nothing else: the search
	 * is the only thing that ever writes the key, and an empty ARRAY is a
	 * different fact — a query that matched nothing, which must keep its text so
	 * the "no site matches" line has something to name.
	 */
	useEffect(() => {
		if (sources.apps !== undefined) return;
		if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
		setAppQuery(current => (current ? '' : current));
	}, [sources.apps]);

	const advanced = mode === '_advanced';

	// ── the two screens before the board ──────────────────────────────
	//
	// Neither is an edge case. AI Studio hangs off the account rail, so
	// arriving without a site is the ordinary first step; and on day one no
	// site has a plan, so the offer to make one is what most people meet.
	const hasApp = !!(sources.appName ?? '').trim();
	const hasObjects = !!(sources.pages?.length || sources.storages?.length);

	const chips = useMemo(
		() => selected.map(s => ({ uid: s.uid, title: s.title, parent: s.parent })),
		[selected],
	);

	/**
	 * A planning sweep, while it runs.
	 *
	 * Writing a plan for a site that already exists is one reading per object,
	 * so it is minutes of work, and the thing somebody watches for minutes has
	 * to say more than "please wait". Every step was named by the service before
	 * any of them ran, so this names what is being read now and what is left.
	 *
	 * Shown on both screens. It begins on the gate, where the button that starts
	 * it lives, and has to keep reporting once the first plan lands and the
	 * board replaces that screen underneath it.
	 */
	/**
	 * Progress while a sweep runs, PUSHED rather than asked for.
	 *
	 * The host starts the job and writes what came back — including its id —
	 * onto the sources. From there this component holds one connection open and
	 * the service writes whenever the progress actually changes, which on a
	 * sweep is once per object.
	 *
	 * It was a poll, on a Timer, every two and a half seconds, and the network
	 * panel was a wall of identical GETs answering "nothing has moved" for
	 * minutes at a time. Streaming is the same information at a hundredth of the
	 * requests, and it arrives when it happens rather than up to a tick late.
	 *
	 * The streamed copy wins over the stored one while it is newer, so the board
	 * does not flicker back to the payload the host wrote when it pressed start.
	 */
	const [streamed, setStreamed] = useState<BoardSources['progress']>(undefined);
	const storedProgress = sources.progress;
	const progress = streamed && streamed.job === storedProgress?.job ? streamed : storedProgress;
	const planning = !!progress && progress.state === 'running';

	const jobId = storedProgress?.state === 'running' ? storedProgress.job : undefined;
	useEffect(() => {
		if (!jobId || !progressEndpoint) return;
		const controller = new AbortController();
		let stopped = false;

		(async () => {
			try {
				const token =
					getDataFromPath('Store.auth.accessToken', []) ??
					getDataFromPath('LocalStore.AuthToken', []) ??
					'';
				const response = await fetch(progressEndpoint.replace('{job}', jobId), {
					headers: {
						Accept: 'text/event-stream',
						Authorization: token ? `Bearer ${token}` : '',
						clientCode: (getDataFromPath('Store.auth.loggedInClientCode', []) ??
							'') as string,
						appCode: (getDataFromPath('Store.application.appCode', []) ?? '') as string,
					},
					signal: controller.signal,
				});
				if (!response.ok || !response.body) return;
				const reader = response.body.getReader();
				const decoder = new TextDecoder();
				let buffer = '';
				while (!stopped) {
					const { done, value } = await reader.read();
					if (done) break;
					buffer += decoder.decode(value, { stream: true });
					// SSE frames are separated by a blank line, and a frame can
					// arrive split across reads, so the tail is kept for next time.
					const frames = buffer.split('\n\n');
					buffer = frames.pop() ?? '';
					for (const frame of frames) {
						const line = frame.split('\n').find(l => l.startsWith('data:'));
						if (!line) continue;
						try {
							const data = JSON.parse(line.slice(5).trim());
							if (data && typeof data === 'object' && data.job) setStreamed(data);
						} catch {
							// A frame that is not JSON is a keep-alive comment or
							// a truncated write. Neither is worth reporting.
						}
					}
				}
			} catch {
				// An aborted or refused stream leaves the stored progress on
				// screen. The work is unaffected: it is a job on the server and
				// every object is written as it completes.
			}
		})();

		return () => {
			stopped = true;
			controller.abort();
		};
	}, [jobId, progressEndpoint]);

	// The sweep ended, so the plan under the board has changed. Asked for once,
	// on the transition, rather than on every frame: a reload per object would
	// rebuild the screen while somebody is reading it.
	const endedJobRef = useRef('');
	useEffect(() => {
		const state = streamed?.state;
		if (!streamed?.job || state === 'running') return;
		if (endedJobRef.current === streamed.job) return;
		endedJobRef.current = streamed.job;
		fire(onRefresh, { job: streamed.job, state });
	}, [streamed, fire, onRefresh]);
	const renderProgress = () => {
		if (!progress?.total) return null;
		// A finished sweep with nothing to report says its piece by the board
		// refilling underneath it. A bar sitting at 100% for the rest of the
		// session is a progress report about nothing. One that FAILED stays: the
		// step's reason is the only place that is written down.
		if (progress.state !== 'running' && !progress.failed && !progress.error) return null;
		const done = progress.done ?? 0;
		const total = progress.total;
		const pct = Math.min(100, Math.round((done / Math.max(1, total)) * 100));
		const failed = progress.failed ?? 0;
		const current = progress.current;
		let line: string;
		if (progress.state === 'running') {
			line = current?.label ? `Reading ${current.label}` : 'Starting';
			line += ` · ${done} of ${total}`;
		} else if (progress.error) {
			line = progress.error;
		} else {
			line = `${total} read`;
		}
		return (
			<div className={`_planProgress${planning ? ' _running' : ''}`}>
				<SubHelperComponent definition={definition} subComponentName="planProgress" />
				<div className="_progressBar">
					<i style={{ width: `${pct}%` }} />
				</div>
				<div className="_progressLine">
					{planning ? <span className="_spinner" /> : null}
					<span>{line}</span>
					{failed ? (
						<span className="_progressFailed">{failed} could not be read</span>
					) : null}
				</div>
				{/* Every object, with what happened to it. The list is the whole
				    point of naming the work up front: it says what is being read
				    NOW, what is still to come, and which one failed, at the grain
				    somebody can act on. Hidden once the sweep has finished
				    cleanly, when the board itself is the better report. */}
				{planning || failed ? (
					<div className="_progressSteps">
						{(progress.steps ?? []).map(step => (
							<span
								key={`${step.kind}:${step.name}`}
								className={`_progressStep _${step.state ?? 'waiting'}`}
								title={step.detail ?? ''}
							>
								{step.label ?? step.name}
							</span>
						))}
					</div>
				) : null}
			</div>
		);
	};

	const chat = (
		variant: 'gate' | 'board',
		placeholder: string,
		submitLabel?: string,
		submitIcon?: string,
	) => (
		<Suspense fallback={null}>
			<BoardChat
				definition={definition}
				appCode={sources.appName ?? ''}
				agentEndpoint={agentEndpoint}
				placeholder={placeholder}
				contextSurface={contextSurface}
				variant={variant}
				submitLabel={submitLabel}
				submitIcon={submitIcon}
				chips={variant === 'gate' ? [] : chips}
				onRemoveChip={uid => publish(selected.filter(s => s.uid !== uid))}
				onClearChips={clear}
				onObjectChanged={name => fire(onNeedObject, { name })}
				onTurnEnd={() => fire(onRefresh, { reason: 'turnEnd' })}
				// Only on the gate. What the person typed there is a brief for a
				// PLAN, and sending it to the build agent instead would start
				// making pages for a site nobody has agreed the shape of.
				onSubmitText={
					variant === 'gate'
						? text =>
								fire(onGeneratePlan, {
									name: sources.appName,
									from: hasObjects ? 'existing' : 'prompt',
									prompt: text,
								})
						: undefined
				}
			/>
		</Suspense>
	);

	if (!hasApp) {
		const apps = (sources.apps ?? []).map(a => {
			// Two shapes arrive here. A ui Application document calls them
			// `name`/`title`; a security row calls them `appCode`/`appName`. Both
			// are read rather than renamed upstream, because renaming two keys
			// would otherwise mean mapping an array in KIRun.
			const code = (a.name ?? a.appCode ?? '').trim();
			return {
				code,
				label: (a.title ?? a.appName ?? '').trim() || code,
				// The row's own date, for the tile's second line.
				at: String(a.updatedAt ?? a.createdAt ?? ''),
			};
		});

		// One site is not a choice, so go straight there and save a click with
		// only one possible outcome.
		//
		// NOT while a search is on screen, which is the whole of this condition.
		// This was written when the host handed over every site it had; the list
		// now arrives only as an answer to what somebody typed, and without the
		// guard narrowing a query to its last match teleports them into that
		// site mid-word, with the field they were typing into gone. A search
		// result is a thing to look at and choose from, however few of them
		// there are.
		if (!appQuery.trim() && apps.length === 1 && apps[0].code && onPickApp) {
			if (!soleAppSentRef.current) {
				soleAppSentRef.current = true;
				fire(onPickApp, { name: apps[0].code, title: apps[0].label });
			}
			return (
				<div
					className="comp compBlueprintEditor"
					style={stylePropertiesWithPseudoStates?.comp ?? {}}
				>
					<HelperComponent context={context} definition={definition} />
				</div>
			);
		}

		// A search rather than every site. This list runs to hundreds on a real
		// account, and a wall of near-identical cards is not a picker: nobody
		// scans two hundred names looking for the one they already had in mind.
		// The SERVER filtered these. Searching client-side over a fetched page of
		// sites looks identical and is wrong: this account has 637 sites, a
		// fetch of the first 500 silently omits 137 of them, and the site you
		// wanted is in the missing tail with the search insisting it does not
		// exist. So the query goes to the platform and this renders the answer.
		const query = appQuery.trim();
		const matches = query ? apps.slice(0, MAX_APP_MATCHES) : [];

		// Newest first. `at` is written when a site is opened, so this is the
		// order somebody would guess: the thing they were last working on.
		// `at` is an ISO timestamp string, which is what
		// System.Date.GetCurrentTimestamp hands back. ISO sorts correctly as
		// text, so no parsing is needed; a missing one sorts last rather than
		// throwing, because an entry written before this field existed is still
		// a site somebody opened.
		const recents = Object.entries(sources.recents ?? {})
			.map(([code, r]) => ({
				code,
				label: (r?.title ?? r?.name ?? '').trim() || code,
				at: String(r?.at ?? ''),
			}))
			.sort((a, b) => b.at.localeCompare(a.at))
			.slice(0, MAX_RECENT_APPS);

		// One tile, drawn the same in both rows.
		//
		// It is the account screen's project tile: a square picture of the site
		// with the name and a date over it on frosted glass. Same geometry, the
		// same two type sizes, and the shadow comes from the same themed Grid
		// value rather than a number copied out of a screenshot — so this reads
		// as part of whichever product it is dropped into, and a theme that
		// restyles those tiles restyles these.
		//
		// The picture itself is a property, not something built here. Turning a
		// site into an image is a service the product owns, and a nocode-ui
		// component naming SiteZump's would be dead weight everywhere else.
		const appTile = (a: { code: string; label: string; at: string }) => {
			const shot = appTileImage ? appTileImage.replaceAll('{appCode}', a.code) : '';
			// A date when the row carried one, the code when it did not. Never
			// blank: the second line is what tells two sites with the same name
			// apart, and half the tiles here come from a list that has no date.
			const when = tileDate(a.at);
			const second =
				when?.toLocaleDateString(undefined, {
					year: 'numeric',
					month: 'long',
					day: 'numeric',
				}) ?? a.code;
			return (
				<button
					type="button"
					key={a.code}
					className="comp compGrid _noAnchorGrid _LIGHTLOW _appPickerCard"
					style={shot ? { backgroundImage: `url('${shot}')` } : undefined}
					title={a.code}
					onClick={() => fire(onPickApp, { name: a.code, title: a.label })}
				>
					<SubHelperComponent definition={definition} subComponentName="appPickerCard" />
					<span className="_appPickerFoot">
						<span className="_appPickerName">{a.label}</span>
						<span className="_appPickerMeta">{second}</span>
					</span>
				</button>
			);
		};
		return (
			<div
				className="comp compBlueprintEditor"
				style={stylePropertiesWithPseudoStates?.comp ?? {}}
			>
				<HelperComponent context={context} definition={definition} />
				<div className="_soloState">
					<SubHelperComponent definition={definition} subComponentName="soloState" />
					<h1 className="_soloTitle">
						<SubHelperComponent definition={definition} subComponentName="soloTitle" />
						{pickTitle}
					</h1>
					<p className="_soloText">
						<SubHelperComponent definition={definition} subComponentName="soloText" />
						{pickText}
					</p>
				</div>
				<div className="_appSearchRow">
					<SubHelperComponent definition={definition} subComponentName="appSearchRow" />
					{/* The platform's own input, under the TextBox prefix, NOT a
					    hand-rolled box.

					    This is the difference between a component that can be
					    dropped into App Builder and one that cannot. Styling it
					    myself would bake SiteZump's look into the component, and
					    App Builder would get a search field that matched nothing
					    around it. Borrowing `comp compTextBox` means it renders
					    as whatever the HOST app's theme says a text box is, and
					    it is the same markup and behaviour — magnifier, clear
					    button, focus ring — as the search on Projects. */}
					<CommonInputText
						cssPrefix="comp compTextBox"
						id={`${definition.key}_appSearch`}
						noFloat={true}
						readOnly={false}
						value={appQuery}
						translations={pageDefinition.translations ?? {}}
						placeholder={pickPlaceholder}
						leftIcon={searchIcon}
						context={context}
						definition={definition}
						// `_default` and `_primary`, NOT empty strings. Every themed
						// rule for a text box is selected as
						// `.compTextBox<designType><colorScheme>`, so an empty
						// designType strips the class the theme keys off and the
						// field renders with no border and no background at all —
						// which is exactly what it did on the first attempt.
						designType="_default"
						colorScheme="_primary"
						handleChange={e => {
							setAppQuery(e.target.value);
							askServerToSearch(e.target.value);
						}}
						clearContentHandler={() => {
							setAppQuery('');
							if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
						}}
					/>
					<span className="_appSearchCount">
						{query && apps.length ? `${apps.length} found` : ''}
					</span>
				</div>

				{/* Only while nothing is chosen. Inside a site, a row of other
				    sites is clutter on a screen that is about this one. */}
				{!query && recents.length ? (
					<>
						<div className="_appSearchRow _recentLabel">
							<span className="_lensLabel">Recent</span>
						</div>
						<div className="_appPickerRow">{recents.map(appTile)}</div>
					</>
				) : null}
				<div className="_appPickerRow">
					<SubHelperComponent definition={definition} subComponentName="appPickerRow" />
					{matches.map(appTile)}
					{/* An empty list is the RESTING state now, not a verdict on the
					    account: the search asks the platform and nothing is
					    fetched until somebody types. Saying "you have no sites"
					    here would be a confident lie to anyone with hundreds. */}
					{query && !matches.length ? (
						<p className="_soloText">No site matches “{query}”.</p>
					) : null}
				</div>
			</div>
		);
	}

	// No plan: ask for one before working on it. A plan is what everything
	// else on this screen is a view of, so a board with nothing behind it is
	// an invitation to edit a document that does not exist.
	if (model.unplannedApp) {
		return (
			<div
				className="comp compBlueprintEditor"
				style={stylePropertiesWithPseudoStates?.comp ?? {}}
			>
				<HelperComponent context={context} definition={definition} />
				<div className="_soloState">
					<SubHelperComponent definition={definition} subComponentName="soloState" />
					<h1 className="_soloTitle">
						<SubHelperComponent definition={definition} subComponentName="soloTitle" />
						{hasObjects ? derivedTitle : newTitle}
					</h1>
					<p className="_soloText">
						<SubHelperComponent definition={definition} subComponentName="soloText" />
						{hasObjects ? derivedText : newText}
					</p>
					{hasObjects && !planning ? (
						<div className="_actionRow">
							<button
								type="button"
								className="_actionButton _primary"
								onClick={() =>
									fire(onGeneratePlan, {
										name: sources.appName,
										from: 'existing',
									})
								}
							>
								<SubHelperComponent
									definition={definition}
									subComponentName="actionButton"
								/>
								{derivedSubmitLabel}
							</button>
						</div>
					) : null}
					{/* The button is replaced by what it started, rather than sitting
					    beside it. Reading a whole site takes minutes, and a button that
					    stays pressable through that is an invitation to start a second
					    sweep over the objects the first one is still writing. */}
					{renderProgress()}
					<div className="_noteAside">
						<SubHelperComponent definition={definition} subComponentName="noteAside" />
						This is the only thing we ask up front. Everything a setup wizard would
						demand is a card on the plan, where you can see it in context.
					</div>
				</div>
				{chat(
					'gate',
					hasObjects ? askPlaceholder : newPlaceholder,
					hasObjects ? 'Start from this' : newSubmitLabel,
				)}
			</div>
		);
	}

	// ── the board ─────────────────────────────────────────────────────

	const renderPreview = (card: BoardCard) => (
		<div className="_previewFrame">
			<SubHelperComponent definition={definition} subComponentName="previewFrame" />
			<div className="_previewBody">
				<SubHelperComponent definition={definition} subComponentName="previewBody" />
				<div className="_phHead" />
				<div className="_phText" style={{ width: '76%' }} />
				<div className="_phText" style={{ width: '52%' }} />
				{card.chrome ? null : <div className="_phButton" />}
			</div>
			<div className="_previewCaption">
				<SubHelperComponent definition={definition} subComponentName="previewCaption" />
				Roughly this shape
			</div>
		</div>
	);

	// One icon per band. Delivery and the product boundary are bands rather than
	// object kinds, so they have no `<kind>Icon` property of their own; they take
	// the shared chrome icon rather than pretending to be a page.
	//
	// The seven kinds below take a fixed icon rather than a property each. Seven
	// more slots in the property panel is a worse trade than a fixed picture on
	// a board that is read far more often than it is restyled, and pages and
	// storages keep their properties because those two are what a host actually
	// rebrands.
	const columnIcon = (kind: string) => {
		if (kind === 'storage') return storageIcon;
		if (kind === 'delivery') return deliveryIcon;
		if (kind === 'boundary') return boundaryIcon;
		return KIND_ICONS[kind] ?? pageIcon;
	};

	const renderDetail = (card: BoardCard, column: BoardColumn) => (
		<div
			className="_cardDetail"
			role="presentation"
			onClick={e => e.stopPropagation()}
			onKeyDown={e => e.stopPropagation()}
		>
			<SubHelperComponent definition={definition} subComponentName="cardDetail" />

			{card.componentKey ? renderPreview(card) : null}

			<div className="_fieldRow">
				<SubHelperComponent definition={definition} subComponentName="fieldRow" />
				<span className="_fieldLabel">
					<SubHelperComponent definition={definition} subComponentName="fieldLabel" />
					{card.stated ? 'What it is for' : 'What it is'}
				</span>
				{card.description ? (
					<div className="_fieldValue">
						<SubHelperComponent definition={definition} subComponentName="fieldValue" />
						{card.description}
					</div>
				) : (
					<div className="_fieldValue _placeholder">
						Nothing describes this yet. Press Explain this and I will read it.
					</div>
				)}
				{card.description && !card.stated ? (
					<span className="_fieldHint">
						<SubHelperComponent definition={definition} subComponentName="fieldHint" />
						Read from what is built. Nobody has said what it is FOR, which is the part
						only you can answer.
					</span>
				) : null}
			</div>

			<div className="_actionRow">
				<SubHelperComponent definition={definition} subComponentName="actionRow" />
				{card.status === 'pending' && onApply ? (
					<button
						type="button"
						className="_actionButton _primary"
						onClick={() =>
							// `title` and `description` ride along because applying is
							// the one action no endpoint can do: it is a BUILD, so the
							// host turns it into a request somebody can read, and a uid
							// is not something anybody can read.
							fire(onApply, {
								uid: card.uid,
								object: column.name,
								title: card.title,
								description: card.description,
							})
						}
					>
						<SubHelperComponent
							definition={definition}
							subComponentName="actionButton"
						/>
						Put this on the site
					</button>
				) : null}
				{card.status === 'drifted' && onUpdatePlan ? (
					<button
						type="button"
						className="_actionButton"
						onClick={() =>
							fire(onUpdatePlan, {
								uid: card.uid,
								object: column.name,
								componentKey: card.componentKey,
							})
						}
					>
						<SubHelperComponent
							definition={definition}
							subComponentName="actionButton"
						/>
						Update the plan
					</button>
				) : null}
				{onExplain ? (
					<button
						type="button"
						className="_actionButton _quiet"
						onClick={() =>
							fire(onExplain, {
								uid: card.uid,
								object: column.name,
								componentKey: card.componentKey,
							})
						}
					>
						<SubHelperComponent
							definition={definition}
							subComponentName="actionButton"
						/>
						{card.description ? 'Explain again' : 'Explain this'}
					</button>
				) : null}
			</div>
		</div>
	);

	const renderCard = (card: BoardCard, column: BoardColumn) => {
		const isSelected = selected.some(s => s.uid === card.uid);
		const isExpanded = expanded === card.uid;
		const dim = lens && card.feature !== lens && column.feature !== lens;
		const word = STATUS_WORDS[card.status];

		return (
			// A div rather than a button, because the expansion inside it holds
			// buttons of its own and a button inside a button is invalid markup
			// that browsers resolve by dropping one of them.
			<div
				key={card.uid}
				role="button"
				tabIndex={0}
				className={`_planCard${card.chrome ? ' _chrome' : ''}${
					isSelected ? ' _selected' : ''
				}${isExpanded ? ' _expanded' : ''}${card.unplanned ? ' _unplanned' : ''}${
					!card.componentKey ? ' _notBuilt' : ''
				}`}
				style={{ opacity: dim ? 0.4 : undefined }}
				onClick={e => {
					e.stopPropagation();
					pick(
						{
							uid: card.uid,
							kind: 'card',
							title: card.title,
							parent: column.title,
							componentKey: card.componentKey,
						},
						e.metaKey || e.ctrlKey || e.shiftKey,
					);
				}}
				onKeyDown={e => {
					if (e.key !== 'Enter' && e.key !== ' ') return;
					e.preventDefault();
					e.stopPropagation();
					pick(
						{
							uid: card.uid,
							kind: 'card',
							title: card.title,
							parent: column.title,
							componentKey: card.componentKey,
						},
						e.metaKey || e.ctrlKey || e.shiftKey,
					);
				}}
			>
				<SubHelperComponent definition={definition} subComponentName="planCard" />
				<div className="_cardTitle">
					<SubHelperComponent definition={definition} subComponentName="cardTitle" />
					{card.chrome && chromeIcon ? (
						<i className={`_chromeCardIcon ${chromeIcon}`} />
					) : null}
					{card.title}
				</div>
				{card.description && !card.chrome ? (
					<div className="_cardDescription">
						<SubHelperComponent
							definition={definition}
							subComponentName="cardDescription"
						/>
						{card.description}
					</div>
				) : null}
				{word ? (
					<span className={`_statusMark _${card.status}`}>
						<SubHelperComponent definition={definition} subComponentName="statusMark" />
						<span className="_statusDot">
							<SubHelperComponent
								definition={definition}
								subComponentName="statusDot"
							/>
						</span>
						{word}
					</span>
				) : null}
				{advanced ? (
					<span className="_advMeta">
						{card.uid} · order {card.order}
						{card.feature ? ` · ${card.feature}` : ''}
						{card.componentKey ? ` · ${card.componentKey}` : ''}
					</span>
				) : null}
				{!readOnly ? (
					<span className="_cardMenu">
						<SubHelperComponent definition={definition} subComponentName="cardMenu" />
						<i className={menuIcon} />
					</span>
				) : null}
				{isExpanded ? renderDetail(card, column) : null}
			</div>
		);
	};

	const renderColumn = (column: BoardColumn) => {
		const isSelected = selected.some(s => s.uid === column.uid);
		const dim = lens && column.feature !== lens && !column.cards.some(c => c.feature === lens);
		return (
			<div
				key={column.uid}
				className={`_railColumn _${column.kind}${column.planned ? ' _planned' : ''}`}
				style={{ opacity: dim ? 0.45 : undefined }}
			>
				<SubHelperComponent definition={definition} subComponentName="railColumn" />
				<button
					type="button"
					className={`_columnHeader${isSelected ? ' _selected' : ''}`}
					onClick={e => {
						e.stopPropagation();
						pick(
							{
								uid: column.uid,
								kind: 'column',
								title: column.title,
								// The object's OWN name and kind, which is what a fetch
								// needs. `title` is the plan's label when it has one, so
								// asking for it by title would ask for a page that does
								// not exist the moment somebody renames a column.
								name: column.name,
								objectKind: column.kind,
							},
							e.metaKey || e.ctrlKey || e.shiftKey,
						);
					}}
				>
					<SubHelperComponent definition={definition} subComponentName="columnHeader" />
					<i className={`_columnIcon ${columnIcon(column.kind)}`} />
					<span className="_columnName">
						<SubHelperComponent definition={definition} subComponentName="columnName" />
						{column.title}
					</span>
					<span className="_columnRollup">
						<SubHelperComponent
							definition={definition}
							subComponentName="columnRollup"
						/>
						{/* A number only when there is something to count. The list
						    route carries no definitions, so a column that nobody has
						    opened yet has not been READ, and printing 0 there says the
						    page is empty, which is a different and usually false
						    statement. */}
						{/* "not built" is about an object the plan wants and the app
					    does not have. On a derived band it would be a category
					    error: an address is not waiting to be built, and a
					    request that is not part of a site is never going to be. */}
						{DERIVED_BANDS.has(column.kind)
							? ''
							: column.planned
								? 'not built'
								: column.cards.length || ''}
					</span>
					{!readOnly ? (
						<span className="_columnMenu">
							<SubHelperComponent
								definition={definition}
								subComponentName="columnMenu"
							/>
							<i className={menuIcon} />
						</span>
					) : null}
				</button>

				{column.cards.map(c => renderCard(c, column))}

				{allowAdd && !readOnly && !column.planned && !DERIVED_BANDS.has(column.kind) ? (
					<button
						type="button"
						className="_addCardBox"
						onClick={e => {
							e.stopPropagation();
							fire(onChange, { object: column.name, action: 'addCard' });
						}}
					>
						<SubHelperComponent definition={definition} subComponentName="addCardBox" />
						+ Add {column.kind === 'storage' ? 'a field' : 'a section'}
					</button>
				) : null}
			</div>
		);
	};

	return (
		<div
			className={`comp compBlueprintEditor _split${dragging ? ' _dragging' : ''}`}
			style={{
				...(stylePropertiesWithPseudoStates?.comp ?? {}),
				...(fitHeight ? { height: `${fitHeight}px` } : {}),
			}}
			ref={setSplitNode}
		>
			<HelperComponent context={context} definition={definition} />

			{/* The conversation, on the left, scrolling in its own pane with the
			    box pinned to the bottom of it. */}
			<div className="_chatPane" style={{ flexBasis: `${chatWidth}%` }}>
				{chat('board', askPlaceholder, sendLabel || 'Send')}
			</div>

			{/* The grab strip. A button so a keyboard can move it too: the split
			    is a real preference and a mouse-only control would lock anybody
			    who does not use one out of it. */}
			<button
				type="button"
				className="_splitHandle"
				aria-label="Resize the conversation"
				aria-orientation="vertical"
				onMouseDown={e => {
					e.preventDefault();
					startDrag();
				}}
				onKeyDown={e => {
					if (e.key === 'ArrowRight') setChatWidth(w => Math.min(MAX_CHAT_PCT, w + 2));
					else if (e.key === 'ArrowLeft')
						setChatWidth(w => Math.max(MIN_CHAT_PCT, w - 2));
					else return;
					e.preventDefault();
				}}
			/>

			{/* The plan, which gets the rest and most of it. */}
			<div className="_boardPane">
				<div className="_boardHeader" role="presentation" onClick={clear} onKeyDown={clear}>
					<SubHelperComponent definition={definition} subComponentName="boardHeader" />
					{model.title ? (
						<h1 className="_boardTitle">
							<SubHelperComponent
								definition={definition}
								subComponentName="boardTitle"
							/>
							{model.title}
						</h1>
					) : null}
					{model.description ? (
						<p className="_boardDescription">
							<SubHelperComponent
								definition={definition}
								subComponentName="boardDescription"
							/>
							{model.description}
						</p>
					) : null}
					{/* Reading the site again, on purpose and on demand.
				    A plan drifts from the site the moment anybody edits a page,
				    and the alternative to a button here is re-reading on every
				    open, which spends tokens on the ninety-nine visits that
				    wanted to look at the plan rather than rebuild it. Disabled
				    rather than hidden while a sweep runs, because a control that
				    vanishes reads as a bug. */}
					{!readOnly && onGeneratePlan ? (
						<div className="_actionRow">
							<button
								type="button"
								className="_actionButton"
								disabled={planning}
								onClick={e => {
									e.stopPropagation();
									fire(onGeneratePlan, {
										name: sources.appName,
										from: 'regenerate',
									});
								}}
							>
								<SubHelperComponent
									definition={definition}
									subComponentName="actionButton"
								/>
								{planning
									? 'Reading the site'
									: regenerateLabel || 'Read the site again'}
							</button>
						</div>
					) : null}
					{renderProgress()}
				</div>

				{showLens && model.features.length ? (
					<div className="_lensRow">
						<SubHelperComponent definition={definition} subComponentName="lensRow" />
						<span className="_lensLabel">
							<SubHelperComponent
								definition={definition}
								subComponentName="lensLabel"
							/>
							It does
						</span>
						<button
							type="button"
							className={`_lensChip${lens === '' ? ' _selected' : ''}`}
							onClick={() => setLens('')}
						>
							<SubHelperComponent
								definition={definition}
								subComponentName="lensChip"
							/>
							Everything
						</button>
						{model.features.map(f => (
							<button
								type="button"
								key={f.uid}
								className={`_lensChip${lens === f.uid ? ' _selected' : ''}`}
								onClick={() => setLens(lens === f.uid ? '' : f.uid)}
								title={f.intent}
							>
								<SubHelperComponent
									definition={definition}
									subComponentName="lensChip"
								/>
								{f.name}
								<span className="_lensChipCount">
									<SubHelperComponent
										definition={definition}
										subComponentName="lensChipCount"
									/>
									{f.count}
								</span>
							</button>
						))}
					</div>
				) : null}

				{visibleBands.map(band => (
					<div className="_band" key={band.kind}>
						<SubHelperComponent definition={definition} subComponentName="band" />
						<h2 className="_bandHeading">
							<SubHelperComponent
								definition={definition}
								subComponentName="bandHeading"
							/>
							{band.heading}
						</h2>
						{band.subLine ? (
							<p className="_bandSubLine">
								<SubHelperComponent
									definition={definition}
									subComponentName="bandSubLine"
								/>
								{band.subLine}
							</p>
						) : null}
						<div className="_rail">
							<SubHelperComponent definition={definition} subComponentName="rail" />
							{band.columns.map(renderColumn)}
							{allowAdd && !readOnly && !DERIVED_BANDS.has(band.kind) ? (
								<button
									type="button"
									className="_addColumnBox"
									onClick={e => {
										e.stopPropagation();
										fire(onChange, { kind: band.kind, action: 'addColumn' });
									}}
								>
									<SubHelperComponent
										definition={definition}
										subComponentName="addColumnBox"
									/>
									<i className={addIcon} />
								</button>
							) : null}
						</div>
					</div>
				))}

				{noteMessage ? (
					<div className="_noteAside">
						<SubHelperComponent definition={definition} subComponentName="noteAside" />
						{noteMessage}
					</div>
				) : null}
			</div>
		</div>
	);
}

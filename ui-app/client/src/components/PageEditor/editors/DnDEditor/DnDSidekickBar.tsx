import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ComponentDefinitions from '../../..';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	setData,
} from '../../../../context/StoreContext';
import {
	ComponentDefinition,
	ComponentProps,
	LocationHistory,
	PageDefinition,
	RenderContext,
} from '../../../../types/common';
import { PageOperations } from '../../functions/PageOperations';

/**
 * The AI panel, docked in the editor chrome.
 *
 * It renders the ordinary Prompt component rather than a second chat UI. Prompt
 * takes plain ComponentProps, and PageEditor is itself a component so it already
 * has them, which means the whole conversation surface (sessions, tool cards,
 * thinking blocks, attachments, voice) comes along for free. The definition is
 * synthesized here instead of authored on a page, because the interesting
 * properties are things only this component knows: which component is selected,
 * and where the page under edit lives.
 *
 * Docking is what buys that. A pane beside the editor would reach the page
 * definition identically, since it lives in the page store either way; what it
 * could not reach is the selection, PageOperations and the iframe refs, which
 * exist only in LazyPageEditor's React state.
 */

interface SidekickBarProps {
	defPath: string | undefined;
	personalizationPath: string | undefined;
	onChangePersonalization: (prop: string, value: any) => void;
	pageExtractor: PageStoreExtractor;
	locationHistory: Array<LocationHistory>;
	context: RenderContext;
	pageDefinition: PageDefinition;
	selectedComponent: string | undefined;
	selectedSubComponent: string;
	pageOperations: PageOperations;
	appCode: string | undefined;
	agentEndpoint: string;
	/** Send the agent's edits to the draft surface, where the editor saves too. */
	draftMode: boolean;
	previewMode: boolean;
	enabled: boolean;
	/** Held by DnDEditor, because the side rail's toggle needs the same bit. */
	open: boolean;
	/** A write that really did save, so the canvas may be showing stale state. */
	onObjectSaved: (data: any) => void;
}

const DEFAULT_WIDTH = 380;
const MIN_WIDTH = 300;
const MAX_WIDTH = 720;

export default function DnDSidekickBar({
	defPath,
	personalizationPath,
	onChangePersonalization,
	pageExtractor,
	locationHistory,
	context,
	pageDefinition,
	selectedComponent,
	selectedSubComponent,
	pageOperations,
	appCode,
	agentEndpoint,
	draftMode,
	previewMode,
	enabled,
	open,
	onObjectSaved,
}: Readonly<SidekickBarProps>) {
	const [width, setWidth] = useState(DEFAULT_WIDTH);

	useEffect(() => {
		if (!personalizationPath) return;
		return addListenerAndCallImmediately(
			pageExtractor.getPageName(),
			(_, v) => setWidth(typeof v === 'number' ? v : DEFAULT_WIDTH),
			`${personalizationPath}.sidekickWidth`,
		);
	}, [personalizationPath, pageExtractor]);

	// Where the descriptor list lives. Page-scoped and prefixed, so it cannot
	// collide with anything the hosting page keeps for itself.
	const draftsPath = `Page._peSidekick.drafts`;

	// Declare the page as a CLIENT-HELD draft, but only when the agent is not
	// writing to the server draft surface.
	//
	// The two are alternatives for the same object, not complements. Holding a
	// write in the browser is what made the agent blind to its own work: a change
	// that never reached the database cannot be screenshotted, so the agent looked
	// at the live page, saw nothing, and went hunting for a bug that was not there.
	// With draft mode on, its writes go to the app's draft surface instead, the
	// editor reads that same surface, and the agent can render it and see what it
	// did.
	//
	// The cost, stated rather than hidden: the agent no longer sees edits the user
	// has made and not yet saved, because those exist only in this browser. Saving
	// is cheap now -- it goes to the draft, not to live -- so the answer is to save
	// first, not to hold the write.
	useEffect(() => {
		if (!enabled || !defPath || draftMode) return;
		setData(draftsPath, [{ kind: 'page', path: defPath }], context.pageName);
		return () => setData(draftsPath, undefined, context.pageName);
	}, [enabled, defPath, draftsPath, context.pageName, draftMode]);

	// Name the selection the way a person would, so the agent can act on "make
	// this red" without being handed a bare uuid it has to go and look up.
	const activeObject = useMemo(() => {
		if (!selectedComponent) return '';
		const comp = pageOperations.getComponentDefinition(selectedComponent);
		if (!comp) return '';
		const sub = selectedSubComponent?.split(':')[1];
		const label = `${comp.type} '${comp.name ?? comp.key}' (key ${comp.key})`;
		return sub ? `${label}, sub-part '${sub}'` : label;
	}, [selectedComponent, selectedSubComponent, pageOperations]);

	const definition = useMemo<ComponentDefinition>(
		() => ({
			key: 'peSidekick',
			name: 'peSidekick',
			type: 'Prompt',
			properties: {
				agentEndpoint: { value: agentEndpoint },
				targetAppCode: { value: appCode ?? '' },
				contextSurface: { value: 'the Modlix page editor canvas' },
				activeObject: { value: activeObject },
				openDraftsPath: { value: draftsPath },
				draftMode: { value: draftMode },
				placeholder: { value: 'Describe a change to this page...' },
				welcomeMessage: {
					value: draftMode
						? 'Changes go to this app\u2019s draft. Review them, then publish.'
						: 'Changes land on the canvas unsaved. Review, then Save.',
				},
				showSessions: { value: true },
				sessionsMode: { value: '_overlay' },
				showToolCalls: { value: true },
				enableFeedback: { value: false },
				enableVoiceInput: { value: false },
				showModelSelector: { value: false },
			},
		}),
		[agentEndpoint, appCode, activeObject, draftsPath, draftMode],
	);

	const barRef = useRef<HTMLDivElement>(null);

	const onResizeStart = useCallback(
		(e: React.MouseEvent<HTMLButtonElement>) => {
			e.preventDefault();
			const startX = e.clientX;
			const startWidth = barRef.current?.getBoundingClientRect().width ?? width;

			const onMove = (ev: MouseEvent) => {
				// The panel is on the right, so dragging left widens it.
				const next = Math.min(
					MAX_WIDTH,
					Math.max(MIN_WIDTH, startWidth + (startX - ev.clientX)),
				);
				setWidth(next);
			};
			const onUp = (ev: MouseEvent) => {
				document.removeEventListener('mousemove', onMove);
				document.removeEventListener('mouseup', onUp);
				const next = Math.min(
					MAX_WIDTH,
					Math.max(MIN_WIDTH, startWidth + (startX - ev.clientX)),
				);
				onChangePersonalization('sidekickWidth', next);
			};
			document.addEventListener('mousemove', onMove);
			document.addEventListener('mouseup', onUp);
		},
		[width, onChangePersonalization],
	);

	if (!enabled || previewMode || !open) return <></>;

	const Prompt = ComponentDefinitions.get('Prompt')?.component;
	if (!Prompt) return <></>;

	const promptProps: ComponentProps & { onObjectSaved: (d: any) => void } = {
		definition,
		pageDefinition,
		locationHistory,
		context,
		onObjectSaved,
	};

	return (
		<div className="_peSidekickBar" style={{ width: `${width}px` }} ref={barRef}>
			<button
				className="_peSidekickResizer"
				onMouseDown={onResizeStart}
				aria-label="Resize the AI panel"
			/>
			<div className="_peSidekickHeader">
				<span className="_peSidekickTitle">Sidekick</span>
				<button
					className="_peSidekickClose"
					title="Close"
					onClick={() => onChangePersonalization('sidekickOpen', false)}
				>
					<i className="fa fa-xmark" />
				</button>
			</div>
			<div className="_peSidekickBody">
				<Prompt {...promptProps} />
			</div>
		</div>
	);
}

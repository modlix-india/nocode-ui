import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { STORE_PATH_APP, STORE_PATH_SELECTED_THEME } from '../../constants';
import {
	addListenerAndCallImmediately,
	PageStoreExtractor,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { selectTheme } from '../../util/selectTheme';
import { ThemeEntry, themeEntries } from '../../util/themeSelection';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import Portal from '../Portal';
import getPositions from '../util/getPositions';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './themeSwitcherProperties';
import ThemeSwitcherStyle from './ThemeSwitcherStyle';
import { styleDefaults, styleProperties } from './themeSwitcherStyleProperties';

interface PanelCoordinates {
	left?: number;
	top?: number;
	right?: number;
	bottom?: number;
	/** The stand-off from the trigger, which side depending on the placement. */
	marginTop?: string;
	marginBottom?: string;
	marginLeft?: string;
	marginRight?: string;
}

/**
 * The themes to offer come straight out of the app definition, so there is no
 * binding path and nothing for the page author to wire up. `Store.selectedTheme`
 * always holds a name that actually resolved, which is why the active marker can
 * never point at a theme that has been deleted.
 */
function ThemeSwitcher(props: Readonly<ComponentProps>) {
	const {
		definition,
		locationHistory,
		context,
		pageDefinition,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);
	const {
		key,
		properties: { designType, showLabel, position, onChange, readOnly } = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
	);

	const resolvedStyles = processComponentStylePseudoClasses(
		pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	const [application, setApplication] = useState<any>();
	const [selected, setSelected] = useState<string | undefined>();
	const [open, setOpen] = useState(false);
	const [coords, setCoords] = useState<PanelCoordinates | undefined>();
	const [switching, setSwitching] = useState(false);

	const triggerRef = useRef<HTMLButtonElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);

	useEffect(
		() =>
			addListenerAndCallImmediately(
				pageExtractor.getPageName(),
				(_, value) => setApplication(value),
				STORE_PATH_APP,
			),
		[],
	);

	useEffect(
		() =>
			addListenerAndCallImmediately(
				pageExtractor.getPageName(),
				(_, value) => setSelected(value),
				STORE_PATH_SELECTED_THEME,
			),
		[],
	);

	const themes = useMemo(() => themeEntries(application), [application]);

	// Layout effect, not an effect: the panel is portalled to the end of the body,
	// so an unpositioned fixed box paints at the origin for a frame before the
	// coordinates land.
	useLayoutEffect(() => {
		if (!open) {
			setCoords(undefined);
			return;
		}
		if (!triggerRef.current || !panelRef.current) return;

		const positions = getPositions(
			position,
			triggerRef.current.getBoundingClientRect(),
			panelRef.current.getBoundingClientRect(),
		)!;
		// `marginContainer` as well as `coords`. It is the 14px the panel is meant to
		// stand off its trigger, and it flips side with the placement (marginTop when
		// the panel opens below, marginBottom when it flips above), which is why it
		// comes from getPositions rather than from the stylesheet. Taking coords alone
		// pinned the panel against the trigger and its first row ran into the app
		// header's bottom edge.
		setCoords({ ...positions.coords, ...positions.marginContainer });
	}, [open, position, themes.length]);

	useEffect(() => {
		if (!open) return;
		const close = () => setOpen(false);
		document.body.addEventListener('click', close);
		return () => document.body.removeEventListener('click', close);
	}, [open]);

	const apply = useCallback(
		async (name: string) => {
			if (readOnly || switching || name === selected) {
				setOpen(false);
				return;
			}

			// Guarded rather than merely debounced: a second switch started while the
			// first is still fetching would race two stylesheet swaps, and the loser
			// removes the winner's link.
			setSwitching(true);
			try {
				await selectTheme(name);
			} finally {
				setSwitching(false);
				setOpen(false);
			}

			const eventFunction = onChange ? pageDefinition.eventFunctions?.[onChange] : undefined;
			if (eventFunction)
				await runEvent(
					eventFunction,
					onChange,
					context.pageName,
					locationHistory,
					pageDefinition,
				);
		},
		[readOnly, switching, selected, onChange, pageDefinition, context.pageName, locationHistory],
	);

	const renderIcon = (entry: ThemeEntry) =>
		entry.icon ? (
			<i
				className={`${entry.icon} _themeIcon`}
				style={{ ...(resolvedStyles.icon ?? {}), color: entry.iconColor || undefined }}
			>
				<SubHelperComponent definition={definition} subComponentName="icon" />
			</i>
		) : null;

	const renderLabel = (entry: ThemeEntry, force = false) =>
		showLabel || force ? (
			<span className="_label" style={resolvedStyles.label ?? {}}>
				<SubHelperComponent definition={definition} subComponentName="label" />
				{entry.displayName || entry.name}
			</span>
		) : null;

	/**
	 * `showLabel` governs the RESTING control, never the popover's list. A header
	 * wants a single icon for a trigger, but a panel of icons alone is a guessing
	 * game: six palettes here are three light/dark pairs, so the rows differ only
	 * by the tint of a sun or a moon, and nothing says which blue is which. The
	 * open list is also the one place there is room for the name.
	 */
	const option = (entry: ThemeEntry, active: boolean, labelled = false) => (
		<button
			key={entry.name}
			type="button"
			className={`_option ${active ? '_active' : ''}`}
			style={resolvedStyles.option ?? {}}
			disabled={readOnly || switching}
			aria-pressed={active}
			title={entry.displayName || entry.name}
			onClick={e => {
				e.stopPropagation();
				apply(entry.name);
			}}
		>
			<SubHelperComponent definition={definition} subComponentName="option" />
			{renderIcon(entry)}
			{renderLabel(entry, labelled)}
		</button>
	);

	const helper = <HelperComponent context={context} definition={definition} />;
	const active = themes.find(e => e.name === selected) ?? themes[0];

	// An app with no themes has nothing to switch between, and one with a single
	// theme has nothing to switch to. Rendering an inert control in either case is
	// worse than rendering nothing, because it looks operable.
	if (themes.length < 2)
		return (
			<div
				className="comp compThemeSwitcher"
				style={resolvedStyles.comp ?? {}}
				data-empty="true"
			>
				{helper}
			</div>
		);

	if (designType === '_toggle') {
		const [first, second] = themes;
		const isOn = active?.name === second.name;
		const shown = isOn ? second : first;

		return (
			<button
				type="button"
				id={key}
				className={`comp compThemeSwitcher _toggle ${isOn ? '_on' : '_off'}`}
				style={resolvedStyles.comp ?? {}}
				disabled={readOnly || switching}
				aria-pressed={isOn}
				title={shown.displayName || shown.name}
				onClick={() => apply(isOn ? first.name : second.name)}
			>
				{helper}
				<span className="_track">
					<span className="_knob">{renderIcon(shown)}</span>
				</span>
				{renderLabel(shown)}
			</button>
		);
	}

	if (designType === '_popover') {
		return (
			<div
				className="comp compThemeSwitcher _popover"
				style={resolvedStyles.comp ?? {}}
				onClick={e => e.stopPropagation()}
			>
				{helper}
				<button
					type="button"
					id={key}
					ref={triggerRef}
					className="_trigger"
					disabled={readOnly || switching}
					aria-haspopup="listbox"
					aria-expanded={open}
					onClick={() => setOpen(!open)}
				>
					{active ? renderIcon(active) : null}
					{active ? renderLabel(active) : null}
				</button>
				{open ? (
					<Portal>
						<div
							ref={panelRef}
							className="_themeSwitcherPanel"
							role="listbox"
							style={{ ...(resolvedStyles.panel ?? {}), ...(coords ?? {}) }}
							onClick={e => e.stopPropagation()}
						>
							<SubHelperComponent
								definition={definition}
								subComponentName="panel"
							/>
							{themes.map(e => option(e, e.name === active?.name, true))}
						</div>
					</Portal>
				) : null}
			</div>
		);
	}

	return (
		<div
			id={key}
			className="comp compThemeSwitcher _segmented"
			style={resolvedStyles.comp ?? {}}
			role="group"
		>
			{helper}
			{themes.map(e => option(e, e.name === active?.name))}
		</div>
	);
}

const component: Component = {
	name: 'ThemeSwitcher',
	displayName: 'Theme Switcher',
	description: "Lets the visitor pick one of the application's themes",
	component: ThemeSwitcher,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: ThemeSwitcherStyle,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	stylePropertiesForTheme: styleProperties,
	defaultTemplate: {
		key: '',
		type: 'ThemeSwitcher',
		name: 'ThemeSwitcher',
		properties: {},
	},
	sections: [{ name: 'Theme Switcher', pageName: 'themeswitcher' }],
};

export default component;

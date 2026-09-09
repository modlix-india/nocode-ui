import React, { useCallback, useRef } from 'react';
import { STORE_PATH_FUNCTION_EXECUTION } from '../../constants';
import {
	getDataFromPath,
	PageStoreExtractor,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { announceShortcut } from '../../shortcuts/ShortcutChooser';
import { useShortcut } from '../../shortcuts/useShortcut';
import { messageToMaster } from '../../slaveFunctions';
import { Component, ComponentProps } from '../../types/common';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { getTranslations } from '../util/getTranslations';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { flattenUUID } from '../util/uuid';
import { propertiesDefinition, stylePropertiesDefinition } from './shortcutProperties';
import ShortcutIcon from './ShortcutIcon';
import ShortcutComponentStyle from './ShortcutStyle';

/**
 * A non-visual component that binds a keyboard shortcut to a page event function.
 *
 * Being a component rather than a page property is what buys the useful behaviour:
 * the `visibility` expression makes the shortcut conditional, an ArrayRepeater gives
 * each row its own, dropping it inside a Popup scopes it to that dialog, and putting
 * it on the shell page with Whole App scope makes it app wide.
 */
function ShortcutComponent(props: Readonly<ComponentProps>) {
	const { definition, pageDefinition, locationHistory, context } = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);

	const {
		key,
		properties: {
			shortcutKey,
			onShortcut,
			label: shortcutLabel,
			shortcutGroup,
			shortcutScope,
			shortcutPriority,
			allowInInput,
			preventDefault,
			left = 0,
			top = 0,
		} = {},
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
	);

	const label =
		getTranslations(shortcutLabel, pageDefinition.translations) ||
		definition.name ||
		'Shortcut';
	const group = getTranslations(shortcutGroup, pageDefinition.translations);

	const onTrigger = useCallback(() => {
		const eventFunction = onShortcut ? pageDefinition.eventFunctions?.[onShortcut] : undefined;
		if (!eventFunction) return;

		// Same guard the page onLoad uses, so a held key cannot stack executions.
		const functionKey = `shortcut_${flattenUUID(definition.key)}`;
		if (
			getDataFromPath(
				`${STORE_PATH_FUNCTION_EXECUTION}.${context.pageName}.${functionKey}.isRunning`,
				locationHistory,
				pageExtractor,
			)
		)
			return;

		announceShortcut(label);

		(async () =>
			runEvent(
				eventFunction,
				functionKey,
				context.pageName,
				locationHistory,
				pageDefinition,
			))();
	}, [
		onShortcut,
		pageDefinition,
		definition.key,
		context.pageName,
		locationHistory,
		pageExtractor,
		label,
	]);

	useShortcut({
		spec: shortcutKey,
		label,
		group,
		pageName: context.pageName,
		componentKey: key,
		name: definition.name,
		level: context.level,
		scope: shortcutScope ?? 'PAGE',
		priority: shortcutPriority ?? 0,
		disabled: !onShortcut || !pageDefinition.eventFunctions?.[onShortcut],
		allowInInput,
		preventDefault,
		onTrigger,
	});

	const ref = useRef<HTMLDivElement>(null);

	if (!globalThis.designMode) return <></>;

	return (
		<div
			className="comp compShortcut"
			ref={ref}
			title={`Shortcut: ${shortcutKey ?? 'not set'}`}
			style={{ transform: `translate(${left}px, ${top}px)` }}
			onMouseDown={ev => {
				ev.preventDefault();
				ev.stopPropagation();

				if (!ref.current || ev.button !== 0) return;

				const startX = ev.clientX;
				const startY = ev.clientY;
				let newX = left;
				let newY = top;

				const mouseMoveHandler = (e: MouseEvent) => {
					e.preventDefault();
					e.stopPropagation();
					if (!ref.current) return;

					newX = left + e.clientX - startX;
					newY = top + e.clientY - startY;
					ref.current.style.transform = `translate(${newX}px, ${newY}px)`;
				};

				const mouseUpHandler = (e: MouseEvent) => {
					e.preventDefault();
					e.stopPropagation();
					document.body.removeEventListener('mousemove', mouseMoveHandler);
					document.body.removeEventListener('mouseup', mouseUpHandler);

					messageToMaster({
						type: 'SLAVE_COMP_PROP_CHANGED',
						payload: {
							key: definition.key,
							properties: [
								{ name: 'left', value: newX },
								{ name: 'top', value: newY },
							],
						},
					});
				};

				document.body.addEventListener('mousemove', mouseMoveHandler);
				document.body.addEventListener('mouseup', mouseUpHandler);
			}}
		>
			<ShortcutIcon />
			<HelperComponent context={context} definition={definition} />
		</div>
	);
}

const component: Component = {
	name: 'Shortcut',
	displayName: 'Shortcut',
	description: 'Runs a page function when a keyboard shortcut is pressed',
	component: ShortcutComponent,
	styleComponent: ShortcutComponentStyle,
	styleDefaults: new Map<string, string>(),
	propertyValidation: (): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	stylePropertiesForTheme: [],
	defaultTemplate: {
		key: '',
		type: 'Shortcut',
		name: 'Shortcut',
		properties: {
			shortcutKey: { value: 'Mod+S' },
		},
	},
};

export default component;

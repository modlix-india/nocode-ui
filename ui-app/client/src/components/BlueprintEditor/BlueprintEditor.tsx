import React, { Suspense } from 'react';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './blueprintEditorProperties';
import BlueprintEditorStyle from './BlueprintEditorStyle';
import { styleDefaults, stylePropertiesForTheme } from './blueprintEditorStyleProperties';

const LazyBlueprintEditor = React.lazy(
	() => import(/* webpackChunkName: "BlueprintEditor" */ './LazyBlueprintEditor'),
);

function LoadLazyBlueprintEditor(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyBlueprintEditor {...props} />
		</Suspense>
	);
}

const component: Component = {
	order: 101,
	name: 'BlueprintEditor',
	displayName: 'Blueprint Editor',
	description:
		"A board of what an application is meant to be: objects of one kind side by side as columns, the kinds stacked as bands. Renders from the app's own definitions whether or not a plan exists.",
	component: LoadLazyBlueprintEditor,
	styleComponent: BlueprintEditorStyle,
	styleDefaults: styleDefaults,
	propertyValidation: (_props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	// Selected, expanded and hovered are STATES rather than slots, so every slot
	// gets each variant instead of only the card having one. `active` is
	// deliberately absent: a class covers what the component itself knows, and a
	// pseudo state is for what a page author wants to override.
	stylePseudoStates: ['hover', 'focus', 'selected', 'expanded', 'disabled'],
	bindingPaths: {
		// What the host fetched: the app blueprint (may be absent), the page
		// list with their definitions, and the storage list. The board is
		// derived from these, so a site with no plan still renders.
		bindingPath: { name: 'Board Sources Binding' },
		// Per-entry clean / pending / drifted, supplied by the host. The
		// component never computes it: comparing a plan to a definition means
		// reading definitions, which is not a component's job.
		bindingPath2: { name: 'Status Binding' },
		// The selection, read AND written. It is the prompt's context, so a chat
		// beside the board or a canvas elsewhere reads the same path.
		bindingPath3: { name: 'Selection Binding' },
		// Written just before an event runs, and only ever written. A page event
		// function cannot read a callback argument, so the payload goes on a
		// path it can read on its first step. Table does the same for pagination.
		bindingPath4: { name: 'Event Payload Binding' },
	},
	defaultTemplate: {
		key: '',
		name: 'blueprintEditor',
		type: 'BlueprintEditor',
		properties: {
			mode: { value: '_prose' },
			showLens: { value: true },
			emptyMessage: {
				value: 'No plan yet. The board below is read from what is actually built.',
			},
		},
	},
	stylePropertiesForTheme: stylePropertiesForTheme,
};

export default component;

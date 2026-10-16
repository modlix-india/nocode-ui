import React, { Suspense } from 'react';
import { ComponentProps } from '../../types/common';
import DraftAgentStyle from './DraftAgentStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './draftAgentProperties';
import { styleDefaults, styleProperties } from './draftAgentStyleProperties';

const LazyDraftAgent = React.lazy(
	() => import(/* webpackChunkName: "DraftAgent" */ './LazyDraftAgent'),
);

function LoadLazyDraftAgent(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<></>}>
			<LazyDraftAgent {...props} />
		</Suspense>
	);
}

const component = {
	name: 'DraftAgent',
	displayName: 'Draft Agent',
	description:
		"An AI agent over the running app. On a draft host it appears by itself, signed in as the builder; place it to override that, or to offer an agent of your choice in a live app on the app's own sign-in.",
	component: LoadLazyDraftAgent,
	styleComponent: DraftAgentStyle,
	styleDefaults: styleDefaults,
	propertyValidation: () => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	defaultTemplate: {
		key: '',
		type: 'DraftAgent',
		name: 'DraftAgent',
		properties: {
			defaultMode: { value: 'button' },
		},
	},
	stylePropertiesForTheme: styleProperties,
};

export default component;

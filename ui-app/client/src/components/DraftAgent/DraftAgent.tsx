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
		"The builder's AI on an app's draft surface, signed in separately from the app. Appears on every draft host by itself; place it only to override its settings on a page.",
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
			defaultMode: { value: 'rail' },
		},
	},
	stylePropertiesForTheme: styleProperties,
};

export default component;

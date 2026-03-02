import React, { Suspense } from 'react';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './promptProperties';
import PromptStyle from './PromptStyle';
import { styleDefaults, stylePropertiesForTheme } from './promptStyleProperties';

const LazyPrompt = React.lazy(
	() => import(/* webpackChunkName: "Prompt" */ './LazyPrompt'),
);

function LoadLazyPrompt(props: Readonly<ComponentProps>) {
	return (
		<Suspense fallback={<>...</>}>
			<LazyPrompt {...props} />
		</Suspense>
	);
}

const component: Component = {
	order: 100,
	name: 'Prompt',
	displayName: 'Prompt',
	description: 'AI chat prompt component',
	component: LoadLazyPrompt,
	styleComponent: PromptStyle,
	styleDefaults: styleDefaults,
	propertyValidation: (_props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: ['hover'],
	defaultTemplate: {
		key: '',
		name: 'prompt',
		type: 'Prompt',
		properties: {
			agentEndpoint: { value: '/api/ai/appbuilder/chat' },
			placeholder: { value: 'Ask anything' },
			welcomeMessage: { value: 'What can I help with?' },
			showSessions: { value: true },
			showToolCalls: { value: true },
			sessionsPerPage: { value: 20 },
			messagesPerPage: { value: 20 },
		},
	},
	stylePropertiesForTheme: stylePropertiesForTheme,
};

export default component;

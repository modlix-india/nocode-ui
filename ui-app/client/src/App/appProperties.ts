import { Schema } from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE } from '../constants';
import { ComponentPropertyDefinition, ComponentPropertyEditor } from '../types/component';

const props: Array<ComponentPropertyDefinition> = [
	{
		name: 'title',
		displayName: 'Title',
		description: 'Title to be shown in the browser tab.',
		schema: Schema.ofString('title'),
	},
	{
		name: 'links',
		displayName: 'Links',
		description: 'Links to the stylesheets, fonts and others.',
		schema: Schema.ofRef(`${NAMESPACE_UI_ENGINE}.AppLink`),
		multiValued: true,
	},
	{
		name: 'metas',
		displayName: 'Metas',
		description: 'Meta tags for define meatadata.',
		schema: Schema.ofRef(`${NAMESPACE_UI_ENGINE}.AppMeta`),
		multiValued: true,
	},
	{
		name: 'scripts',
		displayName: 'Scripts',
		description: 'Scripts to be loaded.',
		schema: Schema.ofRef(`${NAMESPACE_UI_ENGINE}.AppScript`),
		multiValued: true,
	},
	{
		name: 'defaultPage',
		displayName: 'Default Page',
		description: 'Name of the page to be loaded when no page name is specified.',
		schema: Schema.ofString('defaultPage'),
		editor: ComponentPropertyEditor.PAGE_SELECTOR,
	},
	{
		name: 'shellPage',
		displayName: 'Shell Page',
		description: 'Name of the page to be loaded as a shell for the application.',
		schema: Schema.ofString('shellPage'),
		editor: ComponentPropertyEditor.PAGE_SELECTOR,
	},
	{
		name: 'errorPage',
		displayName: 'Error Page',
		description: 'Name of the page to be loaded when there is an error.',
		schema: Schema.ofString('errorPage'),
		editor: ComponentPropertyEditor.PAGE_SELECTOR,
	},
	{
		name: 'forbiddenPage',
		displayName: 'Forbidden Page',
		description: 'Name of the page to be loaded when a page is forbidden.',
		schema: Schema.ofString('forbiddenPage'),
		editor: ComponentPropertyEditor.PAGE_SELECTOR,
	},
	{
		name: 'loadingPage',
		displayName: 'Loading Page',
		description: 'Name of the page to be loaded while loading.',
		schema: Schema.ofString('loadingPage'),
		editor: ComponentPropertyEditor.PAGE_SELECTOR,
	},
	{
		name: 'styles',
		displayName: 'Styles',
		description: 'Styles required for the App.',
		schema: Schema.ofString('style'),
		editor: ComponentPropertyEditor.STYLE_SELECTOR,
		multiValued: true,
	},
	{
		name: 'themes',
		displayName: 'Themes',
		description: 'Themes required for the App.',
		schema: Schema.ofString('theme'),
		editor: ComponentPropertyEditor.THEME_SELECTOR,
		multiValued: true,
	},
	{
		name: 'components',
		displayName: 'Components',
		description: 'Components required for the App.',
		schema: Schema.ofString('component'),
		editor: ComponentPropertyEditor.COMPONENT_SELECTOR,
		multiValued: true,
	},
];

export default props;

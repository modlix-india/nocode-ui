import {
	SCHEMA_ANY_COMP_PROP,
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_NUM_COMP_PROP,
	SCHEMA_STRING_COMP_PROP,
} from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentStylePropertyDefinition,
} from '../../types/common';
import { COMMON_COMPONENT_PROPERTIES, COMPONENT_STYLE_GROUP_PROPERTIES } from '../util/properties';

const propertiesDefinition: Array<ComponentPropertyDefinition> = [
	{
		name: 'preset',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Preset',
		description: 'Which built-in scroll scene to render.',
		editor: ComponentPropertyEditor.SCENE_PRESET,
		defaultValue: 'scrollSpin',
		group: ComponentPropertyGroup.BASIC,
		// Literal, not mapped from SCENE_PRESETS: the catalog generator reads
		// this file with the TypeScript AST and cannot evaluate a computed
		// list. __tests__/scrollSceneProperties.test.ts keeps them in step.
		enumValues: [
			{
				name: 'scrollSpin',
				displayName: 'Scroll Spin',
				description: 'An object that turns and rises as the section scrolls past.',
			},
			{
				name: 'scrollDolly',
				displayName: 'Scroll Dolly',
				description: 'The camera pushes in toward the object as the section passes.',
			},
			{
				name: 'scrollRise',
				displayName: 'Scroll Rise',
				description: 'The object rises and grows into place, then settles.',
			},
		],
	},
	{
		name: 'axis',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Scroll Direction',
		description:
			'Which way the scroll that drives this scene runs. Inline is for a ' +
			'sideways scroller such as a carousel or a Grid with horizontal overflow.',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'block',
		group: ComponentPropertyGroup.BASIC,
		enumValues: [
			{ name: 'block', displayName: 'Vertical', description: 'The usual page scroll.' },
			{
				name: 'inline',
				displayName: 'Horizontal',
				description: 'A sideways scroller, such as a carousel or an overflowing Grid.',
			},
		],
	},
	{
		name: 'mode',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Measured Against',
		description:
			'View measures this component crossing the viewport, which is what a ' +
			'section reveal wants. Scroll measures the whole scroller from top to ' +
			'bottom, which is what a page-length progress indicator wants.',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'view',
		group: ComponentPropertyGroup.BASIC,
		enumValues: [
			{
				name: 'view',
				displayName: 'This Component Crossing the Screen',
				description: '0 as it enters, 1 as it leaves.',
			},
			{
				name: 'scroll',
				displayName: 'The Whole Scroller',
				description: '0 at the top of the scroller, 1 at the bottom.',
			},
		],
	},
	{
		name: 'scroller',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Driven By',
		description:
			'Which element is scrolling. Nearest walks up to the closest scrollable ' +
			'ancestor, which is right almost always.',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'nearest',
		group: ComponentPropertyGroup.ADVANCED,
		enumValues: [
			{
				name: 'nearest',
				displayName: 'Nearest Scrollable Ancestor',
				description: 'The usual choice.',
			},
			{ name: 'root', displayName: 'The Page', description: 'The document scroll.' },
			{
				name: 'self',
				displayName: 'This Component',
				description: 'Only useful when the component scrolls internally.',
			},
		],
	},
	{
		name: 'rangeStart',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Start At',
		description:
			'Where in the raw 0 to 1 travel the animation begins. Raise it to hold ' +
			'the scene still until the section is properly on screen.',
		editor: ComponentPropertyEditor.NUMBER_SLIDER,
		defaultValue: 0,
		min: 0,
		max: 1,
		step: 0.01,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'rangeEnd',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Finish At',
		description:
			'Where in the raw 0 to 1 travel the animation completes. Lower it to ' +
			'have the scene finish before the section leaves.',
		editor: ComponentPropertyEditor.NUMBER_SLIDER,
		defaultValue: 1,
		min: 0,
		max: 1,
		step: 0.01,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'colorA',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Object Colour',
		description: "The scene object's own colour.",
		editor: ComponentPropertyEditor.COLOR_PICKER,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'fallbackColor',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Background Colour',
		description:
			'Sits behind the scene. The canvas is transparent, so without this the ' +
			'scene sits on whatever is behind the component.',
		editor: ComponentPropertyEditor.COLOR_PICKER,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'dprCap',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Pixel Ratio Cap',
		description: 'Highest device pixel ratio to render at. Lower is faster.',
		editor: ComponentPropertyEditor.NUMBER_SLIDER,
		defaultValue: 2,
		min: 0.5,
		max: 3,
		step: 0.25,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'poster',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Fallback Image',
		description:
			'Shown instead of the scene where WebGL is unavailable, the context is ' +
			'lost, or the page already has too many 3D scenes.',
		editor: ComponentPropertyEditor.IMAGE,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'onReady',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Ready',
		description: 'Runs once the scene has drawn its first frame.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onError',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Error',
		description: 'Runs if WebGL is unavailable. The reason arrives as `error`.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onSceneEnter',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Scene Enter',
		description: 'Runs when the scene first moves off 0 progress.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onSceneExit',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Scene Exit',
		description: 'Runs when the scene reaches the end of its range.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'reducedMotionProgress',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Still Frame At',
		description:
			'Where in the timeline to freeze for a visitor who has asked for ' +
			'reduced motion. The midpoint usually reads best; the start often ' +
			'shows a scene that has not arrived yet.',
		editor: ComponentPropertyEditor.NUMBER_SLIDER,
		defaultValue: 0.5,
		min: 0,
		max: 1,
		step: 0.05,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'uniforms',
		schema: SCHEMA_ANY_COMP_PROP,
		displayName: 'Uniform Overrides',
		description: 'An object of uniform name to value, merged over the preset each frame.',
		group: ComponentPropertyGroup.DATA,
	},
	{
		name: 'pointerInteraction',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'React to the pointer',
		description: 'Turn off to skip the pointer listener entirely.',
		defaultValue: true,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'scene',
		schema: SCHEMA_ANY_COMP_PROP,
		displayName: 'Scene',
		description:
			'The full scene document. Empty while the component is still using a ' +
			'built-in preset; opening the editor copies the preset in here and ' +
			'clears Preset, so the page owns its scene from then on and a later ' +
			'change to the built-in preset cannot alter it.',
		editor: ComponentPropertyEditor.THREE_SCENE,
		group: ComponentPropertyGroup.ADVANCED,
	},
	COMMON_COMPONENT_PROPERTIES.visibility,
	COMMON_COMPONENT_PROPERTIES.designType,
	COMMON_COMPONENT_PROPERTIES.sceneColorScheme,
];

const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': [
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	container: [
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
	],
	poster: [
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.image.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
	],
	overlay: [
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };

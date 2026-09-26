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
		description: 'Which built-in shader to render. Choose Custom to write your own.',
		editor: ComponentPropertyEditor.SCENE_PRESET,
		defaultValue: 'aurora',
		group: ComponentPropertyGroup.BASIC,
		// Written out literally, not mapped from SCENE_PRESETS. The catalog
		// generator reads this file with the TypeScript AST and cannot evaluate
		// a spread of a .map(), so a computed list reaches the AppBuilder agent
		// as just `custom` and it never learns the presets exist. The test in
		// __tests__/shaderBackgroundProperties.test.ts keeps the two in step.
		enumValues: [
			{
				name: 'aurora',
				displayName: 'Aurora',
				description: 'Soft drifting colour bands. Good behind a hero headline.',
			},
			{
				name: 'waves',
				displayName: 'Noise Waves',
				description: 'A travelling wave with a bright crest.',
			},
			{
				name: 'gradientMesh',
				displayName: 'Gradient Mesh',
				description: 'Blended colour blobs that lean toward the pointer.',
			},
			{
				name: 'custom',
				displayName: 'Custom',
				description: 'Use the fragment shader written below.',
			},
		],
	},
	{
		name: 'fragmentShader',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Fragment Shader',
		description:
			'GLSL ES 1.0 fragment shader, used when Preset is Custom. `varying vec2 vUv` is ' +
			'the 0..1 position across the surface. uTime, uResolution, uPointer and uProgress ' +
			'are bound for you, but you must still declare each one you use: three binds ' +
			'values to names the source declares, it does not add declarations. Write to ' +
			'gl_FragColor.',
		editor: ComponentPropertyEditor.LARGE_TEXT,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'colorA',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Colour One',
		description:
			'First shader colour, as a CSS colour such as #1e1b4b. Style-sheet syntax ' +
			'like <colorOne> is NOT resolved here; to follow the theme, bind this ' +
			'property to an expression such as Theme.colorOne instead.',
		editor: ComponentPropertyEditor.COLOR_PICKER,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'colorB',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Colour Two',
		description: 'Second shader colour.',
		editor: ComponentPropertyEditor.COLOR_PICKER,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'colorC',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Colour Three',
		description: 'Third shader colour, where the preset uses one.',
		editor: ComponentPropertyEditor.COLOR_PICKER,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'speed',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Speed',
		description: 'Multiplies elapsed time. 0 holds the shader on its first frame.',
		editor: ComponentPropertyEditor.NUMBER_SLIDER,
		defaultValue: 1,
		min: 0,
		max: 4,
		step: 0.05,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'pointerInteraction',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'React to the pointer',
		description:
			'Feed the pointer position to the shader as uPointer. Turn off to skip the ' +
			'pointer listener entirely.',
		defaultValue: true,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'dprCap',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Pixel Ratio Cap',
		description:
			'Highest device pixel ratio to render at. Lower is faster: a cap of 1 on a ' +
			'retina screen is a quarter of the pixels of a cap of 2.',
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
			'Shown instead of the shader where WebGL is unavailable, the context is lost, ' +
			'or the page already has too many 3D scenes.',
		editor: ComponentPropertyEditor.IMAGE,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'fallbackColor',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Fallback Colour',
		description: 'Flat colour behind the canvas, and used when there is no fallback image.',
		editor: ComponentPropertyEditor.COLOR_PICKER,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'onReady',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Ready',
		description: 'Runs once the shader has compiled and drawn its first frame.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onError',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Error',
		description:
			'Runs when the scene cannot render. The reason is bound as `error` in the ' +
			'event arguments.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		...COMMON_COMPONENT_PROPERTIES.onClick,
		description: 'Runs on a click anywhere on the shader surface.',
	},
	{
		name: 'uniforms',
		schema: SCHEMA_ANY_COMP_PROP,
		displayName: 'Uniform Overrides',
		description:
			'An object of uniform name to value, merged over the preset defaults. Use this ' +
			'to drive the shader from page data.',
		group: ComponentPropertyGroup.DATA,
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

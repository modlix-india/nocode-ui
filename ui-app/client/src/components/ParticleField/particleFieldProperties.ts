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
		description: 'Which built-in particle field to render.',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'orbField',
		group: ComponentPropertyGroup.BASIC,
		// Literal, not mapped from SCENE_PRESETS: the catalog generator reads
		// this file with the TypeScript AST and cannot evaluate a computed
		// list. __tests__/particleFieldProperties.test.ts keeps them in step.
		enumValues: [
			{
				name: 'orbField',
				displayName: 'Orb Field',
				description: 'A rotating cloud of points that parts around the cursor.',
			},
			{
				name: 'starfield',
				displayName: 'Starfield',
				description: 'Points on a sphere surface, like a night sky turning overhead.',
			},
			{
				name: 'dust',
				displayName: 'Drifting Dust',
				description: 'A flat drift of motes, good as a subtle layer behind content.',
			},
		],
	},
	{
		name: 'count',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Particle Count',
		description:
			'How many particles to draw. Each one costs a fragment pass, so a large count ' +
			'slows the whole page and not just this component. Capped at 200,000.',
		editor: ComponentPropertyEditor.NUMBER_SLIDER,
		min: 100,
		// Well under the 200,000 hard cap in sceneDocument: the slider is for
		// the range that is actually usable on a laptop, not the range that is
		// merely legal. A larger value can still be typed into the box.
		max: 20000,
		step: 100,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'distribution',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Shape',
		description: 'How the particles are seeded in space.',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.BASIC,
		enumValues: [
			{ name: 'sphere', displayName: 'Sphere', description: 'Filling a ball evenly.' },
			{ name: 'shell', displayName: 'Shell', description: 'On the surface of a ball.' },
			{ name: 'disc', displayName: 'Disc', description: 'A flat circle facing the camera.' },
			{ name: 'box', displayName: 'Box', description: 'Filling a cube evenly.' },
		],
	},
	{
		name: 'colorA',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Colour One',
		description: 'Particles are shaded between the two colours by a per-particle random value.',
		editor: ComponentPropertyEditor.COLOR_PICKER,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'colorB',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Colour Two',
		description: 'The other end of the particle colour range.',
		editor: ComponentPropertyEditor.COLOR_PICKER,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'particleSize',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Particle Size',
		description: 'Base size in pixels before per-particle variation and distance falloff.',
		editor: ComponentPropertyEditor.NUMBER_SLIDER,
		min: 0.5,
		max: 12,
		step: 0.1,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'pointerStrength',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Pointer Strength',
		description:
			'How hard particles move away from the cursor. A NEGATIVE value pulls them ' +
			'toward it instead. 0 turns the effect off.',
		editor: ComponentPropertyEditor.NUMBER_SLIDER,
		// Symmetric around zero so the attract half of the range is as
		// reachable as the repel half; the sign is the mode.
		min: -1.5,
		max: 1.5,
		step: 0.05,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'speed',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Speed',
		description: 'Multiplies elapsed time. 0 holds the field still.',
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
		description: 'Turn off to skip the pointer listener entirely.',
		defaultValue: true,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'dprCap',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Pixel Ratio Cap',
		description:
			'Highest device pixel ratio to render at. Lower is faster, and matters more ' +
			'here than elsewhere because every particle is redrawn each frame.',
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
			'Shown instead of the field where WebGL is unavailable, the context is lost, ' +
			'or the page already has too many 3D scenes.',
		editor: ComponentPropertyEditor.IMAGE,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'fallbackColor',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Background Colour',
		description:
			'Sits behind the particles. Particles are drawn on a transparent canvas, so ' +
			'without this they sit on whatever is behind the component.',
		editor: ComponentPropertyEditor.COLOR_PICKER,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'onReady',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Ready',
		description: 'Runs once the field has drawn its first frame.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onError',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Error',
		description: 'Runs when the scene cannot render. The reason is bound as `error`.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		...COMMON_COMPONENT_PROPERTIES.onClick,
		description: 'Runs on a click anywhere on the field.',
	},
	{
		name: 'uniforms',
		schema: SCHEMA_ANY_COMP_PROP,
		displayName: 'Uniform Overrides',
		description:
			'An object of uniform name to value, merged over the preset defaults each ' +
			'frame. Use this to drive the field from page data.',
		group: ComponentPropertyGroup.DATA,
	},
	COMMON_COMPONENT_PROPERTIES.visibility,
	COMMON_COMPONENT_PROPERTIES.designType,
	COMMON_COMPONENT_PROPERTIES.colorScheme,
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

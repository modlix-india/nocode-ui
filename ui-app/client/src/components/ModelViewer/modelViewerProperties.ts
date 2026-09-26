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
		name: 'modelUrl',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Model',
		description:
			'A glTF or .glb file. Pick one from the file browser or paste a URL. ' +
			'Compressed meshes (DRACO, KTX2) are not supported: they need decoder ' +
			'files that this build does not ship, and such a model loads as nothing.',
		// IMAGE opens the existing FileBrowser and applies no extension filter,
		// so it works unchanged for .glb. There is no model-specific picker.
		editor: ComponentPropertyEditor.IMAGE,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'environmentPreset',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Lighting',
		description:
			'How the model is lit. Every option is real lights rather than an image, ' +
			'so nothing extra downloads.',
		editor: ComponentPropertyEditor.ENUM,
		defaultValue: 'studio',
		group: ComponentPropertyGroup.BASIC,
		enumValues: [
			{
				name: 'studio',
				displayName: 'Studio',
				description: 'Neutral key, fill and rim. Shows a product honestly.',
			},
			{
				name: 'soft',
				displayName: 'Soft',
				description: 'One broad light and a lot of ambient. Few shadows.',
			},
			{
				name: 'dramatic',
				displayName: 'Dramatic',
				description: 'A hard key from one side and deep shadow on the other.',
			},
			{
				name: 'warm',
				displayName: 'Warm',
				description: 'Amber key against a cool fill, like late afternoon.',
			},
		],
	},
	{
		name: 'hdriUrl',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Environment Image',
		description:
			'An .hdr file for image-based lighting, which is what makes metal and ' +
			'glass read correctly. Replaces the Lighting preset when set, and is a ' +
			'sizeable download, so leave it empty unless the material needs it.',
		editor: ComponentPropertyEditor.IMAGE,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'showEnvironment',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show Environment Behind Model',
		description:
			'Draw the environment image as the backdrop as well as using it for light. ' +
			'Has no effect without an Environment Image.',
		defaultValue: false,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'controls',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Let the Visitor Orbit',
		description: 'Drag to rotate, scroll to zoom, right-drag to pan.',
		defaultValue: true,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'autoRotate',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Turn on its Own',
		description: 'Rotate slowly until the visitor takes hold of it.',
		defaultValue: true,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'autoRotateSpeed',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Turn Speed',
		description: 'Degrees per second, roughly. Negative turns the other way.',
		editor: ComponentPropertyEditor.NUMBER_SLIDER,
		defaultValue: 2,
		min: -10,
		max: 10,
		step: 0.5,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'zoom',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Camera Distance',
		description:
			'How far the camera sits from the model. Models are scaled to a common ' +
			'size first, so this means the same thing whatever file is loaded.',
		editor: ComponentPropertyEditor.NUMBER_SLIDER,
		defaultValue: 4,
		min: 1.2,
		max: 14,
		step: 0.1,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'cameraHeight',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Camera Height',
		description: 'Raises or lowers the camera. 0 looks at the model dead on.',
		editor: ComponentPropertyEditor.NUMBER_SLIDER,
		defaultValue: 0.6,
		min: -4,
		max: 4,
		step: 0.1,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'fov',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Field of View',
		description:
			'Lens angle in degrees. A low value flattens the model like a long lens; ' +
			'a high one exaggerates its depth.',
		editor: ComponentPropertyEditor.NUMBER_SLIDER,
		defaultValue: 45,
		min: 15,
		max: 90,
		step: 1,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'autoFit',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Scale the Model to Fit',
		description:
			'Normalise the model to a common size on load. glTF carries no agreed ' +
			'unit, so the same object arrives 1000x larger from one exporter than ' +
			'another. Turn this off only once the scene is hand-placed.',
		defaultValue: true,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'speed',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Animation Speed',
		description:
			'Multiplies the playback rate of animations baked into the model. ' +
			'0 freezes them on the first frame.',
		editor: ComponentPropertyEditor.NUMBER_SLIDER,
		defaultValue: 1,
		min: 0,
		max: 4,
		step: 0.05,
		group: ComponentPropertyGroup.BASIC,
	},
	{
		name: 'fallbackColor',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Background Colour',
		description:
			'Sits behind the model. The canvas is transparent, so without this the ' +
			'model sits on whatever is behind the component.',
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
			'Shown instead of the model where WebGL is unavailable, the context is ' +
			'lost, or the page already has too many 3D scenes.',
		editor: ComponentPropertyEditor.IMAGE,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'onReady',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Ready',
		description: 'Runs once the canvas has drawn its first frame.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onModelLoad',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Model Load',
		description:
			'Runs once the model file itself has downloaded and been added to the ' +
			'scene, which is later than On Ready.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onError',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Error',
		description:
			'Runs if WebGL is unavailable or the model fails to load. The reason ' +
			'arrives as the `error` argument.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onMeshClick',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Mesh Click',
		description:
			'Runs when a part of the model is clicked. The clicked part arrives as ' +
			'`meshName`, with `point` and `distance` alongside it.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'onMeshHover',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Mesh Hover',
		description:
			'Runs when the pointer moves onto a different part of the model. Setting ' +
			'this makes every pointer move raycast the scene, so leave it empty ' +
			'unless something depends on it.',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		group: ComponentPropertyGroup.EVENTS,
	},
	{
		name: 'highlightColor',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Selected Part Tint',
		description:
			'Tints the part named by the binding. Leave empty to leave the model ' +
			'exactly as authored.',
		editor: ComponentPropertyEditor.COLOR_PICKER,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'uniforms',
		schema: SCHEMA_ANY_COMP_PROP,
		displayName: 'Uniform Overrides',
		description:
			'An object of uniform name to value, for a scene that also carries a ' +
			'custom shader. Ignored by ordinary glTF materials.',
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

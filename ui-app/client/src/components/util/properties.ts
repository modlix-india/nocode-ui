import {
	SCHEMA_ANY_COMP_PROP,
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_NUM_COMP_PROP,
	SCHEMA_STRING_COMP_PROP,
	SCHEMA_VALIDATION,
} from '../../constants';
import {
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	ComponentStylePropertyGroupDefinition,
} from '../../types/common';

const COMMON_COMPONENT_PROPERTIES: { [key: string]: ComponentPropertyDefinition } = {
	onClick: {
		name: 'onClick',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Click',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered when clicked.',
		group: ComponentPropertyGroup.EVENTS,
	},
	onChange: {
		name: 'onChange',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Change',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered on input change.',
		group: ComponentPropertyGroup.EVENTS,
	},
	onSelect: {
		name: 'onSelect',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Select',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered when selection.',
		group: ComponentPropertyGroup.EVENTS,
	},
	onEnter: {
		name: 'onEnter',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'On Enter',
		editor: ComponentPropertyEditor.EVENT_SELECTOR,
		description: 'Event to be triggered when enter is pressed.',
		group: ComponentPropertyGroup.EVENTS,
	},
	label: {
		name: 'label',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Label',
		description: 'Label to be displayed',
		translatable: true,
		group: ComponentPropertyGroup.BASIC,
		editor: ComponentPropertyEditor.TRANSLATABLE_PROP,
	},
	readOnly: {
		name: 'readOnly',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Read Only',
		description: 'This component will be rendered un editable when this property is true.',
		group: ComponentPropertyGroup.COMMON,
	},
	visibility: {
		name: 'visibility',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Visibility',
		description: 'This component will be hidden when this property is true.',
		group: ComponentPropertyGroup.COMMON,
	},
	validation: {
		name: 'validation',
		schema: SCHEMA_VALIDATION,
		displayName: 'Validation',
		description: 'Validation Rule',
		editor: ComponentPropertyEditor.VALIDATION,
		multiValued: true,
		group: ComponentPropertyGroup.VALIDATION,
	},
	linkTargetType: {
		name: 'target',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: 'Link target',
		description:
			'Link taget type based on HTML link target, only applies when link path is given.',
	},
	linkPath: {
		name: 'linkPath',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: 'Link path',
		description: 'Path that page needs to be redirected on click.',
		translatable: false,
	},
	linkTargetFeatures: {
		name: 'features',
		schema: SCHEMA_STRING_COMP_PROP,
		group: ComponentPropertyGroup.ADVANCED,
		displayName: 'Link target features',
		description: 'Link target features',
	},
	layout: {
		name: 'layout',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Layout',
		description: 'Name of the layout',
		editor: ComponentPropertyEditor.LAYOUT,
		defaultValue: 'SINGLECOLUMNLAYOUT',
		group: ComponentPropertyGroup.ADVANCED,
		enumValues: [
			{ name: 'ROWLAYOUT', displayName: 'Row Layout', description: 'Row layout' },
			{
				name: 'ROWCOLUMNLAYOUT',
				displayName: 'Row/Column Layout',
				description: 'Row/Column layout in mobile it truns to column. ',
			},
			{
				name: 'SINGLECOLUMNLAYOUT',
				displayName: 'Column Layout',
				description: 'Single Column layout in all resolutions',
			},
			{
				name: 'TWOCOLUMNSLAYOUT',
				displayName: 'Two Columns Layout',
				description: 'Two Columns layout in all resolutions except mobile',
			},
			{
				name: 'THREECOLUMNSLAYOUT',
				displayName: 'Three Columns Layout',
				description:
					'Three Columns layout in all resolutions and two in tablet and one in mobile',
			},
			{
				name: 'FOURCOLUMNSLAYOUT',
				displayName: 'Four Columns Layout',
				description:
					'Four Columns layout in desktop and widescreen and two in tablet and one in mobile',
			},
			{
				name: 'FIVECOLUMNSLAYOUT',
				displayName: 'Five Columns Layout',
				description:
					'Five Columns layout in desktop and widescreen and two in tablet and one in mobile',
			},
		],
	},
	datatype: {
		name: 'datatype',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Data Type/Format',
		description:
			'Expected format of the data, so that the processor can process the data correctly.',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.DATA,
		defaultValue: 'LIST_OF_STRINGS',
		enumValues: [
			{
				name: 'LIST_OF_STRINGS',
				displayName: 'List of strings',
				description: 'data has an array of strings',
			},
			{
				name: 'LIST_OF_OBJECTS',
				displayName: 'List of objects',
				description: 'data has an array of objects',
			},
			{
				name: 'LIST_OF_LISTS',
				displayName: 'List of lists',
				description: 'data has an array of arrays',
			},
			{
				name: 'OBJECT_OF_PRIMITIVES',
				displayName: 'Object of primitives',
				description: 'Object with key value pairs where values are primitives',
			},
			{
				name: 'OBJECT_OF_OBJECTS',
				displayName: 'Object of objects',
				description: 'Object with key value pairs where values are objects',
			},
			{
				name: 'OBJECT_OF_LISTS',
				displayName: 'Object of lists',
				description: 'Object with key value pairs where values are lists',
			},
		],
	},
	uniqueKeyType: {
		name: 'uniqueKeyType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: "Unique key's type",
		description:
			'A key to identify every item uniquely in the list, RANDOM option creates a random id everytime',
		defaultValue: 'KEY',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.DATA,
		enumValues: [
			{
				name: 'KEY',
				displayName: 'Key',
				description: "Select key as unique key's value",
			},
			{
				name: 'INDEX',
				displayName: 'Index',
				description: "Select index as unique key's value",
			},
			{
				name: 'OBJECT',
				displayName: 'Object',
				description: "Select object as unique key's value",
			},
			{
				name: 'RANDOM',
				displayName: 'Random',
				description: 'A Random key is associated with value which is costly in rendering',
			},
		],
	},
	selectionType: {
		name: 'selectionType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Selection value type',
		description: 'This is the value that is selected and stored on selection.',
		group: ComponentPropertyGroup.DATA,
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{
				name: 'KEY',
				displayName: 'Key',
				description: "Select key as selection key's value",
			},
			{
				name: 'INDEX',
				displayName: 'Index',
				description: "Select index as selection key's value",
			},
			{
				name: 'OBJECT',
				displayName: 'Object',
				description: "Select object as selection key's value",
			},
		],
	},
	labelKeyType: {
		name: 'labelKeyType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Label type.',
		description:
			'This is the label that user sees on the scree, OBJECT works when value is primitive.',
		defaultValue: 'OBJECT',
		editor: ComponentPropertyEditor.ENUM,
		group: ComponentPropertyGroup.DATA,
		enumValues: [
			{
				name: 'KEY',
				displayName: 'Key',
				description: "Select key as label key's value",
			},
			{
				name: 'INDEX',
				displayName: 'Index',
				description: "Select index as label key's value",
			},
			{
				name: 'OBJECT',
				displayName: 'Object',
				description: "Select object as label key's value",
			},
		],
	},
	selectionKey: {
		name: 'selectionKey',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: "Selection key's value ",
		group: ComponentPropertyGroup.DATA,
		description:
			'Key value that is used to generate selection value when selection type is selected as KEY.',
	},

	uniqueKey: {
		name: 'uniqueKey',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: "Unique key's value ",
		description:
			'Key value that is used to get unique key value when unique key type is selected as KEY',
		group: ComponentPropertyGroup.DATA,
	},

	labelKey: {
		name: 'labelKey',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: "Labels key's value ",
		description:
			'Key value that is used to get label value when label key type is selected as KEY',
		group: ComponentPropertyGroup.DATA,
	},

	showInDesign: {
		name: 'showInDesign',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Show in Design Mode',
		group: ComponentPropertyGroup.BASIC,
		defaultValue: false,
	},

	animation: {
		name: 'animation',
		schema: SCHEMA_ANY_COMP_PROP,
		displayName: 'Animation',
		editor: ComponentPropertyEditor.ANIMATION,
		description: 'Animation to be played.',
		group: ComponentPropertyGroup.COMMON,
		multiValued: true,
	},
	designType: {
		name: 'designType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Design Type',
		description: 'Design Type',
		defaultValue: '_default',
		group: ComponentPropertyGroup.BASIC,
		enumValues: [{ name: '_default', displayName: 'Default', description: 'Default' }],
	},
	colorScheme: {
		name: 'colorScheme',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Color Scheme',
		description: 'Color Scheme',
		defaultValue: '_primary',
		group: ComponentPropertyGroup.BASIC,
		enumValues: [
			{
				name: '_primary',
				displayName: 'Primary Color Scheme',
				description: 'Default Color Scheme',
			},
			{
				name: '_secondary',
				displayName: 'Secondary Color Scheme',
				description: 'Secondary Color Scheme',
			},
			{
				name: '_tertiary',
				displayName: 'Tertiary Color Scheme',
				description: 'Tertiary Color Scheme',
			},
			{
				name: '_quaternary',
				displayName: 'Quaternary Color Scheme',
				description: 'Quaternary Color Scheme',
			},
			{
				name: '_quinary',
				displayName: 'Quinary Color Scheme',
				description: 'Quinary Color Scheme',
			},
		],
	},
	background: {
		name: 'background',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Background',
		description: 'Background to be applied',
		editor: ComponentPropertyEditor.BACKGROUND,
		group: ComponentPropertyGroup.BASIC,
		defaultValue: '',
		enumValues: [
			{ name: '', displayName: 'None', description: 'None' },
			{
				name: '_PRIMARYBG',
				displayName: 'Primary background',
				description: 'Primary background',
			},
			{
				name: '_SECONDARYBG',
				displayName: 'Secondary background',
				description: 'Secondary background',
			},
			{
				name: '_TERTIARYBG',
				displayName: 'Tertiary background',
				description: 'Tertiary background',
			},
			{
				name: '_QUATERNARYBG',
				displayName: 'Quaternary background',
				description: 'Quaternary background',
			},
			{
				name: '_QUINARYBG',
				displayName: 'Quinary background',
				description: 'Quinary background',
			},
			{
				name: '_SENARYBG',
				displayName: 'Senary background',
				description: 'Senary background',
			},
			{
				name: '_SEPTENARYBG',
				displayName: 'Septenary background',
				description: 'Septenary background',
			},
			{
				name: '_OCTONARYBG',
				displayName: 'Octonary background',
				description: 'Octonary background',
			},
			{
				name: '_NONARYBG',
				displayName: 'Nonary background',
				description: 'Nonary background',
			},
			{
				name: '_PRIMARYGRADBG',
				displayName: 'Primary gradient background',
				description: 'Primary gradient background',
			},
			{
				name: '_SECONDARYGRADBG',
				displayName: 'Secondary gradient background',
				description: 'Secondary gradient background',
			},
			{
				name: '_TERTIARYGRADBG',
				displayName: 'Tertiary gradient background',
				description: 'Tertiary gradient background',
			},
			{
				name: '_QUATERNARYGRADBG',
				displayName: 'Quaternary gradient background',
				description: 'Quaternary gradient background',
			},
			{
				name: '_QUINARYGRADBG',
				displayName: 'Quinary gradient background',
				description: 'Quinary gradient background',
			},
			{
				name: '_SENARYGRADBG',
				displayName: 'Senary gradient background',
				description: 'Senary gradient background',
			},
			{
				name: '_SEPTENARYGRADBG',
				displayName: 'Septenary gradient background',
				description: 'Septenary gradient background',
			},
			{
				name: '_OCTONARYGRADBG',
				displayName: 'Octonary gradient background',
				description: 'Octonary gradient background',
			},
			{
				name: '_NONARYGRADBG',
				displayName: 'Nonary gradient background',
				description: 'Nonary gradient background',
			},
		],
	},
};

const COMPONENT_STYLE_GROUPS: { [key: string]: Array<string> } = {
	layout: ['display'],
	spacing: [
		'marginBottom',
		'marginLeft',
		'marginRight',
		'marginTop',
		'paddingBottom',
		'paddingLeft',
		'paddingRight',
		'paddingTop',
	],
	size: ['width', 'height', 'minHeight', 'minWidth', 'maxHeight', 'maxWidth'],
	position: ['bottom', 'left', 'right', 'top', 'position'],
	typography: [
		'fontFamily',
		'fontSize',
		'fontWeight',
		'color',
		'textAlign',
		'fontStyle',
		'lineHeight',
		'letterSpacing',
	],
	background: [
		'backgroundColor',
		'backgroundClip',
		'backgroundImage',
		'backgroundSize',
		'backgroundPosition',
		'backgroundPositionX',
		'backgroundPositionY',
		'backgroundRepeat',
	],

	border: [
		'borderTopLeftRadius',
		'borderTopRightRadius',
		'borderBottomLeftRadius',
		'borderBottomRightRadius',
	],
	effects: [
		'backgroundBlendMode',
		'opacity',
		'outlineColor',
		'outlineOffset',
		'outlineStyle',
		'outlineWidth',
		'boxShadow',
	],
	accentColor: ['accentColor'],
	image: ['imageOrientation', 'imageRendering', 'imageResolution'],
	shape: ['clipPath', 'mask'],
	rotate: ['rotate'],
	list: ['listStyleImage', 'listStylePosition', 'listStyleType'],
	scrollbar: ['hideScrollBar'],
	selectorName: ['selectorName'],
	animation: [
		'animationName',
		'animationDuration',
		'animationTimingFunction',
		'animationDelay',
		'animationIterationCount',
		'animationDirection',
		'animationFillMode',
		'animationPlayState',
	],
};

const CSS_STYLE_PROPERTY_GROUP_REF: { [key: string]: string } = Object.entries(
	COMPONENT_STYLE_GROUPS,
).reduce((a: any, [grp, mems]) => {
	for (const x of mems) a[x] = grp;
	return a;
}, {});

const COMPONENT_STYLE_GROUP_PROPERTIES: { [key: string]: ComponentStylePropertyGroupDefinition } = {
	spacing: {
		name: 'spacing',
		type: 'spacing',
		displayName: 'Spacing',
		description: 'Spacing Properties',
		target: ['comp'],
	},
	typography: {
		name: 'typography',
		type: 'typography',
		displayName: 'Typography',
		description: 'Typography Properties',
		target: ['comp'],
		advanced: [
			'textIndent',
			'textTransform',
			'textShadow',
			'direction',
			'textDecoration',
			'textOrientation',
			'wordBreak',
			'wordSpacing',
			'wordWrap',
			'fontFeatureSettings',
			'fontKerning',
			'fontVariant',
			'fontVariantCaps',
			'textAlignLast',
			'textDecorationColor',
			'textDecorationLine',
			'textDecorationStyle',
			'textEmphasis',
			'textOverflow',
			'whiteSpace',
		],
	},
	position: {
		name: 'position',
		type: 'position',
		displayName: 'Position',
		description: 'Position Properties',
		target: ['comp'],
		advanced: ['float', 'clear', 'zIndex'],
	},
	layout: {
		name: 'layout',
		type: 'layout',
		displayName: 'Layout',
		description: 'Layout Properties',
		target: ['comp'],
		advanced: [
			'alignContent',
			'alignItems',
			'alignSelf',
			'justifyContent',
			'justifyItems',
			'justifySelf',
			'flex',
			'flexBasis',
			'flexDirection',
			'flexFlow',
			'flexGrow',
			'flexShrink',
			'flexWrap',
			'gap',
		],
	},
	image: {
		name: 'image',
		type: 'image',
		displayName: 'Image',
		description: 'Image Properties',
		target: ['comp'],
		advanced: ['aspectRatio'],
	},
	accentColor: {
		name: 'accentColor',
		type: 'accentColor',
		displayName: 'Accent Color',
		description: 'Accent Color',
		target: ['comp'],
	},
	scrollbar: {
		name: 'scrollbar',
		type: 'scrollbar',
		displayName: 'Scroll Bar',
		description: 'Scroll Bar',
		target: ['comp'],
		advanced: [
			'scrollBehavior',
			'scrollMargin',
			'scrollMarginBlock',
			'scrollMarginBlockEnd',
			'scrollMarginBlockStart',
			'scrollMarginBottom',
			'scrollMarginInline',
			'scrollMarginInlineEnd',
			'scrollMarginInlineStart',
			'scrollMarginLeft',
			'scrollMarginRight',
			'scrollMarginTop',
			'scrollPadding',
			'scrollPaddingBlock',
			'scrollPaddingBlockEnd',
			'scrollPaddingBlockStart',
			'scrollPaddingBottom',
			'scrollPaddingInline',
			'scrollPaddingInlineEnd',
			'scrollPaddingInlineStart',
			'scrollPaddingLeft',
			'scrollPaddingRight',
			'scrollPaddingTop',
			'scrollSnapAlign',
			'scrollSnapStop',
			'scrollSnapType',
		],
	},
	background: {
		name: 'background',
		type: 'background',
		displayName: 'Background',
		description: 'Background',
		target: ['comp'],
		advanced: ['backgroundAttachment', 'backgroundOrigin'],
	},
	border: {
		name: 'border',
		type: 'border',
		displayName: 'Border',
		description: 'Border',
		target: ['comp'],
		advanced: [
			'borderTopColor',
			'borderTopStyle',
			'borderTopWidth',
			'borderRightColor',
			'borderRightStyle',
			'borderRightWidth',
			'borderBottomColor',
			'borderBottomStyle',
			'borderBottomWidth',
			'borderLeftColor',
			'borderLeftStyle',
			'borderLeftWidth',
			'borderCollapse',
			'borderEndEndRadius',
			'borderEndStartRadius',
			'borderImage',
			'borderImageOutset',
			'borderImageRepeat',
			'borderImageSlice',
			'borderImageSource',
			'borderImageWidth',
			'borderSpacing',
			'borderStartEndRadius',
			'borderStartStartRadius',
		],
	},
	shape: {
		name: 'shape',
		type: 'shape',
		displayName: 'Shape',
		description: 'Shape',
		target: ['comp'],
	},
	list: {
		name: 'list',
		type: 'list',
		displayName: 'List',
		description: 'List',
		target: ['comp'],
	},
	rotate: {
		name: 'rotate',
		type: 'rotate',
		displayName: 'Rotate',
		description: 'Rotate',
		target: ['comp'],
	},
	size: {
		name: 'size',
		type: 'size',
		displayName: 'Size',
		description: 'Size',
		target: ['comp'],
		advanced: [
			'scale',
			'overflow',
			'overflowWrap',
			'overflowX',
			'overflowY',
			'objectFit',
			'objectPosition',
		],
	},
	effects: {
		name: 'effects',
		type: 'effects',
		displayName: 'Effects',
		description: 'Effects Properties',
		target: ['comp'],
		advanced: [
			'mixBlendMode',
			'transform',
			'transformStyle',
			'transitionProperty',
			'transitionDuration',
			'transitionTiming-function',
			'transitionDelay',
			'filter',
			'backdropFilter',
			'cursor',
			'transformOrigin',
			'perspective',
		],
	},
	slectorName: {
		name: 'selectorName',
		type: 'selectorName',
		displayName: 'Selector Names',
		description: 'Selector Names',
		target: ['comp'],
	},
	animation: {
		name: 'animation',
		type: 'animation',
		displayName: 'Animation',
		description: 'Animation',
		target: ['comp'],
	},
};

const ANIMATION_BASIC_PROPERTIES: Array<ComponentPropertyDefinition> = [
	{
		name: 'animationName',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Animation',
		description: 'The Animation name',
		defaultValue: '_bounce',
		enumValues: [
			{
				name: '_bounce',
				displayName: 'Bounce',
			},
			{
				name: '_flash',
				displayName: 'Flash',
			},
			{
				name: '_pulse',
				displayName: 'Pulse',
			},
			{
				name: '_shake',
				displayName: 'Shake',
			},
			{
				name: '_swing',
				displayName: 'Swing',
			},
			{
				name: '_tada',
				displayName: 'Tada',
			},
			{
				name: '_wobble',
				displayName: 'Wobble',
			},
			{
				name: '_bounceIn',
				displayName: 'Bounce In',
			},
			{
				name: '_bounceInDown',
				displayName: 'Bounce In Down',
			},
			{
				name: '_bounceInLeft',
				displayName: 'Bounce In Left',
			},
			{
				name: '_bounceInRight',
				displayName: 'Bounce In Right',
			},
			{
				name: '_bounceInUp',
				displayName: 'Bounce In Up',
			},
			{
				name: '_bounceOut',
				displayName: 'Bounce Out',
			},
			{
				name: '_bounceOutDown',
				displayName: 'Bounce Out Down',
			},
			{
				name: '_bounceOutLeft',
				displayName: 'Bounce Out Left',
			},
			{
				name: '_bounceOutRight',
				displayName: 'Bounce Out Right',
			},
			{
				name: '_bounceOutUp',
				displayName: 'Bounce Out Up',
			},
			{
				name: '_fadeIn',
				displayName: 'Fade In',
			},
			{
				name: '_fadeInDown',
				displayName: 'Fade In Down',
			},
			{
				name: '_fadeInDownBig',
				displayName: 'Fade In Down Big',
			},
			{
				name: '_fadeInLeft',
				displayName: 'Fade In Left',
			},
			{
				name: '_fadeInLeftBig',
				displayName: 'Fade In Left Big',
			},
			{
				name: '_fadeInRight',
				displayName: 'Fade In Right',
			},
			{
				name: '_fadeInRightBig',
				displayName: 'Fade In Right Big',
			},
			{
				name: '_fadeInUp',
				displayName: 'Fade In Up',
			},
			{
				name: '_fadeInUpBig',
				displayName: 'Fade In Up Big',
			},
			{
				name: '_fadeOut',
				displayName: 'Fade Out',
			},
			{
				name: '_fadeOutDown',
				displayName: 'Fade Out Down',
			},
			{
				name: '_fadeOutDownBig',
				displayName: 'Fade Out Down Big',
			},
			{
				name: '_fadeOutLeft',
				displayName: 'Fade Out Left',
			},
			{
				name: '_fadeOutLeftBig',
				displayName: 'Fade Out Left Big',
			},
			{
				name: '_fadeOutRight',
				displayName: 'Fade Out Right',
			},
			{
				name: '_fadeOutRightBig',
				displayName: 'Fade Out Right Big',
			},
			{
				name: '_fadeOutUp',
				displayName: 'Fade Out Up',
			},
			{
				name: '_fadeOutUpBig',
				displayName: 'Fade Out Up Big',
			},
			{
				name: '_flip',
				displayName: 'Flip',
			},
			{
				name: '_flipInX',
				displayName: 'Flip In X',
			},
			{
				name: '_flipInY',
				displayName: 'Flip In Y',
			},
			{
				name: '_flipOutX',
				displayName: 'Flip Out X',
			},
			{
				name: '_flipOutY',
				displayName: 'Flip Out Y',
			},
			{
				name: '_lightSpeedIn',
				displayName: 'Light Speed In',
			},
			{
				name: '_lightSpeedOut',
				displayName: 'Light Speed Out',
			},
			{
				name: '_rotateIn',
				displayName: 'Rotate In',
			},
			{
				name: '_rotateInDownLeft',
				displayName: 'Rotate In Down Left',
			},
			{
				name: '_rotateInDownRight',
				displayName: 'Rotate In Down Right',
			},
			{
				name: '_rotateInUpLeft',
				displayName: 'Rotate In Up Left',
			},
			{
				name: '_rotateInUpRight',
				displayName: 'Rotate In Up Right',
			},
			{
				name: '_rotateOut',
				displayName: 'Rotate Out',
			},
			{
				name: '_rotateOutDownLeft',
				displayName: 'Rotate Out Down Left',
			},
			{
				name: '_rotateOutDownRight',
				displayName: 'Rotate Out Down Right',
			},
			{
				name: '_rotateOutUpLeft',
				displayName: 'Rotate Out Up Left',
			},
			{
				name: '_rotateOutUpRight',
				displayName: 'Rotate Out Up Right',
			},
			{
				name: '_hinge',
				displayName: 'Hinge',
			},
			{
				name: '_rollIn',
				displayName: 'Roll In',
			},
			{
				name: '_rollOut',
				displayName: 'Roll Out',
			},
			{
				name: '_zoomIn',
				displayName: 'Zoom In',
			},
			{
				name: '_zoomInDown',
				displayName: 'Zoom In Down',
			},
			{
				name: '_zoomInLeft',
				displayName: 'Zoom In Left',
			},
			{
				name: '_zoomInRight',
				displayName: 'Zoom In Right',
			},
			{
				name: '_zoomInUp',
				displayName: 'Zoom In Up',
			},
			{
				name: '_zoomOut',
				displayName: 'Zoom Out',
			},
			{
				name: '_zoomOutDown',
				displayName: 'Zoom Out Down',
			},
			{
				name: '_zoomOutLeft',
				displayName: 'Zoom Out Left',
			},
			{
				name: '_zoomOutRight',
				displayName: 'Zoom Out Right',
			},
			{
				name: '_zoomOutUp',
				displayName: 'Zoom Out Up',
			},
		],
	},
	{
		name: 'animationDuration',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Duration (in milliseconds)',
		description: 'The duration of the animation in Milliseconds',
		defaultValue: 0,
	},
	{
		name: 'animationDelay',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Delay (in milliseconds)',
		description: 'The delay of the animation in Milliseconds',
		defaultValue: 0,
	},
	{
		name: 'animationIterationCount',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Iteration Count',
		description: 'The number of times the animation should be played',
		defaultValue: '1',
	},
	{
		name: 'animationDirection',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Direction',
		description: 'The direction of the animation',
		defaultValue: 'normal',
		enumValues: [
			{ name: 'normal', displayName: 'Normal', description: 'Normal' },
			{ name: 'reverse', displayName: 'Reverse', description: 'Reverse' },
			{ name: 'alternate', displayName: 'Alternate', description: 'Alternate' },
			{
				name: 'alternate-reverse',
				displayName: 'Alternate Reverse',
				description: 'Alternate Reverse',
			},
		],
	},
	{
		name: 'animationFillMode',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Fill Mode',
		description: 'The fill mode of the animation',
		defaultValue: 'none',
		enumValues: [
			{ name: 'none', displayName: 'None', description: 'None' },
			{ name: 'forwards', displayName: 'Forwards', description: 'Forwards' },
			{ name: 'backwards', displayName: 'Backwards', description: 'Backwards' },
			{ name: 'both', displayName: 'Both', description: 'Both' },
		],
	},
	{
		name: 'animationTimingFunction',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Timing Function',
		description: 'The timing function of the animation',
		defaultValue: 'ease',
		enumValues: [
			{ name: 'ease', displayName: 'Ease', description: 'Ease' },
			{ name: 'ease-in', displayName: 'Ease In', description: 'Ease In' },
			{ name: 'ease-out', displayName: 'Ease Out', description: 'Ease Out' },
			{ name: 'ease-in-out', displayName: 'Ease In Out', description: 'Ease In Out' },
			{ name: 'linear', displayName: 'Linear', description: 'Linear' },
			{ name: 'step-start', displayName: 'Step Start', description: 'Step Start' },
			{ name: 'step-end', displayName: 'Step End', description: 'Step End' },
			{ name: 'steps', displayName: 'Steps', description: 'Steps' },
			{ name: 'cubic-bezier', displayName: 'Cubic Bezier', description: 'Cubic Bezier' },
		],
	},
	{
		name: 'condition',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Condition',
		description: 'This animation is applied only if this condition is true',
		defaultValue: true,
	},
];

const TIMING_FUNCTION_EXTRA = {
	name: 'timingFunctionExtra',
	schema: SCHEMA_STRING_COMP_PROP,
	displayName: 'Parameters',
	description: 'Parameters of the timing function',
};

const OBESERVATION_PROP = {
	name: 'observation',
	schema: SCHEMA_STRING_COMP_PROP,
	displayName: 'Observation',
	description: 'The observation to be made',
	defaultValue: 'none',
	enumValues: [
		{ name: 'none', displayName: 'None', description: 'None' },
		{ name: 'entering', displayName: 'Entering', description: 'When entering the view port' },
		{ name: 'exiting', displayName: 'Exiting', description: 'When exiting the view port ' },
	],
};

const OBESERVATION_ENTERING_THRESHOLD = {
	name: 'enteringThreshold',
	schema: SCHEMA_NUM_COMP_PROP,
	displayName: 'Entering Threshold',
	description: 'The threshold for entering',
	defaultValue: 0.25,
};

const OBESERVATION_EXITING_THRESHOLD = {
	name: 'exitingThreshold',
	schema: SCHEMA_NUM_COMP_PROP,
	displayName: 'Exiting Threshold',
	description: 'The threshold for exiting',
	defaultValue: 0.25,
};

const ANIMATION_PROPERTIES = [
	...ANIMATION_BASIC_PROPERTIES,
	TIMING_FUNCTION_EXTRA,
	OBESERVATION_PROP,
	OBESERVATION_ENTERING_THRESHOLD,
	OBESERVATION_EXITING_THRESHOLD,
];

export {
	COMMON_COMPONENT_PROPERTIES,
	COMPONENT_STYLE_GROUP_PROPERTIES,
	CSS_STYLE_PROPERTY_GROUP_REF,
	COMPONENT_STYLE_GROUPS,
	ANIMATION_BASIC_PROPERTIES,
	ANIMATION_PROPERTIES,
	TIMING_FUNCTION_EXTRA,
	OBESERVATION_PROP,
	OBESERVATION_ENTERING_THRESHOLD,
	OBESERVATION_EXITING_THRESHOLD,
};

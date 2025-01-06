import {
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
		name: 'trackDesign',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Track Design',
		defaultValue: '_mediumTrack',
		group: ComponentPropertyGroup.BASIC,
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{ name: '_thinTrack', displayName: 'Thin' },
			{ name: '_mediumTrack', displayName: 'Medium' },
			{ name: '_thickTrack', displayName: 'Thick' },
		],
	},
	{
		name: 'trackColor',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Track Color',
		defaultValue: '_filledTrack',
		group: ComponentPropertyGroup.BASIC,
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{ name: '_filledTrack', displayName: 'Filled' },
			{ name: '_emptyTrack', displayName: 'Empty' },
			{ name: '_noneTrack', displayName: 'None' },
		],
	},
	{
		name: 'rangeThumbDesign',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Range Thumb Design',
		defaultValue: '_roundThumb',
		group: ComponentPropertyGroup.BASIC,
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{ name: '_roundThumb', displayName: 'Round' },
			{ name: '_pillThumb', displayName: 'Pill' },
			{ name: '_roundedThumbSquare', displayName: 'Rounded Square' },
		],
	},
	{
		name: 'rangeThumbSize',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Range Thumb Size',
		defaultValue: '_mediumThumb',
		group: ComponentPropertyGroup.BASIC,
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{ name: '_smallThumb', displayName: 'Small' },
			{ name: '_mediumThumb', displayName: 'Medium' },
			{ name: '_largeThumb', displayName: 'Large' },
		],
	},
	{
		name: 'rangeThumbPitDesign',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Range Thumb Pit Design',
		defaultValue: '_directThumb',
		group: ComponentPropertyGroup.BASIC,
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{ name: '_directThumb', displayName: 'With Pit' },
			{ name: '_noPit', displayName: 'Without Pit' },
			{ name: '_invertThumb', displayName: 'Invert Pit' },
		],
	},
	{
		name: 'toolTipDesign',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Tooltip Design',
		defaultValue: '_roundedTT',
		group: ComponentPropertyGroup.BASIC,
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{ name: '_roundedTT', displayName: 'Rounded' },
			{ name: '_roundedRectangleTT', displayName: 'Rounded Rectangle' },
			{ name: '_largeRoundedTT', displayName: 'Large Rounded' },
			{ name: '_labelTT', displayName: 'Label' },
			{ name: '_fixedLabelTT', displayName: 'Fixed Label' },
		],
	},

	// {
	// 	name: 'rangeThumb2Design',
	// 	schema: SCHEMA_STRING_COMP_PROP,
	// 	displayName: 'Range Thumb 2 Design',
	// 	defaultValue: '_roundThumb',
	// 	group: ComponentPropertyGroup.BASIC,
	// 	editor: ComponentPropertyEditor.ENUM,
	// 	enumValues: [
	// 		{ name: '_roundThumb', displayName: 'Round' },
	// 		{ name: '_pillThumb', displayName: 'Pill' },
	// 		{ name: '_roundedThumbSquare', displayName: 'Rounded Square' },
	// 	],
	// },
	// {
	// 	name: 'rangeThumb2Size',
	// 	schema: SCHEMA_STRING_COMP_PROP,
	// 	displayName: 'Range Thumb 2 Size',
	// 	defaultValue: '_mediumThumb',
	// 	group: ComponentPropertyGroup.BASIC,
	// 	editor: ComponentPropertyEditor.ENUM,
	// 	enumValues: [
	// 		{ name: '_smallThumb', displayName: 'Small' },
	// 		{ name: '_mediumThumb', displayName: 'Medium' },
	// 		{ name: '_largeThumb', displayName: 'Large' },
	// 	],
	// },
	// {
	// 	name: 'rangeThumb2PitDesign',
	// 	schema: SCHEMA_STRING_COMP_PROP,
	// 	displayName: 'Range Thumb Pit 2 Design',
	// 	defaultValue: '_directThumb',
	// 	group: ComponentPropertyGroup.BASIC,
	// 	editor: ComponentPropertyEditor.ENUM,
	// 	enumValues: [
	// 		{ name: '_directThumb', displayName: 'With Pit' },
	// 		{ name: '_noPit', displayName: 'Without Pit' },
	// 		{ name: '_invertThumb', displayName: 'Invert Pit' },
	// 	],
	// },
	// {
	// 	name: 'toolTip2Design',
	// 	schema: SCHEMA_STRING_COMP_PROP,
	// 	displayName: 'Tooltip 2 Design',
	// 	defaultValue: '_roundedTT',
	// 	group: ComponentPropertyGroup.BASIC,
	// 	editor: ComponentPropertyEditor.ENUM,
	// 	enumValues: [
	// 		{ name: '_roundedTT', displayName: 'Rounded' },
	// 		{ name: '_roundedRectangleTT', displayName: 'Rounded Rectangle' },
	// 		{ name: '_largeRoundedTT', displayName: 'Large Rounded' },
	// 		{ name: '_labelTT', displayName: 'Label' },
	// 		{ name: '_fixedLabelTT', displayName: 'Fixed Label' },
	// 	],
	// },

	{
		name: 'fillType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Track Filling Mode',
		defaultValue: 'fromStart',
		group: ComponentPropertyGroup.BASIC,
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{ name: 'fromStart', displayName: 'Fill from Start' },
			{ name: 'betweenSliders', displayName: 'Fill between Sliders' },
		],
	},
	{
		name: 'sliderCrossing',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Slider Crossing',
		defaultValue: true,
		group: ComponentPropertyGroup.BASIC,
	},
	COMMON_COMPONENT_PROPERTIES.colorScheme,
	{
		name: 'storageDataType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Storage Value Type',
		description: 'Data type to store the value in store',
		defaultValue: 'value',
		group: ComponentPropertyGroup.DATA,
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{ name: 'value', displayName: 'Value' },
			{ name: 'percent', displayName: 'Percentage' },
		],
	},
	{
		name: 'min',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Minimum Value',
		description: 'Minimum value including the min value in the storage data type.',
		defaultValue: 0,
		group: ComponentPropertyGroup.DATA,
	},
	{
		name: 'minLabelDisplay',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Minimum Label Display Type',
		defaultValue: 'value',
		group: ComponentPropertyGroup.DATA,
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{ name: 'none', displayName: 'None' },
			{ name: 'value', displayName: 'Value' },
			{ name: 'percent', displayName: 'Percentage' },
		],
	},
	{
		name: 'minLabel',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Minimum Label',
		group: ComponentPropertyGroup.DATA,
	},
	{
		name: 'minLabelValuePrefix',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Minimum Label Value Prefix',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'minLabelValueSuffix',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Minimum Label Value Suffix',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'minLabelPosition',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Minimum Label Position',
		defaultValue: 'top',
		group: ComponentPropertyGroup.ADVANCED,
		enumValues: [
			{ name: 'top', displayName: 'TOP' },
			{ name: 'bottom', displayName: 'BOTTOM' },
		],
	},
	{
		name: 'max',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Maximum Value',
		description: 'Maximum value including the max value in the storage data type.',
		defaultValue: 100,
		group: ComponentPropertyGroup.DATA,
	},
	{
		name: 'maxLabelDisplay',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Maximum Label Display Type',
		defaultValue: 'value',
		group: ComponentPropertyGroup.DATA,
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{ name: 'none', displayName: 'None' },
			{ name: 'value', displayName: 'Value' },
			{ name: 'percent', displayName: 'Percentage' },
		],
	},
	{
		name: 'maxLabel',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Maximum Label',
		group: ComponentPropertyGroup.DATA,
	},
	{
		name: 'maxLabelValuePrefix',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Maximum Label Value Prefix',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'maxLabelValueSuffix',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Maximum Label Value Suffix',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'maxLabelPosition',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Maximum Label Position',
		defaultValue: 'top',
		group: ComponentPropertyGroup.ADVANCED,
		enumValues: [
			{ name: 'top', displayName: 'TOP' },
			{ name: 'bottom', displayName: 'BOTTOM' },
		],
	},
	// {
	// 	name: 'min2',
	// 	schema: SCHEMA_NUM_COMP_PROP,
	// 	displayName: 'Minimum Value 2',
	// 	description: 'Minimum value including the min value in the storage data type.',
	// 	defaultValue: 0,
	// 	group: ComponentPropertyGroup.DATA,
	// },
	// {
	// 	name: 'min2LabelDisplay',
	// 	schema: SCHEMA_STRING_COMP_PROP,
	// 	displayName: 'Minimum Label Display Type 2',
	// 	defaultValue: 'value',
	// 	group: ComponentPropertyGroup.DATA,
	// 	editor: ComponentPropertyEditor.ENUM,
	// 	enumValues: [
	// 		{ name: 'none', displayName: 'None' },
	// 		{ name: 'value', displayName: 'Value' },
	// 		{ name: 'percent', displayName: 'Percentage' },
	// 	],
	// },
	// {
	// 	name: 'min2Label',
	// 	schema: SCHEMA_STRING_COMP_PROP,
	// 	displayName: 'Minimum Label 2',
	// 	group: ComponentPropertyGroup.DATA,
	// },
	// {
	// 	name: 'min2LabelValuePrefix',
	// 	schema: SCHEMA_STRING_COMP_PROP,
	// 	displayName: 'Minimum Label Value Prefix 2',
	// 	group: ComponentPropertyGroup.ADVANCED,
	// },
	// {
	// 	name: 'min2LabelValueSuffix',
	// 	schema: SCHEMA_STRING_COMP_PROP,
	// 	displayName: 'Minimum Label Value Suffix 2',
	// 	group: ComponentPropertyGroup.ADVANCED,
	// },
	// {
	// 	name: 'min2LabelPosition',
	// 	schema: SCHEMA_STRING_COMP_PROP,
	// 	displayName: 'Minimum Label Position 2',
	// 	defaultValue: 'top',
	// 	group: ComponentPropertyGroup.ADVANCED,
	// 	enumValues: [
	// 		{ name: 'top', displayName: 'TOP' },
	// 		{ name: 'bottom', displayName: 'BOTTOM' },
	// 	],
	// },
	// {
	// 	name: 'max2',
	// 	schema: SCHEMA_NUM_COMP_PROP,
	// 	displayName: 'Maximum Value 2',
	// 	description: 'Maximum value including the max value in the storage data type.',
	// 	defaultValue: 100,
	// 	group: ComponentPropertyGroup.DATA,
	// },
	// {
	// 	name: 'max2LabelDisplay',
	// 	schema: SCHEMA_STRING_COMP_PROP,
	// 	displayName: 'Maximum Label Display Type 2',
	// 	defaultValue: 'value',
	// 	group: ComponentPropertyGroup.DATA,
	// 	editor: ComponentPropertyEditor.ENUM,
	// 	enumValues: [
	// 		{ name: 'none', displayName: 'None' },
	// 		{ name: 'value', displayName: 'Value' },
	// 		{ name: 'percent', displayName: 'Percentage' },
	// 	],
	// },
	// {
	// 	name: 'max2Label',
	// 	schema: SCHEMA_STRING_COMP_PROP,
	// 	displayName: 'Maximum Label 2',
	// 	group: ComponentPropertyGroup.DATA,
	// },
	// {
	// 	name: 'max2LabelValuePrefix',
	// 	schema: SCHEMA_STRING_COMP_PROP,
	// 	displayName: 'Maximum Label Value Prefix 2',
	// 	group: ComponentPropertyGroup.ADVANCED,
	// },
	// {
	// 	name: 'max2LabelValueSuffix',
	// 	schema: SCHEMA_STRING_COMP_PROP,
	// 	displayName: 'Maximum Label Value Suffix 2',
	// 	group: ComponentPropertyGroup.ADVANCED,
	// },
	// {
	// 	name: 'max2LabelPosition',
	// 	schema: SCHEMA_STRING_COMP_PROP,
	// 	displayName: 'Maximum Label Position 2',
	// 	defaultValue: 'top',
	// 	group: ComponentPropertyGroup.ADVANCED,
	// 	enumValues: [
	// 		{ name: 'top', displayName: 'TOP' },
	// 		{ name: 'bottom', displayName: 'BOTTOM' },
	// 	],
	// },
	{
		name: 'step',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Step Value',
		description: 'Step attribute Value.',
		defaultValue: 1,
		group: ComponentPropertyGroup.DATA,
	},
	{
		name: 'minOffset',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Minimum Offset',
		description: 'Minimum Offset Value.',
		group: ComponentPropertyGroup.DATA,
	},
	{
		name: 'maxOffset',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Maximum Offset',
		description: 'Maximum Offset Value.',
		group: ComponentPropertyGroup.DATA,
	},
	{
		name: 'toolTipDisplayType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Tooltip Display Type',
		defaultValue: 'value',
		group: ComponentPropertyGroup.DATA,
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{ name: 'value', displayName: 'Value' },
			{ name: 'percent', displayName: 'Percentage' },
		],
	},
	{
		name: 'toolTipPosition',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Tooltip Position',
		description: 'Position of the tooltip',
		defaultValue: '_top',
		group: ComponentPropertyGroup.ADVANCED,
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{ name: '_top', displayName: 'Top' },
			{ name: '_bottom', displayName: 'Bottom' },
			{ name: '_left', displayName: 'Left' },
			{ name: '_right', displayName: 'Right' },
		],
	},
	{
		name: 'toolTipDisplay',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Tooltip Display',
		description: 'Display the tooltip',
		defaultValue: '_alwaysToolTip',
		group: ComponentPropertyGroup.ADVANCED,
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{ name: '_alwaysToolTip', displayName: 'Always' },
			{ name: '_onHoverToolTip', displayName: 'On Hover' },
			{ name: '_neverToolTip', displayName: 'Never' },
		],
	},
	{
		name: 'toolTipValueLabelPrefix',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Tooltip Value Label Prefix',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'toolTipValueLabelSuffix',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Tooltip Value Label Suffix',
		group: ComponentPropertyGroup.ADVANCED,
	},

	// {
	// 	name: 'toolTip2DisplayType',
	// 	schema: SCHEMA_STRING_COMP_PROP,
	// 	displayName: 'Tooltip 2 Display Type ',
	// 	defaultValue: 'value',
	// 	group: ComponentPropertyGroup.DATA,
	// 	editor: ComponentPropertyEditor.ENUM,
	// 	enumValues: [
	// 		{ name: 'value', displayName: 'Value' },
	// 		{ name: 'percent', displayName: 'Percentage' },
	// 	],
	// },
	// {
	// 	name: 'toolTip2Position',
	// 	schema: SCHEMA_STRING_COMP_PROP,
	// 	displayName: 'Tooltip 2 Position',
	// 	description: 'Position of the tooltip',
	// 	defaultValue: '_top',
	// 	group: ComponentPropertyGroup.ADVANCED,
	// 	editor: ComponentPropertyEditor.ENUM,
	// 	enumValues: [
	// 		{ name: '_top', displayName: 'Top' },
	// 		{ name: '_bottom', displayName: 'Bottom' },
	// 		{ name: '_left', displayName: 'Left' },
	// 		{ name: '_right', displayName: 'Right' },
	// 	],
	// },
	// {
	// 	name: 'toolTip2Display',
	// 	schema: SCHEMA_STRING_COMP_PROP,
	// 	displayName: 'Tooltip 2 Display',
	// 	description: 'Display the tooltip',
	// 	defaultValue: '_alwaysToolTip',
	// 	group: ComponentPropertyGroup.ADVANCED,
	// 	editor: ComponentPropertyEditor.ENUM,
	// 	enumValues: [
	// 		{ name: '_alwaysToolTip', displayName: 'Always' },
	// 		{ name: '_onHoverToolTip', displayName: 'On Hover' },
	// 		{ name: '_neverToolTip', displayName: 'Never' },
	// 	],
	// },
	// {
	// 	name: 'toolTip2ValueLabelPrefix',
	// 	schema: SCHEMA_STRING_COMP_PROP,
	// 	displayName: 'Tooltip 2 Value Label Prefix',
	// 	group: ComponentPropertyGroup.ADVANCED,
	// },
	// {
	// 	name: 'toolTip2ValueLabelSuffix',
	// 	schema: SCHEMA_STRING_COMP_PROP,
	// 	displayName: 'Tooltip 2 Value Label Suffix',
	// 	group: ComponentPropertyGroup.ADVANCED,
	// },
	{
		name: 'decimalPrecision',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Decimal Precision',
		defaultValue: 'auto',
		group: ComponentPropertyGroup.ADVANCED,
		enumValues: [
			{ name: 'auto', displayName: 'Auto' },
			{ name: '0', displayName: '0' },
			{ name: '1', displayName: '1' },
			{ name: '2', displayName: '2' },
			{ name: '3', displayName: '3' },
			{ name: '4', displayName: '4' },
			{ name: '5', displayName: '5' },
			{ name: '6', displayName: '6' },
			{ name: '7', displayName: '7' },
			{ name: '8', displayName: '8' },
			{ name: '9', displayName: '9' },
			{ name: '10', displayName: '10' },
		],
	},
	{
		name: 'updateStoreImmediately',
		schema: SCHEMA_BOOL_COMP_PROP,
		displayName: 'Update Store Immediately',
		description: 'Whether to update store Immediately or not.',
		defaultValue: true,
		group: ComponentPropertyGroup.DATA,
	},

	{
		name: 'markLabelPosition',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Mark Label Position',
		defaultValue: 'bottom',
		group: ComponentPropertyGroup.ADVANCED,
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{ name: 'top', displayName: 'TOP' },
			{ name: 'bottom', displayName: 'BOTTOM' },
		],
	},
	{
		name: 'markValueType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Mark Value Type',
		defaultValue: 'value',
		group: ComponentPropertyGroup.ADVANCED,
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{ name: 'value', displayName: 'Value' },
			{ name: 'percent', displayName: 'Percent' },
		],
	},
	{
		name: 'marks',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Marks',
		group: ComponentPropertyGroup.ADVANCED,
		multiValued: true,
	},
	{
		name: 'markLabelType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Mark Label Type',
		defaultValue: 'value',
		group: ComponentPropertyGroup.ADVANCED,
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{ name: 'none', displayName: 'None' },
			{ name: 'value', displayName: 'Value' },
			{ name: 'percent', displayName: 'Percent' },
		],
	},
	{
		name: 'markValueLabelPrefix',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Mark Value Label Prefix',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'markValueLabelSuffix',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Mark Value Label Suffix',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'ticks',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Ticks',
		defaultValue: 'always',
		group: ComponentPropertyGroup.ADVANCED,
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{ name: 'always', displayName: 'Always' },
			{ name: 'onHover', displayName: 'On Hover' },
		],
	},
	{
		name: 'tickCount',
		schema: SCHEMA_NUM_COMP_PROP,
		displayName: 'Number of Ticks',
		description:
			'Number of ticks to show on the slider. Exclude min and max values. Use -1 to auto calculate the number of ticks.',
		defaultValue: 0,
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'ticksValueType',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Ticks Value type',
		defaultValue: 'value',
		group: ComponentPropertyGroup.ADVANCED,
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{ name: 'value', displayName: 'Value' },
			{ name: 'percent', displayName: 'Percent' },
		],
	},
	{
		name: 'tickValueLabelPrefix',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Tick Value Label Prefix',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'tickValueLabelSuffix',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Tick Value Label Suffix',
		group: ComponentPropertyGroup.ADVANCED,
	},
	{
		name: 'ticksPosition',
		schema: SCHEMA_STRING_COMP_PROP,
		displayName: 'Ticks Position',
		defaultValue: 'bottom',
		group: ComponentPropertyGroup.ADVANCED,
		editor: ComponentPropertyEditor.ENUM,
		enumValues: [
			{ name: 'top', displayName: 'TOP' },
			{ name: 'bottom', displayName: 'BOTTOM' },
		],
	},
	COMMON_COMPONENT_PROPERTIES.onChange,
	COMMON_COMPONENT_PROPERTIES.readOnly,
	COMMON_COMPONENT_PROPERTIES.visibility,
];

const stylePropertiesDefinition: ComponentStylePropertyDefinition = {
	'': [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.spacing.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.border.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	thumbPit1: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	thumb1: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	toolTip1: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	thumbPit2: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	thumb2: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	toolTip2: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	rangeTrack: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	track: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	bottomLabelContainer: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	topLabelContainer: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	maxLabel: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	minLabel: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	markThumbPit: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	markThumb: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	markLabel: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	ticksContainer: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	tickContainer: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.size.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	tickLabel: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.typography.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
	tick: [
		COMPONENT_STYLE_GROUP_PROPERTIES.layout.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.position.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.effects.type,
		COMPONENT_STYLE_GROUP_PROPERTIES.background.type,
	],
};

export { propertiesDefinition, stylePropertiesDefinition };

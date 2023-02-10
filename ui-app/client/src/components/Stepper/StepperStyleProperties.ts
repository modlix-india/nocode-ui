import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		name: 'stepperMargin',
		cssProperty: 'margin',
		displayName: 'Stepper margin',
		description: 'The margin of Stepper.',
		defaultValue: '20px 0',
		selector: ' ',
	},
	{
		name: 'stepperBackgroundColor',
		cssProperty: 'background-color',
		displayName: 'Stepper background color',
		description: 'The background color of Stepper.',
		defaultValue: '#FFF',
		selector: '.stepper',
	},

	{
		name: 'stepperPaddingWhenHorizontal',
		cssProperty: 'padding',
		displayName: 'Stepper padding when horizontal',
		description: 'The padding of Stepper when it is horizontal.',
		defaultValue: '12px 20px',
		selector: '.stepper.horizontal',
	},
	{
		name: 'stepperPaddingWhenVertical',
		cssProperty: 'padding',
		displayName: 'Stepper padding when vertical',
		description: 'The padding of Stepper when it is vertical.',
		defaultValue: '20px 12px',
		selector: '.stepper.vertical',
	},

	{
		name: 'stepperGapWhenHorizontal',
		cssProperty: 'gap',
		displayName: 'Stepper gap when horizontal',
		description: 'The gap of Stepper when it is horizontal.',
		defaultValue: '0 8px',
		selector: '.stepper.horizontal',
	},
	{
		name: 'stepperGapWhenVertical',
		cssProperty: 'gap',
		displayName: 'Stepper gap when vertical',
		description: 'The gap of stepper when it is vertical.',
		defaultValue: '8px 0',
		selector: '.stepper.vertical',
	},

	{
		name: 'countingStepBackgroundColor',
		cssProperty: 'background-color',
		displayName: 'Counting step background color',
		description: 'The background color of counting step.',
		defaultValue: '#C7C8D6',
		selector: '.countingStep',
	},
	{
		name: 'countingStepDoneBackgroundColor',
		cssProperty: 'background-color',
		displayName: 'Counting step background color',
		description: 'The background color of countingStep.',
		defaultValue: '#2680EB',
		selector: '.countingStep.done',
	},
	{
		name: 'countingStepColor',
		cssProperty: 'color',
		displayName: 'Counting step color',
		description: 'The color of countingStep.',
		defaultValue: '#FFF',
		selector: '.countingStep',
	},

	{
		name: 'circleSize',
		defaultValue: '40px',
		displayName: 'Size for circle',
		description: 'Size for circle with icon/number',
	},

	{
		name: 'titleMarginLeftWhenHorizontal',
		cssProperty: 'margin-left',
		displayName: 'Title margin left when horizontal',
		description: 'The margin left of title when it is horizontal.',
		defaultValue: '8px',
		selector: '.stepper.horizontal .title',
	},
	{
		name: 'titleMarginTopWhenVertical',
		cssProperty: 'margin-top',
		displayName: 'Title margin left when vertical',
		description: 'The margin left of title when it is vertical.',
		defaultValue: '8px',
		selector: '.stepper.vertical .title',
	},

	{
		name: 'lineMinWidthWhenHorizontal',
		cssProperty: 'min-width',
		displayName: 'Line minimum width when horizontal',
		description: 'The minimum width of line when it is horizontal.',
		defaultValue: '30px',
		selector: '.stepper.horizontal .line',
	},
	{
		name: 'lineBorderWhenHorizontal',
		cssProperty: 'border-top',
		displayName: 'Line border when horizontal',
		description: 'The border of line when it is horizontal.',
		defaultValue: '1px solid #DEDFE7',
		selector: '.stepper.horizontal .line',
	},
	{
		name: 'lineMarginLeftWhenHorizontal',
		cssProperty: 'margin-left',
		displayName: 'Line margin left when horizontal',
		description: 'The margin left of line when it is horizontal.',
		defaultValue: '16px',
		selector: '.stepper.horizontal .line',
	},

	{
		name: 'lineMinHeightWhenVertical',
		cssProperty: 'min-height',
		displayName: 'Line minimum height when vertical',
		description: 'The minimum height of line when it is vertical.',
		defaultValue: '30px',
		selector: '.stepper.vertical .line',
	},
	{
		name: 'lineBorderWhenVertical',
		cssProperty: 'border-left',
		displayName: 'Line border when vertical',
		description: 'The border of line when it is vertical.',
		defaultValue: '1px solid #DEDFE7',
		selector: '.stepper.vertical .line',
	},
	{
		name: 'lineMarginTopWhenVertical',
		cssProperty: 'margin-top',
		displayName: 'Line margin left when vertical',
		description: 'The margin left of line when it is vertical.',
		defaultValue: '16px',
		selector: '.stepper.vertical .line',
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);

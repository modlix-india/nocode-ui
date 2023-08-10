import { StyleGroupDefinition, StylePropertyDefinition } from '../../types/common';

export const styleProperties: Array<StylePropertyDefinition> = [
	{
		groupName: 'Default',
		displayName: 'Default Toggle Button Height',
		name: 'defaultToggleButtonHeight',
		defaultValue: '24px',
		description: 'Toggle Button Default design type height',
		cssProperty: 'height',
		selector: '.comp.compToggleButton._default',
		noPrefix: true,
	},
	{
		groupName: 'Outlined',
		displayName: 'Outlined Toggle Button Height',
		name: 'outlinedToggleButtonHeight',
		defaultValue: '24px',
		description: 'Toggle Button Outlined design type height',
		cssProperty: 'height',
		selector: '.comp.compToggleButton._outlined',
		noPrefix: true,
	},
	{
		groupName: 'Squared',
		displayName: 'Squared Toggle Button Height',
		name: 'squaredToggleButtonHeight',
		defaultValue: '24px',
		description: 'Toggle Button squared design type height',
		cssProperty: 'height',
		selector: '.comp.compToggleButton._squared',
		noPrefix: true,
	},
	{
		groupName: 'BigKnob',
		displayName: 'Big Knob Toggle Button Height',
		name: 'bigKnobToggleButtonHeight',
		defaultValue: '18px',
		description: 'Toggle Button big knob design type height',
		cssProperty: 'height',
		selector: '.comp.compToggleButton._bigknob',
		noPrefix: true,
	},
	{
		groupName: 'Small',
		displayName: 'Small Toggle Button Height',
		name: 'smallToggleButtonHeight',
		defaultValue: '24px',
		description: 'Toggle Button small design type height',
		cssProperty: 'height',
		selector: '.comp.compToggleButton._small',
		noPrefix: true,
	},

	{
		groupName: 'Background',
		displayName: 'Primary Track Background Color',
		name: 'primaryToggleCompBGColor',
		defaultValue: '<backgroundColorOne>',
		description: 'Toggle Button Primary Color Scheme Background Color',
		cssProperty: 'background',
		selector:
			'.comp.compToggleButton._default._primary._on, .comp.compToggleButton._outlined._primary._on, .comp.compToggleButton._squared._primary._on, .comp.compToggleButton._bigknob._primary._on, .comp.compToggleButton._small._primary._on, .comp.compToggleButton._outlined._primary ._knob',
		noPrefix: true,
	},
	{
		groupName: 'Background',
		displayName: 'Secondary Track Background Color',
		name: 'secondaryToggleCompBGColor',
		defaultValue: '<backgroundColorTwo>',
		description: 'Toggle Button Secondary Color Scheme Background Color',
		cssProperty: 'background',
		selector:
			'.comp.compToggleButton._default._secondary._on, .comp.compToggleButton._outlined._secondary._on, .comp.compToggleButton._squared._secondary._on, .comp.compToggleButton._bigknob._secondary._on, .comp.compToggleButton._small._secondary._on, .comp.compToggleButton._outlined._secondary ._knob',
		noPrefix: true,
	},
	{
		groupName: 'Background',
		displayName: 'Tertiary Track Background Color',
		name: 'tertiaryToggleCompBGColor',
		defaultValue: '<backgroundColorThree>',
		description: 'Toggle Button Tertiary Color Scheme Background Color',
		cssProperty: 'background',
		selector:
			'.comp.compToggleButton._default._tertiary._on, .comp.compToggleButton._outlined._tertiary._on, .comp.compToggleButton._squared._tertiary._on, .comp.compToggleButton._bigknob._tertiary._on, .comp.compToggleButton._small._tertiary._on, .comp.compToggleButton._outlined._tertiary ._knob',
		noPrefix: true,
	},
	{
		groupName: 'Background',
		displayName: 'Quaternary Track Background Color',
		name: 'quaternaryToggleCompBGColor',
		defaultValue: '<backgroundColorFour>',
		description: 'Toggle Button Quaternary Color Scheme Background Color',
		cssProperty: 'background',
		selector:
			'.comp.compToggleButton._default._quaternary._on, .comp.compToggleButton._outlined._quaternary._on, .comp.compToggleButton._squared._quaternary._on, .comp.compToggleButton._bigknob._quaternary._on, .comp.compToggleButton._small._quaternary._on, .comp.compToggleButton._outlined._quaternary ._knob',
		noPrefix: true,
	},
	{
		groupName: 'Background',
		displayName: 'Quinary Track Background Color',
		name: 'quinaryToggleCompBGColor',
		defaultValue: '<backgroundColorFive>',
		description: 'Toggle Button Quinary Color Scheme Background Color',
		cssProperty: 'background',
		selector:
			'.comp.compToggleButton._default._quinary._on, .comp.compToggleButton._outlined._quinary._on, .comp.compToggleButton._squared._quinary._on, .comp.compToggleButton._bigknob._quinary._on, .comp.compToggleButton._small._quinary._on, .comp.compToggleButton._outlined._quinary ._knob',
		noPrefix: true,
	},
	{
		groupName: 'Background',
		displayName: 'Gradient One Track Background Color',
		name: 'gradientOneToggleCompBGColor',
		defaultValue: '<gradientColorOne>',
		description: 'Toggle Button Gradient One Color Scheme Background Color',
		cssProperty: 'background',
		selector:
			'.comp.compToggleButton._default._gradient1._on, .comp.compToggleButton._outlined._gradient1._on, .comp.compToggleButton._squared._gradient1._on, .comp.compToggleButton._bigknob._gradient1._on, .comp.compToggleButton._small._gradient1._on, .comp.compToggleButton._outlined._gradient1 ._knob',
		noPrefix: true,
	},

	{
		groupName: 'Background',
		displayName: 'Grey Background',
		name: 'greyToggleCompBgColor',
		defaultValue: '<backgroundColorNine>',
		description: 'Toggle Button Grey Color Background Color',
		cssProperty: 'background',
		selector:
			'.comp.compToggleButton._default, .comp.compToggleButton._squared, .comp.compToggleButton._bigknob, .comp.compToggleButton._small',
		noPrefix: true,
	},
	{
		groupName: 'Background',
		displayName: 'Light Background',
		name: 'lightToggleCompBgColor',
		defaultValue: '<backgroundColorSeven>',
		description: 'Toggle Button Light Color Background Color',
		cssProperty: 'background',
		selector:
			'.comp.compToggleButton._outlined, .comp.compToggleButton._outlined._on ._knob, .comp.compToggleButton._default ._knob, .comp.compToggleButton._squared ._knob, .comp.compToggleButton._bigknob ._knob, .comp.compToggleButton._small ._knob',
		noPrefix: true,
	},

	{
		groupName: 'Default',
		displayName: 'Default Toggle Knob Height',
		name: 'defaultToggleKnobHeight',
		defaultValue: '18px',
		description: 'Toggle Knob Default design type height',
		cssProperty: 'height',
		selector: '.comp.compToggleButton._default ._knob',
		noPrefix: true,
	},
	{
		groupName: 'Outlined',
		displayName: 'Outlined Toggle Knob Height',
		name: 'outlinedToggleKnobHeight',
		defaultValue: '18px',
		description: 'Toggle Knob Outlined design type height',
		cssProperty: 'height',
		selector: '.comp.compToggleButton._outlined ._knob',
		noPrefix: true,
	},
	{
		groupName: 'Squared',
		displayName: 'Squared Toggle Knob Height',
		name: 'squaredToggleKnobHeight',
		defaultValue: '18px',
		description: 'Toggle Knob squared design type height',
		cssProperty: 'height',
		selector: '.comp.compToggleButton._squared ._knob',
		noPrefix: true,
	},
	{
		groupName: 'BigKnob',
		displayName: 'Big Knob Toggle Knob Height',
		name: 'bigKnobToggleKnobHeight',
		defaultValue: '24px',
		description: 'Toggle Knob big knob design type height',
		cssProperty: 'height',
		selector: '.comp.compToggleButton._bigknob ._knob',
		noPrefix: true,
	},
	{
		groupName: 'Small',
		displayName: 'Small Toggle Knob Height',
		name: 'smallToggleKnobHeight',
		defaultValue: '12px',
		description: 'Toggle Knob small design type height',
		cssProperty: 'height',
		selector: '.comp.compToggleButton._small ._knob',
		noPrefix: true,
	},

	{
		groupName: 'Default',
		displayName: 'Default Toggle Knob Width',
		name: 'defaultToggleKnobWidth',
		defaultValue: '<defaultToggleKnobHeight>',
		description: 'Toggle Knob Default design type width',
		cssProperty: 'width',
		selector: '.comp.compToggleButton._default ._knob',
		noPrefix: true,
	},
	{
		groupName: 'Outlined',
		displayName: 'Outlined Toggle Knob Width',
		name: 'outlinedToggleKnobWidth',
		defaultValue: '<outlinedToggleKnobHeight>',
		description: 'Toggle Knob Outlined design type width',
		cssProperty: 'width',
		selector: '.comp.compToggleButton._outlined ._knob',
		noPrefix: true,
	},
	{
		groupName: 'Squared',
		displayName: 'Squared Toggle Knob Width',
		name: 'squaredToggleKnobWidth',
		defaultValue: '<squaredToggleKnobHeight>',
		description: 'Toggle Knob squared design type width',
		cssProperty: 'width',
		selector: '.comp.compToggleButton._squared ._knob',
		noPrefix: true,
	},
	{
		groupName: 'BigKnob',
		displayName: 'Big Knob Toggle Knob Width',
		name: 'bigKnobToggleKnobWidth',
		defaultValue: '<bigKnobToggleKnobHeight>',
		description: 'Toggle Knob big knob design type width',
		cssProperty: 'width',
		selector: '.comp.compToggleButton._bigknob ._knob',
		noPrefix: true,
	},
	{
		groupName: 'Small',
		displayName: 'Small Toggle Knob Width',
		name: 'smallToggleKnobWidth',
		defaultValue: '<smallToggleKnobHeight>',
		description: 'Toggle Knob small design type width',
		cssProperty: 'width',
		selector: '.comp.compToggleButton._small ._knob',
		noPrefix: true,
	},

	{
		groupName: 'Padding',
		displayName: 'Knob Container Padding',
		name: 'toggleKnobContainerPadding',
		defaultValue: '0 4px',
		description: 'Toggle Knob container Padding',
		cssProperty: 'padding',
		selector:
			'.comp.compToggleButton._default, .comp.compToggleButton._outlined, .comp.compToggleButton._squared, .comp.compToggleButton._small',
		noPrefix: true,
	},
	{
		groupName: 'Padding',
		displayName: 'Knob Padding',
		name: 'toggleKnobPadding',
		defaultValue: '5px',
		description: 'Toggle Knob padding',
		cssProperty: 'padding',
		selector:
			'.comp.compToggleButton._default ._knob._withText, .comp.compToggleButton._outlined ._knob._withText, .comp.compToggleButton._squared ._knob._withText, .comp.compToggleButton._bigknob ._knob._withText, .comp.compToggleButton._small ._knob._withText',
		noPrefix: true,
	},

	{
		groupName: 'Color',
		displayName: 'Grey Color',
		name: 'greyToggleCompTextColor',
		defaultValue: '<fontColorEight>',
		description: 'Toggle Button Grey Text Color',
		cssProperty: 'color',
		selector:
			'.comp.compToggleButton._default ._toggleButtonLabel, .comp.compToggleButton._outlined ._toggleButtonLabel, .comp.compToggleButton._squared ._toggleButtonLabel, .comp.compToggleButton._bigknob ._toggleButtonLabel, .comp.compToggleButton._small ._toggleButtonLabel, .comp.compToggleButton._default._on ._knob._withText ._toggleButtonLabel, .comp.compToggleButton._outlined._on ._knob._withText ._toggleButtonLabel, .comp.compToggleButton._squared._on ._knob._withText ._toggleButtonLabel, .comp.compToggleButton._bigknob._on ._knob._withText ._toggleButtonLabel, .comp.compToggleButton._small._on ._knob._withText ._toggleButtonLabel',
		noPrefix: true,
	},
	{
		groupName: 'Color',
		displayName: 'Light Color',
		name: 'lightToggleCompTextColor',
		defaultValue: '<fontColorTwo>',
		description: 'Toggle Button Light Text Color',
		cssProperty: 'color',
		selector:
			'.comp.compToggleButton._default._on ._toggleButtonLabel, .comp.compToggleButton._outlined._on ._toggleButtonLabel, .comp.compToggleButton._squared._on ._toggleButtonLabel, .comp.compToggleButton._bigknob._on ._toggleButtonLabel, .comp.compToggleButton._small._on ._toggleButtonLabel, .comp.compToggleButton._outlined ._knob._withText ._toggleButtonLabel',
		noPrefix: true,
	},

	{
		groupName: 'Border',
		displayName: 'Default Toggle Button Border',
		name: 'defaultToggleButtonBorder',
		description: 'Toggle Button border for default design',
		cssProperty: 'border',
		selector: '.comp.compToggleButton._default',
		noPrefix: true,
	},
	{
		groupName: 'Border',
		displayName: 'Outlined Toggle Button Border',
		name: 'outlinedToggleButtonBorder',
		defaultValue: '1px solid',
		description: 'Toggle Button border for Outlined design',
		cssProperty: 'border',
		selector: '.comp.compToggleButton._outlined',
		noPrefix: true,
	},
	{
		groupName: 'Border',
		displayName: 'Squared Toggle Button Border',
		name: 'squaredToggleButtonBorder',
		description: 'Toggle Button border for Squared design',
		cssProperty: 'border',
		selector: '.comp.compToggleButton._squared',
		noPrefix: true,
	},
	{
		groupName: 'Border',
		displayName: 'Big Knob Toggle Button Border',
		name: 'bigKnobToggleButtonBorder',
		description: 'Toggle Button border for BigKnob design',
		cssProperty: 'border',
		selector: '.comp.compToggleButton._bigknob',
		noPrefix: true,
	},
	{
		groupName: 'Border',
		displayName: 'Small Toggle Button Border',
		name: 'smallToggleButtonBorder',
		description: 'Toggle Button border for Small design',
		cssProperty: 'border',
		selector: '.comp.compToggleButton._small',
		noPrefix: true,
	},

	{
		groupName: 'Border Color',
		displayName: 'Primary Track Border Color',
		name: 'primaryToggleCompBorderColor',
		defaultValue: '<backgroundColorOne>',
		description: 'Toggle Button Primary Color Scheme Border Color',
		cssProperty: 'border-color',
		selector: '.comp.compToggleButton._outlined._primary',
		noPrefix: true,
	},
	{
		groupName: 'Border Color',
		displayName: 'Secondary Track Border Color',
		name: 'secondaryToggleCompBorderColor',
		defaultValue: '<backgroundColorTwo>',
		description: 'Toggle Button Secondary Color Scheme Border Color',
		cssProperty: 'border-color',
		selector: '.comp.compToggleButton._outlined._secondary',
		noPrefix: true,
	},
	{
		groupName: 'Border Color',
		displayName: 'Tertiary Track Border Color',
		name: 'tertiaryToggleCompBorderColor',
		defaultValue: '<backgroundColorThree>',
		description: 'Toggle Button Tertiary Color Scheme Border Color',
		cssProperty: 'border-color',
		selector: '.comp.compToggleButton._outlined._tertiary',
		noPrefix: true,
	},
	{
		groupName: 'Border Color',
		displayName: 'Quaternary Track Border Color',
		name: 'quaternaryToggleCompBorderColor',
		defaultValue: '<backgroundColorFour>',
		description: 'Toggle Button Quaternary Color Scheme Border Color',
		cssProperty: 'border-color',
		selector: '.comp.compToggleButton._outlined._quaternary',
		noPrefix: true,
	},
	{
		groupName: 'Border Color',
		displayName: 'Quinary Track Border Color',
		name: 'quinaryToggleCompBorderColor',
		defaultValue: '<backgroundColorFive>',
		description: 'Toggle Button Quinary Color Scheme Border Color',
		cssProperty: 'border-color',
		selector: '.comp.compToggleButton._outlined._quinary',
		noPrefix: true,
	},
	{
		groupName: 'Border Color',
		displayName: 'Gradient One Track Border Color',
		name: 'gradientOneToggleCompBorderColor',
		defaultValue: '<gradientColorOne>',
		description: 'Toggle Button Gradient One Color Scheme Border Color',
		cssProperty: 'border-color',
		selector: '.comp.compToggleButton._outlined._gradient1',
		noPrefix: true,
	},

	{
		groupName: 'Border Color',
		displayName: 'Grey Border Color',
		name: 'greyToggleCompBorderColor',
		defaultValue: '<backgroundColorNine>',
		description: 'Toggle Button Grey Color Border Color',
		cssProperty: 'border-color',
		noPrefix: true,
	},
	{
		groupName: 'Border Color',
		displayName: 'Light Border Color',
		name: 'lightToggleCompBorderColor',
		defaultValue: '<backgroundColorSeven>',
		description: 'Toggle Button Light Color Border Color',
		cssProperty: 'border-color',
		noPrefix: true,
	},

	{
		groupName: 'Border Radius',
		displayName: 'Round Border',
		name: 'toggleCompRoundBorder',
		defaultValue: '50%',
		description: 'Toggle Button Comp Round Border',
		cssProperty: 'border-radius',
		selector:
			'.comp.compToggleButton._default ._knob, .comp.compToggleButton._outlined ._knob, .comp.compToggleButton._small ._knob',
		noPrefix: true,
	},
	{
		groupName: 'Border Radius',
		displayName: 'Rounded Border With Width',
		name: 'toggleCompRoundBorderWithWidth',
		defaultValue: '100px',
		description: 'Toggle Button Comp Round Border with width',
		cssProperty: 'border-radius',
		selector:
			'.comp.compToggleButton._default, .comp.compToggleButton._outlined, .comp.compToggleButton._bigknob, .comp.compToggleButton._bigknob ._knob, .comp.compToggleButton._default ._knob._withText, .comp.compToggleButton._outlined ._knob._withText, .comp.compToggleButton._bigknob ._knob._withText, .comp.compToggleButton._small ._knob._withText',
		noPrefix: true,
	},
	{
		groupName: 'Border Radius',
		displayName: 'Squared Border',
		name: 'toggleCompSquaredBorder',
		defaultValue: '2px',
		description: 'Toggle Button Comp Squared Border',
		cssProperty: 'border-radius',
		selector:
			'.comp.compToggleButton._squared, .comp.compToggleButton._squared ._knob, .comp.compToggleButton._squared ._knob._withText',
		noPrefix: true,
	},
	{
		groupName: 'Border Radius',
		displayName: 'Small Round Border',
		name: 'toggleCompSmallRoundBorder',
		defaultValue: '50px',
		description: 'Toggle Button Comp Small Round Border',
		cssProperty: 'border-radius',
		selector: '.comp.compToggleButton._small',
		noPrefix: true,
	},

	{
		groupName: 'Default',
		displayName: 'Default Toggle Knob Width',
		name: 'defaultToggleKnobWithTextWidth',
		defaultValue: 'auto',
		description: 'Toggle Knob Default design type width',
		cssProperty: 'width',
		selector: '.comp.compToggleButton._default ._knob._withText',
		noPrefix: true,
	},
	{
		groupName: 'Outlined',
		displayName: 'Outlined Toggle Knob Width',
		name: 'outlinedToggleKnobWithTextWidth',
		defaultValue: 'auto',
		description: 'Toggle Knob Outlined design type width',
		cssProperty: 'width',
		selector: '.comp.compToggleButton._outlined ._knob._withText',
		noPrefix: true,
	},
	{
		groupName: 'Squared',
		displayName: 'Squared Toggle Knob Width',
		name: 'squaredToggleKnobWithTextWidth',
		defaultValue: 'auto',
		description: 'Toggle Knob squared design type width',
		cssProperty: 'width',
		selector: '.comp.compToggleButton._squared ._knob._withText',
		noPrefix: true,
	},
	{
		groupName: 'BigKnob',
		displayName: 'Big Knob Toggle Knob Width',
		name: 'bigKnobToggleKnobWithTextWidth',
		defaultValue: 'auto',
		description: 'Toggle Knob big knob design type width',
		cssProperty: 'width',
		selector: '.comp.compToggleButton._bigknob ._knob._withText',
		noPrefix: true,
	},
	{
		groupName: 'Small',
		displayName: 'Small Toggle Knob Width',
		name: 'smallToggleKnobWithTextWidth',
		defaultValue: 'auto',
		description: 'Toggle Knob small design type width',
		cssProperty: 'width',
		selector: '.comp.compToggleButton._small ._knob._withText',
		noPrefix: true,
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties
		.filter(e => !!e.defaultValue)
		.map(({ name, defaultValue }) => [name, defaultValue!]),
);

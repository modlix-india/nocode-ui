import { StylePropertyDefinition } from '../../types/common';

/**
 * SchemaForm's chrome, as theme variables.
 *
 * `SchemaFormStyle.tsx` welds its palette, radii and type scale into a template
 * string. Those rules are emitted BEFORE `processStyleDefinition`, so declaring
 * a property here overrides the literal by cascade alone — every selector below
 * is written at the base rule's own specificity so it wins on the tie.
 *
 * Every default reproduces what the component renders today: where the base CSS
 * reads a theme variable through its `t()` helper the default is that same
 * `<variable>` reference, and where it hard-codes a literal the default is that
 * literal. An app that sets none of these looks exactly as it did.
 *
 * Order matters for the focus rules: `input[type="text"]` and `input:focus` tie
 * on specificity, so the base sheet resolves them by source order and this array
 * has to keep the same order to resolve them the same way.
 */

const INPUT_SEL = [
	'.comp.compSchemaForm ._singleSchema input[type="text"]',
	'.comp.compSchemaForm ._singleSchema input[type="number"]',
	'.comp.compSchemaForm ._singleSchema select',
].join(', ');

const INPUT_FOCUS_SEL = [
	'.comp.compSchemaForm ._singleSchema input:focus',
	'.comp.compSchemaForm ._singleSchema select:focus',
].join(', ');

const SECTION_SEL = '.comp.compSchemaForm ._objectSchema, .comp.compSchemaForm ._arraySchema';

const SECTION_HEADER_SEL =
	'.comp.compSchemaForm ._objectHeader, .comp.compSchemaForm ._arrayHeader';

// The two delete affordances carry identical colours today and mean the same
// thing, so they share one knob. Each branch is written at its own base rule's
// specificity, and neither branch can match the other's elements.
const ACTION_ICON_SEL = [
	'.comp.compSchemaForm ._singleSchema ._inputElement i.fa',
	'.comp.compSchemaForm ._arrayItemHeader i.fa',
].join(', ');

const ACTION_ICON_HOVER_SEL = [
	'.comp.compSchemaForm ._singleSchema ._inputElement i.fa:hover',
	'.comp.compSchemaForm ._arrayItemHeader i.fa:hover',
].join(', ');

export const styleProperties: Array<StylePropertyDefinition> = [
	// ─── Form surface ───
	{
		gn: 'Form Surface',
		dn: 'Font Family',
		de: 'Type family for the whole form. Unset by default, so the form inherits the page font.',
		n: 'schemaFormFontFamily',
		cp: 'font-family',
		sel: '.comp.compSchemaForm',
		np: true,
	},

	// ─── Fields ───
	{
		gn: 'Field',
		dn: 'Input Text Colour',
		n: 'schemaFormInputColor',
		dv: '#1F2937',
		cp: 'color',
		sel: INPUT_SEL,
		np: true,
	},
	{
		gn: 'Field',
		dn: 'Input Background',
		n: 'schemaFormInputBackground',
		dv: '<surfaceColorOne>',
		cp: 'background-color',
		sel: INPUT_SEL,
		np: true,
	},
	{
		gn: 'Field',
		dn: 'Input Border Colour',
		n: 'schemaFormInputBorderColor',
		dv: '<borderColorNine>',
		cp: 'border-color',
		sel: INPUT_SEL,
		np: true,
	},
	{
		gn: 'Field',
		dn: 'Input Border Radius',
		n: 'schemaFormInputBorderRadius',
		dv: '6px',
		cp: 'border-radius',
		sel: INPUT_SEL,
		np: true,
	},
	{
		gn: 'Field',
		dn: 'Input Font Size',
		n: 'schemaFormInputFontSize',
		dv: '13px',
		cp: 'font-size',
		sel: INPUT_SEL,
		np: true,
	},
	{
		gn: 'Field',
		dn: 'Input Padding',
		n: 'schemaFormInputPadding',
		dv: '8px 10px',
		cp: 'padding',
		sel: INPUT_SEL,
		np: true,
	},
	{
		gn: 'Field',
		dn: 'Input Focus Border Colour',
		n: 'schemaFormInputFocusBorderColor',
		dv: '<colorFive>',
		cp: 'border-color',
		sel: INPUT_FOCUS_SEL,
		np: true,
	},
	{
		gn: 'Field',
		dn: 'Input Focus Background',
		n: 'schemaFormInputFocusBackground',
		dv: '<colorSeven>',
		cp: 'background-color',
		sel: INPUT_FOCUS_SEL,
		np: true,
	},
	{
		gn: 'Field',
		dn: 'Label Colour',
		n: 'schemaFormFieldLabelColor',
		dv: '<fontColorTwo>',
		cp: 'color',
		sel: '.comp.compSchemaForm ._fieldLabel',
		np: true,
	},
	{
		gn: 'Field',
		dn: 'Label Font Size',
		n: 'schemaFormFieldLabelFontSize',
		dv: '12px',
		cp: 'font-size',
		sel: '.comp.compSchemaForm ._fieldLabel',
		np: true,
	},
	{
		gn: 'Field',
		dn: 'Label Font Weight',
		n: 'schemaFormFieldLabelFontWeight',
		dv: '500',
		cp: 'font-weight',
		sel: '.comp.compSchemaForm ._fieldLabel',
		np: true,
	},

	// ─── Sections (object and array containers) ───
	{
		gn: 'Section',
		dn: 'Border Colour',
		n: 'schemaFormSectionBorderColor',
		dv: '<borderColorNine>',
		cp: 'border-color',
		sel: SECTION_SEL,
		np: true,
	},
	{
		gn: 'Section',
		dn: 'Border Radius',
		n: 'schemaFormSectionBorderRadius',
		dv: '6px',
		cp: 'border-radius',
		sel: SECTION_SEL,
		np: true,
	},
	{
		gn: 'Section',
		dn: 'Header Background',
		de: 'Background of an object or array header row. A gradient by default.',
		n: 'schemaFormSectionHeaderBackground',
		dv: 'linear-gradient(180deg, <surfaceColorOne> 0%, <surfaceColorTwo> 100%)',
		cp: 'background',
		sel: SECTION_HEADER_SEL,
		np: true,
	},
	{
		gn: 'Section',
		dn: 'Header Text Colour',
		n: 'schemaFormSectionHeaderColor',
		dv: '<fontColorTwo>',
		cp: 'color',
		sel: SECTION_HEADER_SEL,
		np: true,
	},
	{
		gn: 'Section',
		dn: 'Header Font Size',
		n: 'schemaFormSectionHeaderFontSize',
		dv: '13px',
		cp: 'font-size',
		sel: SECTION_HEADER_SEL,
		np: true,
	},
	{
		gn: 'Section',
		dn: 'Header Chevron Colour',
		n: 'schemaFormSectionHeaderIconColor',
		dv: '<fontColorThree>',
		cp: 'color',
		sel: '.comp.compSchemaForm ._objectHeader i.fa',
		np: true,
	},
	{
		gn: 'Section',
		dn: 'Object Divider Colour',
		de: 'The rule between an object header and its properties.',
		n: 'schemaFormObjectDividerColor',
		dv: '<borderColorNine>',
		cp: 'border-top-color',
		sel: '.comp.compSchemaForm ._objectProperties',
		np: true,
	},
	{
		gn: 'Section',
		dn: 'Object Padding',
		n: 'schemaFormObjectPadding',
		dv: '12px',
		cp: 'padding',
		sel: '.comp.compSchemaForm ._objectProperties',
		np: true,
	},

	// ─── Arrays ───
	{
		gn: 'Array',
		dn: 'Header Divider Colour',
		n: 'schemaFormArrayHeaderBorderColor',
		dv: '<borderColorNine>',
		cp: 'border-bottom-color',
		sel: '.comp.compSchemaForm ._arrayHeader',
		np: true,
	},
	{
		gn: 'Array',
		dn: 'Item Divider Colour',
		n: 'schemaFormArrayItemBorderColor',
		dv: '<borderColorNine>',
		cp: 'border-bottom-color',
		sel: '.comp.compSchemaForm ._arrayItem',
		np: true,
	},
	{
		gn: 'Array',
		dn: 'Item Padding',
		n: 'schemaFormArrayItemPadding',
		dv: '12px',
		cp: 'padding',
		sel: '.comp.compSchemaForm ._arrayItem',
		np: true,
	},
	{
		gn: 'Array',
		dn: 'Add Button Background',
		n: 'schemaFormArrayAddButtonBackground',
		dv: '<colorFive>',
		cp: 'background',
		sel: '.comp.compSchemaForm ._arrayAddBtn',
		np: true,
	},
	{
		gn: 'Array',
		dn: 'Add Button Text Colour',
		n: 'schemaFormArrayAddButtonColor',
		dv: '<colorSeven>',
		cp: 'color',
		sel: '.comp.compSchemaForm ._arrayAddBtn',
		np: true,
	},
	{
		gn: 'Array',
		dn: 'Add Button Border Radius',
		n: 'schemaFormArrayAddButtonBorderRadius',
		dv: '4px',
		cp: 'border-radius',
		sel: '.comp.compSchemaForm ._arrayAddBtn',
		np: true,
	},
	{
		gn: 'Array',
		dn: 'Add Button Font Size',
		n: 'schemaFormArrayAddButtonFontSize',
		dv: '12px',
		cp: 'font-size',
		sel: '.comp.compSchemaForm ._arrayAddBtn',
		np: true,
	},
	{
		gn: 'Array',
		dn: 'Add Button Hover Background',
		n: 'schemaFormArrayAddButtonHoverBackground',
		dv: '#2563EB',
		cp: 'background',
		sel: '.comp.compSchemaForm ._arrayAddBtn:hover',
		np: true,
	},
	{
		gn: 'Array',
		dn: 'Item Index Text Colour',
		n: 'schemaFormArrayItemIndexColor',
		dv: '<fontColorThree>',
		cp: 'color',
		sel: '.comp.compSchemaForm ._arrayItemIndex',
		np: true,
	},
	{
		gn: 'Array',
		dn: 'Item Index Background',
		n: 'schemaFormArrayItemIndexBackground',
		dv: '<surfaceColorTwo>',
		cp: 'background',
		sel: '.comp.compSchemaForm ._arrayItemIndex',
		np: true,
	},
	{
		gn: 'Array',
		dn: 'Item Index Font Size',
		n: 'schemaFormArrayItemIndexFontSize',
		dv: '11px',
		cp: 'font-size',
		sel: '.comp.compSchemaForm ._arrayItemIndex',
		np: true,
	},

	// ─── Action icons ───
	{
		gn: 'Action Icon',
		dn: 'Colour',
		de: 'The delete affordance on a field and on an array item.',
		n: 'schemaFormActionIconColor',
		dv: '<fontColorTen>',
		cp: 'color',
		sel: ACTION_ICON_SEL,
		np: true,
	},
	{
		gn: 'Action Icon',
		dn: 'Hover Colour',
		n: 'schemaFormActionIconHoverColor',
		dv: '<colorFour>',
		cp: 'color',
		sel: ACTION_ICON_HOVER_SEL,
		np: true,
	},
	{
		gn: 'Action Icon',
		dn: 'Hover Background',
		n: 'schemaFormActionIconHoverBackground',
		dv: '<errorWashColor>',
		cp: 'background-color',
		sel: ACTION_ICON_HOVER_SEL,
		np: true,
	},

	// ─── Validation ───
	{
		gn: 'Validation',
		dn: 'Error Text Colour',
		n: 'schemaFormErrorColor',
		dv: '<colorFour>',
		cp: 'color',
		sel: '.comp.compSchemaForm ._singleSchema ._errorMessages',
		np: true,
	},
	{
		gn: 'Validation',
		dn: 'Error Background',
		n: 'schemaFormErrorBackground',
		dv: '<errorWashColor>',
		cp: 'background-color',
		sel: '.comp.compSchemaForm ._singleSchema ._errorMessages',
		np: true,
	},
	{
		gn: 'Validation',
		dn: 'Error Accent Colour',
		de: 'The bar down the left edge of an error message.',
		n: 'schemaFormErrorAccentColor',
		dv: '<colorFour>',
		cp: 'border-left-color',
		sel: '.comp.compSchemaForm ._singleSchema ._errorMessages',
		np: true,
	},
	{
		gn: 'Validation',
		dn: 'Error Font Size',
		n: 'schemaFormErrorFontSize',
		dv: '12px',
		cp: 'font-size',
		sel: '.comp.compSchemaForm ._singleSchema ._errorMessages',
		np: true,
	},
	{
		gn: 'Validation',
		dn: 'Empty Message Colour',
		n: 'schemaFormEmptyMessageColor',
		dv: '<fontColorTen>',
		cp: 'color',
		sel: '.comp.compSchemaForm ._emptyMessage',
		np: true,
	},
	{
		gn: 'Validation',
		dn: 'Empty Message Font Size',
		n: 'schemaFormEmptyMessageFontSize',
		dv: '12px',
		cp: 'font-size',
		sel: '.comp.compSchemaForm ._emptyMessage',
		np: true,
	},

	// ─── Type selector (multi-type fields) ───
	{
		gn: 'Type Selector',
		dn: 'Text Colour',
		n: 'schemaFormTypeSelectorColor',
		dv: '#1F2937',
		cp: 'color',
		sel: '.comp.compSchemaForm ._typeSelector',
		np: true,
	},
	{
		gn: 'Type Selector',
		dn: 'Background',
		n: 'schemaFormTypeSelectorBackground',
		dv: '<surfaceColorOne>',
		cp: 'background-color',
		sel: '.comp.compSchemaForm ._typeSelector',
		np: true,
	},
	{
		gn: 'Type Selector',
		dn: 'Border Colour',
		n: 'schemaFormTypeSelectorBorderColor',
		dv: '<borderColorNine>',
		cp: 'border-color',
		sel: '.comp.compSchemaForm ._typeSelector',
		np: true,
	},
	{
		gn: 'Type Selector',
		dn: 'Border Radius',
		n: 'schemaFormTypeSelectorBorderRadius',
		dv: '6px',
		cp: 'border-radius',
		sel: '.comp.compSchemaForm ._typeSelector',
		np: true,
	},
	{
		gn: 'Type Selector',
		dn: 'Font Size',
		n: 'schemaFormTypeSelectorFontSize',
		dv: '12px',
		cp: 'font-size',
		sel: '.comp.compSchemaForm ._typeSelector',
		np: true,
	},
	{
		gn: 'Type Selector',
		dn: 'Focus Border Colour',
		n: 'schemaFormTypeSelectorFocusBorderColor',
		dv: '<colorFive>',
		cp: 'border-color',
		sel: '.comp.compSchemaForm ._typeSelector:focus',
		np: true,
	},
	{
		gn: 'Type Selector',
		dn: 'Focus Background',
		n: 'schemaFormTypeSelectorFocusBackground',
		dv: '<colorSeven>',
		cp: 'background-color',
		sel: '.comp.compSchemaForm ._typeSelector:focus',
		np: true,
	},
];

export const styleDefaults = new Map<string, string>(
	styleProperties.filter(e => !!e.dv).map(({ n, dv }) => [n, dv!]),
);

export const stylePropertiesForTheme: Array<StylePropertyDefinition> = styleProperties;

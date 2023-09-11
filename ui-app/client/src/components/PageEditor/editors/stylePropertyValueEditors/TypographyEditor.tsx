import React from 'react';
import {
	DropdownOptions,
	EachSimpleEditor,
	SimpleEditorType,
	StyleEditorsProps,
} from './SimpleEditors';

// 		'fontSize',
// 		'fontWeight',
// 		'color',
// 		'textAlign',
// 		'fontStyle',
// 		'lineHeight',
// 		'letterSpacing',
// 		'textIndent',
// 			'textTransform',
// 			'textShadow',
// 			'direction',
// 			'textDecoration',
// 			'textOrientation',
// 			'wordBreak',
// 			'wordSpacing',
// 			'wordWrap',
// 			'fontFeatureSettings',
// 			'fontKerning',
// 			'fontVariant',
// 			'fontVariantCaps',
// 			'textAlignLast',
// 			'textDecorationColor',
// 			'textDecorationLine',
// 			'textDecorationStyle',
// 			'textEmphasis',
// 			'textOverflow',
// 			'whiteSpace',

const FONT_FAMILIES = [
	{ value: 'Arial', displayName: 'Arial' },
	{ value: 'Arial Black', displayName: 'Arial Black' },
	{ value: 'Helvetica', displayName: 'Helvetica' },
	{ value: 'Times New Roman', displayName: 'Times New Roman' },
	{ value: 'Times', displayName: 'Times' },
	{ value: 'Courier New', displayName: 'Courier New' },
	{ value: 'Courier', displayName: 'Courier' },
	{ value: 'Comic Sans MS', displayName: 'Comic Sans MS' },
	{ value: 'Impact', displayName: 'Impact' },
	{ value: 'Verdana', displayName: 'Verdana' },
	{ value: 'Georgia', displayName: 'Georgia' },
	{ value: 'Palatino', displayName: 'Palatino' },
	{ value: 'Garamond', displayName: 'Garamond' },
	{ value: 'Trebuchet MS', displayName: 'Trebuchet MS' },
];

export function TypographyEditor({
	subComponentName,
	pseudoState,
	iterateProps,
	appDef,
	pageDef,
	editPageName,
	slaveStore,
	storePaths,
	selectorPref,
	styleProps,
	selectedComponent,
	saveStyle,
	pageOperations,
	properties,
}: StyleEditorsProps) {
	let fonts: DropdownOptions = [...FONT_FAMILIES];
	if (appDef?.properties?.fontPacks) {
		fonts = Object.values(appDef.properties.fontPacks)
			.map((e: any) => ({ value: e.name, displayName: e.name }))
			.concat(fonts);
	}

	return (
		<>
			<EachSimpleEditor
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="fontFamily"
				displayName="Font Family"
				iterateProps={iterateProps}
				pageDef={pageDef}
				editPageName={editPageName}
				slaveStore={slaveStore}
				storePaths={storePaths}
				selectorPref={selectorPref}
				styleProps={styleProps}
				selectedComponent={selectedComponent}
				saveStyle={saveStyle}
				pageOperations={pageOperations}
				properties={properties}
				editorDef={{ type: SimpleEditorType.Dropdown, options: fonts }}
			/>
			<EachSimpleEditor
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="fontSize"
				displayName="Font Size"
				iterateProps={iterateProps}
				pageDef={pageDef}
				editPageName={editPageName}
				slaveStore={slaveStore}
				storePaths={storePaths}
				selectorPref={selectorPref}
				styleProps={styleProps}
				selectedComponent={selectedComponent}
				saveStyle={saveStyle}
				pageOperations={pageOperations}
				properties={properties}
				editorDef={{ type: SimpleEditorType.PixelSize }}
				showTitle={false}
			/>
		</>
	);
}

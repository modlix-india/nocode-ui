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
	{ name: 'Arial', displayName: 'Arial' },
	{ name: 'Arial Black', displayName: 'Arial Black' },
	{ name: 'Helvetica', displayName: 'Helvetica' },
	{ name: 'Times New Roman', displayName: 'Times New Roman' },
	{ name: 'Times', displayName: 'Times' },
	{ name: 'Courier New', displayName: 'Courier New' },
	{ name: 'Courier', displayName: 'Courier' },
	{ name: 'Comic Sans MS', displayName: 'Comic Sans MS' },
	{ name: 'Impact', displayName: 'Impact' },
	{ name: 'Verdana', displayName: 'Verdana' },
	{ name: 'Georgia', displayName: 'Georgia' },
	{ name: 'Palatino', displayName: 'Palatino' },
	{ name: 'Garamond', displayName: 'Garamond' },
	{ name: 'Trebuchet MS', displayName: 'Trebuchet MS' },
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
			.map((e: any) => ({ name: e.name, displayName: e.name }))
			.concat(fonts);
	}

	return (
		<>
			<EachSimpleEditor
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="fontFamily"
				placeholder="Font Family"
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
				placeholder="Font Size"
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
			/>
		</>
	);
}

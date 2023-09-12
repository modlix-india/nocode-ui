import React from 'react';
import { EachSimpleEditor, StyleEditorsProps, SimpleEditorType } from './simpleEditors';
import { DropdownOptions } from './simpleEditors/Dropdown';

// 		'color',
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
				editorDef={{ type: SimpleEditorType.Dropdown, dropdownOptions: fonts }}
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
			<EachSimpleEditor
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="fontWeight"
				placeholder="Font Weight"
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
				editorDef={{
					type: SimpleEditorType.Dropdown,
					dropdownOptions: [
						{ name: '100', displayName: '100' },
						{ name: '200', displayName: '200' },
						{ name: '300', displayName: '300' },
						{ name: '400', displayName: '400 - Normal' },
						{ name: '500', displayName: '500' },
						{ name: '600', displayName: '600' },
						{ name: '700', displayName: '700 - Bold' },
						{ name: '800', displayName: '800' },
						{ name: '900', displayName: '900' },
						{ name: 'normal', displayName: 'Normal' },
						{ name: 'bold', displayName: 'Bold' },
						{ name: 'lighter', displayName: 'Lighter' },
						{ name: 'bolder', displayName: 'Bolder' },
						{ name: 'unset', displayName: 'Un Set' },
					],
				}}
			/>
			<div className="_combineEditors">
				<EachSimpleEditor
					subComponentName={subComponentName}
					pseudoState={pseudoState}
					prop="textAlign"
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
					editorDef={{
						type: SimpleEditorType.Icons,
						dropdownOptions: [
							{ name: '100', displayName: '100' },
							{ name: '200', displayName: '200' },
							{ name: '300', displayName: '300' },
							{ name: '400', displayName: '400 - Normal' },
							{ name: '500', displayName: '500' },
							{ name: '600', displayName: '600' },
							{ name: '700', displayName: '700 - Bold' },
							{ name: '800', displayName: '800' },
							{ name: '900', displayName: '900' },
							{ name: 'normal', displayName: 'Normal' },
							{ name: 'bold', displayName: 'Bold' },
							{ name: 'lighter', displayName: 'Lighter' },
							{ name: 'bolder', displayName: 'Bolder' },
							{ name: 'unset', displayName: 'Un Set' },
						],
					}}
				/>
			</div>
		</>
	);
}

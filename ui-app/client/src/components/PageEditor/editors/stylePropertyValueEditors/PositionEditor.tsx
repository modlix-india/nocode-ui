import React from 'react';
import {
	EachSimpleEditor,
	SimpleEditorType,
	StyleEditorsProps,
	extractValue,
} from './simpleEditors';

export function PositionEditor({
	subComponentName,
	pseudoState,
	iterateProps,
	appDef,
	selectorPref,
	styleProps,
	selectedComponent,
	saveStyle,
	properties,
	isDetailStyleEditor,
}: StyleEditorsProps) {
	const { value: { value: position } = {} } =
		extractValue({
			subComponentName,
			prop: 'position',
			iterateProps,
			pseudoState,
			selectorPref,
			selectedComponent,
		}) ?? ({} as any);

	return (
		<>
			<div className="_combineEditors">
				<div className="_simpleLabel">Position</div>
				<EachSimpleEditor
					subComponentName={subComponentName}
					pseudoState={pseudoState}
					prop="position"
					placeholder="Position"
					iterateProps={iterateProps}
					selectorPref={selectorPref}
					styleProps={styleProps}
					selectedComponent={selectedComponent}
					saveStyle={saveStyle}
					properties={properties}
					editorDef={{
						type: SimpleEditorType.Dropdown,
						dropDownDefaultValue: 'static',
						dropDownShowNoneLabel: false,
						dropdownOptions: [
							{
								name: 'static',
								displayName: 'Static',
								description:
									'Default value. Elements render in order, as they appear in the document flow',
							},
							{
								name: 'relative',
								displayName: 'Relative',
								description:
									'Element is positioned relative to its normal position',
							},
							{
								name: 'absolute',
								displayName: 'Absolute',
								description:
									'Element is positioned relative to its first positioned (not static) ancestor element',
							},
							{
								name: 'fixed',
								displayName: 'Fixed',
								description: 'Element is positioned relative to the browser window',
							},
							{
								name: 'sticky',
								displayName: 'Sticky',
								description:
									"Element is positioned based on the user's scroll position",
							},
						],
					}}
				/>
			</div>
		</>
	);
}

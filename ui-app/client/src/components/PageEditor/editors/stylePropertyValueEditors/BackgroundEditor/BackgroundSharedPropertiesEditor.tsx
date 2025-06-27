import React from 'react';
import { StyleEditorsProps, extractValue, valuesChangedOnlyValues } from '../simpleEditors';
import { EachSimpleEditor } from '../simpleEditors';
import { SimpleEditorType } from '../simpleEditors';
import { ManyFunctionsEditor } from '../simpleEditors/ManyFunctionsEditor';
import { FILTER_FUNCTIONS } from '../EffectsEditor';

export function BackgroundSharedPropertiesEditor(props: Readonly<StyleEditorsProps>) {
	const {
		subComponentName,
		selectedComponent,
		selectedComponentsList,
		iterateProps,
		pseudoState,
		selectorPref,
		defPath,
		locationHistory,
		pageExtractor,
		styleProps,
		saveStyle,
		properties,
	} = props;

	const backdropFilterValue =
		extractValue({
			subComponentName,
			prop: 'backdropFilter',
			iterateProps,
			pseudoState,
			selectorPref,
			selectedComponent,
		})?.value?.value || '';

	return (
		<div className="_backgroundSharedProperties">
			<div className="_propertySection">
				<EachSimpleEditor
					selectedComponentsList={selectedComponentsList}
					defPath={defPath}
					locationHistory={locationHistory}
					pageExtractor={pageExtractor}
					subComponentName={subComponentName}
					pseudoState={pseudoState}
					prop="backgroundBlendMode"
					placeholder="Background Blend Mode"
					iterateProps={iterateProps}
					selectorPref={selectorPref}
					styleProps={styleProps}
					selectedComponent={selectedComponent}
					saveStyle={saveStyle}
					properties={properties}
					editorDef={{
						type: SimpleEditorType.Dropdown,
						dropDownShowNoneLabel: true,
						dropdownOptions: [
							{ name: 'normal', displayName: 'Normal' },
							{ name: 'multiply', displayName: 'Multiply' },
							{ name: 'screen', displayName: 'Screen' },
							{ name: 'overlay', displayName: 'Overlay' },
							{ name: 'darken', displayName: 'Darken' },
							{ name: 'lighten', displayName: 'Lighten' },
							{ name: 'color-dodge', displayName: 'Color Dodge' },
							{ name: 'color-burn', displayName: 'Color Burn' },
							{ name: 'hard-light', displayName: 'Hard Light' },
							{ name: 'soft-light', displayName: 'Soft Light' },
							{ name: 'difference', displayName: 'Difference' },
							{ name: 'exclusion', displayName: 'Exclusion' },
							{ name: 'hue', displayName: 'Hue' },
							{ name: 'saturation', displayName: 'Saturation' },
							{ name: 'color', displayName: 'Color' },
							{ name: 'luminosity', displayName: 'Luminosity' },
						],
					}}
				/>
			</div>

			<div className="_propertySection">
				<div className="_simpleLabel _withPadding">Backdrop Filter</div>
				<ManyFunctionsEditor
					newFunctionTitle="New Backdrop Filter Function"
					value={backdropFilterValue}
					functionDetails={FILTER_FUNCTIONS}
					onChange={v =>
						valuesChangedOnlyValues({
							subComponentName,
							selectedComponent,
							selectedComponentsList,
							propValues: [{ prop: 'backdropFilter', value: v }],
							selectorPref,
							defPath,
							locationHistory,
							pageExtractor,
						})
					}
				/>
			</div>
		</div>
	);
}

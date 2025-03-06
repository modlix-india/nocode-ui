import React from 'react';
import {
	EachSimpleEditor,
	SimpleEditorType,
	StyleEditorsProps,
	extractValue,
	valuesChangedOnlyValues,
} from './simpleEditors';
import { FunctionDetail, ManyFunctionsEditor } from './simpleEditors/ManyFunctionsEditor';
import { PixelSize } from './simpleEditors/SizeSliders';
import { ManyValuesEditor, PropertyDetail } from './simpleEditors/ManyValuesEditor';

export function EffectsEditor(props: StyleEditorsProps) {
	const {
		subComponentName,
		pseudoState,
		iterateProps,
		selectorPref,
		styleProps,
		selectedComponent,
		selectedComponentsList,
		saveStyle,
		properties,
		pageDef,
		editPageName,
		slaveStore,
		storePaths,
		pageOperations,
		isDetailStyleEditor,
		defPath,
		locationHistory,
		pageExtractor,
	} = props;

	const filterValue =
		(
			extractValue({
				subComponentName,
				prop: 'filter',
				iterateProps,
				pseudoState,
				selectorPref,
				selectedComponent,
			}) ?? ({} as any)
		).value?.value ?? '';

	if (isDetailStyleEditor) {
		return (
			<>
				<OutlineEditor
					selectedComponentsList={selectedComponentsList}
					defPath={defPath}
					locationHistory={locationHistory}
					pageExtractor={pageExtractor}
					subComponentName={subComponentName}
					pseudoState={pseudoState}
					iterateProps={iterateProps}
					selectorPref={selectorPref}
					styleProps={styleProps}
					selectedComponent={selectedComponent}
					saveStyle={saveStyle}
					properties={properties}
					pageDef={pageDef}
					editPageName={editPageName}
					slaveStore={slaveStore}
					storePaths={storePaths}
					pageOperations={pageOperations}
				/>

				<TransformEditor
					selectedComponentsList={selectedComponentsList}
					defPath={defPath}
					locationHistory={locationHistory}
					pageExtractor={pageExtractor}
					subComponentName={subComponentName}
					pseudoState={pseudoState}
					iterateProps={iterateProps}
					selectorPref={selectorPref}
					styleProps={styleProps}
					selectedComponent={selectedComponent}
					saveStyle={saveStyle}
					properties={properties}
					pageDef={pageDef}
					editPageName={editPageName}
					slaveStore={slaveStore}
					storePaths={storePaths}
					pageOperations={pageOperations}
				/>
				<div className="_simpleLabel _withPadding">Mix Blend Mode</div>
				<EachSimpleEditor
					selectedComponentsList={selectedComponentsList}
					defPath={defPath}
					locationHistory={locationHistory}
					pageExtractor={pageExtractor}
					subComponentName={subComponentName}
					pseudoState={pseudoState}
					prop="mixBlendMode"
					placeholder="Mix Blend Mode"
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

				<div className="_simpleLabel _withPadding">Filter</div>
				<ManyFunctionsEditor
					newFunctionTitle="New Filter Function"
					value={filterValue}
					functionDetails={FILTER_FUNCTIONS}
					onChange={v =>
						valuesChangedOnlyValues({
							subComponentName,
							selectedComponent,
							selectedComponentsList,
							propValues: [{ prop: 'filter', value: v }],
							selectorPref,
							defPath,
							locationHistory,
							pageExtractor,
						})
					}
				/>
			</>
		);
	}
	const transform =
		(
			extractValue({
				subComponentName,
				prop: 'transform',
				iterateProps,
				pseudoState,
				selectorPref,
				selectedComponent,
			}) ?? ({} as any)
		).value?.value ?? '';
	return (
		<>
			<OpacityEditor
				selectedComponentsList={selectedComponentsList}
				defPath={defPath}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				iterateProps={iterateProps}
				selectorPref={selectorPref}
				styleProps={styleProps}
				selectedComponent={selectedComponent}
				saveStyle={saveStyle}
				properties={properties}
				pageDef={pageDef}
				editPageName={editPageName}
				slaveStore={slaveStore}
				storePaths={storePaths}
				pageOperations={pageOperations}
			/>
			<div className="_simpleLabel _withPadding">Cursor</div>
			<EachSimpleEditor
				selectedComponentsList={selectedComponentsList}
				defPath={defPath}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="cursor"
				placeholder="Cursor"
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
						{ name: 'auto', displayName: 'Auto' },
						{ name: 'defualt', displayName: 'Default' },
						{ name: 'pointer', displayName: 'Pointer' },
						{ name: 'all-scroll', displayName: 'All-scroll' },
						{ name: 'cell', displayName: 'Cell' },
						{ name: 'col-resize', displayName: 'Column Resize' },
						{ name: 'context-menu', displayName: 'Context Menu' },
						{ name: 'copy', displayName: 'Copy' },
						{ name: 'crosshair', displayName: 'Crosshair' },
						{ name: 'default', displayName: 'Default' },
						{ name: 'e-resize', displayName: 'E Resize' },
						{ name: 'ew-resize', displayName: 'EW Resize' },
						{ name: 'grab', displayName: 'Grab' },
						{ name: 'grabbing', displayName: 'Grabbing' },
						{ name: 'help', displayName: 'Help' },
						{ name: 'move', displayName: 'Move' },
						{ name: 'n-resize', displayName: 'N Resize' },
						{ name: 'ne-resize', displayName: 'NE Resize' },
						{ name: 'nesw-resize', displayName: 'NESW Resize' },
						{ name: 'ns-resize', displayName: 'NS Resize' },
						{ name: 'nw-resize', displayName: 'NW Resize' },
						{ name: 'nwse-resize', displayName: 'NWSE Resize' },
						{ name: 'no-drop', displayName: 'No Drop' },
						{ name: 'none', displayName: 'None' },
						{ name: 'not-allowed', displayName: 'Not Allowed' },
						{ name: 'progress', displayName: 'Progress' },
						{ name: 'row-resize', displayName: 'Row Resize' },
						{ name: 's-resize', displayName: 'S Resize' },
						{ name: 'se-resize', displayName: 'SE Resize' },
						{ name: 'sw-resize', displayName: 'SW Resize' },
						{ name: 'text', displayName: 'Text' },
						{ name: 'vertical-text', displayName: 'Vertical Text' },
						{ name: 'w-resize', displayName: 'W Resize' },
						{ name: 'wait', displayName: 'Wait' },
						{ name: 'zoom-in', displayName: 'Zoom-in' },
						{ name: 'zoom-out', displayName: 'Zoom-out' },
					],
				}}
			/>
			<div className="_simpleLabel _withPadding">Transform</div>
			<ManyFunctionsEditor
				newFunctionTitle="New Transform Function"
				value={transform}
				functionDetails={TRANSFORM_FUNCTIONS}
				onChange={v =>
					valuesChangedOnlyValues({
						subComponentName,
						selectedComponent,
						selectedComponentsList,
						propValues: [{ prop: 'transform', value: v }],
						selectorPref,
						defPath,
						locationHistory,
						pageExtractor,
					})
				}
			/>
			<div className="_simpleLabel _withPadding">Box Shadow</div>
			<EachSimpleEditor
				selectedComponentsList={selectedComponentsList}
				defPath={defPath}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="boxShadow"
				placeholder="Box Shadow"
				iterateProps={iterateProps}
				selectorPref={selectorPref}
				styleProps={styleProps}
				selectedComponent={selectedComponent}
				saveStyle={saveStyle}
				properties={properties}
				editorDef={{
					type: SimpleEditorType.BoxShadow,
				}}
			/>

			<ManyValuesEditor
				onChange={v =>
					valuesChangedOnlyValues({
						subComponentName,
						selectedComponent,
						selectedComponentsList,
						selectorPref,
						defPath,
						locationHistory,
						pageExtractor,
						propValues: v,
					})
				}
				values={TRANSITION_PROPERTIES.map(e => e.name).map(e => ({
					prop: e,
					value:
						extractValue({
							subComponentName,
							prop: e,
							iterateProps,
							pseudoState,
							selectorPref,
							selectedComponent,
						}).value?.value ?? '',
				}))}
				groupTitle="Customize Transition"
				newValueProps={['transitionProperty']}
				showNewGroup={true}
				newValueGroupTitle="New Transition"
				propDefinitions={TRANSITION_PROPERTIES}
			/>
		</>
	);
}

const TRANSITION_PROPERTIES: Array<PropertyDetail> = [
	{
		name: 'transitionProperty',
		displayName: 'Property',
		default: 'all',
		type: 'dropdown',
		dropdownOptions: [
			{ name: 'all', displayName: 'All' },
			{ name: 'none', displayName: 'None' },
			{ name: 'aspect-ratio', displayName: 'Aspect Ratio' },
			{ name: 'background', displayName: 'Background' },
			{ name: 'background-color', displayName: 'Background Color' },
			{ name: 'background-position', displayName: 'Background Position' },
			{ name: 'background-position-x', displayName: 'Background Position X' },
			{ name: 'background-position-y', displayName: 'Background Position Y' },
			{ name: 'background-size', displayName: 'Background Size' },
			{ name: 'block-size', displayName: 'Block Size' },
			{ name: 'border', displayName: 'Border' },
			{ name: 'border-bottom', displayName: 'Border Bottom' },
			{ name: 'border-bottom-color', displayName: 'Border Bottom Color' },
			{ name: 'border-end-end-radius', displayName: 'Border End End Radius' },
			{ name: 'border-end-start-radius', displayName: 'Border End Start Radius' },
			{ name: 'border-block', displayName: 'Border Block' },
			{ name: 'border-block-color', displayName: 'Border Block Color' },
			{ name: 'border-block-end-color', displayName: 'Border Block End Color' },
			{ name: 'border-block-end-width', displayName: 'Border Block End Width' },
			{ name: 'border-block-start-color', displayName: 'Border Block Start Color' },
			{ name: 'border-block-start-width', displayName: 'Border Block Start Width' },
			{ name: 'border-block-width', displayName: 'Border Block Width' },
			{ name: 'border-bottom-left-radius', displayName: 'Border Bottom Left Radius' },
			{ name: 'border-bottom-right-radius', displayName: 'Border Bottom Right Radius' },
			{ name: 'border-inline', displayName: 'Border Inline' },
			{ name: 'border-inline-color', displayName: 'Border Inline Color' },
			{ name: 'border-inline-end-color', displayName: 'Border Inline End Color' },
			{ name: 'border-inline-end-width', displayName: 'Border Inline End Width' },
			{ name: 'border-inline-start-color', displayName: 'Border Inline Start Color' },
			{ name: 'border-inline-start-width', displayName: 'Border Inline Start Width' },
			{ name: 'border-inline-width', displayName: 'Border Inline Width' },
			{ name: 'border-start-end-radius', displayName: 'Border Start End Radius' },
			{ name: 'border-start-start-radius', displayName: 'Border Start Start Radius' },
			{ name: 'border-bottom-width', displayName: 'Border Bottom Width' },
			{ name: 'border-color', displayName: 'Border Color' },
			{ name: 'border-left', displayName: 'Border Left' },
			{ name: 'border-left-color', displayName: 'Border Left Color' },
			{ name: 'border-left-width', displayName: 'Border Left Width' },
			{ name: 'border-right', displayName: 'Border Right' },
			{ name: 'border-right-color', displayName: 'Border Right Color' },
			{ name: 'border-right-width', displayName: 'Border Right Width' },
			{ name: 'border-spacing', displayName: 'Border Spacing' },
			{ name: 'border-top', displayName: 'Border Top' },
			{ name: 'border-top-color', displayName: 'Border Top Color' },
			{ name: 'border-top-left-radius', displayName: 'Border Top Left Radius' },
			{ name: 'border-top-right-radius', displayName: 'Border Top Right Radius' },
			{ name: 'border-top-width', displayName: 'Border Top Width' },
			{ name: 'bottom', displayName: 'Bottom' },
			{ name: 'box-shadow', displayName: 'Box Shadow' },
			{ name: 'clip', displayName: 'Clip' },
			{ name: 'color', displayName: 'Color' },
			{ name: 'column-count', displayName: 'Column Count' },
			{ name: 'column-gap', displayName: 'Column Gap' },
			{ name: 'column-rule', displayName: 'Column Rule' },
			{ name: 'column-rule-color', displayName: 'Column Rule Color' },
			{ name: 'column-rule-width', displayName: 'Column Rule Width' },
			{ name: 'column-width', displayName: 'Column Width' },
			{ name: 'columns', displayName: 'Columns' },
			{ name: 'filter', displayName: 'Filter' },
			{ name: 'flex', displayName: 'Flex' },
			{ name: 'flex-basis', displayName: 'Flex Basis' },
			{ name: 'flex-grow', displayName: 'Flex Grow' },
			{ name: 'flex-shrink', displayName: 'Flex Shrink' },
			{ name: 'font', displayName: 'Font' },
			{ name: 'font-size', displayName: 'Font Size' },
			{ name: 'font-size-adjust', displayName: 'Font Size Adjust' },
			{ name: 'font-stretch', displayName: 'Font Stretch' },
			{ name: 'font-weight', displayName: 'Font Weight' },
			{ name: 'grid', displayName: 'Grid' },
			{ name: 'grid-area', displayName: 'Grid Area' },
			{ name: 'grid-auto-columns', displayName: 'Grid Auto Columns' },
			{ name: 'grid-auto-flow', displayName: 'Grid Auto Flow' },
			{ name: 'grid-auto-rows', displayName: 'Grid Auto Rows' },
			{ name: 'grid-column', displayName: 'Grid Column' },
			{ name: 'grid-column-end', displayName: 'Grid Column End' },
			{ name: 'grid-column-gap', displayName: 'Grid Column Gap' },
			{ name: 'grid-column-start', displayName: 'Grid Column Start' },
			{ name: 'grid-gap', displayName: 'Grid Gap' },
			{ name: 'grid-row', displayName: 'Grid Row' },
			{ name: 'grid-row-end', displayName: 'Grid Row End' },
			{ name: 'grid-row-gap', displayName: 'Grid Row Gap' },
			{ name: 'grid-row-start', displayName: 'Grid Row Start' },
			{ name: 'grid-template', displayName: 'Grid Template' },
			{ name: 'grid-template-areas', displayName: 'Grid Template Areas' },
			{ name: 'grid-template-columns', displayName: 'Grid Template Columns' },
			{ name: 'grid-template-rows', displayName: 'Grid Template Rows' },
			{ name: 'height', displayName: 'Height' },
			{ name: 'inline-size', displayName: 'Inline Size' },
			{ name: 'inset', displayName: 'Inset' },
			{ name: 'inset-block', displayName: 'Inset Block' },
			{ name: 'inset-block-end', displayName: 'Inset Block End' },
			{ name: 'inset-block-start', displayName: 'Inset Block Start' },
			{ name: 'inset-inline', displayName: 'Inset Inline' },
			{ name: 'inset-inline-end', displayName: 'Inset Inline End' },
			{ name: 'inset-inline-start', displayName: 'Inset Inline Start' },
			{ name: 'left', displayName: 'Left' },
			{ name: 'letter-spacing', displayName: 'Letter Spacing' },
			{ name: 'line-height', displayName: 'Line Height' },
			{ name: 'margin', displayName: 'Margin' },
			{ name: 'margin-block', displayName: 'Margin Block' },
			{ name: 'margin-block-end', displayName: 'Margin Block End' },
			{ name: 'margin-block-start', displayName: 'Margin Block Start' },
			{ name: 'margin-bottom', displayName: 'Margin Bottom' },
			{ name: 'margin-inline', displayName: 'Margin Inline' },
			{ name: 'margin-inline-end', displayName: 'Margin Inline End' },
			{ name: 'margin-inline-start', displayName: 'Margin Inline Start' },
			{ name: 'margin-left', displayName: 'Margin Left' },
			{ name: 'margin-right', displayName: 'Margin Right' },
			{ name: 'margin-top', displayName: 'Margin Top' },
			{ name: 'max-height', displayName: 'Max Height' },
			{ name: 'max-width', displayName: 'Max Width' },
			{ name: 'max-block-size', displayName: 'Max Block Size' },
			{ name: 'max-inline-size', displayName: 'Max Inline Size' },
			{ name: 'min-block-size', displayName: 'Min Block Size' },
			{ name: 'min-inline-size', displayName: 'Min Inline Size' },
			{ name: 'min-height', displayName: 'Min Height' },
			{ name: 'min-width', displayName: 'Min Width' },
			{ name: 'object-position', displayName: 'Object Position' },
			{ name: 'offset-anchor', displayName: 'Offset Anchor' },
			{ name: 'offset-distance', displayName: 'Offset Distance' },
			{ name: 'offset-path', displayName: 'Offset Path' },
			{ name: 'offset-rotate', displayName: 'Offset Rotate' },
			{ name: 'opacity', displayName: 'Opacity' },
			{ name: 'order', displayName: 'Order' },
			{ name: 'outline', displayName: 'Outline' },
			{ name: 'outline-color', displayName: 'Outline Color' },
			{ name: 'outline-offset', displayName: 'Outline Offset' },
			{ name: 'outline-width', displayName: 'Outline Width' },
			{ name: 'padding', displayName: 'Padding' },
			{ name: 'padding-block', displayName: 'Padding Block' },
			{ name: 'padding-block-end', displayName: 'Padding Block End' },
			{ name: 'padding-block-start', displayName: 'Padding Block Start' },
			{ name: 'padding-bottom', displayName: 'Padding Bottom' },
			{ name: 'padding-inline', displayName: 'Padding Inline' },
			{ name: 'padding-inline-end', displayName: 'Padding Inline End' },
			{ name: 'padding-inline-start', displayName: 'Padding Inline Start' },
			{ name: 'padding-left', displayName: 'Padding Left' },
			{ name: 'padding-right', displayName: 'Padding Right' },
			{ name: 'padding-top', displayName: 'Padding Top' },
			{ name: 'perspective', displayName: 'Perspective' },
			{ name: 'perspective-origin', displayName: 'Perspective Origin' },
			{ name: 'right', displayName: 'Right' },
			{ name: 'rotate', displayName: 'Rotate' },
			{ name: 'scale', displayName: 'Scale' },
			{ name: 'text-decoration-color', displayName: 'Text Decoration Color' },
			{ name: 'text-indent', displayName: 'Text Indent' },
			{ name: 'text-shadow', displayName: 'Text Shadow' },
			{ name: 'top', displayName: 'Top' },
			{ name: 'transform', displayName: 'Transform' },
			{ name: 'transform-origin', displayName: 'Transform Origin' },
			{ name: 'translate', displayName: 'Translate' },
			{ name: 'vertical-align', displayName: 'Vertical Align' },
			{ name: 'visibility', displayName: 'Visibility' },
			{ name: 'width', displayName: 'Width' },
			{ name: 'word-spacing', displayName: 'Word Spacing' },
			{ name: 'z-index', displayName: 'Z Index' },
		],
	},
	{
		name: 'transitionDuration',
		displayName: 'Duration',
		default: '1s',
		type: 'time',
	},
	{
		name: 'transitionDelay',
		displayName: 'Delay',
		default: '0s',
		type: 'time',
	},
	{
		name: 'transitionTimingFunction',
		displayName: 'Timing Function',
		default: 'ease',
		type: 'dropdown',
		dropdownOptions: [
			{ name: 'ease', displayName: 'Ease' },
			{ name: 'ease-in', displayName: 'Ease In' },
			{ name: 'ease-out', displayName: 'Ease Out' },
			{ name: 'ease-in-out', displayName: 'Ease In Out' },
			{ name: 'linear', displayName: 'Linear' },
			{ name: 'step-start', displayName: 'Step Start' },
			{ name: 'step-end', displayName: 'Step End' },
		],
	},
];

const FILTER_FUNCTIONS: Array<FunctionDetail> = [
	{
		name: 'blur',
		displayName: 'Blur',
		params: [{ name: 'length', displayName: 'Length', type: 'pixel size' }],
	},
	{
		name: 'brightness',
		displayName: 'Brightness',
		params: [
			{
				name: 'percentage',
				displayName: 'Value',
				type: 'number percentage',
				optionOverride: [
					{ name: '', displayName: 'Number', min: 0, max: 3, step: 0.01 },
					{ name: 'percentage', displayName: 'Percentage', min: 0, max: 200, step: 1 },
				],
			},
		],
	},
	{
		name: 'contrast',
		displayName: 'Contrast',
		params: [
			{
				name: 'percentage',
				displayName: 'Value',
				type: 'number percentage',
				optionOverride: [
					{ name: '', displayName: 'Number', min: 0, max: 3, step: 0.01 },
					{ name: 'percentage', displayName: 'Percentage', min: 0, max: 200, step: 1 },
				],
			},
		],
	},
	{
		name: 'grayScale',
		displayName: 'Gray Scale',
		params: [
			{
				name: 'percentage',
				displayName: 'Value',
				type: 'number percentage',
				optionOverride: [
					{ name: '', displayName: 'Number', min: 0, max: 1, step: 0.01 },
					{ name: 'percentage', displayName: 'Percentage', min: 0, max: 100, step: 1 },
				],
			},
		],
	},
	{
		name: 'hueRotate',
		displayName: 'Hue Rotate',
		params: [
			{
				name: 'angle',
				displayName: 'Angle',
				type: 'angle size',
			},
		],
	},
	{
		name: 'invert',
		displayName: 'Invert',
		params: [
			{
				name: 'percentage',
				displayName: 'Value',
				type: 'number percentage',
				optionOverride: [
					{ name: '', displayName: 'Number', min: 0, max: 1, step: 0.01 },
					{ name: 'percentage', displayName: 'Percentage', min: 0, max: 100, step: 1 },
				],
			},
		],
	},
	{
		name: 'opacity',
		displayName: 'Opacity',
		params: [
			{
				name: 'percentage',
				displayName: 'Value',
				type: 'number percentage',
				optionOverride: [
					{ name: '', displayName: 'Number', min: 0, max: 1, step: 0.01 },
					{ name: 'percentage', displayName: 'Percentage', min: 0, max: 100, step: 1 },
				],
			},
		],
	},
	{
		name: 'saturate',
		displayName: 'Saturate',
		params: [
			{
				name: 'percentage',
				displayName: 'Value',
				type: 'number percentage',
				optionOverride: [
					{ name: '', displayName: 'Number', min: 0, max: 3, step: 0.01 },
					{ name: 'percentage', displayName: 'Percentage', min: 0, max: 200, step: 1 },
				],
			},
		],
	},
	{
		name: 'sepia',
		displayName: 'Sepia',
		params: [
			{
				name: 'percentage',
				displayName: 'Value',
				type: 'number percentage',
				optionOverride: [
					{ name: '', displayName: 'Number', min: 0, max: 1, step: 0.01 },
					{ name: 'percentage', displayName: 'Percentage', min: 0, max: 100, step: 1 },
				],
			},
		],
	},
];

const TRANSFORM_FUNCTIONS: Array<FunctionDetail> = [
	{
		name: 'matrix',
		displayName: 'Matrix',
		params: [
			{
				name: 'a',
				displayName: 'Scale X',
				type: 'number',
				numberOptions: {
					min: -10,
					max: 10,
					step: 0.1,
				},
				default: '1',
			},
			{
				name: 'b',
				displayName: 'Skew Y',
				type: 'number',
				numberOptions: {
					min: -10,
					max: 10,
					step: 0.1,
				},
				default: '0',
			},
			{
				name: 'c',
				displayName: 'Skew X',
				type: 'number',
				numberOptions: {
					min: -10,
					max: 10,
					step: 0.1,
				},
				default: '0',
			},
			{
				name: 'd',
				displayName: 'Scale Y',
				type: 'number',
				numberOptions: {
					min: -10,
					max: 10,
					step: 0.1,
				},
				default: '1',
			},
			{
				name: 'tx',
				displayName: 'Translation - X',
				type: 'number',
				numberOptions: {
					min: -100,
					max: 100,
					step: 1,
				},
				default: '0',
			},
			{
				name: 'ty',
				displayName: 'Translation - Y',
				type: 'number',
				numberOptions: {
					min: -100,
					max: 100,
					step: 1,
				},
				default: '0',
			},
		],
	},

	{
		name: 'matrix3d',
		displayName: 'Matrix 3D',
		params: [
			{
				name: 'text',
				displayName: 'Parameters',
				type: 'text area',
			},
		],
	},

	{
		name: 'perspective',
		displayName: 'Perspective',
		params: [
			{
				name: 'length',
				displayName: 'Length',
				type: 'pixel size',
			},
		],
	},

	{
		name: 'rotate',
		displayName: 'Rotate',
		params: [{ name: 'angle', displayName: 'Angle', type: 'angle size' }],
	},

	{
		name: 'rotate3d',
		displayName: 'Rotate 3D',
		params: [
			{
				name: 'x',
				displayName: 'X Co-ordinate',
				type: 'number',
				numberOptions: {
					min: -10,
					max: 10,
					step: 0.1,
				},
				default: '0',
			},
			{
				name: 'y',
				displayName: 'Y Co-ordinate',
				type: 'number',
				numberOptions: {
					min: -10,
					max: 10,
					step: 0.1,
				},
				default: '0',
			},
			{
				name: 'z',
				displayName: 'Z Co-ordinate',
				type: 'number',
				numberOptions: {
					min: -10,
					max: 10,
					step: 0.1,
				},
				default: '0',
			},
			{ name: 'angle', displayName: 'Angle', type: 'angle size', default: '0deg' },
		],
	},

	{
		name: 'rotateX',
		displayName: 'Rotate X',
		params: [{ name: 'angle', displayName: 'Angle', type: 'angle size' }],
	},

	{
		name: 'rotateY',
		displayName: 'Rotate Y',
		params: [{ name: 'angle', displayName: 'Angle', type: 'angle size' }],
	},

	{
		name: 'rotateZ',
		displayName: 'Rotate Z',
		params: [{ name: 'angle', displayName: 'Angle', type: 'angle size' }],
	},

	{
		name: 'scale',
		displayName: 'Scale',
		params: [
			{
				name: 'x',
				displayName: 'Scale X',
				type: 'number',
				numberOptions: {
					min: -10,
					max: 10,
					step: 0.1,
				},
				default: '1',
			},
			{
				name: 'y',
				displayName: 'Scale Y',
				type: 'number',
				numberOptions: {
					min: -10,
					max: 10,
					step: 0.1,
				},
				default: '1',
			},
		],
	},

	{
		name: 'scale3d',
		displayName: 'Scale 3D',
		params: [
			{
				name: 'x',
				displayName: 'Scale X',
				type: 'number',
				numberOptions: {
					min: -10,
					max: 10,
					step: 0.1,
				},
				default: '1',
			},
			{
				name: 'y',
				displayName: 'Scale Y',
				type: 'number',
				numberOptions: {
					min: -10,
					max: 10,
					step: 0.1,
				},
				default: '1',
			},
			{
				name: 'z',
				displayName: 'Scale Z',
				type: 'number',
				numberOptions: {
					min: -10,
					max: 10,
					step: 0.1,
				},
				default: '1',
			},
		],
	},

	{
		name: 'scaleX',
		displayName: 'Scale X',
		params: [
			{
				name: 'number',
				displayName: 'Scale Factor',
				type: 'number',
				numberOptions: {
					min: -10,
					max: 10,
					step: 0.1,
				},
			},
		],
	},

	{
		name: 'scaleY',
		displayName: 'Scale Y',
		params: [
			{
				name: 'number',
				displayName: 'Scale Factor',
				type: 'number',
				numberOptions: {
					min: -10,
					max: 10,
					step: 0.1,
				},
			},
		],
	},

	{
		name: 'scaleZ',
		displayName: 'Scale Z',
		params: [
			{
				name: 'number',
				displayName: 'Scale Factor',
				type: 'number',
				numberOptions: {
					min: -10,
					max: 10,
					step: 0.1,
				},
			},
		],
	},

	{
		name: 'skew',
		displayName: 'Skew',
		params: [
			{
				name: 'angleX',
				displayName: 'Angle',
				type: 'angle size',
				default: '0deg',
			},
			{
				name: 'angleY',
				displayName: 'Angle',
				type: 'angle size',
				default: '0deg',
			},
		],
	},

	{
		name: 'skewX',
		displayName: 'Skew X',
		params: [{ name: 'angle', displayName: 'Angle', type: 'angle size' }],
	},

	{
		name: 'skewY',
		displayName: 'Skew Y',
		params: [{ name: 'angle', displayName: 'Angle', type: 'angle size' }],
	},

	{
		name: 'translate',
		displayName: 'Translate',
		params: [
			{
				name: 'x',
				displayName: 'Position from X',
				type: 'pixel size',
				default: '0px',
				optionOverride: [
					{ name: 'px', displayName: 'PX', min: -100, max: 100, step: 1 },
					{ name: 'vw', displayName: 'VW', min: -100, max: 100, step: 1 },
					{ name: 'vh', displayName: 'VH', min: -100, max: 100, step: 1 },
					{ name: 'vmin', displayName: 'VMIN', min: -100, max: 100, step: 1 },
					{ name: 'vmax', displayName: 'VMAX', min: -100, max: 100, step: 1 },
					{ name: '%', displayName: '%', min: -100, max: 100, step: 0.1 },
				],
			},
			{
				name: 'y',
				displayName: 'Position from Y',
				type: 'pixel size',
				default: '0px',
				optionOverride: [
					{ name: 'px', displayName: 'PX', min: -100, max: 100, step: 1 },
					{ name: 'vw', displayName: 'VW', min: -100, max: 100, step: 1 },
					{ name: 'vh', displayName: 'VH', min: -100, max: 100, step: 1 },
					{ name: 'vmin', displayName: 'VMIN', min: -100, max: 100, step: 1 },
					{ name: 'vmax', displayName: 'VMAX', min: -100, max: 100, step: 1 },
					{ name: '%', displayName: '%', min: -100, max: 100, step: 0.1 },
				],
			},
		],
	},

	{
		name: 'translate3d',
		displayName: 'Translate 3D',
		params: [
			{
				name: 'x',
				displayName: 'Length from X axis origin',
				type: 'pixel size',
				optionOverride: [
					{ name: 'px', displayName: 'PX', min: -100, max: 100, step: 1 },
					{ name: 'vw', displayName: 'VW', min: -100, max: 100, step: 1 },
					{ name: 'vh', displayName: 'VH', min: -100, max: 100, step: 1 },
					{ name: 'vmin', displayName: 'VMIN', min: -100, max: 100, step: 1 },
					{ name: 'vmax', displayName: 'VMAX', min: -100, max: 100, step: 1 },
					{ name: '%', displayName: '%', min: -100, max: 100, step: 0.1 },
				],
				default: '0px',
			},
			{
				name: 'y',
				displayName: 'Length from Y axis origin',
				type: 'pixel size',
				optionOverride: [
					{ name: 'px', displayName: 'PX', min: -100, max: 100, step: 1 },
					{ name: 'vw', displayName: 'VW', min: -100, max: 100, step: 1 },
					{ name: 'vh', displayName: 'VH', min: -100, max: 100, step: 1 },
					{ name: 'vmin', displayName: 'VMIN', min: -100, max: 100, step: 1 },
					{ name: 'vmax', displayName: 'VMAX', min: -100, max: 100, step: 1 },
					{ name: '%', displayName: '%', min: -100, max: 100, step: 0.1 },
				],
				default: '0px',
			},
			{
				name: 'z',
				displayName: 'Length from Z axis origin',
				type: 'pixel size',
				optionOverride: [
					{ name: 'px', displayName: 'PX', min: -100, max: 100, step: 1 },
					{ name: 'vw', displayName: 'VW', min: -100, max: 100, step: 1 },
					{ name: 'vh', displayName: 'VH', min: -100, max: 100, step: 1 },
					{ name: 'vmin', displayName: 'VMIN', min: -100, max: 100, step: 1 },
					{ name: 'vmax', displayName: 'VMAX', min: -100, max: 100, step: 1 },
					{ name: '%', displayName: '%', min: -100, max: 100, step: 0.1 },
				],
				default: '0px',
			},
		],
	},

	{
		name: 'translateX',
		displayName: 'Translate X',
		params: [
			{
				name: 'x',
				displayName: 'Position from X',
				type: 'pixel size',
				optionOverride: [
					{ name: 'px', displayName: 'PX', min: -100, max: 100, step: 1 },
					{ name: 'vw', displayName: 'VW', min: -100, max: 100, step: 1 },
					{ name: 'vh', displayName: 'VH', min: -100, max: 100, step: 1 },
					{ name: 'vmin', displayName: 'VMIN', min: -100, max: 100, step: 1 },
					{ name: 'vmax', displayName: 'VMAX', min: -100, max: 100, step: 1 },
					{ name: '%', displayName: '%', min: -100, max: 100, step: 0.1 },
				],
			},
		],
	},

	{
		name: 'translateY',
		displayName: 'Translate Y',
		params: [
			{
				name: 'y',
				displayName: 'Position from Y',
				type: 'pixel size',
				optionOverride: [
					{ name: 'px', displayName: 'PX', min: -100, max: 100, step: 1 },
					{ name: 'vw', displayName: 'VW', min: -100, max: 100, step: 1 },
					{ name: 'vh', displayName: 'VH', min: -100, max: 100, step: 1 },
					{ name: 'vmin', displayName: 'VMIN', min: -100, max: 100, step: 1 },
					{ name: 'vmax', displayName: 'VMAX', min: -100, max: 100, step: 1 },
					{ name: '%', displayName: '%', min: -100, max: 100, step: 0.1 },
				],
			},
		],
	},

	{
		name: 'translateZ',
		displayName: 'Translate Z',
		params: [
			{
				name: 'z',
				displayName: 'Position from Z',
				type: 'pixel size',
				optionOverride: [
					{ name: 'px', displayName: 'PX', min: -100, max: 100, step: 1 },
					{ name: 'vw', displayName: 'VW', min: -100, max: 100, step: 1 },
					{ name: 'vh', displayName: 'VH', min: -100, max: 100, step: 1 },
					{ name: 'vmin', displayName: 'VMIN', min: -100, max: 100, step: 1 },
					{ name: 'vmax', displayName: 'VMAX', min: -100, max: 100, step: 1 },
					{ name: '%', displayName: '%', min: -100, max: 100, step: 0.1 },
				],
			},
		],
	},
];

function TransformEditor({
	subComponentName,
	pseudoState,
	iterateProps,
	selectorPref,
	styleProps,
	selectedComponent,
	selectedComponentsList,
	saveStyle,
	properties,
	defPath,
	locationHistory,
	pageExtractor,
}: StyleEditorsProps) {
	const transformOrigin = (
		(
			extractValue({
				subComponentName,
				prop: 'transformOrigin',
				iterateProps,
				pseudoState,
				selectorPref,
				selectedComponent,
			}) ?? ({} as any)
		).value?.value ?? ''
	)
		.split(' ')
		.map((e: string) => e.trim())
		.filter((e: string) => !!e);

	return (
		<>
			<div className="_simpleLabel _withPadding">Transform</div>
			<div className="_combineEditors _spaceBetween">
				<div className="_combineEditors">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="32"
						height="32"
						viewBox="0 0 32 32"
					>
						<g
							id="Group_90"
							data-name="Group 90"
							transform="translate(-673.338 -870.942)"
						>
							<path
								id="Path_43"
								data-name="Path 43"
								d="M74.3,32.913l8.711-5.029V17.826L74.3,22.855Z"
								transform="translate(614.736 863.813)"
								fill="currentColor"
								fillOpacity={0.4}
							/>
							<path
								id="Path_44"
								data-name="Path 44"
								d="M58.085,32.913l-8.711-5.029V17.826l8.711,5.029Z"
								transform="translate(630.94 863.813)"
								fill="currentColor"
								fillOpacity={0.3}
							/>
							<path
								id="Path_45"
								data-name="Path 45"
								d="M49.416,8.48l8.709-5.029L66.836,8.48l-8.724,5.038Z"
								transform="translate(630.899 873.155)"
								fill="currentColor"
								fillOpacity={0.1}
							/>
						</g>
					</svg>
					<EachSimpleEditor
						selectedComponentsList={selectedComponentsList}
						defPath={defPath}
						locationHistory={locationHistory}
						pageExtractor={pageExtractor}
						subComponentName={subComponentName}
						pseudoState={pseudoState}
						prop="transformBox"
						placeholder="Transform Box"
						iterateProps={iterateProps}
						selectorPref={selectorPref}
						styleProps={styleProps}
						selectedComponent={selectedComponent}
						saveStyle={saveStyle}
						properties={properties}
						editorDef={{
							type: SimpleEditorType.Dropdown,
							dropdownOptions: [
								{ name: 'content-box', displayName: 'Content Box' },
								{ name: 'border-box', displayName: 'Border Box' },
								{ name: 'fill-box', displayName: 'Fill Box' },
								{ name: 'stroke-box', displayName: 'Stroke Box' },
								{ name: 'view-box', displayName: 'View Box' },
							],
						}}
					/>
				</div>
				<EachSimpleEditor
					selectedComponentsList={selectedComponentsList}
					defPath={defPath}
					locationHistory={locationHistory}
					pageExtractor={pageExtractor}
					subComponentName={subComponentName}
					pseudoState={pseudoState}
					prop="transformStyle"
					placeholder="Transform Style"
					iterateProps={iterateProps}
					selectorPref={selectorPref}
					styleProps={styleProps}
					selectedComponent={selectedComponent}
					saveStyle={saveStyle}
					properties={properties}
					editorDef={{
						type: SimpleEditorType.Icons,
						iconButtonsBackground: true,
						Options: [
							{
								name: 'flat',
								description: 'Transform Style : Flat',
								icon: (
									<rect
										id="Rectangle_25"
										data-name="Rectangle 25"
										width="15"
										height="15"
										transform="translate(9 9)"
										fill="currentColor"
										strokeWidth="0"
									/>
								),
							},
							{
								name: 'preserve-3d',
								description: 'Transform Style : Preserve 3D',
								icon: (
									<g
										id="Group_90"
										data-name="Group 90"
										transform="translate(-673.315 -870.606)"
									>
										<path
											id="Path_43"
											data-name="Path 43"
											d="M74.3,32.913l8.711-5.029V17.826L74.3,22.855Z"
											transform="translate(614.736 863.813)"
											fill="currentColor"
											strokeWidth="0"
										/>
										<path
											id="Path_44"
											data-name="Path 44"
											d="M58.085,32.913l-8.711-5.029V17.826l8.711,5.029Z"
											transform="translate(630.94 863.813)"
											fill="currentColor"
											fillOpacity={0.9}
											strokeWidth="0"
										/>
										<path
											id="Path_45"
											data-name="Path 45"
											d="M49.416,8.48l8.709-5.029L66.836,8.48l-8.724,5.038Z"
											transform="translate(630.899 873.155)"
											fill="currentColor"
											fillOpacity={0.6}
											strokeWidth="0"
										/>
									</g>
								),
							},
						],
					}}
				/>
			</div>
			<div className="_combineEditors">
				<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
					<path
						id="Path_193"
						data-name="Path 193"
						d="M0,0H5.412V2.255H2.368V5.093H0Z"
						transform="translate(11.761 4.436) rotate(45)"
						fill="currentColor"
					/>
					<path
						id="Path_195"
						data-name="Path 195"
						d="M0,0H5.412V2.255H2.368V5.093H0Z"
						transform="translate(26.386 19.175) rotate(135)"
						fill="lime"
					/>
					<path
						id="Path_197"
						data-name="Path 197"
						d="M0,0H5.412V2.255H2.368V5.093H0Z"
						transform="translate(7.105 27.564) rotate(-106)"
						fill="currentColor"
					/>
					<path
						id="Path_194"
						data-name="Path 194"
						d="M18.3,20v2.174H5V20Z"
						transform="translate(32.881 1.728) rotate(90)"
						fill="currentColor"
					/>
					<path
						id="Path_196"
						data-name="Path 196"
						d="M18.3,20v2.174H5V20Z"
						transform="translate(29.095 40.295) rotate(180)"
						fill="lime"
					/>
					<path
						id="Path_198"
						data-name="Path 198"
						d="M12.817,20v2.12H5V20Z"
						transform="matrix(0.485, -0.875, 0.875, 0.485, -12.679, 19.694)"
						fill="currentColor"
					/>
				</svg>
				<PixelSize
					value={transformOrigin[0] ?? ''}
					onChange={e => {
						if (e.endsWith('top')) e = 'top';
						else if (e.endsWith('bottom')) e = 'bottom';
						else if (e.endsWith('left')) e = 'left';
						else if (e.endsWith('right')) e = 'right';
						else if (e.endsWith('center')) e = 'center';

						const value: Array<string> = [...transformOrigin];

						if (value.length < 1) value.push(e);
						else value[0] = e;

						valuesChangedOnlyValues({
							subComponentName,
							selectedComponent,
							selectedComponentsList,
							selectorPref,
							defPath,
							locationHistory,
							pageExtractor,
							propValues: [{ prop: 'transformOrigin', value: value.join(' ') }],
						});
					}}
					placeholder="X Offset"
					extraOptions={[
						{ name: 'left', displayName: 'Left' },
						{ name: 'right', displayName: 'Right' },
						{ name: 'center', displayName: 'Center' },
					]}
				/>
			</div>
			<div className="_combineEditors">
				<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
					<path
						id="Path_193"
						data-name="Path 193"
						d="M0,0H5.412V2.255H2.368V5.093H0Z"
						transform="translate(11.761 4.436) rotate(45)"
						fill="#4C7FEE"
					/>
					<path
						id="Path_195"
						data-name="Path 195"
						d="M0,0H5.412V2.255H2.368V5.093H0Z"
						transform="translate(26.386 19.175) rotate(135)"
						fill="currentColor"
					/>
					<path
						id="Path_197"
						data-name="Path 197"
						d="M0,0H5.412V2.255H2.368V5.093H0Z"
						transform="translate(7.105 27.564) rotate(-106)"
						fill="currentColor"
					/>
					<path
						id="Path_194"
						data-name="Path 194"
						d="M18.3,20v2.174H5V20Z"
						transform="translate(32.881 1.728) rotate(90)"
						fill="#4C7FEE"
					/>
					<path
						id="Path_196"
						data-name="Path 196"
						d="M18.3,20v2.174H5V20Z"
						transform="translate(29.095 40.295) rotate(180)"
						fill="currentColor"
					/>
					<path
						id="Path_198"
						data-name="Path 198"
						d="M12.817,20v2.12H5V20Z"
						transform="matrix(0.485, -0.875, 0.875, 0.485, -12.679, 19.694)"
						fill="currentColor"
					/>
				</svg>
				<PixelSize
					value={transformOrigin[1] ?? ''}
					onChange={e => {
						if (e.endsWith('top')) e = 'top';
						else if (e.endsWith('bottom')) e = 'bottom';
						else if (e.endsWith('left')) e = 'left';
						else if (e.endsWith('right')) e = 'right';
						else if (e.endsWith('center')) e = 'center';

						const value: Array<string> = [...transformOrigin];

						if (value.length < 2) {
							if (value.length === 0) value.push('0%');
							value.push(e);
						} else value[1] = e;

						valuesChangedOnlyValues({
							subComponentName,
							selectedComponent,
							selectedComponentsList,
							selectorPref,
							defPath,
							locationHistory,
							pageExtractor,
							propValues: [{ prop: 'transformOrigin', value: value.join(' ') }],
						});
					}}
					placeholder="Y Offset"
					extraOptions={[
						{ name: 'top', displayName: 'Top' },
						{ name: 'bottom', displayName: 'Bottom' },
						{ name: 'center', displayName: 'Center' },
					]}
				/>
			</div>
			<div className="_combineEditors">
				<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
					<path
						id="Path_193"
						data-name="Path 193"
						d="M0,0H5.412V2.255H2.368V5.093H0Z"
						transform="translate(11.761 4.436) rotate(45)"
						fill="currentColor"
					/>
					<path
						id="Path_195"
						data-name="Path 195"
						d="M0,0H5.412V2.255H2.368V5.093H0Z"
						transform="translate(26.386 19.175) rotate(135)"
						fill="currentColor"
					/>
					<path
						id="Path_197"
						data-name="Path 197"
						d="M0,0H5.412V2.255H2.368V5.093H0Z"
						transform="translate(7.105 27.564) rotate(-106)"
						fill="red"
					/>
					<path
						id="Path_194"
						data-name="Path 194"
						d="M18.3,20v2.174H5V20Z"
						transform="translate(32.881 1.728) rotate(90)"
						fill="currentColor"
					/>
					<path
						id="Path_196"
						data-name="Path 196"
						d="M18.3,20v2.174H5V20Z"
						transform="translate(29.095 40.295) rotate(180)"
						fill="currentColor"
					/>
					<path
						id="Path_198"
						data-name="Path 198"
						d="M12.817,20v2.12H5V20Z"
						transform="matrix(0.485, -0.875, 0.875, 0.485, -12.679, 19.694)"
						fill="red"
					/>
				</svg>
				<PixelSize
					value={transformOrigin[2] ?? ''}
					onChange={e => {
						if (e.endsWith('top')) e = 'top';
						else if (e.endsWith('bottom')) e = 'bottom';
						else if (e.endsWith('left')) e = 'left';
						else if (e.endsWith('right')) e = 'right';
						else if (e.endsWith('center')) e = 'center';

						const value: Array<string> = [...transformOrigin];

						if (value.length < 3) {
							if (value.length === 0) value.push('0%');
							if (value.length === 1) value.push('0%');
							value.push(e);
						} else value[2] = e;

						valuesChangedOnlyValues({
							subComponentName,
							selectedComponent,
							selectedComponentsList,
							selectorPref,
							defPath,
							locationHistory,
							pageExtractor,
							propValues: [{ prop: 'transformOrigin', value: value.join(' ') }],
						});
					}}
					placeholder="Z Offset"
				/>
			</div>
		</>
	);
}

function OutlineEditor({
	subComponentName,
	pseudoState,
	iterateProps,
	selectorPref,
	styleProps,
	selectedComponent,
	selectedComponentsList,
	saveStyle,
	properties,
	defPath,
	locationHistory,
	pageExtractor,
}: StyleEditorsProps) {
	return (
		<>
			<div className="_simpleLabel _withPadding">Outline</div>
			<div className="_combineEditors">
				<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
					<rect
						width="20"
						height="16"
						transform="translate(6 8)"
						rx="2"
						fill="currentColor"
						fillOpacity={0.2}
					/>
					<rect
						width="16"
						height="12"
						transform="translate(8 10)"
						rx="2"
						fill="currentColor"
					/>
				</svg>
				<EachSimpleEditor
					selectedComponentsList={selectedComponentsList}
					defPath={defPath}
					locationHistory={locationHistory}
					pageExtractor={pageExtractor}
					subComponentName={subComponentName}
					pseudoState={pseudoState}
					prop="outlineOffset"
					placeholder="Offset"
					iterateProps={iterateProps}
					selectorPref={selectorPref}
					styleProps={styleProps}
					selectedComponent={selectedComponent}
					saveStyle={saveStyle}
					properties={properties}
					editorDef={{
						type: SimpleEditorType.PixelSize,
					}}
					className="_expandWidth"
				/>
			</div>
			<div className="_combineEditors _spaceBetween">
				<EachSimpleEditor
					selectedComponentsList={selectedComponentsList}
					defPath={defPath}
					locationHistory={locationHistory}
					pageExtractor={pageExtractor}
					subComponentName={subComponentName}
					pseudoState={pseudoState}
					prop="outlineStyle"
					iterateProps={iterateProps}
					selectorPref={selectorPref}
					styleProps={styleProps}
					selectedComponent={selectedComponent}
					saveStyle={saveStyle}
					properties={properties}
					editorDef={{
						type: SimpleEditorType.Icons,
						iconButtonsBackground: true,
						Options: [
							{
								name: 'solid',
								description: 'Outline Style : Solid',
								icon: (
									<path
										id="Path_162"
										data-name="Path 162"
										d="M1,1H20.013"
										transform="translate(5.5 15)"
										fill="none"
										strokeLinecap="square"
										strokeWidth="2"
									/>
								),
							},
							{
								name: 'double',
								description: 'Outline Style : Double',
								icon: (
									<>
										<g
											id="Group_76"
											data-name="Group 76"
											transform="translate(4.727 13)"
										>
											<path
												id="Path_163"
												data-name="Path 163"
												d="M1.273,6H20.286"
												fill="none"
												strokeLinecap="square"
												strokeWidth="2"
											/>
											<path
												id="Path_164"
												data-name="Path 164"
												d="M1.273,1H20.286"
												fill="none"
												strokeLinecap="square"
												strokeWidth="2"
											/>
										</g>
									</>
								),
							},
							{
								name: 'dotted',
								description: 'Outline Style : Dotted',
								icon: (
									<path
										id="Path_167"
										data-name="Path 167"
										d="M1,1H22"
										transform="translate(4.5 15.5)"
										fill="none"
										strokeLinecap="round"
										strokeMiterlimit="3.999"
										strokeWidth="2"
										strokeDasharray="0 4"
									/>
								),
							},
							{
								name: 'dashed',
								description: 'Outline Style : Dashed',
								icon: (
									<path
										id="Path_165"
										data-name="Path 165"
										d="M1,1H20.013"
										transform="translate(5.5 15.5)"
										strokeLinecap="square"
										strokeMiterlimit="3.999"
										strokeWidth="2"
										strokeDasharray="4 4"
									/>
								),
							},
							{
								name: 'wavy',
								description: 'Outline Style : Wavy',
								icon: (
									<path
										id="Path_166"
										data-name="Path 166"
										d="M20.859,3.5q-2.482,5-4.965,0t-4.965,0q-2.482,5-4.965,0T1,3.5"
										transform="translate(5.5 12.5)"
										strokeWidth="2"
										fill="none"
									/>
								),
							},
						],
					}}
				/>

				<EachSimpleEditor
					selectedComponentsList={selectedComponentsList}
					defPath={defPath}
					locationHistory={locationHistory}
					pageExtractor={pageExtractor}
					subComponentName={subComponentName}
					pseudoState={pseudoState}
					prop="outlineColor"
					placeholder="Color"
					iterateProps={iterateProps}
					selectorPref={selectorPref}
					styleProps={styleProps}
					selectedComponent={selectedComponent}
					saveStyle={saveStyle}
					properties={properties}
					editorDef={{ type: SimpleEditorType.Color }}
				/>
			</div>
			<div className="_combineEditors">
				<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
					<path
						id="Path_189"
						data-name="Path 189"
						d="M0,0H5.412V2.255H2.368V5.093H0Z"
						transform="translate(15.887 17.765) rotate(45)"
						fill="currentColor"
					/>
					<path
						id="Path_190"
						data-name="Path 190"
						d="M0,5.094H5.412V2.839H2.368V0H0Z"
						transform="translate(12.286 10.163) rotate(-45)"
						fill="currentColor"
					/>
					<rect
						id="Rectangle_24"
						data-name="Rectangle 24"
						width="26"
						height="4"
						transform="translate(3 13.765)"
						fill="currentColor"
						fillOpacity={0.2}
					/>
					<path
						id="Path_191"
						data-name="Path 191"
						d="M13.274,20v2.166H5V20Z"
						transform="translate(37 -1.33) rotate(90)"
						fill="currentColor"
					/>
					<path
						id="Path_192"
						data-name="Path 192"
						d="M13.274,20v2.166H5V20Z"
						transform="translate(37 15.056) rotate(90)"
						fill="currentColor"
					/>
				</svg>

				<EachSimpleEditor
					selectedComponentsList={selectedComponentsList}
					defPath={defPath}
					locationHistory={locationHistory}
					pageExtractor={pageExtractor}
					subComponentName={subComponentName}
					pseudoState={pseudoState}
					prop="outlineWidth"
					placeholder="Width"
					iterateProps={iterateProps}
					selectorPref={selectorPref}
					styleProps={styleProps}
					selectedComponent={selectedComponent}
					saveStyle={saveStyle}
					properties={properties}
					editorDef={{ type: SimpleEditorType.PixelSize, rangeMin: 0, rangeMax: 30 }}
				/>
			</div>
		</>
	);
}

function OpacityEditor({
	subComponentName,
	pseudoState,
	iterateProps,
	selectorPref,
	styleProps,
	selectedComponent,
	selectedComponentsList,
	saveStyle,
	properties,
	defPath,
	locationHistory,
	pageExtractor,
}: StyleEditorsProps) {
	return (
		<div className="_combineEditors">
			<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
				<g id="Group_86" data-name="Group 86" transform="translate(-1036.905 -329)">
					<path
						id="Subtraction_1"
						data-name="Subtraction 1"
						d="M8.18,16.36A8.182,8.182,0,0,1,5,.643a8.188,8.188,0,0,1,9.55,2.4h-5.8V4.566H15.52a8.139,8.139,0,0,1,.57,1.522H8.751V7.609H16.34c.013.191.02.382.02.57a8.3,8.3,0,0,1-.055.951H8.751v1.522h7.229a8.151,8.151,0,0,1-.66,1.522H8.751V13.7h5.469A8.159,8.159,0,0,1,8.18,16.36Z"
						transform="translate(1040.905 337.245)"
						fill="currentColor"
						strokeWidth={0}
					/>
					<path
						id="Subtraction_3"
						data-name="Subtraction 3"
						d="M4.449,15.942A7.931,7.931,0,0,1,0,14.586a8.031,8.031,0,0,0,1.071-.864,6.492,6.492,0,0,0,7.594-1.163A6.488,6.488,0,0,0,4.078,1.483a6.505,6.505,0,0,0-3.007.737A8.029,8.029,0,0,0,0,1.356,7.977,7.977,0,0,1,11.793,4.868,7.968,7.968,0,0,1,4.449,15.942Z"
						transform="translate(1052.484 337)"
						fill="currentColor"
						strokeWidth={0}
					/>
				</g>
			</svg>

			<EachSimpleEditor
				selectedComponentsList={selectedComponentsList}
				defPath={defPath}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="opacity"
				placeholder="Opacity"
				iterateProps={iterateProps}
				selectorPref={selectorPref}
				styleProps={styleProps}
				selectedComponent={selectedComponent}
				saveStyle={saveStyle}
				properties={properties}
				editorDef={{
					type: SimpleEditorType.Range,
					rangeMin: 0,
					rangeMax: 1,
					rangeStep: 0.01,
				}}
				className="_expandWidth"
			/>
		</div>
	);
}

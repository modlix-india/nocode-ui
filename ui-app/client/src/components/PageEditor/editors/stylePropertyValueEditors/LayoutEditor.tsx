import React from 'react';
import {
	EachSimpleEditor,
	extractValue,
	SimpleEditorType,
	StyleEditorsProps,
} from './simpleEditors';
import TextEditor from '../../../TextEditor/TextEditor';

export function LayoutEditor(props: Readonly<StyleEditorsProps>) {
	if (props.isDetailStyleEditor) {
		return <LayoutStandardEditor {...props} />;
	}
	return <DetailedLayoutEditor {...props} />;
}

function DetailedLayoutEditor(props: Readonly<StyleEditorsProps>) {
	const { subComponentName, pseudoState, iterateProps, selectorPref, styleProps } = props;
	const {
		selectedComponent,
		selectedComponentsList,
		saveStyle,
		properties,
		defPath,
		locationHistory,
		pageExtractor,
	} = props;
	return (
		<>
			<div className="_combineEditors">Align Content</div>
			<EachSimpleEditor
				selectedComponentsList={selectedComponentsList}
				defPath={defPath}
				className={'_simpleEditor'}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="alignContent"
				placeholder="Align Content"
				iterateProps={iterateProps}
				selectorPref={selectorPref}
				styleProps={styleProps}
				selectedComponent={selectedComponent}
				saveStyle={saveStyle}
				properties={properties}
				editorDef={{
					type: SimpleEditorType.Dropdown,
					dropdownOptions: [
						{ name: 'normal', displayName: 'Normal' },
						{ name: 'start', displayName: 'Start' },
						{ name: 'center', displayName: 'Center' },
						{ name: 'end', displayName: 'End' },
						{ name: 'flex-start', displayName: 'Flex Start' },
						{ name: 'flex-end', displayName: 'Flex End' },
						{ name: 'baseline', displayName: 'Baseline' },
						{ name: 'first baseline', displayName: 'First Baseline' },
						{ name: 'last baseline', displayName: 'Last Baseline' },
						{ name: 'space-between', displayName: 'Space Between' },
						{ name: 'space-around', displayName: 'Space Around' },
						{ name: 'space-evenly', displayName: 'Space Evenly' },
						{ name: 'stretch', displayName: 'Stretch' },
						{ name: 'safe center', displayName: 'Safe Center' },
						{ name: 'unsafe center', displayName: 'Unsafe Center' },
						{ name: 'inherit', displayName: 'Inherit' },
						{ name: 'initial', displayName: 'Initial' },
						{ name: 'revert', displayName: 'Revert' },
						{ name: 'revert-layer', displayName: 'Revert Layer' },
						{ name: 'unset', displayName: 'Unset' },
					],
				}}
			/>

			<div className="_combineEditors">Justify Content</div>
			<EachSimpleEditor
				selectedComponentsList={selectedComponentsList}
				defPath={defPath}
				className={'_simpleEditor'}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="justifyContent"
				placeholder="Justify Content"
				iterateProps={iterateProps}
				selectorPref={selectorPref}
				styleProps={styleProps}
				selectedComponent={selectedComponent}
				saveStyle={saveStyle}
				properties={properties}
				editorDef={{
					type: SimpleEditorType.Dropdown,
					dropdownOptions: [
						{ name: 'center', displayName: 'Center' },
						{ name: 'start', displayName: 'Start' },
						{ name: 'end', displayName: 'End' },
						{ name: 'flex-start', displayName: 'Flex Start' },
						{ name: 'flex-end', displayName: 'Flex End' },
						{ name: 'left', displayName: 'Left' },
						{ name: 'right', displayName: 'Right' },
						{ name: 'normal', displayName: 'Normal' },
						{ name: 'space-between', displayName: 'Space Between' },
						{ name: 'space-around', displayName: 'Space Around' },
						{ name: 'space-evenly', displayName: 'Space Evenly' },
						{ name: 'stretch', displayName: 'Stretch' },
						{ name: 'safe center', displayName: 'Safe Center' },
						{ name: 'unsafe center', displayName: 'Unsafe Center' },
						{ name: 'inherit', displayName: 'Inherit' },
						{ name: 'initial', displayName: 'Initial' },
						{ name: 'revert', displayName: 'Revert' },
						{ name: 'revert-layer', displayName: 'Revert Layer' },
						{ name: 'unset', displayName: 'Unset' },
					],
				}}
			/>

			<div className="_combineEditors">Justify Items</div>
			<EachSimpleEditor
				selectedComponentsList={selectedComponentsList}
				defPath={defPath}
				className={'_simpleEditor'}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="justifyItems"
				placeholder="Justify Items"
				iterateProps={iterateProps}
				selectorPref={selectorPref}
				styleProps={styleProps}
				selectedComponent={selectedComponent}
				saveStyle={saveStyle}
				properties={properties}
				editorDef={{
					type: SimpleEditorType.Dropdown,
					dropdownOptions: [
						{ name: 'normal', displayName: 'Normal' },
						{ name: 'stretch', displayName: 'Stretch' },
						{ name: 'center', displayName: 'Center' },
						{ name: 'start', displayName: 'Start' },
						{ name: 'end', displayName: 'End' },
						{ name: 'flex-start', displayName: 'Flex Start' },
						{ name: 'flex-end', displayName: 'Flex End' },
						{ name: 'self-start', displayName: 'Self Start' },
						{ name: 'self-end', displayName: 'Self End' },
						{ name: 'left', displayName: 'Left' },
						{ name: 'right', displayName: 'Right' },
						{ name: 'anchor-center', displayName: 'Anchor Center' },
						{ name: 'baseline', displayName: 'Baseline' },
						{ name: 'first baseline', displayName: 'First Baseline' },
						{ name: 'last baseline', displayName: 'Last Baseline' },
						{ name: 'safe center', displayName: 'Safe Center' },
						{ name: 'unsafe center', displayName: 'Unsafe Center' },
						{ name: 'legacy right', displayName: 'Legacy Right' },
						{ name: 'legacy left', displayName: 'Legacy Left' },
						{ name: 'legacy center', displayName: 'Legacy Center' },
						{ name: 'inherit', displayName: 'Inherit' },
						{ name: 'initial', displayName: 'Initial' },
						{ name: 'revert', displayName: 'Revert' },
						{ name: 'revert-layer', displayName: 'Revert Layer' },
						{ name: 'unset', displayName: 'Unset' },
					],
				}}
			/>

			<div className="_combineEditors">Justify Self</div>
			<EachSimpleEditor
				selectedComponentsList={selectedComponentsList}
				defPath={defPath}
				className={'_simpleEditor'}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="justifySelf"
				placeholder="Justify Self"
				iterateProps={iterateProps}
				selectorPref={selectorPref}
				styleProps={styleProps}
				selectedComponent={selectedComponent}
				saveStyle={saveStyle}
				properties={properties}
				editorDef={{
					type: SimpleEditorType.Dropdown,
					dropdownOptions: [
						{ name: 'auto', displayName: 'Auto' },
						{ name: 'normal', displayName: 'Normal' },
						{ name: 'stretch', displayName: 'Stretch' },
						{ name: 'center', displayName: 'Center' },
						{ name: 'start', displayName: 'Start' },
						{ name: 'end', displayName: 'End' },
						{ name: 'flex-start', displayName: 'Flex Start' },
						{ name: 'flex-end', displayName: 'Flex End' },
						{ name: 'self-start', displayName: 'Self Start' },
						{ name: 'self-end', displayName: 'Self End' },
						{ name: 'left', displayName: 'Left' },
						{ name: 'right', displayName: 'Right' },
						{ name: 'anchor-center', displayName: 'Anchor Center' },
						{ name: 'baseline', displayName: 'Baseline' },
						{ name: 'first baseline', displayName: 'First Baseline' },
						{ name: 'last baseline', displayName: 'Last Baseline' },
						{ name: 'safe center', displayName: 'Safe Center' },
						{ name: 'unsafe center', displayName: 'Unsafe Center' },
						{ name: 'inherit', displayName: 'Inherit' },
						{ name: 'initial', displayName: 'Initial' },
						{ name: 'revert', displayName: 'Revert' },
						{ name: 'revert-layer', displayName: 'Revert Layer' },
						{ name: 'unset', displayName: 'Unset' },
					],
				}}
			/>

			<div className="_combineEditors">Flex Flow</div>
			<div className="_simpleEditor">
				<input type="text" className="_simpleEditorInput" />
			</div>
		</>
	);
}

function LayoutStandardEditor(props: Readonly<StyleEditorsProps>) {
	const { subComponentName, pseudoState, iterateProps, selectorPref, styleProps } = props;
	const {
		selectedComponent,
		selectedComponentsList,
		saveStyle,
		properties,
		defPath,
		locationHistory,
		pageExtractor,
	} = props;
	return (
		<>
			<div className="_combineEditors">Display</div>
			<EachSimpleEditor
				selectedComponentsList={selectedComponentsList}
				defPath={defPath}
				className={'_simpleEditor'}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="display"
				placeholder="Display"
				iterateProps={iterateProps}
				selectorPref={selectorPref}
				styleProps={styleProps}
				selectedComponent={selectedComponent}
				saveStyle={saveStyle}
				properties={properties}
				editorDef={{
					type: SimpleEditorType.Dropdown,
					dropdownOptions: [
						{ name: 'none', displayName: 'None' },
						{ name: 'block', displayName: 'Block' },
						{ name: 'inline', displayName: 'Inline' },
						{ name: 'initial', displayName: 'Initial' },
						{ name: 'contents', displayName: 'Contents' },
						{ name: 'inline-block', displayName: 'Inline Block' },
						{ name: 'flex', displayName: 'Flex' },
						{ name: 'inline-flex', displayName: 'Inline Flex' },
						{ name: 'grid', displayName: 'Grid' },
						{ name: 'inline-grid', displayName: 'Inline Grid' },
						{ name: 'table', displayName: 'Table' },
						{ name: 'inline-table', displayName: 'Inline Table' },
						{ name: 'table-row', displayName: 'Table Row' },
						{ name: 'table-cell', displayName: 'Table Cell' },
						{ name: 'table-column', displayName: 'Table Column' },
						{ name: 'table-row-group', displayName: 'Table Row Group' },
						{ name: 'table-column-group', displayName: 'Table Column Group' },
						{ name: 'table-header-group', displayName: 'Table Header Group' },
						{ name: 'table-footer-group', displayName: 'Table Footer Group' },
						{ name: 'table-caption', displayName: 'Table Caption' },
						{ name: 'flow-root', displayName: 'Flow Root' },
						{ name: 'contents', displayName: 'Contents' },
						{ name: 'list-item', displayName: 'List Item' },
						{ name: 'run-in', displayName: 'Run In' },
						{ name: 'subgrid', displayName: 'Subgrid' },
						{ name: 'inherit', displayName: 'Inherit' },
					],
				}}
			/>
			<div className="_combineEditors">Align Items</div>
			<EachSimpleEditor
				selectedComponentsList={selectedComponentsList}
				defPath={defPath}
				className={'_simpleEditor'}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="alignItems"
				placeholder="Align Items"
				iterateProps={iterateProps}
				selectorPref={selectorPref}
				styleProps={styleProps}
				selectedComponent={selectedComponent}
				saveStyle={saveStyle}
				properties={properties}
				editorDef={{
					type: SimpleEditorType.Dropdown,
					dropdownOptions: [
						{ name: 'normal', displayName: 'Normal' },
						{ name: 'stretch', displayName: 'Stretch' },
						{ name: 'center', displayName: 'Center' },
						{ name: 'start', displayName: 'Start' },
						{ name: 'end', displayName: 'End' },
						{ name: 'flex-start', displayName: 'Flex Start' },
						{ name: 'flex-end', displayName: 'Flex End' },
						{ name: 'self-start', displayName: 'Self Start' },
						{ name: 'self-end', displayName: 'Self End' },
						{ name: 'anchor-center', displayName: 'Anchor Center' },
						{ name: 'baseline', displayName: 'Baseline' },
						{ name: 'first baseline', displayName: 'First Baseline' },
						{ name: 'last baseline', displayName: 'Last Baseline' },
						{ name: 'safe center', displayName: 'Safe Center' },
						{ name: 'unsafe center', displayName: 'Unsafe Center' },
						{ name: 'inherit', displayName: 'Inherit' },
						{ name: 'initial', displayName: 'Initial' },
						{ name: 'revert', displayName: 'Revert' },
						{ name: 'revert-layer', displayName: 'Revert Layer' },
						{ name: 'unset', displayName: 'Unset' },
					],
				}}
			/>

			<div className="_combineEditors">Align Self</div>
			<EachSimpleEditor
				selectedComponentsList={selectedComponentsList}
				defPath={defPath}
				className={'_simpleEditor'}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="alignSelf"
				placeholder="Align Self"
				iterateProps={iterateProps}
				selectorPref={selectorPref}
				styleProps={styleProps}
				selectedComponent={selectedComponent}
				saveStyle={saveStyle}
				properties={properties}
				editorDef={{
					type: SimpleEditorType.Dropdown,
					dropdownOptions: [
						/* Keyword values */
						{ name: 'auto', displayName: 'Auto' },
						{ name: 'normal', displayName: 'Normal' },
						{ name: 'center', displayName: 'Center' },
						{ name: 'start', displayName: 'Start' },
						{ name: 'end', displayName: 'End' },
						{ name: 'self-start', displayName: 'Self Start' },
						{ name: 'self-end', displayName: 'Self End' },
						{ name: 'flex-start', displayName: 'Flex Start' },
						{ name: 'flex-end', displayName: 'Flex End' },
						{ name: 'anchor-center', displayName: 'Anchor Center' },
						{ name: 'baseline', displayName: 'Baseline' },
						{ name: 'first baseline', displayName: 'First Baseline' },
						{ name: 'last baseline', displayName: 'Last Baseline' },
						{ name: 'stretch', displayName: 'Stretch' },
						{ name: 'safe center', displayName: 'Safe Center' },
						{ name: 'unsafe center', displayName: 'Unsafe Center' },
						{ name: 'inherit', displayName: 'Inherit' },
						{ name: 'initial', displayName: 'Initial' },
						{ name: 'revert', displayName: 'Revert' },
						{ name: 'revert-layer', displayName: 'Revert Layer' },
						{ name: 'unset', displayName: 'Unset' },
					],
				}}
			/>
			<div className="_combineEditors">Flex</div>
			<div className="_simpleEditor">
				<input
					type="text"
					className="_simpleEditorInput"
					// value={selectedComponent?.style?.flex || ''}
					// onChange={e => saveStyle(defPath, 'flex', e.target.value)}
				/>
			</div>
			<div className="_combineEditors">Flex Basis</div>
			<EachSimpleEditor
				selectedComponentsList={selectedComponentsList}
				defPath={defPath}
				className={'_simpleEditor'}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="flexBasis"
				placeholder="Flex Basis"
				iterateProps={iterateProps}
				selectorPref={selectorPref}
				styleProps={styleProps}
				selectedComponent={selectedComponent}
				saveStyle={saveStyle}
				properties={properties}
				editorDef={{ type: SimpleEditorType.PixelSize }}
			/>
			<div className="_combineEditors">Flex Grow</div>
			<EachSimpleEditor
				selectedComponentsList={selectedComponentsList}
				defPath={defPath}
				className={'_simpleEditor'}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="flexGrow"
				placeholder="Flex Grow"
				iterateProps={iterateProps}
				selectorPref={selectorPref}
				styleProps={styleProps}
				selectedComponent={selectedComponent}
				saveStyle={saveStyle}
				properties={properties}
				editorDef={{ type: SimpleEditorType.Range, rangeMin: 0, rangeMax: 10 }}
			/>
			<div className="_combineEditors">Flex Shrink</div>
			<EachSimpleEditor
				selectedComponentsList={selectedComponentsList}
				defPath={defPath}
				className={'_simpleEditor'}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="flexShrink"
				placeholder="Flex Shrink"
				iterateProps={iterateProps}
				selectorPref={selectorPref}
				styleProps={styleProps}
				selectedComponent={selectedComponent}
				saveStyle={saveStyle}
				properties={properties}
				editorDef={{ type: SimpleEditorType.Range, rangeMin: 0, rangeMax: 10 }}
			/>
			<div className="_combineEditors">Flex Direction</div>
			<EachSimpleEditor
				selectedComponentsList={selectedComponentsList}
				defPath={defPath}
				className={'_simpleEditor'}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="flexDirection"
				placeholder="Flex Direction"
				iterateProps={iterateProps}
				selectorPref={selectorPref}
				styleProps={styleProps}
				selectedComponent={selectedComponent}
				saveStyle={saveStyle}
				properties={properties}
				editorDef={{
					type: SimpleEditorType.Dropdown,
					dropdownOptions: [
						{ name: 'row', displayName: 'Row' },
						{ name: 'row-reverse', displayName: 'Row Reverse' },
						{ name: 'column', displayName: 'Column' },
						{ name: 'column-reverse', displayName: 'Column Reverse' },
						{ name: 'inherit', displayName: 'Inherit' },
						{ name: 'initial', displayName: 'Initial' },
						{ name: 'revert', displayName: 'Revert' },
						{ name: 'revert-layer', displayName: 'Revert Layer' },
						{ name: 'unset', displayName: 'Unset' },
					],
				}}
			/>
			<div className="_combineEditors">Flex Wrap</div>
			<EachSimpleEditor
				selectedComponentsList={selectedComponentsList}
				defPath={defPath}
				className={'_simpleEditor'}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="flexWrap"
				placeholder="Flex Wrap"
				iterateProps={iterateProps}
				selectorPref={selectorPref}
				styleProps={styleProps}
				selectedComponent={selectedComponent}
				saveStyle={saveStyle}
				properties={properties}
				editorDef={{
					type: SimpleEditorType.Dropdown,
					dropdownOptions: [
						{ name: 'nowrap', displayName: 'No Wrap' },
						{ name: 'wrap', displayName: 'Wrap' },
						{ name: 'wrap-reverse', displayName: 'Wrap Reverse' },
						{ name: 'inherit', displayName: 'Inherit' },
						{ name: 'initial', displayName: 'Initial' },
						{ name: 'revert', displayName: 'Revert' },
						{ name: 'revert-layer', displayName: 'Revert Layer' },
						{ name: 'unset', displayName: 'Unset' },
					],
				}}
			/>
			<div className="_combineEditors">Gap</div>
			<EachSimpleEditor
				selectedComponentsList={selectedComponentsList}
				defPath={defPath}
				className={'_simpleEditor'}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="gap"
				placeholder="Gap"
				iterateProps={iterateProps}
				selectorPref={selectorPref}
				styleProps={styleProps}
				selectedComponent={selectedComponent}
				saveStyle={saveStyle}
				properties={properties}
				editorDef={{ type: SimpleEditorType.PixelSize }}
			/>
		</>
	);
}
// Display
// Align Content
// Align Items
// Align Self
// Justify Content
// Justify Items
// Justify Self
// Flex
// Flex Basis
// Flex Direction
// Flex Flow
// Flex Grow
// Flex Shrink
// Flex Wrap
// Gap

// Grid
// Grid Area
// Grid Auto Columns
// Grid Auto Rows
// Grid Column
// Grid Column End
// Grid Column Start
// Grid Row
// Grid Row End
// Grid Row Start
// Grid Template
// Grid Template Areas
// Grid Template Columns
// Grid Template Rows
// Height
// Left
// Margin
// Margin Bottom
// Margin Left
// Margin Right
// Margin Top
// Max Height
// Max Width
// Min Height
// Min Width
// Opacity
// Order
// Padding
// Padding Bottom
// Padding Left
// Padding Right
// Padding Top
// Position
// Right
// Top
// Transform
// Transform Origin
// Transition
// Width
// Word Break
// Word Wrap
// Z Index

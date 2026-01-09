import React from 'react';
import {
	EachSimpleEditor,
	SimpleEditorType,
	StyleEditorsProps,
} from './simpleEditors';
import { DropdownOptions } from './simpleEditors/Dropdown';

const OVERFLOW_OPTIONS: DropdownOptions = [
	{ name: 'visible', displayName: 'Visible' },
	{ name: 'hidden', displayName: 'Hidden' },
	{ name: 'scroll', displayName: 'Scroll' },
	{ name: 'auto', displayName: 'Auto' },
];

const OVERFLOW_WRAP_OPTIONS: DropdownOptions = [
	{ name: 'normal', displayName: 'Normal' },
	{ name: 'break-word', displayName: 'Break Word' },
	{ name: 'anywhere', displayName: 'Anywhere' },
];

const OBJECT_FIT_OPTIONS: DropdownOptions = [
	{ name: 'fill', displayName: 'Fill' },
	{ name: 'contain', displayName: 'Contain' },
	{ name: 'cover', displayName: 'Cover' },
	{ name: 'none', displayName: 'None' },
	{ name: 'scale-down', displayName: 'Scale Down' },
];

const OBJECT_POSITION_OPTIONS: DropdownOptions = [
	{ name: 'center', displayName: 'Center' },
	{ name: 'top', displayName: 'Top' },
	{ name: 'bottom', displayName: 'Bottom' },
	{ name: 'left', displayName: 'Left' },
	{ name: 'right', displayName: 'Right' },
	{ name: 'top left', displayName: 'Top Left' },
	{ name: 'top center', displayName: 'Top Center' },
	{ name: 'top right', displayName: 'Top Right' },
	{ name: 'center left', displayName: 'Center Left' },
	{ name: 'center right', displayName: 'Center Right' },
	{ name: 'bottom left', displayName: 'Bottom Left' },
	{ name: 'bottom center', displayName: 'Bottom Center' },
	{ name: 'bottom right', displayName: 'Bottom Right' },
];

export function SizeEditor({
	subComponentName,
	pseudoState,
	iterateProps,
	selectorPref,
	styleProps,
	selectedComponent,
	selectedComponentsList,
	saveStyle,
	properties,
	isDetailStyleEditor,
	defPath,
	locationHistory,
	pageExtractor,
}: StyleEditorsProps) {
	const commonEditorProps = {
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
	};

	if (isDetailStyleEditor) {
		return (
			<>
				<div className="_combineEditors">
					<div className="_simpleLabel">Object Fit</div>
					<EachSimpleEditor
						{...commonEditorProps}
						prop="objectFit"
						placeholder="Object Fit"
						editorDef={{
							type: SimpleEditorType.Dropdown,
							dropdownOptions: OBJECT_FIT_OPTIONS,
						}}
						className="_expandWidth"
					/>
				</div>
				<div className="_combineEditors">
					<div className="_simpleLabel">Overflow Wrap</div>
					<EachSimpleEditor
						{...commonEditorProps}
						prop="overflowWrap"
						placeholder="Overflow Wrap"
						editorDef={{
							type: SimpleEditorType.Dropdown,
							dropdownOptions: OVERFLOW_WRAP_OPTIONS,
						}}
						className="_expandWidth"
					/>
				</div>
				<div className="_combineEditors">
					<div className="_simpleLabel">Object Position</div>
					<EachSimpleEditor
						{...commonEditorProps}
						prop="objectPosition"
						placeholder="Object Position"
						editorDef={{
							type: SimpleEditorType.Dropdown,
							dropdownOptions: OBJECT_POSITION_OPTIONS,
						}}
						className="_expandWidth"
					/>
				</div>
			</>
		);
	}

	return (
		<>
			<div className="_combineEditors">
				<div className="_simpleLabel">Width</div>
				<EachSimpleEditor
					{...commonEditorProps}
					prop="width"
					placeholder="Width"
					editorDef={{ type: SimpleEditorType.PixelSize }}
					className="_expandWidth"
				/>
			</div>
			<div className="_combineEditors">
				<div className="_simpleLabel">Height</div>
				<EachSimpleEditor
					{...commonEditorProps}
					prop="height"
					placeholder="Height"
					editorDef={{ type: SimpleEditorType.PixelSize }}
					className="_expandWidth"
				/>
			</div>
			<div className="_combineEditors">
				<div className="_simpleLabel">Overflow</div>
				<EachSimpleEditor
					{...commonEditorProps}
					prop="overflow"
					placeholder="Overflow"
					editorDef={{
						type: SimpleEditorType.Dropdown,
						dropdownOptions: OVERFLOW_OPTIONS,
					}}
					className="_expandWidth"
				/>
			</div>
			<div className="_combineEditors">
				<div className="_simpleLabel">Min Height</div>
				<EachSimpleEditor
					{...commonEditorProps}
					prop="minHeight"
					placeholder="Min Height"
					editorDef={{ type: SimpleEditorType.PixelSize }}
					className="_expandWidth"
				/>
			</div>
			<div className="_combineEditors">
				<div className="_simpleLabel">Min Width</div>
				<EachSimpleEditor
					{...commonEditorProps}
					prop="minWidth"
					placeholder="Min Width"
					editorDef={{ type: SimpleEditorType.PixelSize }}
					className="_expandWidth"
				/>
			</div>
			<div className="_combineEditors">
				<div className="_simpleLabel">Max Height</div>
				<EachSimpleEditor
					{...commonEditorProps}
					prop="maxHeight"
					placeholder="Max Height"
					editorDef={{ type: SimpleEditorType.PixelSize }}
					className="_expandWidth"
				/>
			</div>
			<div className="_combineEditors">
				<div className="_simpleLabel">Max Width</div>
				<EachSimpleEditor
					{...commonEditorProps}
					prop="maxWidth"
					placeholder="Max Width"
					editorDef={{ type: SimpleEditorType.PixelSize }}
					className="_expandWidth"
				/>
			</div>
			<div className="_combineEditors">
				<div className="_simpleLabel">Overflow X</div>
				<EachSimpleEditor
					{...commonEditorProps}
					prop="overflowX"
					placeholder="Overflow X"
					editorDef={{
						type: SimpleEditorType.Dropdown,
						dropdownOptions: OVERFLOW_OPTIONS,
					}}
					className="_expandWidth"
				/>
			</div>
			<div className="_combineEditors">
				<div className="_simpleLabel">Overflow Y</div>
				<EachSimpleEditor
					{...commonEditorProps}
					prop="overflowY"
					placeholder="Overflow Y"
					editorDef={{
						type: SimpleEditorType.Dropdown,
						dropdownOptions: OVERFLOW_OPTIONS,
					}}
					className="_expandWidth"
				/>
			</div>
			<div className="_combineEditors">
				<div className="_simpleLabel">Scale</div>
				<EachSimpleEditor
					{...commonEditorProps}
					prop="scale"
					placeholder="Scale"
					editorDef={{
						type: SimpleEditorType.Range,
						rangeMin: 0,
						rangeMax: 5,
						rangeStep: 0.1,
					}}
					className="_expandWidth"
				/>
			</div>
		</>
	);
}


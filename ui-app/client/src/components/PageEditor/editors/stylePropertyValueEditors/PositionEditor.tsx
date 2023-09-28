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

	let otherEditors = undefined;
	console.log(styleProps);
	if (position !== undefined && position !== 'static') {
		let classes = '';
		for (let prop of ['left', 'right', 'top', 'bottom']) {
			const { value: { value: propValue } = {} } =
				extractValue({
					subComponentName,
					prop,
					iterateProps,
					pseudoState,
					selectorPref,
					selectedComponent,
				}) ?? ({} as any);

			if (propValue !== undefined) {
				classes += ` _${prop}`;
			}
		}

		otherEditors = (
			<>
				<div className="_combineEditors _centered">
					<EachSimpleEditor
						subComponentName={subComponentName}
						pseudoState={pseudoState}
						prop="top"
						placeholder="Top"
						iterateProps={iterateProps}
						selectorPref={selectorPref}
						styleProps={styleProps}
						selectedComponent={selectedComponent}
						saveStyle={saveStyle}
						properties={properties}
						editorDef={{
							type: SimpleEditorType.PixelSize,
							rangeMin: 0,
							rangeMax: 1000,
							hideSlider: true,
						}}
						className="_confineWidth"
					/>
				</div>
				<div className="_combineEditors _centered">
					<EachSimpleEditor
						subComponentName={subComponentName}
						pseudoState={pseudoState}
						prop="left"
						placeholder="Left"
						iterateProps={iterateProps}
						selectorPref={selectorPref}
						styleProps={styleProps}
						selectedComponent={selectedComponent}
						saveStyle={saveStyle}
						properties={properties}
						editorDef={{
							type: SimpleEditorType.PixelSize,
							rangeMin: 0,
							rangeMax: 1000,
							hideSlider: true,
						}}
						className="_confineWidth"
					/>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="70"
						height="70"
						viewBox="0 0 70 70"
						className={`_positionKnob ${classes}`}
					>
						<g id="Group_81" data-name="Group 81" transform="translate(-1158 -414)">
							<g id="Group_80" data-name="Group 80" transform="translate(1158 414)">
								<rect
									id="background"
									data-name="Rectangle 9"
									width="70"
									height="70"
									rx="6"
								/>
								<g id="Group_79" data-name="Group 79">
									<rect
										id="knob"
										data-name="Rectangle 10"
										width="25"
										height="25"
										rx="12.5"
										transform="translate(23 23)"
									/>
								</g>
							</g>
							<rect
								id="top"
								data-name="Rectangle 11"
								width="3"
								height="15"
								rx="1.5"
								transform="translate(1192 417)"
							/>
							<rect
								id="left"
								data-name="Rectangle 14"
								width="3"
								height="15"
								rx="1.5"
								transform="translate(1161 450.5) rotate(-90)"
							/>
							<rect
								id="bottom"
								data-name="Rectangle 12"
								width="3"
								height="15"
								rx="1.5"
								transform="translate(1192 466)"
							/>
							<rect
								id="right"
								data-name="Rectangle 13"
								width="3"
								height="15"
								rx="1.5"
								transform="translate(1210 450.5) rotate(-90)"
							/>
						</g>
					</svg>

					<EachSimpleEditor
						subComponentName={subComponentName}
						pseudoState={pseudoState}
						prop="right"
						placeholder="Right"
						iterateProps={iterateProps}
						selectorPref={selectorPref}
						styleProps={styleProps}
						selectedComponent={selectedComponent}
						saveStyle={saveStyle}
						properties={properties}
						editorDef={{
							type: SimpleEditorType.PixelSize,
							rangeMin: 0,
							rangeMax: 1000,
							hideSlider: true,
						}}
						className="_confineWidth"
					/>
				</div>
				<div className="_combineEditors _centered">
					<EachSimpleEditor
						subComponentName={subComponentName}
						pseudoState={pseudoState}
						prop="bottom"
						placeholder="Bottom"
						iterateProps={iterateProps}
						selectorPref={selectorPref}
						styleProps={styleProps}
						selectedComponent={selectedComponent}
						saveStyle={saveStyle}
						properties={properties}
						editorDef={{
							type: SimpleEditorType.PixelSize,
							rangeMin: 0,
							rangeMax: 1000,
							hideSlider: true,
						}}
						className="_confineWidth"
					/>
				</div>
			</>
		);
	}

	return (
		<>
			<div className="_combineEditors">
				<div className="_simpleLabel">Type : </div>
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
					className="_expandWidth"
				/>
			</div>
			{otherEditors}
		</>
	);
}

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
				<div className="_spacer" />

				<div className="_combineEditors">
					<div className="_simpleLabel">Z-Index : </div>
					<EachSimpleEditor
						subComponentName={subComponentName}
						pseudoState={pseudoState}
						prop="zIndex"
						placeholder="Z Index"
						iterateProps={iterateProps}
						selectorPref={selectorPref}
						styleProps={styleProps}
						selectedComponent={selectedComponent}
						saveStyle={saveStyle}
						properties={properties}
						editorDef={{
							type: SimpleEditorType.Dropdown,
							dropdownOptions: [
								{ name: '1', displayName: '1' },
								{ name: '2', displayName: '2' },
								{ name: '3', displayName: '3' },
								{ name: '4', displayName: '4' },
								{ name: '5', displayName: '5' },
								{ name: '6', displayName: '6' },
								{ name: '7', displayName: '7' },
								{ name: '8', displayName: '8' },
								{ name: '9', displayName: '9' },
								{ name: '10', displayName: '10' },
								{ name: '11', displayName: '11' },
								{ name: '12', displayName: '12' },
								{ name: '13', displayName: '13' },
								{ name: '14', displayName: '14' },
								{ name: '15', displayName: '15' },
							],
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
			<div className="_spacer"></div>
			<div className="_combineEditors _spaceBetween">
				<div className="_simpleLabel">Float :</div>
				<EachSimpleEditor
					subComponentName={subComponentName}
					pseudoState={pseudoState}
					prop="float"
					placeholder="Float"
					iterateProps={iterateProps}
					selectorPref={selectorPref}
					styleProps={styleProps}
					selectedComponent={selectedComponent}
					saveStyle={saveStyle}
					properties={properties}
					editorDef={{
						type: SimpleEditorType.Icons,
						multiSelect: false,
						iconButtonsBackground: true,
						iconButtonOptions: [
							{
								name: '',
								description: 'Float : None',
								icon: (
									<g
										id="Group_76"
										data-name="Group 76"
										transform="translate(13 14.5)"
									>
										<rect
											id="Rectangle_8"
											data-name="Rectangle 8"
											width="7"
											height="2"
											rx="1"
											transform="translate(0 0.5)"
											strokeWidth={0}
										/>
									</g>
								),
							},
							{
								name: 'left',
								description: 'Float: Left',
								icon: (
									<path
										id="Union_1"
										data-name="Union 1"
										d="M-124.25,206.406l-6.535-6.6a1.341,1.341,0,0,1,0-1.885l6.535-6.6a1.313,1.313,0,0,1,1.867,0c1.235,1.247-5.944,7.474-5.982,7.509,0,.04,7.251,6.286,5.982,7.566a1.31,1.31,0,0,1-.934.39A1.31,1.31,0,0,1-124.25,206.406Zm6.6-.113-6.535-6.6a1.341,1.341,0,0,1,0-1.885l6.535-6.6a1.313,1.313,0,0,1,1.867,0c1.236,1.247-5.944,7.474-5.982,7.509,0,.04,7.251,6.286,5.982,7.566a1.31,1.31,0,0,1-.934.39A1.31,1.31,0,0,1-117.648,206.294Z"
										transform="translate(139.272 -182.897)"
										strokeWidth={0}
									/>
								),
							},
							{
								name: 'right',
								description: 'Float: Right',
								icon: (
									<path
										id="Union_1"
										data-name="Union 1"
										d="M6.922.39.387,6.985a1.341,1.341,0,0,0,0,1.885l6.535,6.6a1.313,1.313,0,0,0,1.867,0c1.235-1.247-5.944-7.474-5.982-7.509,0-.04,7.251-6.286,5.982-7.566a1.312,1.312,0,0,0-1.867,0Zm6.6.113L6.988,7.1a1.341,1.341,0,0,0,0,1.885l6.535,6.6a1.313,1.313,0,0,0,1.867,0C16.626,14.331,9.446,8.1,9.409,8.069c0-.04,7.251-6.286,5.982-7.566a1.312,1.312,0,0,0-1.867,0Z"
										transform="translate(23.64 23.9) rotate(180)"
										strokeWidth={0}
									/>
								),
							},
						],
					}}
				/>
			</div>
			<div className="_combineEditors _spaceBetween">
				<div className="_simpleLabel">Clear :</div>
				<EachSimpleEditor
					subComponentName={subComponentName}
					pseudoState={pseudoState}
					prop="clear"
					placeholder="Clear"
					iterateProps={iterateProps}
					selectorPref={selectorPref}
					styleProps={styleProps}
					selectedComponent={selectedComponent}
					saveStyle={saveStyle}
					properties={properties}
					editorDef={{
						type: SimpleEditorType.Icons,
						multiSelect: false,
						iconButtonsBackground: true,
						iconButtonOptions: [
							{
								name: '',
								description: 'Clear : None',
								icon: (
									<g
										id="Group_76"
										data-name="Group 76"
										transform="translate(13 14.5)"
									>
										<rect
											id="Rectangle_8"
											data-name="Rectangle 8"
											width="7"
											height="2"
											rx="1"
											transform="translate(0 0.5)"
											strokeWidth={0}
										/>
									</g>
								),
							},
							{
								name: 'left',
								description: 'Clear: Left',
								icon: (
									<g
										id="Group_83"
										data-name="Group 83"
										transform="translate(-1211.82 -296)"
									>
										<path
											id="Path_157"
											data-name="Path 157"
											d="M13.34,14.862l-9-9a6.451,6.451,0,0,0,9,9Zm1.522-1.522a6.451,6.451,0,0,0-9-9ZM1,9.6a8.6,8.6,0,1,1,2.52,6.083A8.6,8.6,0,0,1,1,9.6Z"
											transform="translate(1220.975 299)"
											fill="currentColor"
											strokeWidth="0"
										/>
										<path
											id="Union_2"
											data-name="Union 2"
											d="M-127.813,198.6l-3.171-3.291a.683.683,0,0,1,0-.94l3.171-3.291a.625.625,0,0,1,.906,0c.6.622-2.884,3.73-2.9,3.747,0,.02,3.518,3.137,2.9,3.776a.627.627,0,0,1-.453.195A.627.627,0,0,1-127.813,198.6Zm3.2-.056-3.171-3.291a.683.683,0,0,1,0-.94l3.171-3.291a.625.625,0,0,1,.906,0c.6.622-2.884,3.73-2.9,3.747,0,.02,3.518,3.137,2.9,3.776a.627.627,0,0,1-.453.195A.627.627,0,0,1-124.61,198.546Z"
											transform="translate(1347.991 125.171)"
											fill="currentColor"
											strokeWidth="0"
										/>
									</g>
								),
							},
							{
								name: 'right',
								description: 'Clear: Right',
								icon: (
									<g
										id="Group_83"
										data-name="Group 83"
										transform="translate(5 4)"
									>
										<path
											id="Path_157"
											data-name="Path 157"
											d="M5.866,14.862l9-9a6.451,6.451,0,0,1-9,9ZM4.344,13.34a6.451,6.451,0,0,1,9-9ZM18.206,9.6a8.6,8.6,0,1,0-2.52,6.083A8.6,8.6,0,0,0,18.206,9.6Z"
											transform="translate(-1 -1)"
											fill="currentColor"
											strokeWidth="0"
										/>
										<path
											id="Union_2"
											data-name="Union 2"
											d="M3.358.195.188,3.486a.683.683,0,0,0,0,.94L3.358,7.717a.625.625,0,0,0,.906,0c.6-.622-2.884-3.73-2.9-3.747,0-.02,3.518-3.137,2.9-3.776a.624.624,0,0,0-.906,0Zm3.2.056L3.391,3.542a.683.683,0,0,0,0,.94L6.561,7.774a.625.625,0,0,0,.906,0c.6-.622-2.884-3.73-2.9-3.747,0-.02,3.518-3.137,2.9-3.776a.624.624,0,0,0-.906,0Z"
											transform="translate(22.361 23.968) rotate(180)"
											fill="currentColor"
											strokeWidth="0"
										/>
									</g>
								),
							},
							{
								name: 'both',
								description: 'Clear: Both',
								icon: (
									<g
										id="Group_83"
										data-name="Group 83"
										transform="translate(-1212.242 -296)"
									>
										<path
											id="Path_157"
											data-name="Path 157"
											d="M5.866,14.862l9-9a6.451,6.451,0,0,1-9,9ZM4.344,13.34a6.451,6.451,0,0,1,9-9ZM18.206,9.6a8.6,8.6,0,1,0-2.52,6.083A8.6,8.6,0,0,0,18.206,9.6Z"
											transform="translate(1218.397 299)"
											fill="currentColor"
											strokeWidth="0"
										/>
										<path
											id="Union_2"
											data-name="Union 2"
											d="M3.358.195.188,3.486a.683.683,0,0,0,0,.94L3.358,7.717a.625.625,0,0,0,.906,0c.6-.622-2.884-3.73-2.9-3.747,0-.02,3.518-3.137,2.9-3.776a.624.624,0,0,0-.906,0Zm3.2.056L3.391,3.542a.683.683,0,0,0,0,.94L6.561,7.774a.625.625,0,0,0,.906,0c.6-.622-2.884-3.73-2.9-3.747,0-.02,3.518-3.137,2.9-3.776a.624.624,0,0,0-.906,0Z"
											transform="translate(1240.373 324.968) rotate(180)"
											fill="currentColor"
											strokeWidth="0"
										/>
										<path
											id="Union_3"
											data-name="Union 3"
											d="M3.358,7.773.188,4.482a.683.683,0,0,1,0-.94L3.358.251a.625.625,0,0,1,.906,0C4.864.873,1.38,3.98,1.362,4c0,.02,3.518,3.137,2.9,3.776a.624.624,0,0,1-.906,0Zm3.2-.056L3.391,4.426a.683.683,0,0,1,0-.94L6.561.195a.625.625,0,0,1,.906,0c.6.622-2.884,3.73-2.9,3.747,0,.02,3.518,3.137,2.9,3.776a.624.624,0,0,1-.906,0Z"
											transform="translate(1216.242 317)"
											fill="currentColor"
											strokeWidth="0"
										/>
									</g>
								),
							},
						],
					}}
				/>
			</div>
		</>
	);
}

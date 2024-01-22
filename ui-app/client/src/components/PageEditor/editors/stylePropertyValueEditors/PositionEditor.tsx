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
	selectorPref,
	styleProps,
	selectedComponent,
	saveStyle,
	properties,
	defPath,
	locationHistory,
	pageExtractor,
	selectedComponentsList,
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
						defPath={defPath}
						locationHistory={locationHistory}
						pageExtractor={pageExtractor}
						selectedComponentsList={selectedComponentsList}
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
						defPath={defPath}
						locationHistory={locationHistory}
						pageExtractor={pageExtractor}
						selectedComponentsList={selectedComponentsList}
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
						defPath={defPath}
						locationHistory={locationHistory}
						pageExtractor={pageExtractor}
						selectedComponentsList={selectedComponentsList}
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
						defPath={defPath}
						locationHistory={locationHistory}
						pageExtractor={pageExtractor}
						selectedComponentsList={selectedComponentsList}
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
						defPath={defPath}
						locationHistory={locationHistory}
						pageExtractor={pageExtractor}
						selectedComponentsList={selectedComponentsList}
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
					defPath={defPath}
					locationHistory={locationHistory}
					pageExtractor={pageExtractor}
					selectedComponentsList={selectedComponentsList}
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
					defPath={defPath}
					locationHistory={locationHistory}
					pageExtractor={pageExtractor}
					selectedComponentsList={selectedComponentsList}
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
									<g
										id="Group_92"
										data-name="Group 92"
										transform="translate(7 8.286)"
									>
										<rect
											id="Rectangle_26"
											data-name="Rectangle 26"
											width="8"
											height="16"
											rx="1"
											transform="translate(10 -0.286)"
											fill="currentColor"
											strokeWidth={0}
										/>
										<path
											id="Path_199"
											data-name="Path 199"
											d="M1.286,1c.71,0,1.286.288,1.286.643V13.214c0,.355-.576.643-1.286.643S0,13.569,0,13.214V1.643C0,1.288.576,1,1.286,1Z"
											transform="translate(0 0.286)"
											fill="currentColor"
											strokeWidth={0}
										/>
										<rect
											id="Rectangle_27"
											data-name="Rectangle 27"
											width="5"
											height="7"
											rx="1"
											transform="translate(9 11.714) rotate(180)"
											fill="currentColor"
											strokeWidth={0}
										/>
									</g>
								),
							},
							{
								name: 'right',
								description: 'Float: Right',
								icon: (
									<g
										id="Group_92"
										data-name="Group 92"
										transform="translate(7 8)"
									>
										<rect
											id="Rectangle_26"
											data-name="Rectangle 26"
											width="8"
											height="16"
											rx="1"
											transform="translate(0)"
											fill="currentColor"
											strokeWidth={0}
										/>
										<path
											id="Path_199"
											data-name="Path 199"
											d="M1.286,1C.576,1,0,1.288,0,1.643V13.214c0,.355.576.643,1.286.643s1.286-.288,1.286-.643V1.643C2.571,1.288,2,1,1.286,1Z"
											transform="translate(15.429 0.571)"
											fill="currentColor"
											strokeWidth={0}
										/>
										<rect
											id="Rectangle_27"
											data-name="Rectangle 27"
											width="5"
											height="7"
											rx="1"
											transform="translate(9 5)"
											fill="currentColor"
											strokeWidth={0}
										/>
									</g>
								),
							},
						],
					}}
				/>
			</div>
			<div className="_combineEditors _spaceBetween">
				<div className="_simpleLabel">Clear :</div>
				<EachSimpleEditor
					defPath={defPath}
					locationHistory={locationHistory}
					pageExtractor={pageExtractor}
					selectedComponentsList={selectedComponentsList}
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
									<>
										<path
											id="Path_213"
											data-name="Path 213"
											d="M14,13a1,1,0,0,1-1,1H1a1,1,0,0,1-1-1V1A1,1,0,0,1,1,0H13a1,1,0,0,1,1,1Z"
											transform="translate(3 9)"
											fill="currentColor"
											strokeWidth="0"
										/>
										<path
											id="Path_214"
											data-name="Path 214"
											d="M25,13c-.552,0-1-.269-1-.6V1.6c0-.331.448-.6,1-.6s1,.269,1,.6V12.4C26,12.731,25.552,13,25,13Z"
											transform="translate(3 9)"
											fill="currentColor"
											strokeWidth="0"
										/>
										<rect
											id="Rectangle_29"
											data-name="Rectangle 29"
											width="6"
											height="7"
											rx="1"
											transform="translate(19 12)"
											fill="currentColor"
											strokeWidth="0"
										/>
										<g
											id="Group_97"
											data-name="Group 97"
											transform="translate(-564.171 -976.778) rotate(45)"
										>
											<g id="Group_96" data-name="Group 96">
												<g id="Group_95" data-name="Group 95">
													<rect
														id="Rectangle_30"
														data-name="Rectangle 30"
														width="8"
														height="2"
														rx="1"
														transform="translate(1104 295)"
														fill="#fff"
														style={{ fill: '#FFF' }}
														strokeWidth="0"
													/>
												</g>
												<rect
													id="Rectangle_31"
													data-name="Rectangle 31"
													width="8"
													height="2"
													rx="1"
													transform="translate(1109 292) rotate(90)"
													fill="#fff"
													style={{ fill: '#FFF' }}
													strokeWidth="0"
												/>
											</g>
										</g>
									</>
								),
							},
							{
								name: 'right',
								description: 'Clear: Right',
								icon: (
									<g
										style={{
											transform: 'rotate(180deg)',
											transformOrigin: 'center',
										}}
									>
										<path
											id="Path_213"
											data-name="Path 213"
											d="M14,13a1,1,0,0,1-1,1H1a1,1,0,0,1-1-1V1A1,1,0,0,1,1,0H13a1,1,0,0,1,1,1Z"
											transform="translate(3 9)"
											fill="currentColor"
											strokeWidth="0"
										/>
										<path
											id="Path_214"
											data-name="Path 214"
											d="M25,13c-.552,0-1-.269-1-.6V1.6c0-.331.448-.6,1-.6s1,.269,1,.6V12.4C26,12.731,25.552,13,25,13Z"
											transform="translate(3 9)"
											fill="currentColor"
											strokeWidth="0"
										/>
										<rect
											id="Rectangle_29"
											data-name="Rectangle 29"
											width="6"
											height="7"
											rx="1"
											transform="translate(19 12)"
											fill="currentColor"
											strokeWidth="0"
										/>
										<g
											id="Group_97"
											data-name="Group 97"
											transform="translate(-564.171 -976.778) rotate(45)"
										>
											<g id="Group_96" data-name="Group 96">
												<g id="Group_95" data-name="Group 95">
													<rect
														id="Rectangle_30"
														data-name="Rectangle 30"
														width="8"
														height="2"
														rx="1"
														transform="translate(1104 295)"
														fill="#fff"
														style={{ fill: '#FFF' }}
														strokeWidth="0"
													/>
												</g>
												<rect
													id="Rectangle_31"
													data-name="Rectangle 31"
													width="8"
													height="2"
													rx="1"
													transform="translate(1109 292) rotate(90)"
													fill="#fff"
													style={{ fill: '#FFF' }}
													strokeWidth="0"
												/>
											</g>
										</g>
									</g>
								),
							},
							{
								name: 'both',
								description: 'Clear: Both',
								icon: (
									<>
										<path
											id="Path_213"
											data-name="Path 213"
											d="M0,13a1,1,0,0,0,1,1H13a1,1,0,0,0,1-1V1a1,1,0,0,0-1-1H1A1,1,0,0,0,0,1Z"
											transform="translate(9 9)"
											fill="currentColor"
											strokeWidth="0"
										/>
										<g
											id="Group_97"
											data-name="Group 97"
											transform="translate(21.314 16) rotate(135)"
										>
											<g
												id="Group_96"
												data-name="Group 96"
												transform="translate(0 0)"
											>
												<g
													id="Group_95"
													data-name="Group 95"
													transform="translate(0 3)"
												>
													<rect
														id="Rectangle_30"
														data-name="Rectangle 30"
														width="8"
														height="2"
														rx="1"
														transform="translate(0 0)"
														fill="#fff"
														style={{ fill: '#FFF' }}
														strokeWidth="0"
													/>
												</g>
												<rect
													id="Rectangle_31"
													data-name="Rectangle 31"
													width="8"
													height="2"
													rx="1"
													transform="translate(3 8) rotate(-90)"
													fill="#fff"
													style={{ fill: '#FFF' }}
													strokeWidth="0"
												/>
											</g>
										</g>
									</>
								),
							},
						],
					}}
				/>
			</div>
		</>
	);
}

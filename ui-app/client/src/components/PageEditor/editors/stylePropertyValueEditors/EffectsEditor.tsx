import React, { useEffect, useState } from 'react';
import {
	EachSimpleEditor,
	SimpleEditorType,
	StyleEditorsProps,
	extractValue,
	valuesChanged,
	valuesChangedOnlyValues,
} from './simpleEditors';
import { PixelSize } from './simpleEditors/SizeSliders';

// 'backgroundBlendMode',

// 		'boxShadow',
// 'mixBlendMode',

// 'transitionProperty',
// 'transitionDuration',
// 'transitionTiming-function',
// 'transitionDelay',
// 'filter',
// 'backdropFilter',
// 'cursor',

// 'perspective',

export function EffectsEditor({
	subComponentName,
	pseudoState,
	iterateProps,
	selectorPref,
	styleProps,
	selectedComponent,
	saveStyle,
	properties,
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
			<div className="_simpleLabel _withPadding">Outline : </div>
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
						iconButtonOptions: [
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
			<div className="_simpleLabel _withPadding">Transform : </div>
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
						iconButtonOptions: [
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
							styleProps,
							properties,
							propValues: [{ prop: 'transformOrigin', value: value.join(' ') }],
							pseudoState,
							saveStyle,
							iterateProps,
						});
					}}
					placeholder="X Offset"
					min={0}
					max={100}
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
							styleProps,
							properties,
							propValues: [{ prop: 'transformOrigin', value: value.join(' ') }],
							pseudoState,
							saveStyle,
							iterateProps,
						});
					}}
					placeholder="Y Offset"
					min={0}
					max={100}
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
							styleProps,
							properties,
							propValues: [{ prop: 'transformOrigin', value: value.join(' ') }],
							pseudoState,
							saveStyle,
							iterateProps,
						});
					}}
					placeholder="Z Offset"
					min={0}
					max={100}
				/>
			</div>
		</>
	);
}

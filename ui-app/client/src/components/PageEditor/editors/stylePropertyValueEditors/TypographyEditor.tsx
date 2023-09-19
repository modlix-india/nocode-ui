import React from 'react';
import {
	EachSimpleEditor,
	StyleEditorsProps,
	SimpleEditorType,
	SimpleEditorMultipleValueType,
} from './simpleEditors';
import { DropdownOptions } from './simpleEditors/Dropdown';

// 'textIndent',

// 'textTransform',

// 'direction',
// 'textOrientation',
// 'wordBreak',
// 'wordSpacing',
// 'wordWrap',

// 'textEmphasis',
// 'textOverflow',
// 'whiteSpace',

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
				selectorPref={selectorPref}
				styleProps={styleProps}
				selectedComponent={selectedComponent}
				saveStyle={saveStyle}
				properties={properties}
				editorDef={{
					type: SimpleEditorType.Dropdown,
					dropdownOptions: fonts,
					multiSelect: true,
					multipleValueType: SimpleEditorMultipleValueType.CommaSeparated,
				}}
			/>
			<EachSimpleEditor
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="fontSize"
				placeholder="Size"
				iterateProps={iterateProps}
				selectorPref={selectorPref}
				styleProps={styleProps}
				selectedComponent={selectedComponent}
				saveStyle={saveStyle}
				properties={properties}
				editorDef={{ type: SimpleEditorType.PixelSize, rangeMin: 0, rangeMax: 200 }}
			/>
			<EachSimpleEditor
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="fontWeight"
				placeholder="Font Weight"
				iterateProps={iterateProps}
				selectorPref={selectorPref}
				styleProps={styleProps}
				selectedComponent={selectedComponent}
				saveStyle={saveStyle}
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
			<div className="_combineEditors _spaceBetween">
				<EachSimpleEditor
					subComponentName={subComponentName}
					pseudoState={pseudoState}
					prop="textAlign"
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
								name: 'left',
								icon: (
									<path
										id="Path_127"
										data-name="Path 127"
										d="M.85,15.275a.859.859,0,0,1,.775-.923h8.75a.937.937,0,0,1,0,1.846H1.625A.859.859,0,0,1,.85,15.275Zm0-4.5a.859.859,0,0,1,.775-.923h13.75a.859.859,0,0,1,.775.923.859.859,0,0,1-.775.923H1.625A.859.859,0,0,1,.85,10.775Zm0-4.5a.859.859,0,0,1,.775-.923h8.75a.859.859,0,0,1,.775.923.859.859,0,0,1-.775.923H1.625A.859.859,0,0,1,.85,6.274Zm0-4.5A.859.859,0,0,1,1.625.85h13.75a.859.859,0,0,1,.775.923.859.859,0,0,1-.775.923H1.625A.859.859,0,0,1,.85,1.773Z"
										transform="translate(7.5 7.476)"
										strokeWidth={0}
									/>
								),
								description: 'Left Align',
							},
							{
								name: 'center',
								icon: (
									<path
										id="Path_127"
										data-name="Path 127"
										d="M3.325,15.211a.859.859,0,0,1,.775-.923h8.75a.937.937,0,0,1,0,1.846H4.1A.859.859,0,0,1,3.325,15.211ZM.85,10.775a.859.859,0,0,1,.775-.923h13.75a.859.859,0,0,1,.775.923.859.859,0,0,1-.775.923H1.625A.859.859,0,0,1,.85,10.775ZM3.325,6.22A.859.859,0,0,1,4.1,5.3h8.75a.859.859,0,0,1,.775.923.859.859,0,0,1-.775.923H4.1A.859.859,0,0,1,3.325,6.22ZM.85,1.773A.859.859,0,0,1,1.625.85h13.75a.859.859,0,0,1,.775.923.859.859,0,0,1-.775.923H1.625A.859.859,0,0,1,.85,1.773Z"
										transform="translate(7.5 7.476)"
										strokeWidth={0}
									/>
								),
								description: 'Center Align',
							},
							{
								name: 'right',
								icon: (
									<path
										id="Path_127"
										data-name="Path 127"
										d="M16.15,15.276a.859.859,0,0,0-.775-.923H6.625a.937.937,0,0,0,0,1.846h8.75A.859.859,0,0,0,16.15,15.276Zm0-4.5a.859.859,0,0,0-.775-.923H1.625a.859.859,0,0,0-.775.923.859.859,0,0,0,.775.923h13.75A.859.859,0,0,0,16.15,10.775Zm0-4.5a.859.859,0,0,0-.775-.923H6.625a.859.859,0,0,0-.775.923.859.859,0,0,0,.775.923h8.75A.859.859,0,0,0,16.15,6.274Zm0-4.5A.859.859,0,0,0,15.375.85H1.625a.859.859,0,0,0-.775.923.859.859,0,0,0,.775.923h13.75A.859.859,0,0,0,16.15,1.773Z"
										transform="translate(7.5 7.476)"
										strokeWidth={0}
									/>
								),
								description: 'Right Align',
							},

							{
								name: 'justify',
								icon: (
									<path
										id="Path_127"
										data-name="Path 127"
										d="M.85,15.211a.859.859,0,0,1,.775-.923h13.75a.937.937,0,0,1,0,1.846H1.625A.859.859,0,0,1,.85,15.211Zm0-4.437a.859.859,0,0,1,.775-.923h13.75a.859.859,0,0,1,.775.923.859.859,0,0,1-.775.923H1.625A.859.859,0,0,1,.85,10.775Zm0-4.555A.859.859,0,0,1,1.625,5.3h13.75a.859.859,0,0,1,.775.923.859.859,0,0,1-.775.923H1.625A.859.859,0,0,1,.85,6.22Zm0-4.447A.859.859,0,0,1,1.625.85h13.75a.859.859,0,0,1,.775.923.859.859,0,0,1-.775.923H1.625A.859.859,0,0,1,.85,1.773Z"
										transform="translate(7.5 7.476)"
										strokeWidth={0}
									/>
								),
								description: 'Justify',
							},
						],
					}}
				/>
				<div className="_combineEditors">
					<EachSimpleEditor
						subComponentName={subComponentName}
						pseudoState={pseudoState}
						prop="fontStyle"
						iterateProps={iterateProps}
						selectorPref={selectorPref}
						styleProps={styleProps}
						selectedComponent={selectedComponent}
						saveStyle={saveStyle}
						properties={properties}
						editorDef={{
							type: SimpleEditorType.Icons,
							iconButtonsBackground: false,
							iconButtonOptions: [
								{
									name: 'normal',
									description: 'Normal',
									icon: (
										<path
											id="Path_128"
											data-name="Path 128"
											d="M1.523,0V-14.316H3.467l7.52,11.24v-11.24H12.8V0H10.859L3.34-11.25V0Z"
											transform="translate(9 23.158)"
											strokeWidth={0}
										/>
									),
								},
								{
									name: 'italic',
									description: 'Italic',
									width: '14',
									height: '32',
									icon: (
										<path
											id="Path_130"
											data-name="Path 130"
											d="M5.353-12.715a1.173,1.173,0,0,1,.862.352,1.173,1.173,0,0,1,.352.862,1.169,1.169,0,0,1-.358.856,1.169,1.169,0,0,1-.856.358,1.169,1.169,0,0,1-.856-.358,1.169,1.169,0,0,1-.358-.856,1.173,1.173,0,0,1,.352-.862A1.173,1.173,0,0,1,5.353-12.715Zm.158,4.822L3.106.621a6.378,6.378,0,0,0-.243,1.032.44.44,0,0,0,.115.316.365.365,0,0,0,.273.121A.775.775,0,0,0,3.689,1.9,7.28,7.28,0,0,0,5.086.341l.425.279A8.6,8.6,0,0,1,3.568,2.746a2.608,2.608,0,0,1-1.579.644,1.139,1.139,0,0,1-.814-.3.983.983,0,0,1-.316-.747,6.226,6.226,0,0,1,.3-1.494L2.742-4.59a8.746,8.746,0,0,0,.389-1.676A.562.562,0,0,0,2.942-6.7a.742.742,0,0,0-.516-.17,9.01,9.01,0,0,0-1.105.134v-.474Z"
											transform="translate(3.441 20.422)"
											strokeWidth={0}
										/>
									),
								},
							],
						}}
					/>
					<EachSimpleEditor
						subComponentName={subComponentName}
						pseudoState={pseudoState}
						prop="fontWeight"
						iterateProps={iterateProps}
						selectorPref={selectorPref}
						styleProps={styleProps}
						selectedComponent={selectedComponent}
						saveStyle={saveStyle}
						properties={properties}
						editorDef={{
							type: SimpleEditorType.Icons,
							iconButtonsBackground: false,
							iconButtonOptions: [
								{
									name: 'bold',
									description: 'Bold',
									icon: (
										<path
											id="Path_131"
											data-name="Path 131"
											d="M1.475-14.316h9.117a4.97,4.97,0,0,1,3.5,1.129,3.655,3.655,0,0,1,1.22,2.8,3.528,3.528,0,0,1-.871,2.4,3.878,3.878,0,0,1-1.7,1.054,4.411,4.411,0,0,1,2.5,1.4,3.858,3.858,0,0,1,.8,2.5,4.3,4.3,0,0,1-.57,2.2A4.2,4.2,0,0,1,13.914.714a5.146,5.146,0,0,1-1.849.516,21.333,21.333,0,0,1-2.183.215H1.475ZM6.388-8.134H8.506a2.434,2.434,0,0,0,1.586-.392,1.43,1.43,0,0,0,.446-1.134,1.348,1.348,0,0,0-.446-1.075,2.4,2.4,0,0,0-1.554-.387H6.388Zm0,6.193H8.872a2.731,2.731,0,0,0,1.774-.446,1.5,1.5,0,0,0,.516-1.2,1.389,1.389,0,0,0-.511-1.124,2.854,2.854,0,0,0-1.79-.425H6.388Z"
											transform="translate(7.332 22.436)"
											strokeWidth={0}
										/>
									),
								},
							],
						}}
					/>
				</div>
				<EachSimpleEditor
					subComponentName={subComponentName}
					pseudoState={pseudoState}
					prop="color"
					iterateProps={iterateProps}
					selectorPref={selectorPref}
					styleProps={styleProps}
					selectedComponent={selectedComponent}
					saveStyle={saveStyle}
					properties={properties}
					editorDef={{
						type: SimpleEditorType.Color,
					}}
				/>
			</div>
			<div className="_spacer" />
			<div className="_combineEditors _spaceBetween">
				<EachSimpleEditor
					subComponentName={subComponentName}
					pseudoState={pseudoState}
					prop="textDecorationLine"
					iterateProps={iterateProps}
					selectorPref={selectorPref}
					styleProps={styleProps}
					selectedComponent={selectedComponent}
					saveStyle={saveStyle}
					properties={properties}
					className="_onePart"
					editorDef={{
						type: SimpleEditorType.Icons,
						multiSelect: true,
						iconButtonsBackground: false,
						iconButtonOptions: [
							{
								name: 'underline',
								description: 'Text Decoration Line : Underline',
								width: '24',
								icon: (
									<path
										id="Path_132"
										data-name="Path 132"
										d="M19,20v2H5V20Zm-3-6.785a4,4,0,0,1-5.74,3.4A3.75,3.75,0,0,1,8,13.085V5.005H6v8.21a6,6,0,0,0,8,5.44,5.851,5.851,0,0,0,4-5.65v-8H16ZM16,5h0ZM8,5H8Z"
										transform="translate(0 4)"
										strokeWidth={0}
									/>
								),
							},
							{
								name: 'overline',
								description: 'Text Decoration Line : Overline',
								width: '24',
								icon: (
									<g
										id="Group_64"
										data-name="Group 64"
										transform="translate(-1272 -248)"
									>
										<path
											id="Path_132"
											data-name="Path 132"
											d="M16,10.785a4,4,0,0,0-5.74-3.4A3.75,3.75,0,0,0,8,10.915v8.08H6v-8.21a6,6,0,0,1,8-5.44,5.851,5.851,0,0,1,4,5.65v8H16ZM16,19h0ZM8,19H8Z"
											transform="translate(1276 252)"
											strokeWidth={0}
										/>
										<path
											id="Path_133"
											data-name="Path 133"
											d="M19,20v2H5V20Z"
											transform="translate(1276 234)"
											strokeWidth={0}
										/>
									</g>
								),
							},
							{
								name: 'line-through',
								description: 'Text Decoration Line : Line Through',
								width: '24',
								icon: (
									<path
										id="Path_134"
										data-name="Path 134"
										d="M3,12.2H21v1.5H16.634a3.6,3.6,0,0,1,.349,1.593A3.252,3.252,0,0,1,15.669,18,5.551,5.551,0,0,1,12.2,19a6.443,6.443,0,0,1-2.623-.539,4.464,4.464,0,0,1-1.893-1.488,3.668,3.668,0,0,1-.67-2.156V14.7h2v.113a2.183,2.183,0,0,0,.854,1.831,3.69,3.69,0,0,0,2.328.679,3.388,3.388,0,0,0,2.077-.546,1.733,1.733,0,0,0,.7-1.467,1.7,1.7,0,0,0-.647-1.434,3.007,3.007,0,0,0-.275-.177H3ZM16.345,7.06a4.181,4.181,0,0,0-1.721-1.514A5.627,5.627,0,0,0,12.111,5,5.161,5.161,0,0,0,8.747,6.062,3.363,3.363,0,0,0,7.44,8.768,3.229,3.229,0,0,0,7.762,10.2h2.6c-.083-.054-.185-.106-.253-.161a1.607,1.607,0,0,1-.653-1.3,1.8,1.8,0,0,1,.688-1.511,3.13,3.13,0,0,1,1.969-.552,3.048,3.048,0,0,1,2.106.669,2.351,2.351,0,0,1,.736,1.833v.113h2V9.173A3.9,3.9,0,0,0,16.345,7.06Z"
										transform="translate(4 5.499)"
										strokeWidth={0}
									/>
								),
							},
						],
					}}
				/>
				<EachSimpleEditor
					subComponentName={subComponentName}
					pseudoState={pseudoState}
					prop="textDecorationThickness"
					placeholder="Thickness"
					iterateProps={iterateProps}
					selectorPref={selectorPref}
					styleProps={styleProps}
					selectedComponent={selectedComponent}
					saveStyle={saveStyle}
					properties={properties}
					editorDef={{ type: SimpleEditorType.PixelSize, rangeMin: 0, rangeMax: 30 }}
					className="_confineWidth _twoParts"
				/>
			</div>
			<div className="_combineEditors _spaceBetween" title="Text Decoration">
				<EachSimpleEditor
					subComponentName={subComponentName}
					pseudoState={pseudoState}
					prop="textDecorationStyle"
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
								description: 'Text Decoration Style : Solid',
								icon: (
									<path
										id="Path_134"
										data-name="Path 134"
										d="M26.869,20v2H5V20Z"
										transform="translate(0.065 -5)"
										strokeWidth={0}
									/>
								),
							},
							{
								name: 'double',
								description: 'Text Decoration Style : Double',
								icon: (
									<>
										<path
											id="Path_134"
											data-name="Path 134"
											d="M26.869,20v2H5V20Z"
											transform="translate(0.065 -3)"
											strokeWidth={0}
										/>
										<path
											id="Path_135"
											data-name="Path 135"
											d="M26.869,20v2H5V20Z"
											transform="translate(0.065 -7)"
											strokeWidth={0}
										/>
									</>
								),
							},
							{
								name: 'dotted',
								description: 'Text Decoration Style : Dotted',
								icon: (
									<g
										id="Group_64"
										data-name="Group 64"
										transform="translate(-1272 -246)"
									>
										<circle
											id="Ellipse_5"
											data-name="Ellipse 5"
											cx="1"
											cy="1"
											r="1"
											transform="translate(1277 261)"
											strokeWidth={0}
										/>
										<circle
											id="Ellipse_6"
											data-name="Ellipse 6"
											cx="1"
											cy="1"
											r="1"
											transform="translate(1280 261)"
											strokeWidth={0}
										/>
										<circle
											id="Ellipse_7"
											data-name="Ellipse 7"
											cx="1"
											cy="1"
											r="1"
											transform="translate(1283 261)"
											strokeWidth={0}
										/>
										<circle
											id="Ellipse_8"
											data-name="Ellipse 8"
											cx="1"
											cy="1"
											r="1"
											transform="translate(1286 261)"
											strokeWidth={0}
										/>
										<circle
											id="Ellipse_9"
											data-name="Ellipse 9"
											cx="1"
											cy="1"
											r="1"
											transform="translate(1289 261)"
											strokeWidth={0}
										/>
										<circle
											id="Ellipse_10"
											data-name="Ellipse 10"
											cx="1"
											cy="1"
											r="1"
											transform="translate(1292 261)"
											strokeWidth={0}
										/>
										<circle
											id="Ellipse_11"
											data-name="Ellipse 11"
											cx="1"
											cy="1"
											r="1"
											transform="translate(1295 261)"
											strokeWidth={0}
										/>
										<circle
											id="Ellipse_12"
											data-name="Ellipse 12"
											cx="1"
											cy="1"
											r="1"
											transform="translate(1298 261)"
											strokeWidth={0}
										/>
									</g>
								),
							},
							{
								name: 'dashed',
								description: 'Text Decoration Style : Dashed',
								icon: (
									<g
										id="Group_65"
										data-name="Group 65"
										transform="translate(-1272.076 -248)"
									>
										<path
											id="Path_135"
											data-name="Path 135"
											d="M9.152,20v2H5V20Z"
											transform="translate(1272 243)"
											strokeWidth={0}
										/>
										<path
											id="Path_136"
											data-name="Path 136"
											d="M9.152,20v2H5V20Z"
											transform="translate(1278 243)"
											strokeWidth={0}
										/>
										<path
											id="Path_137"
											data-name="Path 137"
											d="M9.152,20v2H5V20Z"
											transform="translate(1284 243)"
											strokeWidth={0}
										/>
										<path
											id="Path_138"
											data-name="Path 138"
											d="M9.152,20v2H5V20Z"
											transform="translate(1290 243)"
											strokeWidth={0}
										/>
									</g>
								),
							},
							{
								name: 'wavy',
								description: 'Text Decoration Style : Wavy',
								icon: (
									<g
										id="Group_65"
										data-name="Group 65"
										transform="translate(-1270.67 -248)"
									>
										<path
											id="Path_139"
											data-name="Path 139"
											d="M1403.964-19.955c.013.013-.028,1.77,0,1.749,1.13.479,2.447,3.492,4.6,3.75,2.26-.28,3.487-3.048,4.729-3.75,0,0,0-1.747,0-1.751-1.62-.016-3.884,3.975-4.513,3.776C1408.036-15.972,1406.048-20.027,1403.964-19.955Z"
											transform="translate(-126.615 281.206)"
											strokeWidth={0}
										/>
										<path
											id="Path_140"
											data-name="Path 140"
											d="M1404-19.952c0-.005,0,1.763,0,1.749,1.13.479,2.447,3.492,4.6,3.75,2.26-.28,3.487-3.048,4.729-3.75,0,.043-.014-1.739,0-1.749-1.62-.016-3.884,3.973-4.513,3.774C1408.071-15.969,1406.083-20.023,1404-19.952Z"
											transform="translate(-117.324 281.202)"
											strokeWidth={0}
										/>
									</g>
								),
							},
						],
					}}
				/>
				<div className="_spacer" />
				<EachSimpleEditor
					subComponentName={subComponentName}
					pseudoState={pseudoState}
					prop="textDecorationColor"
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
			<div className="_combineEditors" title="Line Height">
				<svg
					width="15"
					height="15"
					viewBox="0 0 15 15"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M1.98153 12H0.294034L3.36648 3.27273H5.31818L8.39489 12H6.70739L4.37642 5.0625H4.30824L1.98153 12ZM2.03693 8.57812H6.6392V9.84801H2.03693V8.57812Z"
						fill="#333333"
						fillOpacity="0.7"
					/>
					<line x1="12.5" y1="1" x2="12.5" y2="13" stroke="black" />
					<line x1="10" y1="0.5" x2="15" y2="0.5" stroke="black" />
					<line x1="10" y1="13.5" x2="15" y2="13.5" stroke="black" />
				</svg>
				<EachSimpleEditor
					subComponentName={subComponentName}
					pseudoState={pseudoState}
					prop="lineHeight"
					placeholder="Line Height"
					iterateProps={iterateProps}
					selectorPref={selectorPref}
					styleProps={styleProps}
					selectedComponent={selectedComponent}
					saveStyle={saveStyle}
					properties={properties}
					editorDef={{ type: SimpleEditorType.PixelSize, rangeMin: 0, rangeMax: 200 }}
					className="_confineWidth"
				/>
			</div>
			<div className="_combineEditors" title="Letter Spacing">
				<svg
					width="14"
					height="17"
					viewBox="0 0 14 17"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M3.98153 10H2.29403L5.36648 1.27273H7.31818L10.3949 10H8.70739L6.37642 3.0625H6.30824L3.98153 10ZM4.03693 6.57812H8.6392V7.84801H4.03693V6.57812Z"
						fill="#333333"
						fillOpacity="0.7"
					/>
					<line x1="13" y1="14.5" x2="1" y2="14.5" stroke="black" />
					<line x1="13.5" y1="12" x2="13.5" y2="17" stroke="black" />
					<line x1="0.5" y1="12" x2="0.5" y2="17" stroke="black" />
				</svg>
				<EachSimpleEditor
					subComponentName={subComponentName}
					pseudoState={pseudoState}
					prop="letterSpacing"
					placeholder="Letter Spacing"
					iterateProps={iterateProps}
					selectorPref={selectorPref}
					styleProps={styleProps}
					selectedComponent={selectedComponent}
					saveStyle={saveStyle}
					properties={properties}
					editorDef={{ type: SimpleEditorType.PixelSize, rangeMin: 0, rangeMax: 30 }}
					className="_confineWidth"
				/>
			</div>

			<EachSimpleEditor
				subComponentName={subComponentName}
				pseudoState={pseudoState}
				prop="textShadow"
				placeholder="Box Shadow"
				iterateProps={iterateProps}
				selectorPref={selectorPref}
				styleProps={styleProps}
				selectedComponent={selectedComponent}
				saveStyle={saveStyle}
				properties={properties}
				editorDef={{ type: SimpleEditorType.TextShadow }}
			/>
		</>
	);
}

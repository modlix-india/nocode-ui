import React, { CSSProperties } from 'react';
import {
	EachSimpleEditor,
	StyleEditorsProps,
	SimpleEditorType,
	SimpleEditorMultipleValueType,
} from './simpleEditors';
import { DropdownOptions } from './simpleEditors/Dropdown';

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
	isDetailStyleEditor,
}: StyleEditorsProps) {
	let fonts: DropdownOptions = [...FONT_FAMILIES];
	if (appDef?.properties?.fontPacks) {
		fonts = Object.values(appDef.properties.fontPacks)
			.map((e: any) => ({ name: e.name, displayName: e.name }))
			.concat(fonts);
	}

	if (isDetailStyleEditor) {
		return (
			<>
				<div className="_simpleLabel">Text Decoration Line :</div>
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
				<div className="_simpleLabel">Word Spacing :</div>
				<div className="_combineEditors" title="Word Spacing">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="32"
						height="32"
						viewBox="0 0 32 32"
					>
						<g id="Group_67" data-name="Group 67" transform="translate(-1212 -332.073)">
							<path
								id="Path_145"
								data-name="Path 145"
								d="M2.211-3.245,3.542-6.908h.022L4.873-3.245Zm.781-4.609L-.066,0H1l.88-2.365H5.2L6.061,0H7.216L4.147-7.854Zm4.873,0V0H8.8V-.759h.022a1.506,1.506,0,0,0,.38.424,2,2,0,0,0,.479.27,2.6,2.6,0,0,0,.511.143,2.811,2.811,0,0,0,.468.044A2.641,2.641,0,0,0,11.8-.11a2.282,2.282,0,0,0,.814-.633,2.693,2.693,0,0,0,.484-.94,4.012,4.012,0,0,0,.159-1.144,3.888,3.888,0,0,0-.165-1.144,2.891,2.891,0,0,0-.49-.951,2.338,2.338,0,0,0-.814-.655,2.565,2.565,0,0,0-1.149-.242A2.71,2.71,0,0,0,9.548-5.6a1.4,1.4,0,0,0-.726.688H8.8V-7.854Zm4.4,4.961a3.741,3.741,0,0,1-.088.814,2.153,2.153,0,0,1-.286.7,1.5,1.5,0,0,1-.523.5,1.6,1.6,0,0,1-.809.187,1.736,1.736,0,0,1-.825-.181,1.6,1.6,0,0,1-.556-.479,2,2,0,0,1-.313-.687,3.277,3.277,0,0,1-.1-.809A3.3,3.3,0,0,1,8.86-3.63a2.047,2.047,0,0,1,.3-.687,1.609,1.609,0,0,1,.539-.49,1.606,1.606,0,0,1,.8-.187,1.67,1.67,0,0,1,.786.176,1.563,1.563,0,0,1,.55.473,2.093,2.093,0,0,1,.319.677A2.908,2.908,0,0,1,12.265-2.893Zm9.009-.968h.968a2.248,2.248,0,0,0-.264-.874,1.952,1.952,0,0,0-.534-.611A2.21,2.21,0,0,0,20.7-5.7a3.437,3.437,0,0,0-.907-.115,2.753,2.753,0,0,0-1.177.236,2.349,2.349,0,0,0-.841.649,2.76,2.76,0,0,0-.5.968A4.173,4.173,0,0,0,17.1-2.772a3.832,3.832,0,0,0,.17,1.171,2.569,2.569,0,0,0,.506.919,2.229,2.229,0,0,0,.836.594,2.962,2.962,0,0,0,1.149.209,2.471,2.471,0,0,0,1.721-.572,2.619,2.619,0,0,0,.787-1.628h-.957a1.639,1.639,0,0,1-.479,1.023,1.53,1.53,0,0,1-1.083.363A1.548,1.548,0,0,1,19-.869a1.477,1.477,0,0,1-.517-.468A2.064,2.064,0,0,1,18.188-2a3.163,3.163,0,0,1-.094-.77,3.868,3.868,0,0,1,.088-.83,2.083,2.083,0,0,1,.292-.709,1.51,1.51,0,0,1,.545-.5,1.743,1.743,0,0,1,.847-.187,1.419,1.419,0,0,1,.946.3A1.425,1.425,0,0,1,21.274-3.861ZM24-2.794a3.741,3.741,0,0,1,.088-.814,2.153,2.153,0,0,1,.286-.7,1.489,1.489,0,0,1,.528-.5,1.606,1.606,0,0,1,.8-.187,1.736,1.736,0,0,1,.825.181,1.6,1.6,0,0,1,.556.478,2,2,0,0,1,.313.688,3.277,3.277,0,0,1,.1.809,3.3,3.3,0,0,1-.094.781,2.047,2.047,0,0,1-.3.688,1.609,1.609,0,0,1-.539.49,1.606,1.606,0,0,1-.8.187,1.67,1.67,0,0,1-.787-.176,1.563,1.563,0,0,1-.55-.473,2.093,2.093,0,0,1-.319-.677A2.908,2.908,0,0,1,24-2.794ZM28.4,0V-7.854h-.935v2.926h-.022a1.506,1.506,0,0,0-.38-.424,2.156,2.156,0,0,0-.478-.275,2.4,2.4,0,0,0-.506-.148,2.77,2.77,0,0,0-.473-.044,2.588,2.588,0,0,0-1.139.236,2.337,2.337,0,0,0-.814.638A2.693,2.693,0,0,0,23.171-4a4.012,4.012,0,0,0-.16,1.144,3.887,3.887,0,0,0,.165,1.144,2.828,2.828,0,0,0,.49.946,2.366,2.366,0,0,0,.814.649A2.565,2.565,0,0,0,25.63.121a2.772,2.772,0,0,0,1.089-.209,1.376,1.376,0,0,0,.726-.682h.022V0Z"
								transform="translate(1213.832 349)"
								fill="#333"
								fillOpacity="0.7"
							/>
							<g id="Group_66" data-name="Group 66" transform="translate(1223.5 338)">
								<line
									id="Line_1"
									data-name="Line 1"
									x1="7"
									transform="translate(1 14.5)"
									fill="none"
									stroke="#000"
									strokeWidth="1"
								/>
								<line
									id="Line_2"
									data-name="Line 2"
									y2="5"
									transform="translate(8.5 12)"
									fill="none"
									stroke="#000"
									strokeWidth="1"
								/>
								<line
									id="Line_3"
									data-name="Line 3"
									y2="5"
									transform="translate(0.5 12)"
									fill="none"
									stroke="#000"
									strokeWidth="1"
								/>
							</g>
						</g>
					</svg>

					<EachSimpleEditor
						subComponentName={subComponentName}
						pseudoState={pseudoState}
						prop="wordSpacing"
						placeholder="Word"
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
				<div className="_simpleLabel">Intendation :</div>
				<div className="_combineEditors" title="Text Indentation">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="15.163"
						viewBox="0 0 16 15.163"
					>
						<path
							id="Path_141"
							data-name="Path 141"
							d="M16.553,20v2.166H5V20Z"
							transform="translate(-0.553 -20)"
							fill="#333"
							fillOpacity="0.7"
						/>
						<path
							id="Path_142"
							data-name="Path 142"
							d="M21,20v2.166H5V20Z"
							transform="translate(-5 -15.668)"
							fill="#333"
							fillOpacity="0.7"
						/>
						<path
							id="Path_143"
							data-name="Path 143"
							d="M21,20v2.166H5V20Z"
							transform="translate(-5 -11.335)"
							fill="#333"
							fillOpacity="0.7"
						/>
						<path
							id="Path_144"
							data-name="Path 144"
							d="M21,20v2.166H5V20Z"
							transform="translate(-5 -7.003)"
							fill="#333"
							fillOpacity="0.7"
						/>
					</svg>

					<EachSimpleEditor
						subComponentName={subComponentName}
						pseudoState={pseudoState}
						prop="textIndent"
						placeholder="Intendation"
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
				<div className="_combineEditors">
					<div className="_simpleLabel">Transform :</div>
					<EachSimpleEditor
						subComponentName={subComponentName}
						pseudoState={pseudoState}
						prop="textTransform"
						placeholder="Transform"
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
									description: 'Default',
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
									name: 'uppercase',
									description: 'Text Transform : Uppercase',
									icon: (
										<path
											id="Path_145"
											data-name="Path 145"
											d="M4.02-5.9l2.42-6.66h.04L8.86-5.9Zm1.42-8.38L-.12,0H1.82l1.6-4.3H9.46L11.02,0h2.1L7.54-14.28ZM16.42-8.14v-4.54h3.8a9.278,9.278,0,0,1,1.17.07,2.6,2.6,0,0,1,.97.31,1.706,1.706,0,0,1,.66.68,2.52,2.52,0,0,1,.24,1.2,2.062,2.062,0,0,1-.71,1.71,3.747,3.747,0,0,1-2.33.57Zm-1.9-6.14V0h6.9a4.678,4.678,0,0,0,1.87-.35,4.149,4.149,0,0,0,1.36-.92,3.809,3.809,0,0,0,.83-1.31,4.262,4.262,0,0,0,.28-1.52,3.591,3.591,0,0,0-.7-2.24,3.287,3.287,0,0,0-2.02-1.2v-.04a3.242,3.242,0,0,0,1.57-1.23,3.484,3.484,0,0,0,.55-1.97,3.225,3.225,0,0,0-.49-1.82,3.72,3.72,0,0,0-1.19-1.16,2.444,2.444,0,0,0-.77-.3,8.013,8.013,0,0,0-.97-.15q-.52-.05-1.05-.06t-.99-.01ZM16.42-1.6V-6.54h4.34a6.006,6.006,0,0,1,1.16.11,2.891,2.891,0,0,1,.99.38,2.017,2.017,0,0,1,.69.73,2.334,2.334,0,0,1,.26,1.16,2.48,2.48,0,0,1-.71,1.88,2.731,2.731,0,0,1-1.97.68Z"
											transform="translate(3.18 23.14)"
											strokeWidth={0}
										/>
									),
								},
								{
									name: 'lowercase',
									description: 'Text Trasnform : Lowercase',

									icon: (
										<path
											id="Path_145"
											data-name="Path 145"
											d="M10.44-.04A2.4,2.4,0,0,1,9.22.22,1.463,1.463,0,0,1,8.17-.15a1.608,1.608,0,0,1-.39-1.21A4.067,4.067,0,0,1,6.15-.15,5.388,5.388,0,0,1,4.14.22,5.385,5.385,0,0,1,2.81.06a3.092,3.092,0,0,1-1.09-.5,2.4,2.4,0,0,1-.73-.89A2.994,2.994,0,0,1,.72-2.66a3.037,3.037,0,0,1,.3-1.44,2.617,2.617,0,0,1,.79-.91,3.62,3.62,0,0,1,1.12-.53q.63-.18,1.29-.3.7-.14,1.33-.21a7.41,7.41,0,0,0,1.11-.2,1.849,1.849,0,0,0,.76-.38.928.928,0,0,0,.28-.73,1.7,1.7,0,0,0-.21-.9,1.44,1.44,0,0,0-.54-.52,2.2,2.2,0,0,0-.74-.24,5.588,5.588,0,0,0-.81-.06,3.6,3.6,0,0,0-1.8.41,1.74,1.74,0,0,0-.78,1.55H1.12a3.672,3.672,0,0,1,.4-1.62,3.033,3.033,0,0,1,.96-1.07,4.028,4.028,0,0,1,1.37-.59,7.235,7.235,0,0,1,1.65-.18,9.679,9.679,0,0,1,1.39.1,3.633,3.633,0,0,1,1.25.41,2.4,2.4,0,0,1,.9.87,2.784,2.784,0,0,1,.34,1.46v5.32a3.979,3.979,0,0,0,.07.88q.07.28.47.28a1.684,1.684,0,0,0,.52-.1ZM7.68-5.34a2.116,2.116,0,0,1-.84.35q-.52.11-1.09.18T4.6-4.65a4.228,4.228,0,0,0-1.04.29,1.892,1.892,0,0,0-.75.57,1.6,1.6,0,0,0-.29,1.01,1.382,1.382,0,0,0,.17.71,1.417,1.417,0,0,0,.44.47,1.846,1.846,0,0,0,.63.26,3.5,3.5,0,0,0,.76.08,4.027,4.027,0,0,0,1.44-.23,3.029,3.029,0,0,0,.98-.58,2.288,2.288,0,0,0,.56-.76,1.922,1.922,0,0,0,.18-.77Zm4.4-8.94V0h1.7V-1.38h.04a2.739,2.739,0,0,0,.69.77,3.634,3.634,0,0,0,.87.49,4.722,4.722,0,0,0,.93.26,5.11,5.11,0,0,0,.85.08A4.8,4.8,0,0,0,19.23-.2a4.149,4.149,0,0,0,1.48-1.15,4.9,4.9,0,0,0,.88-1.71,7.3,7.3,0,0,0,.29-2.08,7.068,7.068,0,0,0-.3-2.08,5.256,5.256,0,0,0-.89-1.73,4.251,4.251,0,0,0-1.48-1.19,4.664,4.664,0,0,0-2.09-.44,4.927,4.927,0,0,0-1.98.39,2.545,2.545,0,0,0-1.32,1.25h-.04v-5.34Zm8,9.02a6.8,6.8,0,0,1-.16,1.48A3.915,3.915,0,0,1,19.4-2.5a2.733,2.733,0,0,1-.95.9,2.907,2.907,0,0,1-1.47.34,3.155,3.155,0,0,1-1.5-.33,2.911,2.911,0,0,1-1.01-.87,3.638,3.638,0,0,1-.57-1.25,5.959,5.959,0,0,1-.18-1.47,6,6,0,0,1,.17-1.42,3.721,3.721,0,0,1,.55-1.25,2.926,2.926,0,0,1,.98-.89,2.919,2.919,0,0,1,1.46-.34,3.036,3.036,0,0,1,1.43.32,2.842,2.842,0,0,1,1,.86,3.805,3.805,0,0,1,.58,1.23A5.287,5.287,0,0,1,20.08-5.26Z"
											transform="translate(4.7 23.03)"
											strokeWidth={0}
										/>
									),
								},
								{
									name: 'capitalize',
									description: 'Text Tranform : Capitalize',
									icon: (
										<path
											id="Path_145"
											data-name="Path 145"
											d="M4.02-5.9l2.42-6.66h.04L8.86-5.9Zm1.42-8.38L-.12,0H1.82l1.6-4.3H9.46L11.02,0h2.1L7.54-14.28Zm8.86,0V0H16V-1.38h.04a2.739,2.739,0,0,0,.69.77,3.634,3.634,0,0,0,.87.49,4.722,4.722,0,0,0,.93.26,5.11,5.11,0,0,0,.85.08A4.8,4.8,0,0,0,21.45-.2a4.149,4.149,0,0,0,1.48-1.15,4.9,4.9,0,0,0,.88-1.71,7.3,7.3,0,0,0,.29-2.08,7.068,7.068,0,0,0-.3-2.08,5.256,5.256,0,0,0-.89-1.73,4.251,4.251,0,0,0-1.48-1.19,4.664,4.664,0,0,0-2.09-.44,4.927,4.927,0,0,0-1.98.39,2.545,2.545,0,0,0-1.32,1.25H16v-5.34Zm8,9.02a6.8,6.8,0,0,1-.16,1.48,3.915,3.915,0,0,1-.52,1.28,2.733,2.733,0,0,1-.95.9,2.907,2.907,0,0,1-1.47.34,3.155,3.155,0,0,1-1.5-.33,2.911,2.911,0,0,1-1.01-.87,3.638,3.638,0,0,1-.57-1.25,5.959,5.959,0,0,1-.18-1.47,6,6,0,0,1,.17-1.42,3.721,3.721,0,0,1,.55-1.25,2.926,2.926,0,0,1,.98-.89,2.919,2.919,0,0,1,1.46-.34,3.036,3.036,0,0,1,1.43.32,2.842,2.842,0,0,1,1,.86,3.805,3.805,0,0,1,.58,1.23A5.287,5.287,0,0,1,22.3-5.26Z"
											transform="translate(4.01 23.03)"
											strokeWidth={0}
										/>
									),
								},
							],
						}}
					/>
				</div>

				<div className="_combineEditors">
					<div className="_simpleLabel">Word Break :</div>
					<EachSimpleEditor
						subComponentName={subComponentName}
						pseudoState={pseudoState}
						prop="wordBreak"
						placeholder="Word Break"
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
									description: 'Default',
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
									name: 'keep-all',
									description: 'Text Transform : Keep All',
									icon: (
										<path
											id="Path_145"
											data-name="Path 145"
											d="M2.211-3.245,3.542-6.908h.022L4.873-3.245Zm.781-4.609L-.066,0H1l.88-2.365H5.2L6.061,0H7.216L4.147-7.854Zm4.873,0V0H8.8V-.759h.022a1.506,1.506,0,0,0,.38.424,2,2,0,0,0,.479.27,2.6,2.6,0,0,0,.511.143,2.811,2.811,0,0,0,.468.044A2.641,2.641,0,0,0,11.8-.11a2.282,2.282,0,0,0,.814-.633,2.693,2.693,0,0,0,.484-.94,4.012,4.012,0,0,0,.159-1.144,3.888,3.888,0,0,0-.165-1.144,2.891,2.891,0,0,0-.49-.951,2.338,2.338,0,0,0-.814-.655,2.565,2.565,0,0,0-1.149-.242A2.71,2.71,0,0,0,9.548-5.6a1.4,1.4,0,0,0-.726.688H8.8V-7.854Zm4.4,4.961a3.741,3.741,0,0,1-.088.814,2.153,2.153,0,0,1-.286.7,1.5,1.5,0,0,1-.523.5,1.6,1.6,0,0,1-.809.187,1.736,1.736,0,0,1-.825-.181,1.6,1.6,0,0,1-.556-.479,2,2,0,0,1-.313-.687,3.277,3.277,0,0,1-.1-.809A3.3,3.3,0,0,1,8.86-3.63a2.047,2.047,0,0,1,.3-.687,1.609,1.609,0,0,1,.539-.49,1.606,1.606,0,0,1,.8-.187,1.67,1.67,0,0,1,.786.176,1.563,1.563,0,0,1,.55.473,2.093,2.093,0,0,1,.319.677A2.908,2.908,0,0,1,12.265-2.893Zm9.009-.968h.968a2.248,2.248,0,0,0-.264-.874,1.952,1.952,0,0,0-.534-.611A2.21,2.21,0,0,0,20.7-5.7a3.437,3.437,0,0,0-.907-.115,2.753,2.753,0,0,0-1.177.236,2.349,2.349,0,0,0-.841.649,2.76,2.76,0,0,0-.5.968A4.173,4.173,0,0,0,17.1-2.772a3.832,3.832,0,0,0,.17,1.171,2.569,2.569,0,0,0,.506.919,2.229,2.229,0,0,0,.836.594,2.962,2.962,0,0,0,1.149.209,2.471,2.471,0,0,0,1.721-.572,2.619,2.619,0,0,0,.787-1.628h-.957a1.639,1.639,0,0,1-.479,1.023,1.53,1.53,0,0,1-1.083.363A1.548,1.548,0,0,1,19-.869a1.477,1.477,0,0,1-.517-.468A2.064,2.064,0,0,1,18.188-2a3.163,3.163,0,0,1-.094-.77,3.868,3.868,0,0,1,.088-.83,2.083,2.083,0,0,1,.292-.709,1.51,1.51,0,0,1,.545-.5,1.743,1.743,0,0,1,.847-.187,1.419,1.419,0,0,1,.946.3A1.425,1.425,0,0,1,21.274-3.861ZM24-2.794a3.741,3.741,0,0,1,.088-.814,2.153,2.153,0,0,1,.286-.7,1.489,1.489,0,0,1,.528-.5,1.606,1.606,0,0,1,.8-.187,1.736,1.736,0,0,1,.825.181,1.6,1.6,0,0,1,.556.478,2,2,0,0,1,.313.688,3.277,3.277,0,0,1,.1.809,3.3,3.3,0,0,1-.094.781,2.047,2.047,0,0,1-.3.688,1.609,1.609,0,0,1-.539.49,1.606,1.606,0,0,1-.8.187,1.67,1.67,0,0,1-.787-.176,1.563,1.563,0,0,1-.55-.473,2.093,2.093,0,0,1-.319-.677A2.908,2.908,0,0,1,24-2.794ZM28.4,0V-7.854h-.935v2.926h-.022a1.506,1.506,0,0,0-.38-.424,2.156,2.156,0,0,0-.478-.275,2.4,2.4,0,0,0-.506-.148,2.77,2.77,0,0,0-.473-.044,2.588,2.588,0,0,0-1.139.236,2.337,2.337,0,0,0-.814.638A2.693,2.693,0,0,0,23.171-4a4.012,4.012,0,0,0-.16,1.144,3.887,3.887,0,0,0,.165,1.144,2.828,2.828,0,0,0,.49.946,2.366,2.366,0,0,0,.814.649A2.565,2.565,0,0,0,25.63.121a2.772,2.772,0,0,0,1.089-.209,1.376,1.376,0,0,0,.726-.682h.022V0Z"
											transform="translate(1.832 15.879)"
											strokeWidth={0}
										/>
									),
								},
								{
									name: 'break-word',
									description: 'Text Trasnform : Break Word',
									icon: (
										<path
											id="Path_146"
											data-name="Path 146"
											d="M2.211-3.245,3.542-6.908h.022L4.873-3.245Zm.781-4.609L-.066,0H1l.88-2.365H5.2L6.061,0H7.216L4.147-7.854Zm4.873,0V0H8.8V-.759h.022a1.506,1.506,0,0,0,.38.424,2,2,0,0,0,.479.27,2.6,2.6,0,0,0,.511.143,2.811,2.811,0,0,0,.468.044A2.641,2.641,0,0,0,11.8-.11a2.282,2.282,0,0,0,.814-.633,2.693,2.693,0,0,0,.484-.94,4.012,4.012,0,0,0,.159-1.144,3.888,3.888,0,0,0-.165-1.144,2.891,2.891,0,0,0-.49-.951,2.338,2.338,0,0,0-.814-.655,2.565,2.565,0,0,0-1.149-.242A2.71,2.71,0,0,0,9.548-5.6a1.4,1.4,0,0,0-.726.688H8.8V-7.854Zm4.4,4.961a3.741,3.741,0,0,1-.088.814,2.153,2.153,0,0,1-.286.7,1.5,1.5,0,0,1-.523.5,1.6,1.6,0,0,1-.809.187,1.736,1.736,0,0,1-.825-.181,1.6,1.6,0,0,1-.556-.479,2,2,0,0,1-.313-.687,3.277,3.277,0,0,1-.1-.809A3.3,3.3,0,0,1,8.86-3.63a2.047,2.047,0,0,1,.3-.687,1.609,1.609,0,0,1,.539-.49,1.606,1.606,0,0,1,.8-.187,1.67,1.67,0,0,1,.786.176,1.563,1.563,0,0,1,.55.473,2.093,2.093,0,0,1,.319.677A2.908,2.908,0,0,1,12.265-2.893ZM4.565,8.139h.968a2.248,2.248,0,0,0-.264-.874,1.952,1.952,0,0,0-.534-.611A2.21,2.21,0,0,0,3.988,6.3a3.437,3.437,0,0,0-.908-.115A2.753,2.753,0,0,0,1.9,6.418a2.349,2.349,0,0,0-.841.649,2.76,2.76,0,0,0-.5.968A4.173,4.173,0,0,0,.4,9.228,3.832,3.832,0,0,0,.567,10.4a2.569,2.569,0,0,0,.506.918,2.229,2.229,0,0,0,.836.594,2.962,2.962,0,0,0,1.15.209,2.471,2.471,0,0,0,1.721-.572,2.619,2.619,0,0,0,.786-1.628H4.609a1.639,1.639,0,0,1-.479,1.023,1.53,1.53,0,0,1-1.083.363,1.548,1.548,0,0,1-.759-.176,1.477,1.477,0,0,1-.517-.467A2.064,2.064,0,0,1,1.479,10a3.163,3.163,0,0,1-.093-.77,3.868,3.868,0,0,1,.088-.83,2.083,2.083,0,0,1,.292-.709,1.51,1.51,0,0,1,.544-.5,1.743,1.743,0,0,1,.847-.187,1.419,1.419,0,0,1,.946.3A1.425,1.425,0,0,1,4.565,8.139ZM7.293,9.206a3.741,3.741,0,0,1,.088-.814,2.153,2.153,0,0,1,.286-.7,1.489,1.489,0,0,1,.528-.5A1.606,1.606,0,0,1,9,7.006a1.736,1.736,0,0,1,.825.181,1.6,1.6,0,0,1,.556.478,2,2,0,0,1,.313.688A3.33,3.33,0,0,1,10.7,9.943a2.047,2.047,0,0,1-.3.687,1.543,1.543,0,0,1-1.342.677,1.67,1.67,0,0,1-.786-.176,1.563,1.563,0,0,1-.55-.473A2.093,2.093,0,0,1,7.4,9.981,2.908,2.908,0,0,1,7.293,9.206ZM11.693,12V4.146h-.935V7.072h-.022a1.506,1.506,0,0,0-.379-.424,2.156,2.156,0,0,0-.479-.275,2.4,2.4,0,0,0-.506-.148A2.77,2.77,0,0,0,8.9,6.181a2.588,2.588,0,0,0-1.139.236,2.337,2.337,0,0,0-.814.638A2.693,2.693,0,0,0,6.463,8,4.012,4.012,0,0,0,6.3,9.14a3.887,3.887,0,0,0,.165,1.144,2.828,2.828,0,0,0,.49.946,2.366,2.366,0,0,0,.814.649,2.565,2.565,0,0,0,1.149.242,2.772,2.772,0,0,0,1.089-.209,1.376,1.376,0,0,0,.726-.682h.022V12Z"
											transform="translate(1.832 15.854)"
											strokeWidth={0}
										/>
									),
								},
								{
									name: 'break-all',
									description: 'Text Tranform : Break All',
									icon: (
										<path
											id="Path_147"
											data-name="Path 147"
											d="M2.211-3.245,3.542-6.908h.022L4.873-3.245Zm.781-4.609L-.066,0H1l.88-2.365H5.2L6.061,0H7.216L4.147-7.854Zm4.873,0V0H8.8V-.759h.022a1.506,1.506,0,0,0,.38.424,2,2,0,0,0,.479.27,2.6,2.6,0,0,0,.511.143,2.811,2.811,0,0,0,.468.044A2.641,2.641,0,0,0,11.8-.11a2.282,2.282,0,0,0,.814-.633,2.693,2.693,0,0,0,.484-.94,4.012,4.012,0,0,0,.159-1.144,3.888,3.888,0,0,0-.165-1.144,2.891,2.891,0,0,0-.49-.951,2.338,2.338,0,0,0-.814-.655,2.565,2.565,0,0,0-1.149-.242A2.71,2.71,0,0,0,9.548-5.6a1.4,1.4,0,0,0-.726.688H8.8V-7.854Zm4.4,4.961a3.741,3.741,0,0,1-.088.814,2.153,2.153,0,0,1-.286.7,1.5,1.5,0,0,1-.523.5,1.6,1.6,0,0,1-.809.187,1.736,1.736,0,0,1-.825-.181,1.6,1.6,0,0,1-.556-.479,2,2,0,0,1-.313-.687,3.277,3.277,0,0,1-.1-.809A3.3,3.3,0,0,1,8.86-3.63a2.047,2.047,0,0,1,.3-.687,1.609,1.609,0,0,1,.539-.49,1.606,1.606,0,0,1,.8-.187,1.67,1.67,0,0,1,.786.176,1.563,1.563,0,0,1,.55.473,2.093,2.093,0,0,1,.319.677A2.908,2.908,0,0,1,12.265-2.893Zm9.009-.968h.968a2.248,2.248,0,0,0-.264-.874,1.952,1.952,0,0,0-.534-.611A2.21,2.21,0,0,0,20.7-5.7a3.437,3.437,0,0,0-.907-.115,2.753,2.753,0,0,0-1.177.236,2.349,2.349,0,0,0-.841.649,2.76,2.76,0,0,0-.5.968A4.173,4.173,0,0,0,17.1-2.772a3.832,3.832,0,0,0,.17,1.171,2.569,2.569,0,0,0,.506.919,2.229,2.229,0,0,0,.836.594,2.962,2.962,0,0,0,1.149.209,2.471,2.471,0,0,0,1.721-.572,2.619,2.619,0,0,0,.787-1.628h-.957a1.639,1.639,0,0,1-.479,1.023,1.53,1.53,0,0,1-1.083.363A1.548,1.548,0,0,1,19-.869a1.477,1.477,0,0,1-.517-.468A2.064,2.064,0,0,1,18.188-2a3.163,3.163,0,0,1-.094-.77,3.868,3.868,0,0,1,.088-.83,2.083,2.083,0,0,1,.292-.709,1.51,1.51,0,0,1,.545-.5,1.743,1.743,0,0,1,.847-.187,1.419,1.419,0,0,1,.946.3A1.425,1.425,0,0,1,21.274-3.861ZM1.386,9.206a3.741,3.741,0,0,1,.088-.814,2.153,2.153,0,0,1,.286-.7,1.489,1.489,0,0,1,.528-.5,1.606,1.606,0,0,1,.8-.187,1.736,1.736,0,0,1,.825.181,1.6,1.6,0,0,1,.555.478,2,2,0,0,1,.313.688,3.277,3.277,0,0,1,.1.809,3.3,3.3,0,0,1-.093.781,2.047,2.047,0,0,1-.3.687,1.543,1.543,0,0,1-1.342.677,1.67,1.67,0,0,1-.787-.176,1.563,1.563,0,0,1-.55-.473,2.093,2.093,0,0,1-.319-.677A2.908,2.908,0,0,1,1.386,9.206ZM5.786,12V4.146H4.851V7.072H4.829a1.506,1.506,0,0,0-.379-.424,2.156,2.156,0,0,0-.479-.275,2.4,2.4,0,0,0-.506-.148,2.77,2.77,0,0,0-.473-.044,2.588,2.588,0,0,0-1.138.236,2.337,2.337,0,0,0-.814.638A2.693,2.693,0,0,0,.556,8,4.012,4.012,0,0,0,.4,9.14a3.888,3.888,0,0,0,.165,1.144,2.828,2.828,0,0,0,.49.946,2.366,2.366,0,0,0,.814.649,2.565,2.565,0,0,0,1.15.242A2.772,2.772,0,0,0,4.1,11.912a1.376,1.376,0,0,0,.726-.682h.022V12Z"
											transform="translate(1.725 15.854)"
											strokeWidth={0}
										/>
									),
								},
							],
						}}
					/>
				</div>

				<div className="_combineEditors">
					<div className="_simpleLabel">Whitespace :</div>
					<EachSimpleEditor
						subComponentName={subComponentName}
						pseudoState={pseudoState}
						prop="whiteSpace"
						placeholder="White Space"
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
									description: 'Default',
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
									name: 'nowrap',
									description: 'White Space : No Wrap',
									icon: (
										<g
											id="Group_68"
											data-name="Group 68"
											transform="translate(-1223.796 -295.843)"
										>
											<path
												id="Path_146"
												data-name="Path 146"
												d="M1328.764,94.464c.736-1.273,8.2-4.464,8.2-4.464s-.888,3.975-2.943,5.091S1328.028,95.737,1328.764,94.464Z"
												transform="translate(-53.396 657.889) rotate(-19)"
												strokeWidth={0}
											/>
											<path
												id="Path_147"
												data-name="Path 147"
												d="M1330.464,102.3c-2.1.451-5.81-5.485-1.382-3.7,4.973,1.068,6.461-2.552,7.3-3.548,2.823-.142,6.1,2.386,3.995,2.981S1332.561,101.851,1330.464,102.3Z"
												transform="translate(-53.426 655.541) rotate(-19)"
												strokeWidth={0}
											/>
											<path
												id="Path_148"
												data-name="Path 148"
												d="M1343.755,89.739c3.8.533,5,1.743,5.5,3.216,2.136-.434,1.288-2.992,0-3.216,1.16-1.783-.137-3.226-1.555-2.67,1.074-1.486-.511-2.374-1.58-1.891-.488.22-1.7.044-1.48,1.763A14.426,14.426,0,0,0,1343.755,89.739Z"
												transform="translate(-58.987 662.13) rotate(-19)"
												strokeWidth={0}
											/>
											<rect
												id="Rectangle_7"
												data-name="Rectangle 7"
												width="19"
												height="2"
												transform="matrix(0.788, 0.616, -0.616, 0.788, 1233.028, 305.363)"
												strokeWidth={0}
											/>
										</g>
									),
								},
								{
									name: 'pre',
									description: 'White Space : Pre',
									icon: (
										<g
											id="Group_69"
											data-name="Group 69"
											transform="translate(-1272 -248)"
										>
											<path
												id="Path_141"
												data-name="Path 141"
												d="M16.553,20v2.166H5V20Z"
												transform="translate(1279.447 236.418)"
												strokeWidth={0}
											/>
											<path
												id="Path_149"
												data-name="Path 149"
												d="M21,20v2.166H5V20Z"
												transform="translate(1302.166 251) rotate(90)"
												strokeWidth={0}
											/>
											<path
												id="Path_142"
												data-name="Path 142"
												d="M16.553,20v2.166H5V20Z"
												transform="translate(1279.447 240.751)"
												strokeWidth={0}
											/>
											<path
												id="Path_143"
												data-name="Path 143"
												d="M16.553,20v2.166H5V20Z"
												transform="translate(1279.447 245.083)"
												strokeWidth={0}
											/>
											<path
												id="Path_144"
												data-name="Path 144"
												d="M16.553,20v2.166H5V20Z"
												transform="translate(1279.447 249.415)"
												strokeWidth={0}
											/>
										</g>
									),
								},
							],
						}}
					/>
				</div>
				<div className="_simpleLabel">Text Shadow :</div>
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
					placeholder="Height"
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
					placeholder="Letter"
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
		</>
	);
}

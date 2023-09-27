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
									description: 'Text Decoration Style : Double',
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
									description: 'Text Decoration Style : Dotted',
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
									description: 'Text Decoration Style : Dashed',
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
									description: 'Text Decoration Style : Wavy',
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
											id="Path_168"
											data-name="Path 168"
											d="M1.7,9H.3L3.439.273H4.96L8.1,9H6.7L4.236,1.858H4.168ZM1.93,5.582H6.464V6.69H1.93ZM14.857,3.03a2.661,2.661,0,0,0-.332-.695,2.126,2.126,0,0,0-.49-.528,2.058,2.058,0,0,0-.652-.337,2.622,2.622,0,0,0-.8-.115,2.413,2.413,0,0,0-1.33.379,2.586,2.586,0,0,0-.937,1.112,4.2,4.2,0,0,0-.341,1.786,4.191,4.191,0,0,0,.345,1.794,2.564,2.564,0,0,0,.946,1.112,2.508,2.508,0,0,0,1.368.379,2.539,2.539,0,0,0,1.24-.29A2.019,2.019,0,0,0,14.7,6.81a2.553,2.553,0,0,0,.294-1.253l.341.064h-2.5V4.534h3.43v.993A3.744,3.744,0,0,1,15.8,7.436,3.192,3.192,0,0,1,14.512,8.68a3.9,3.9,0,0,1-1.875.439,3.916,3.916,0,0,1-2.08-.545A3.7,3.7,0,0,1,9.168,7.027a5.318,5.318,0,0,1-.5-2.386,5.673,5.673,0,0,1,.29-1.875,4.072,4.072,0,0,1,.814-1.411,3.553,3.553,0,0,1,1.24-.891A3.882,3.882,0,0,1,12.577.153a4.037,4.037,0,0,1,1.317.209,3.551,3.551,0,0,1,1.091.592A3.356,3.356,0,0,1,16.208,3.03Z"
											transform="translate(7.702 11.847)"
											strokeWidth="0"
										/>
									),
								},
								{
									name: 'lowercase',
									description: 'Text Trasnform : Lowercase',
									icon: (
										<path
											id="Path_169"
											data-name="Path 169"
											d="M2.761,7.145a2.673,2.673,0,0,1-1.125-.23,1.9,1.9,0,0,1-.8-.678A1.943,1.943,0,0,1,.55,5.151a1.761,1.761,0,0,1,.213-.912,1.572,1.572,0,0,1,.575-.567,3,3,0,0,1,.81-.315,8.049,8.049,0,0,1,.912-.162l.955-.111a1.4,1.4,0,0,0,.533-.149A.36.36,0,0,0,4.713,2.6v-.03A1.151,1.151,0,0,0,4.4,1.707,1.272,1.272,0,0,0,3.469,1.4a1.624,1.624,0,0,0-1.014.286,1.527,1.527,0,0,0-.507.626L.75,2.04a2.3,2.3,0,0,1,.622-.963A2.524,2.524,0,0,1,2.322.54,3.71,3.71,0,0,1,3.452.369a3.984,3.984,0,0,1,.831.094A2.432,2.432,0,0,1,5.109.8a1.839,1.839,0,0,1,.635.695,2.4,2.4,0,0,1,.247,1.163V7H4.747V6.105H4.7a1.813,1.813,0,0,1-.371.486,1.97,1.97,0,0,1-.635.4A2.463,2.463,0,0,1,2.761,7.145Zm.277-1.023a1.831,1.831,0,0,0,.9-.209,1.462,1.462,0,0,0,.575-.545,1.415,1.415,0,0,0,.2-.729V3.8a.664.664,0,0,1-.264.128,4.109,4.109,0,0,1-.439.1l-.482.072-.392.051a3.158,3.158,0,0,0-.678.158,1.163,1.163,0,0,0-.486.32.8.8,0,0,0-.179.545.816.816,0,0,0,.349.716A1.546,1.546,0,0,0,3.038,6.122Zm7.395,3.469a3.935,3.935,0,0,1-1.342-.2,2.6,2.6,0,0,1-.912-.541,2.272,2.272,0,0,1-.528-.737l1.1-.452a2.634,2.634,0,0,0,.307.4,1.591,1.591,0,0,0,.528.362,2.15,2.15,0,0,0,.865.149,1.945,1.945,0,0,0,1.2-.354,1.3,1.3,0,0,0,.473-1.116V5.807h-.081a2.9,2.9,0,0,1-.332.464,1.8,1.8,0,0,1-.588.443,2.187,2.187,0,0,1-.976.188,2.726,2.726,0,0,1-1.4-.362,2.57,2.57,0,0,1-.98-1.078A3.909,3.909,0,0,1,7.4,3.7a4.146,4.146,0,0,1,.354-1.79A2.7,2.7,0,0,1,8.737.77a2.549,2.549,0,0,1,1.411-.4,2.052,2.052,0,0,1,.984.2,1.8,1.8,0,0,1,.584.469,3.734,3.734,0,0,1,.328.473h.094V.455h1.249v6.69a2.3,2.3,0,0,1-.392,1.385,2.307,2.307,0,0,1-1.061.8A4.092,4.092,0,0,1,10.433,9.591ZM10.42,5.845a1.624,1.624,0,0,0,.929-.256,1.592,1.592,0,0,0,.58-.741,3.047,3.047,0,0,0,.2-1.163,3.189,3.189,0,0,0-.2-1.163,1.729,1.729,0,0,0-.575-.784,1.514,1.514,0,0,0-.937-.286,1.515,1.515,0,0,0-.959.3,1.8,1.8,0,0,0-.58.8A3.184,3.184,0,0,0,8.69,3.685a3,3,0,0,0,.2,1.129,1.67,1.67,0,0,0,.58.759A1.618,1.618,0,0,0,10.42,5.845Z"
											transform="translate(9.45 13.831)"
											strokeWidth={0}
										/>
									),
								},
								{
									name: 'capitalize',
									description: 'Text Tranform : Capitalize',
									icon: (
										<path
											id="Path_170"
											data-name="Path 170"
											d="M1.7,9H.3L3.439.273H4.96L8.1,9H6.7L4.236,1.858H4.168ZM1.93,5.582H6.464V6.69H1.93ZM11.9,11.591a3.937,3.937,0,0,1-1.342-.2,2.6,2.6,0,0,1-.912-.541,2.273,2.273,0,0,1-.528-.737l1.1-.452a2.638,2.638,0,0,0,.307.4,1.594,1.594,0,0,0,.528.362,2.15,2.15,0,0,0,.865.149,1.945,1.945,0,0,0,1.2-.354,1.3,1.3,0,0,0,.473-1.116V7.807H13.5a2.9,2.9,0,0,1-.332.464,1.8,1.8,0,0,1-.588.443A2.187,2.187,0,0,1,11.6,8.9a2.726,2.726,0,0,1-1.4-.362,2.57,2.57,0,0,1-.98-1.078A3.909,3.909,0,0,1,8.868,5.7a4.147,4.147,0,0,1,.354-1.79A2.7,2.7,0,0,1,10.2,2.77a2.549,2.549,0,0,1,1.41-.4,2.052,2.052,0,0,1,.984.2,1.8,1.8,0,0,1,.584.469,3.734,3.734,0,0,1,.328.473H13.6V2.455h1.249v6.69A2.174,2.174,0,0,1,13.4,11.331,4.092,4.092,0,0,1,11.9,11.591Zm-.013-3.746a1.624,1.624,0,0,0,.929-.256,1.592,1.592,0,0,0,.58-.741,3.047,3.047,0,0,0,.2-1.163,3.189,3.189,0,0,0-.2-1.163,1.728,1.728,0,0,0-.575-.784,1.686,1.686,0,0,0-1.9.013,1.8,1.8,0,0,0-.58.8,3.185,3.185,0,0,0-.192,1.134,3,3,0,0,0,.2,1.129,1.67,1.67,0,0,0,.58.759A1.618,1.618,0,0,0,11.885,7.845Z"
											transform="translate(8.702 11.927)"
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

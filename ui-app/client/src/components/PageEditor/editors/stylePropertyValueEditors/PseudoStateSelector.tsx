import React, { ReactNode } from 'react';

interface PseudoStateSelectorProps {
	state: string;
	onChange: (state: string) => void;
	pseudoStates: string[];
}

const PSEUDO_STATES: { [key: string]: ReactNode } = {
	'': (
		<g id="Group_64" data-name="Group 64" transform="translate(-1269 -247)">
			<rect
				id="Rectangle_7"
				data-name="Rectangle 7"
				width="20"
				height="20"
				rx="2"
				transform="translate(1275 253)"
			/>
		</g>
	),
	hover: (
		<g id="Group_61" data-name="Group 61" transform="translate(-1293 -252)">
			<path
				id="Union_1"
				data-name="Union 1"
				d="M.5,4.734C.581,9.9-2.781,19.541,6.909,18.911a26.014,26.014,0,0,0,7.943-3.81c1.134-.872.689-3.706-1.493-3.307,2.184-1.956-.336-4-1.8-2.965.979-.8.668-3.269-1.847-2.451,1.305-1.146,3.6-2.792,4.682-3.792,1.087-1.023-.388-3.395-2-2.308-2.029,1.516-8.2,6.4-8.2,6.4s-.111.3,0-1.952S.682,1.513.5,4.734Z"
				transform="matrix(0.602, -0.799, 0.799, 0.602, 1296.689, 269.016)"
				strokeWidth="1.53"
			/>
		</g>
	),
	focus: (
		<g id="Group_61" data-name="Group 61" transform="translate(-1293 -252)">
			<path
				id="Path_116"
				data-name="Path 116"
				d="M5.111,0A5.487,5.487,0,0,1,6.448.176,5.112,5.112,0,1,1,0,5.111,5.164,5.164,0,0,1,3.958.131,4.745,4.745,0,0,1,5.111,0Z"
				transform="translate(1303.889 263.048)"
			/>
			<path
				id="Path_118"
				data-name="Path 118"
				d="M0,0H5.412V2.255H2.368V5.093H0Z"
				transform="translate(1299.078 259.44)"
			/>
			<path
				id="Path_121"
				data-name="Path 121"
				d="M0,5.093H5.412V2.838H2.368V0H0Z"
				transform="translate(1299.078 271.467)"
			/>
			<path
				id="Path_119"
				data-name="Path 119"
				d="M5.412,0H0V2.255H3.044V5.093H5.412Z"
				transform="translate(1313.51 259.44)"
			/>
			<path
				id="Path_120"
				data-name="Path 120"
				d="M5.412,5.093H0V2.838H3.044V0H5.412Z"
				transform="translate(1313.51 271.467)"
			/>
		</g>
	),
	visited: (
		<g id="Group_63" data-name="Group 63" transform="translate(-1272 -250)">
			<g id="Group_62" data-name="Group 62" transform="translate(-29.102 -7.509)">
				<path
					id="Path_122"
					data-name="Path 122"
					d="M2.466,0H7.4A2.466,2.466,0,0,1,9.864,2.466V11.1A2.466,2.466,0,0,1,7.4,13.562V3.573s.053-.948-.73-1.107a9.484,9.484,0,0,0-3.313,0,1.174,1.174,0,0,0-.889,1.107v9.989A2.466,2.466,0,0,1,0,11.1V2.466A2.466,2.466,0,0,1,2.466,0Z"
					transform="matrix(0.695, 0.719, -0.719, 0.695, 1320.121, 263.303)"
					strokeWidth="1.53"
				/>
				<path
					id="Path_123"
					data-name="Path 123"
					d="M2.466,0H7.4A2.466,2.466,0,0,1,9.864,2.466V11.1A2.466,2.466,0,0,1,7.4,13.562V3.573s.053-.948-.73-1.107a9.484,9.484,0,0,0-3.313,0,1.174,1.174,0,0,0-.889,1.107v9.989A2.466,2.466,0,0,1,0,11.1V2.466A2.466,2.466,0,0,1,2.466,0Z"
					transform="matrix(-0.695, -0.719, 0.719, -0.695, 1315.21, 287.122)"
					strokeWidth="1.53"
				/>
				<path
					id="Path_124"
					data-name="Path 124"
					d="M0,4.015H8.877V2.238H1.867V0H0Z"
					transform="matrix(0.719, -0.695, 0.695, 0.719, 1307.232, 266.062)"
					strokeWidth="3"
				/>
			</g>
		</g>
	),
	disabled: (
		<g id="Group_64" data-name="Group 64" transform="translate(-1264 -247)">
			<path
				id="Subtraction_1"
				data-name="Subtraction 1"
				d="M-121,211a10.012,10.012,0,0,1-10-10,10.012,10.012,0,0,1,10-10,10.011,10.011,0,0,1,10,10A10.011,10.011,0,0,1-121,211Zm-7.689-9.085c-.372,0-.556,0-.562,0a6.888,6.888,0,0,0,2.431,5.183,8.809,8.809,0,0,0,5.86,2.15c4.572,0,8.292-3.289,8.293-7.332-.033.011-1.133.016-3.268.016-2.039,0-4.791,0-7.213-.009l-1.269,0C-126.274,201.918-127.878,201.915-128.688,201.915Zm7.73-9.166c-4.572,0-8.292,3.29-8.292,7.333,0,0,.082,0,.439,0l3.113-.005h.218l2.231,0c2.395,0,5.122-.009,7.189-.009,2.228,0,3.337.005,3.392.016A6.884,6.884,0,0,0-115.1,194.9,8.81,8.81,0,0,0-120.958,192.749Z"
				transform="translate(1223.432 35.312) rotate(-45)"
			/>
		</g>
	),
	readonly: (
		<g id="Group_64" data-name="Group 64" transform="translate(-1264 -247)">
			<g
				id="Group_63"
				data-name="Group 63"
				transform="matrix(0.602, 0.799, -0.799, 0.602, 743.248, -933.449)"
			>
				<path
					id="Path_125"
					data-name="Path 125"
					d="M7.112,18.253c.048.057-1.811-2.39-1.811-3.366V8.951H0V7.117H5.3V0H8.389L8.371,7.078l5.938.039,0,1.834H8.389v5.936S6.98,18.263,7.112,18.253Z"
					transform="translate(1271.398 283.84)"
				/>
				<path
					id="Path_126"
					data-name="Path 126"
					d="M0,1.767C0,.791.212,0,.474,0h2.14c.262,0,.474.791.474,1.767C3.088,1.767.043,1.861,0,1.767Z"
					transform="translate(1276.699 280.649)"
				/>
			</g>
		</g>
	),
	other: (
		<g id="Group_65" data-name="Group 65" transform="translate(-1269 -247)">
			<g id="Group_64" data-name="Group 64">
				<circle
					id="Ellipse_5"
					data-name="Ellipse 5"
					cx="5"
					cy="5"
					r="5"
					transform="translate(1280 258)"
					strokeWidth="1.53"
				/>
				<circle
					id="Ellipse_6"
					data-name="Ellipse 6"
					cx="3"
					cy="3"
					r="3"
					transform="translate(1273 260)"
					strokeWidth="1.53"
				/>
				<circle
					id="Ellipse_7"
					data-name="Ellipse 7"
					cx="3"
					cy="3"
					r="3"
					transform="translate(1291 260)"
					strokeWidth="1.53"
				/>
			</g>
		</g>
	),
};

export function PseudoStateSelector({ state, onChange, pseudoStates }: PseudoStateSelectorProps) {
	return (
		<div className="_propLabel _svgButtons" title="Pseudo State">
			Pseudo State:
			<div className="_svgButtonsContainer">
				{['', ...pseudoStates].map((pseudoState, index) => {
					const activeClass = (state ?? '') == pseudoState ? 'active' : '';
					return (
						<div
							key={pseudoState}
							className={`svgContainer ${activeClass}`}
							title={(pseudoState ? pseudoState : 'Default').toUpperCase()}
						>
							<svg
								width="32"
								height="32"
								viewBox="0 0 32 32"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								className={activeClass}
								onClick={e => onChange(pseudoState)}
								style={{ width: '37px' }}
							>
								{PSEUDO_STATES[pseudoState ?? ''] ?? PSEUDO_STATES['other']}
							</svg>
						</div>
					);
				})}
			</div>
		</div>
	);
}

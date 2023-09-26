import React, { ReactNode } from 'react';

interface PseudoStateSelectorProps {
	state: string;
	onChange: (state: string) => void;
	pseudoStates: string[];
}

const PSEUDO_STATES: { [key: string]: ReactNode } = {
	'': (
		<g id="Group_64" data-name="Group 64">
			<rect
				id="Rectangle_7"
				data-name="Rectangle 7"
				width="14"
				height="14"
				rx="2"
				transform="translate(9,9)"
				strokeWidth={0}
			/>
		</g>
	),
	hover: (
		<path
			id="Path_154"
			data-name="Path 154"
			d="M15,7.343v4.2a9.359,9.359,0,0,1-.306,2.1c-.185.758-.417,1.48-.6,1.991a1.059,1.059,0,0,1-.424.533,1.265,1.265,0,0,1-.694.2H6.115a1.274,1.274,0,0,1-.616-.156,1.1,1.1,0,0,1-.432-.423l-1.2-2.148-.117-.21C3.237,12.509.309,8.759.309,8.759a1.168,1.168,0,0,1-.3-.925A1.23,1.23,0,0,1,.527,6.99,1.524,1.524,0,0,1,1.56,6.721a1.457,1.457,0,0,1,.943.464L4.219,9.1V1.259a1.2,1.2,0,0,1,.412-.89,1.525,1.525,0,0,1,1.989,0,1.2,1.2,0,0,1,.412.89v4.2a1.2,1.2,0,0,1,.412-.89,1.525,1.525,0,0,1,1.989,0,1.2,1.2,0,0,1,.412.89v.839a1.2,1.2,0,0,1,.412-.89,1.525,1.525,0,0,1,1.989,0,1.2,1.2,0,0,1,.412.89V7.343A1,1,0,0,1,13,6.6a1.271,1.271,0,0,1,1.657,0A1,1,0,0,1,15,7.343Z"
			transform="translate(9 8)"
			strokeWidth={0}
		/>
	),
	focus: (
		<g id="Group_72" data-name="Group 72" transform="translate(8 8)">
			<path
				id="Path_155"
				data-name="Path 155"
				d="M1.972,1A.971.971,0,0,0,1,1.972V4.887a.972.972,0,0,0,1.943,0V2.943H4.887A.972.972,0,0,0,4.887,1Zm.972,9.716a.972.972,0,0,0-1.943,0v2.915a.971.971,0,0,0,.972.972H4.887a.972.972,0,0,0,0-1.943H2.943ZM10.716,1a.972.972,0,0,0,0,1.943H12.66V4.887a.972.972,0,0,0,1.943,0V1.972A.971.971,0,0,0,13.631,1ZM14.6,10.716a.972.972,0,0,0-1.943,0V12.66H10.716a.972.972,0,0,0,0,1.943h2.915a.971.971,0,0,0,.972-.972Z"
				strokeWidth={0}
			/>
			<path
				id="Path_156"
				data-name="Path 156"
				d="M6.19,7.574,4.731,7.109a.439.439,0,0,1-.018-.83l4.95-1.824a.439.439,0,0,1,.564.564L8.4,9.968a.439.439,0,0,1-.83-.018L7.108,8.491l-1.36,1.36a.651.651,0,0,1-.917,0h0a.651.651,0,0,1,0-.917Z"
				transform="translate(0.458 0.458)"
				fillRule="evenodd"
				strokeWidth={0}
			/>
		</g>
	),
	visited: (
		<path
			id="Path_158"
			data-name="Path 158"
			d="M18.735,7.8,10.24.274a1.136,1.136,0,0,0-1.479,0L.265,7.8a.789.789,0,0,0,.52,1.379H2.324v7.888a.67.67,0,0,0,.66.669H16.016a.67.67,0,0,0,.66-.669V9.176h1.539A.791.791,0,0,0,18.735,7.8Zm-5.7,1.48L9.24,13.13a.991.991,0,0,1-.7.284,1.027,1.027,0,0,1-.7-.284L5.942,11.2a1,1,0,0,1,0-1.4.967.967,0,0,1,1.379,0l1.2,1.217,3.118-3.163a.967.967,0,0,1,1.379,0A1.027,1.027,0,0,1,13.038,9.277Z"
			transform="translate(7 7)"
			strokeWidth={0}
		/>
	),
	disabled: (
		<path
			id="Path_157"
			data-name="Path 157"
			d="M13.34,14.862l-9-9a6.451,6.451,0,0,0,9,9Zm1.522-1.522a6.451,6.451,0,0,0-9-9ZM1,9.6a8.6,8.6,0,1,1,2.52,6.083A8.6,8.6,0,0,1,1,9.6Z"
			transform="translate(6.5 6.5)"
			strokeWidth={0}
		/>
	),
	readonly: (
		<g id="Group_73" data-name="Group 73" transform="translate(6 9)">
			<path
				id="Path_159"
				data-name="Path 159"
				d="M7.58,8.242a3.177,3.177,0,0,0,1.152-.215,3.03,3.03,0,0,0,.977-.614,2.825,2.825,0,0,0,.653-.918,2.684,2.684,0,0,0,.229-1.083c0-.32-.392-.466-.726-.4a1.88,1.88,0,0,1-.362.034,1.913,1.913,0,0,1-.815-.182,1.8,1.8,0,0,1-.642-.507,1.658,1.658,0,0,1-.332-.723,1.61,1.61,0,0,1,.048-.786.186.186,0,0,0,.011-.09.19.19,0,0,0-.032-.085.2.2,0,0,0-.07-.063.219.219,0,0,0-.092-.027,3.112,3.112,0,0,0-2.13.829,2.714,2.714,0,0,0,0,4,3.112,3.112,0,0,0,2.13.829Z"
				transform="translate(2.174 1.228)"
				strokeWidth={0}
			/>
			<path
				id="Path_160"
				data-name="Path 160"
				d="M19.25,7.461a1.488,1.488,0,0,0,.005-1.642C18.109,4.041,14.933,0,9.75,0S1.39,4.041.244,5.82A1.49,1.49,0,0,0,.249,7.461c1.158,1.775,4.358,5.821,9.5,5.821S18.092,9.236,19.25,7.461Zm-9.5,3.651a4.975,4.975,0,0,0,2.643-.754,4.545,4.545,0,0,0,1.752-2.007,4.225,4.225,0,0,0,.271-2.584,4.4,4.4,0,0,0-1.3-2.29,4.858,4.858,0,0,0-2.436-1.224,5.039,5.039,0,0,0-2.749.255A4.707,4.707,0,0,0,5.794,4.155a4.285,4.285,0,0,0-.8,2.485,4.241,4.241,0,0,0,.362,1.712A4.464,4.464,0,0,0,6.386,9.8a4.787,4.787,0,0,0,1.543.969A5.02,5.02,0,0,0,9.75,11.113Z"
				strokeWidth={0}
				fillRule="evenodd"
			/>
		</g>
	),
	other: (
		<g id="Group_74" data-name="Group 74" transform="translate(-1211.04 -296)">
			<circle
				id="Ellipse_14"
				data-name="Ellipse 14"
				cx="1.991"
				cy="1.991"
				r="1.991"
				transform="translate(1219.04 310.009)"
				strokeWidth={0}
			/>
			<circle
				id="Ellipse_15"
				data-name="Ellipse 15"
				cx="1.991"
				cy="1.991"
				r="1.991"
				transform="translate(1225.678 310.009)"
				strokeWidth={0}
			/>
			<circle
				id="Ellipse_16"
				data-name="Ellipse 16"
				cx="2"
				cy="2"
				r="2"
				transform="translate(1232 310)"
				strokeWidth={0}
			/>
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

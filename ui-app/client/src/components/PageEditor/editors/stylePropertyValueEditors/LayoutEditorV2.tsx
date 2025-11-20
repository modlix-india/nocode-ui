import React from 'react';
import {
	EachSimpleEditor,
	extractValue,
	SimpleEditorType,
	StyleEditorsProps,
} from './simpleEditors';

// Display Options - same as original LayoutEditor
const DisplayOptions = [
	{
		name: 'flex',
		description: 'Flex container',
		icon: (
			<g transform="translate(6 6)">
				<rect
					x="3.5"
					y="3.5"
					width="5"
					height="13"
					rx="0.5"
					fill="#E3E5EA"
					stroke="#02B694"
					strokeOpacity={0}
				/>
				<rect
					x="11.5"
					y="3.5"
					width="5"
					height="13"
					rx="0.5"
					fill="#E3E5EA"
					stroke="#02B694"
					strokeOpacity={0}
				/>
			</g>
		),
	},
	{
		name: 'grid',
		description: 'Grid container',
		icon: (
			<g viewBox="0 0 20 20" transform="translate(4 6)">
				<rect
					x="3.5"
					y="3.5"
					width="13"
					height="13"
					rx="0.5"
					style={{ fill: 'none' }}
					stroke="#D1D1D1"
				/>
				<path d="M4 10H16" stroke="#D1D1D1" strokeLinecap="round" />
				<path d="M10 4V16" stroke="#D1D1D1" strokeLinecap="round" />
			</g>
		),
	},
	{
		name: 'block',
		description: 'Block',
		icon: (
			<g transform="translate(6 6)">
				<rect x="3" y="3" width="14" height="14" rx="1" fill="#E3E5EA" strokeOpacity={0} />
				<rect
					x="3.5"
					y="3.5"
					width="13"
					height="13"
					rx="0.5"
					stroke="#999999"
					style={{ fill: '#e3e5ea' }}
					strokeOpacity="1"
				/>
			</g>
		),
	},
	{
		name: 'inline',
		description: 'Inline element',
		icon: (
			<g viewBox="0 0 20 20" transform="translate(6 6)">
				<path
					d="M18.1667 15.4823C18.1667 15.9423 17.7933 16.3156 17.3333 16.3156H2.33333C1.87333 16.3156 1.5 15.9423 1.5 15.4823C1.5 15.0223 1.87333 14.6489 2.33333 14.6489H17.3333C17.7933 14.6489 18.1667 15.0223 18.1667 15.4823Z"
					fill="#999999"
					fillOpacity="1"
					strokeOpacity={0}
				/>
				<path
					d="M2.79688 13.6516H1.78125L4.71875 5.65155H5.71875L8.65625 13.6516H7.64062L5.25 6.91717H5.1875L2.79688 13.6516ZM3.17188 10.5266H7.26563V11.3859H3.17188V10.5266Z"
					fill="#999999"
					fillOpacity="0.5"
					strokeOpacity={0}
				/>
				<path
					d="M11.7969 13.6516H10.7813L13.7188 5.65155H14.7188L17.6563 13.6516H16.6406L14.25 6.91717H14.1875L11.7969 13.6516ZM12.1719 10.5266H16.2656V11.3859H12.1719V10.5266Z"
					fill="#999999"
					fillOpacity="1"
					strokeOpacity={0}
				/>
			</g>
		),
	},
	{
		name: 'inline-block',
		description: 'Inline-block element',
		icon: (
			<g viewBox="0 0 20 20" transform="translate(6 6)">
				<path
					d="M1.83333 18.6667C1.37333 18.6667 1 18.2933 1 17.8333V2.83333C1 2.37333 1.37333 2 1.83333 2C2.29333 2 2.66667 2.37333 2.66667 2.83333V17.8333C2.66667 18.2933 2.29333 18.6667 1.83333 18.6667Z"
					fill="#999999"
					fillOpacity="1"
					strokeOpacity={0}
				/>
				<path
					d="M18.3333 18.6667C17.8733 18.6667 17.5 18.2933 17.5 17.8333V2.83333C17.5 2.37333 17.8733 2 18.3333 2C18.7933 2 19.1667 2.37333 19.1667 2.83333V17.8333C19.1667 18.2933 18.7933 18.6667 18.3333 18.6667Z"
					fill="#999999"
					fillOpacity="1"
					strokeOpacity={0}
				/>
				<rect
					x="5"
					y="5"
					width="10"
					height="10"
					rx="1"
					fill="#999999"
					fillOpacity="1"
					strokeOpacity={0}
				/>
			</g>
		),
	},
	{
		name: 'inline-flex',
		description: 'Inline flex container',
		icon: (
			<g viewBox="0 0 20 20" transform="translate(6 6)">
				<path
					d="M1.83333 18.6667C1.37333 18.6667 1 18.2933 1 17.8333V2.83333C1 2.37333 1.37333 2 1.83333 2C2.29333 2 2.66667 2.37333 2.66667 2.83333V17.8333C2.66667 18.2933 2.29333 18.6667 1.83333 18.6667Z"
					fill="#999999"
					fillOpacity="1"
					strokeOpacity={0}
				/>
				<path
					d="M18.3333 18.6667C17.8733 18.6667 17.5 18.2933 17.5 17.8333V2.83333C17.5 2.37333 17.8733 2 18.3333 2C18.7933 2 19.1667 2.37333 19.1667 2.83333V17.8333C19.1667 18.2933 18.7933 18.6667 18.3333 18.6667Z"
					fill="#999999"
					fillOpacity="1"
					strokeOpacity={0}
				/>
				<rect
					x="5"
					y="4.34845"
					width="4"
					height="12"
					rx="1"
					fill="#999999"
					fillOpacity="1"
					strokeOpacity={0}
				/>
				<rect
					x="11"
					y="4.34845"
					width="4"
					height="12"
					rx="1"
					fill="#999999"
					fillOpacity="1"
					strokeOpacity={0}
				/>
			</g>
		),
	},
	{
		name: 'inline-grid',
		description: 'Inline grid container',
		icon: (
			<g viewBox="0 0 20 20" transform="translate(6 6)">
				<path
					d="M1.83333 18.6667C1.37333 18.6667 1 18.2933 1 17.8333V2.83333C1 2.37333 1.37333 2 1.83333 2C2.29333 2 2.66667 2.37333 2.66667 2.83333V17.8333C2.66667 18.2933 2.29333 18.6667 1.83333 18.6667Z"
					strokeOpacity={0}
					fillOpacity="1"
				/>
				<path
					d="M18.3333 18.6667C17.8733 18.6667 17.5 18.2933 17.5 17.8333V2.83333C17.5 2.37333 17.8733 2 18.3333 2C18.7933 2 19.1667 2.37333 19.1667 2.83333V17.8333C19.1667 18.2933 18.7933 18.6667 18.3333 18.6667Z"
					strokeOpacity={0}
					fillOpacity="1"
				/>
				<rect
					x="5.5"
					y="5.5"
					width="9"
					height="9"
					rx="0.5"
					fill="white"
					stroke="#D1D1D1"
					strokeOpacity={1}
					style={{ fill: 'none' }}
				/>
				<path d="M5.71387 10H14.2853" stroke="#D1D1D1" strokeLinecap="round" />
				<path d="M10 5.71732V14.2887" stroke="#D1D1D1" strokeLinecap="round" />
			</g>
		),
	},
	{
		name: 'none',
		description: 'Hide the element',
		icon: (
			<g transform="translate(6 6)">
				<path
					d="M12.0731 9.45478L13.1616 10.5433C13.2684 10.2407 13.3265 9.91541 13.3265 9.57667C13.3265 7.96905 12.0186 6.66107 10.4109 6.66107C10.0722 6.66107 9.74694 6.71923 9.44434 6.82601L10.5328 7.91451C11.3549 7.97431 12.0133 8.63273 12.0731 9.45478Z"
					fill="#999999"
					fillOpacity="1"
					strokeOpacity={0}
				/>
				<path
					d="M5.9039 13.8522C7.30354 14.6316 8.84217 15.0426 10.3575 15.0426C10.3755 15.0426 10.3936 15.0426 10.4114 15.0426C11.4703 15.0498 12.5404 14.855 13.5675 14.4748L14.9096 15.817C15.0315 15.9389 15.1912 16 15.3512 16C15.5112 16 15.6709 15.9389 15.7928 15.817C16.0366 15.5732 16.0366 15.178 15.7928 14.9342L5.04144 4.18284C4.79765 3.93905 4.4024 3.93905 4.15861 4.18284C3.91482 4.42663 3.91482 4.82188 4.15861 5.06567L4.97211 5.87917C3.93519 6.61547 3.01918 7.55448 2.28683 8.63871C1.90439 9.20547 1.90439 9.93782 2.28683 10.5049C3.23143 11.9036 4.48224 13.0611 5.90357 13.8526L5.9039 13.8522ZM10.3295 11.2363C9.4753 11.1945 8.78829 10.5075 8.74656 9.65329L10.3295 11.2363ZM3.32178 9.33689C4.01109 8.31607 4.88275 7.44211 5.8694 6.77613L7.67054 8.57727C7.55752 8.88776 7.49608 9.22223 7.49608 9.57115C7.49608 11.1788 8.80406 12.4868 10.4117 12.4868C10.7606 12.4868 11.0951 12.425 11.4056 12.312L12.5801 13.4866C11.8826 13.6893 11.1706 13.7937 10.4659 13.7937C10.4495 13.7937 10.4327 13.7937 10.4163 13.7937H10.4077C9.08727 13.8026 7.74151 13.4458 6.51173 12.7614C5.26059 12.0649 4.15762 11.0428 3.32244 9.80607C3.22617 9.66348 3.22617 9.47949 3.32244 9.33722L3.32178 9.33689Z"
					fill="#999999"
					fillOpacity="1"
					strokeOpacity={0}
				/>
				<path
					d="M18.5359 8.63896C17.5913 7.2403 16.3405 6.0828 14.9192 5.29131C13.5195 4.51198 11.9809 4.10095 10.4653 4.10095C10.4472 4.10095 10.4295 4.10095 10.4114 4.10095C10.3933 4.10095 10.3756 4.10095 10.3575 4.10095C9.32617 4.10095 8.28399 4.29151 7.28223 4.65884L8.27151 5.64812C8.95983 5.45099 9.66228 5.34946 10.3575 5.34946C10.3739 5.34946 10.3907 5.34946 10.4071 5.34946H10.4157C11.7345 5.33961 13.0819 5.6974 14.3117 6.38178C15.5628 7.07832 16.6658 8.10046 17.501 9.33714C17.5972 9.47974 17.5972 9.66373 17.501 9.80599C16.8166 10.8193 15.9528 11.688 14.9754 12.352L15.872 13.2486C16.9 12.5146 17.8085 11.5812 18.5356 10.5045C18.918 9.93774 18.918 9.20539 18.5356 8.63863L18.5359 8.63896Z"
					fill="#999999"
					fillOpacity="1"
					strokeOpacity={0}
				/>
			</g>
		),
	},
];

// Flex Direction Options
const FlexDirectionOptions = [
	{
		name: 'row',
		description: 'Row (left to right)',
		icon: (
			<g transform="translate(2 2)">
				<path d="M4 12h16M4 12l4-4m-4 4l4 4" stroke="currentColor" strokeWidth="2" fill="none" />
			</g>
		),
	},
	{
		name: 'row-reverse',
		description: 'Row Reverse (right to left)',
		icon: (
			<g transform="translate(2 2)">
				<path d="M20 12H4m16 0l-4-4m4 4l-6 6" stroke="currentColor" strokeWidth="2" fill="none" />
			</g>
		),
	},
	{
		name: 'column',
		description: 'Column (top to bottom)',
		icon: (
			<g transform="translate(2 2)">
				<path d="M12 4v16m0-16l-4 4m4-4l4 4" stroke="currentColor" strokeWidth="2" fill="none" />
			</g>
		),
	},
	{
		name: 'column-reverse',
		description: 'Column Reverse (bottom to top)',
		icon: (
			<g transform="translate(2 2)">
				<path d="M12 20V4m0 16l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" fill="none" />
			</g>
		),
	},
];

// Flex Wrap Options
const FlexWrapOptions = [
	{
		name: 'nowrap',
		description: 'No Wrap: All flex items will be on one line',
		icon: (
			<g transform="translate(4 4)">
				<path d="M3 5h18v2H3V5zm0 6h18v2H3v-2zm0 6h18v2H3v-2z" stroke="currentColor" strokeWidth="2" fill="none" />
			</g>
		),
	},
	{
		name: 'wrap',
		description: 'Wrap: Flex items will wrap onto multiple lines, from top to bottom',
		icon: (
			<g transform="translate(4 4)">
				<path d="M3 5h18v2H3V5zm0 6h10v2H3v-2zm12 0h6v2h-6v-2zm-12 6h8v2H3v-2zm10 0h8v2h-8v-2z" stroke="currentColor" strokeWidth="2" fill="none" />
			</g>
		),
	},
	{
		name: 'wrap-reverse',
		description: 'Wrap Reverse: Flex items will wrap onto multiple lines from bottom to top',
		icon: (
			<g transform="translate(4 4)">
				<path d="M3 19h18v-2H3v2zm0-6h10v-2H3v2zm12 0h6v-2h-6v2zm-12-6h8V5H3v2zm10 0h8V5h-8v2z" stroke="currentColor" strokeWidth="2" fill="none" />
			</g>
		),
	},
];

// Justify Content Options
const JustifyContentOptions = [
	{
		name: 'flex-start',
		description: 'Flex Start',
		icon: (
			<g transform="translate(2 2)">
				<path d="M2 6h16v2H2V6zm0 6h10v2H2v-2z" stroke="currentColor" strokeWidth="2" fill="none" />
			</g>
		),
	},
	{
		name: 'flex-end',
		description: 'Flex End',
		icon: (
			<g transform="translate(2 2)">
				<path d="M2 6h16v2H2V6zm8 6h10v2H10v-2z" stroke="currentColor" strokeWidth="2" fill="none" />
			</g>
		),
	},
	{
		name: 'center',
		description: 'Center',
		icon: (
			<g transform="translate(2 2)">
				<path d="M2 6h16v2H2V6zm4 6h10v2H6v-2z" stroke="currentColor" strokeWidth="2" fill="none" />
			</g>
		),
	},
	{
		name: 'space-between',
		description: 'Space Between',
		icon: (
			<g transform="translate(2 2)">
				<path d="M2 6h6v2H2V6zm6 0h6v2H8V6zm6 0h6v2h-6V6zm-12 6h6v2H2v-2zm6 0h6v2H8v-2zm6 0h6v2h-6v-2z" stroke="currentColor" strokeWidth="2" fill="none" />
			</g>
		),
	},
	{
		name: 'space-around',
		description: 'Space Around',
		icon: (
			<g transform="translate(2 2)">
				<path d="M2 6h4v2H2V6zm6 0h4v2H8V6zm6 0h4v2h-4V6zm-12 6h4v2H2v-2zm6 0h4v2H8v-2zm6 0h4v2h-4v-2z" stroke="currentColor" strokeWidth="2" fill="none" />
			</g>
		),
	},
	{
		name: 'space-evenly',
		description: 'Space Evenly',
		icon: (
			<g transform="translate(2 2)">
				<path d="M2 6h3v2H2V6zm5 0h3v2H7V6zm5 0h3v2h-3V6zm5 0h3v2h-3V6zm-15 6h3v2H2v-2zm5 0h3v2H7v-2zm5 0h3v2h-3v-2zm5 0h3v2h-3v-2z" stroke="currentColor" strokeWidth="2" fill="none" />
			</g>
		),
	},
];

// Align Items Options
const AlignItemsOptions = [
	{
		name: 'flex-start',
		description: 'Flex Start',
		icon: (
			<g transform="translate(2 2)">
				<path d="M2 2v16h2V2H2zm6 4h10v2H8V6zm0 6h10v2H8v-2z" stroke="currentColor" strokeWidth="2" fill="none" />
			</g>
		),
	},
	{
		name: 'flex-end',
		description: 'Flex End',
		icon: (
			<g transform="translate(2 2)">
				<path d="M2 2v16h2V2H2zm6 10h10v2H8v-2zm0-6h10v2H8V6z" stroke="currentColor" strokeWidth="2" fill="none" />
			</g>
		),
	},
	{
		name: 'center',
		description: 'Center',
		icon: (
			<g transform="translate(2 2)">
				<path d="M2 2v16h2V2H2zm6 5h10v2H8V7zm0 6h10v2H8v-2z" stroke="currentColor" strokeWidth="2" fill="none" />
			</g>
		),
	},
	{
		name: 'stretch',
		description: 'Stretch',
		icon: (
			<g transform="translate(2 2)">
				<path d="M2 2v16h2V2H2zm6 4h10v10H8V6z" stroke="currentColor" strokeWidth="2" fill="none" />
			</g>
		),
	},
	{
		name: 'baseline',
		description: 'Baseline',
		icon: (
			<g transform="translate(2 2)">
				<path d="M2 2v16h2V2H2zm6 7h10M8 7v2m10-2v2zm0 4h-10" stroke="currentColor" strokeWidth="2" fill="none" />
			</g>
		),
	},
];

// Align Content Options (for flex wrap)
const AlignContentOptions = [
	{
		name: 'flex-start',
		description: 'Flex Start',
		icon: (
			<g transform="translate(2 2)">
				<path d="M2 2v16h2V2H2zm6 2h10v2H8V4zm0 6h10v2H8v-2z" stroke="currentColor" strokeWidth="2" fill="none" />
			</g>
		),
	},
	{
		name: 'flex-end',
		description: 'Flex End',
		icon: (
			<g transform="translate(2 2)">
				<path d="M2 2v16h2V2H2zm6 10h10v2H8v-2zm0-6h10v2H8V4z" stroke="currentColor" strokeWidth="2" fill="none" />
			</g>
		),
	},
	{
		name: 'center',
		description: 'Center',
		icon: (
			<g transform="translate(2 2)">
				<path d="M2 2v16h2V2H2zm6 4h10v2H8V6zm0 6h10v2H8v-2z" stroke="currentColor" strokeWidth="2" fill="none" />
			</g>
		),
	},
	{
		name: 'space-between',
		description: 'Space Between',
		icon: (
			<g transform="translate(2 2)">
				<path d="M2 2v16h2V2H2zm6 2h4v2H8V4zm6 0h4v2h-4V4zm-12 6h4v2H2v-2zm6 0h4v2H8v-2zm6 0h4v2h-4v-2z" stroke="currentColor" strokeWidth="2" fill="none" />
			</g>
		),
	},
	{
		name: 'space-around',
		description: 'Space Around',
		icon: (
			<g transform="translate(2 2)">
				<path d="M2 2v16h2V2H2zm6 2h3v2H8V4zm5 0h3v2h-3V4zm-11 6h3v2H2v-2zm5 0h3v2H7v-2zm5 0h3v2h-3v-2z" stroke="currentColor" strokeWidth="2" fill="none" />
			</g>
		),
	},
	{
		name: 'stretch',
		description: 'Stretch',
		icon: (
			<g transform="translate(2 2)">
				<path d="M2 2v16h2V2H2zm6 2h10v10H8V4z" stroke="currentColor" strokeWidth="2" fill="none" />
			</g>
		),
	},
];

// Grid Auto Flow Options
const GridAutoFlowOptions = [
	{
		name: 'row',
		description: 'Row',
		icon: (
			<g transform="translate(2 2)">
				<path d="M2 2h16v2H2V2zm0 6h16v2H2V8zm0 6h16v2H2v-2z" stroke="currentColor" strokeWidth="2" fill="none" />
			</g>
		),
	},
	{
		name: 'column',
		description: 'Column',
		icon: (
			<g transform="translate(2 2)">
				<path d="M2 2v16h2V2H2zm6 0v16h2V2H8zm6 0v16h2V2h-2z" stroke="currentColor" strokeWidth="2" fill="none" />
			</g>
		),
	},
	{
		name: 'dense',
		description: 'Dense',
		icon: (
			<g transform="translate(2 2)">
				<rect x="2" y="2" width="6" height="6" stroke="currentColor" strokeWidth="2" fill="none" />
				<rect x="10" y="2" width="6" height="6" stroke="currentColor" strokeWidth="2" fill="none" />
				<rect x="2" y="10" width="6" height="6" stroke="currentColor" strokeWidth="2" fill="none" />
				<rect x="10" y="10" width="6" height="6" stroke="currentColor" strokeWidth="2" fill="none" />
			</g>
		),
	},
	{
		name: 'row dense',
		description: 'Row Dense',
		icon: (
			<g transform="translate(2 2)">
				<rect x="2" y="2" width="5" height="5" stroke="currentColor" strokeWidth="2" fill="none" />
				<rect x="9" y="2" width="5" height="5" stroke="currentColor" strokeWidth="2" fill="none" />
				<rect x="2" y="9" width="5" height="5" stroke="currentColor" strokeWidth="2" fill="none" />
				<rect x="9" y="9" width="5" height="5" stroke="currentColor" strokeWidth="2" fill="none" />
			</g>
		),
	},
	{
		name: 'column dense',
		description: 'Column Dense',
		icon: (
			<g transform="translate(2 2)">
				<rect x="2" y="2" width="5" height="5" stroke="currentColor" strokeWidth="2" fill="none" />
				<rect x="2" y="9" width="5" height="5" stroke="currentColor" strokeWidth="2" fill="none" />
				<rect x="9" y="2" width="5" height="5" stroke="currentColor" strokeWidth="2" fill="none" />
				<rect x="9" y="9" width="5" height="5" stroke="currentColor" strokeWidth="2" fill="none" />
			</g>
		),
	},
];

// Related props logic for flex
const flexRelatedProps = {
	props: ['flexGrow', 'flexShrink', 'flexBasis', 'flex'],
	logic: ({ flexGrow, flexShrink, flexBasis, flex }: Record<string, any>) => {
		if (flex === 'auto') {
			return { flexGrow: '1', flexShrink: '1', flexBasis: 'auto', flex: 'auto' };
		}
		if (flex === 'none') {
			return { flexGrow: '0', flexShrink: '0', flexBasis: 'auto', flex: 'none' };
		}
		return {
			flexGrow,
			flexShrink,
			flexBasis,
			flex: `${flexGrow} ${flexShrink} ${flexBasis}`,
		};
	},
};

const flexFlowRelatedProps = {
	props: ['flexDirection', 'flexWrap'],
	logic: ({ flexFlow, flexDirection, flexWrap }: Record<string, any>) => {
		return { flexDirection, flexWrap, flexFlow: `${flexDirection} ${flexWrap}` };
	},
};

export function LayoutEditorV2({
	subComponentName,
	pseudoState,
	iterateProps,
	appDef,
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
	// Get current display value using extractValue to properly read from iterateProps
	const { value: displayValueObj } = extractValue({
		subComponentName,
		prop: 'display',
		iterateProps,
		pseudoState,
		selectorPref,
		selectedComponent,
	});
	const displayValue = displayValueObj?.value || 'flex';

	// Determine if display is flex-based
	const isFlex = displayValue === 'flex' || displayValue === 'inline-flex';
	// Determine if display is grid-based
	const isGrid = displayValue === 'grid' || displayValue === 'inline-grid';
	// Determine if display is block-based
	const isBlock = displayValue === 'block' || displayValue === 'inline-block' || displayValue === 'inline';

	// Helper function to render EachSimpleEditor with common props
	const renderEditor = (
		prop: string,
		editorDef: any,
		options?: {
			displayName?: string;
			placeholder?: string;
			className?: string;
			relatedProps?: any;
		},
	) => (
		<EachSimpleEditor
			selectedComponentsList={selectedComponentsList}
			defPath={defPath}
			locationHistory={locationHistory}
			pageExtractor={pageExtractor}
			subComponentName={subComponentName}
			pseudoState={pseudoState}
			prop={prop}
			displayName={options?.displayName}
			placeholder={options?.placeholder}
			className={options?.className}
			iterateProps={iterateProps}
			selectorPref={selectorPref}
			styleProps={styleProps}
			selectedComponent={selectedComponent}
			saveStyle={saveStyle}
			properties={properties}
			editorDef={editorDef}
			relatedProps={options?.relatedProps}
		/>
	);

	return (
		<>
			{/* Display Selector - Always shown */}
			<div className="_combineEditors">
				<div className="_simpleLabel">Display</div>
				{renderEditor('display', {
					type: SimpleEditorType.Icons,
					withBackground: true,
					visibleIconCount: 4,
					Options: DisplayOptions,
				})}
			</div>

			<div className="_spacer" />

			{/* Flex-specific controls */}
			{isFlex && (
				<>
					<div className="_simpleLabel">Flex Container</div>

					{/* Flex Direction */}
					<div className="_combineEditors">
						<div className="_simpleLabel">Direction</div>
						{renderEditor('flexDirection', {
							type: SimpleEditorType.Icons,
							withBackground: true,
							visibleIconCount: 4,
							Options: FlexDirectionOptions,
						}, { relatedProps: flexFlowRelatedProps })}
					</div>

					{/* Flex Wrap */}
					<div className="_combineEditors">
						<div className="_simpleLabel">Wrap</div>
						{renderEditor('flexWrap', {
							type: SimpleEditorType.Icons,
							withBackground: true,
							visibleIconCount: 3,
							Options: FlexWrapOptions,
						}, { relatedProps: flexFlowRelatedProps })}
					</div>

					<div className="_spacer" />

					{/* Justify Content */}
					<div className="_combineEditors">
						<div className="_simpleLabel">Justify Content</div>
						{renderEditor('justifyContent', {
							type: SimpleEditorType.Icons,
							withBackground: true,
							visibleIconCount: 6,
							Options: JustifyContentOptions,
						})}
					</div>

					{/* Align Items */}
					<div className="_combineEditors">
						<div className="_simpleLabel">Align Items</div>
						{renderEditor('alignItems', {
							type: SimpleEditorType.Icons,
							withBackground: true,
							visibleIconCount: 5,
							Options: AlignItemsOptions,
						})}
					</div>

					{/* Align Content (only relevant when wrap is enabled) */}
					<div className="_combineEditors">
						<div className="_simpleLabel">Align Content</div>
						{renderEditor('alignContent', {
							type: SimpleEditorType.Icons,
							withBackground: true,
							visibleIconCount: 6,
							Options: AlignContentOptions,
						})}
					</div>

					<div className="_spacer" />

					{/* Gap */}
					<div className="_combineEditors">
						<div className="_simpleLabel">Gap</div>
						{renderEditor('gap', {
							type: SimpleEditorType.PixelSize,
						})}
					</div>

					<div className="_spacer" />

					{/* Flex Item Properties */}
					<div className="_simpleLabel">Flex Item</div>

					{/* Flex Shorthand */}
					<div className="_combineEditors">
						<div className="_simpleLabel">Flex</div>
						{renderEditor('flex', {
							type: SimpleEditorType.ButtonBar,
							buttonBarOptions: [
								{ name: 'none', displayName: 'None' },
								{ name: 'auto', displayName: 'Auto' },
								{ name: 'custom', displayName: 'Custom' },
							],
						}, { relatedProps: flexRelatedProps })}
					</div>

					{/* Flex Grow */}
					<div className="_combineEditors">
						<div className="_simpleLabel">Grow</div>
						{renderEditor('flexGrow', {
							type: SimpleEditorType.Range,
							rangeMin: 0,
							rangeMax: 10,
						}, { relatedProps: flexRelatedProps })}
					</div>

					{/* Flex Shrink */}
					<div className="_combineEditors">
						<div className="_simpleLabel">Shrink</div>
						{renderEditor('flexShrink', {
							type: SimpleEditorType.Range,
							rangeMin: 0,
							rangeMax: 10,
						}, { relatedProps: flexRelatedProps })}
					</div>

					{/* Flex Basis */}
					<div className="_combineEditors">
						<div className="_simpleLabel">Basis</div>
						{renderEditor('flexBasis', {
							type: SimpleEditorType.PixelSize,
						}, { relatedProps: flexRelatedProps })}
					</div>

					{/* Flex Basis Options */}
					{renderEditor('flexBasis', {
						type: SimpleEditorType.ButtonBar,
						buttonBarOptions: [
							{ name: 'auto', displayName: 'Auto' },
							{ name: 'content', displayName: 'Content' },
							{ name: 'max-content', displayName: 'Max Content' },
							{ name: 'min-content', displayName: 'Min Content' },
							{ name: 'fit-content', displayName: 'Fit Content' },
						],
					}, { relatedProps: flexRelatedProps })}
				</>
			)}

			{/* Grid-specific controls */}
			{isGrid && (
				<>
					<div className="_simpleLabel">Grid Container</div>

					{/* Grid Template Columns */}
					<div className="_combineEditors">
						<div className="_simpleLabel">Template Columns</div>
						{renderEditor('gridTemplateColumns', {
							type: SimpleEditorType.Text,
						}, { placeholder: 'e.g., 1fr 1fr 1fr or repeat(3, 1fr)' })}
					</div>

					{/* Grid Template Rows */}
					<div className="_combineEditors">
						<div className="_simpleLabel">Template Rows</div>
						{renderEditor('gridTemplateRows', {
							type: SimpleEditorType.Text,
						}, { placeholder: 'e.g., auto 1fr auto' })}
					</div>

					{/* Grid Template Areas */}
					<div className="_combineEditors">
						<div className="_simpleLabel">Template Areas</div>
						{renderEditor('gridTemplateAreas', {
							type: SimpleEditorType.Text,
						}, { placeholder: 'e.g., "header header" "sidebar main"' })}
					</div>

					<div className="_spacer" />

					{/* Grid Auto Columns */}
					<div className="_combineEditors">
						<div className="_simpleLabel">Auto Columns</div>
						{renderEditor('gridAutoColumns', {
							type: SimpleEditorType.PixelSize,
						}, { placeholder: 'Auto column size' })}
					</div>

					{/* Grid Auto Rows */}
					<div className="_combineEditors">
						<div className="_simpleLabel">Auto Rows</div>
						{renderEditor('gridAutoRows', {
							type: SimpleEditorType.PixelSize,
						}, { placeholder: 'Auto row size' })}
					</div>

					{/* Grid Auto Flow */}
					<div className="_combineEditors">
						<div className="_simpleLabel">Auto Flow</div>
						{renderEditor('gridAutoFlow', {
							type: SimpleEditorType.Icons,
							withBackground: true,
							visibleIconCount: 5,
							Options: GridAutoFlowOptions,
						})}
					</div>

					<div className="_spacer" />

					{/* Gap Controls */}
					<div className="_simpleLabel">Gap</div>
					<div className="_combineEditors">
						<div className="_simpleLabel">Gap</div>
						{renderEditor('gap', {
							type: SimpleEditorType.PixelSize,
						})}
					</div>
					<div className="_combineEditors">
						<div className="_simpleLabel">Column Gap</div>
						{renderEditor('columnGap', {
							type: SimpleEditorType.PixelSize,
						})}
					</div>
					<div className="_combineEditors">
						<div className="_simpleLabel">Row Gap</div>
						{renderEditor('rowGap', {
							type: SimpleEditorType.PixelSize,
						})}
					</div>

					<div className="_spacer" />

					{/* Grid Alignment */}
					<div className="_simpleLabel">Grid Alignment</div>

					{/* Justify Items */}
					<div className="_combineEditors">
						<div className="_simpleLabel">Justify Items</div>
						{renderEditor('justifyItems', {
							type: SimpleEditorType.Icons,
							withBackground: true,
							visibleIconCount: 4,
							Options: [
								{ name: 'start', description: 'Start', icon: <g><path d="M2 2h16v2H2V2z" stroke="currentColor" strokeWidth="2" fill="none" /></g> },
								{ name: 'end', description: 'End', icon: <g><path d="M2 2h16v2H2V2zm0 6h16v2H2V8z" stroke="currentColor" strokeWidth="2" fill="none" /></g> },
								{ name: 'center', description: 'Center', icon: <g><path d="M2 2h16v2H2V2zm4 6h8v2H6V8z" stroke="currentColor" strokeWidth="2" fill="none" /></g> },
								{ name: 'stretch', description: 'Stretch', icon: <g><path d="M2 2h16v14H2V2z" stroke="currentColor" strokeWidth="2" fill="none" /></g> },
							],
						})}
					</div>

					{/* Align Items */}
					<div className="_combineEditors">
						<div className="_simpleLabel">Align Items</div>
						{renderEditor('alignItems', {
							type: SimpleEditorType.Icons,
							withBackground: true,
							visibleIconCount: 4,
							Options: AlignItemsOptions,
						})}
					</div>

					{/* Justify Content */}
					<div className="_combineEditors">
						<div className="_simpleLabel">Justify Content</div>
						{renderEditor('justifyContent', {
							type: SimpleEditorType.Icons,
							withBackground: true,
							visibleIconCount: 6,
							Options: JustifyContentOptions,
						})}
					</div>

					{/* Align Content */}
					<div className="_combineEditors">
						<div className="_simpleLabel">Align Content</div>
						{renderEditor('alignContent', {
							type: SimpleEditorType.Icons,
							withBackground: true,
							visibleIconCount: 6,
							Options: AlignContentOptions,
						})}
					</div>

					<div className="_spacer" />

					{/* Grid Item Properties */}
					<div className="_simpleLabel">Grid Item</div>

					{/* Grid Column */}
					<div className="_combineEditors">
						<div className="_simpleLabel">Column</div>
						{renderEditor('gridColumn', {
							type: SimpleEditorType.Text,
						}, { placeholder: 'e.g., 1 / 3 or span 2' })}
					</div>

					{/* Grid Row */}
					<div className="_combineEditors">
						<div className="_simpleLabel">Row</div>
						{renderEditor('gridRow', {
							type: SimpleEditorType.Text,
						}, { placeholder: 'e.g., 1 / 3 or span 2' })}
					</div>

					{/* Grid Area */}
					<div className="_combineEditors">
						<div className="_simpleLabel">Area</div>
						{renderEditor('gridArea', {
							type: SimpleEditorType.Text,
						}, { placeholder: 'e.g., header or 1 / 1 / 2 / 3' })}
					</div>
				</>
			)}

			{/* Common layout properties - shown for flex and grid */}
			{(isFlex || isGrid) && (
				<>
					<div className="_spacer" />
					<div className="_simpleLabel">Common Properties</div>

					{/* Width */}
					<div className="_combineEditors">
						<div className="_simpleLabel">Width</div>
						{renderEditor('width', {
							type: SimpleEditorType.PixelSize,
						})}
					</div>

					{/* Height */}
					<div className="_combineEditors">
						<div className="_simpleLabel">Height</div>
						{renderEditor('height', {
							type: SimpleEditorType.PixelSize,
						})}
					</div>

					{/* Min Width */}
					<div className="_combineEditors">
						<div className="_simpleLabel">Min Width</div>
						{renderEditor('minWidth', {
							type: SimpleEditorType.PixelSize,
						})}
					</div>

					{/* Min Height */}
					<div className="_combineEditors">
						<div className="_simpleLabel">Min Height</div>
						{renderEditor('minHeight', {
							type: SimpleEditorType.PixelSize,
						})}
					</div>

					{/* Max Width */}
					<div className="_combineEditors">
						<div className="_simpleLabel">Max Width</div>
						{renderEditor('maxWidth', {
							type: SimpleEditorType.PixelSize,
						})}
					</div>

					{/* Max Height */}
					<div className="_combineEditors">
						<div className="_simpleLabel">Max Height</div>
						{renderEditor('maxHeight', {
							type: SimpleEditorType.PixelSize,
						})}
					</div>
				</>
			)}

			{/* Basic layout properties for block/inline display types */}
			{isBlock && !isFlex && !isGrid && (
				<>
					<div className="_spacer" />
					<div className="_simpleLabel">Layout Properties</div>

					{/* Width */}
					<div className="_combineEditors">
						<div className="_simpleLabel">Width</div>
						{renderEditor('width', {
							type: SimpleEditorType.PixelSize,
						})}
					</div>

					{/* Height */}
					<div className="_combineEditors">
						<div className="_simpleLabel">Height</div>
						{renderEditor('height', {
							type: SimpleEditorType.PixelSize,
						})}
					</div>

					{/* Min Width */}
					<div className="_combineEditors">
						<div className="_simpleLabel">Min Width</div>
						{renderEditor('minWidth', {
							type: SimpleEditorType.PixelSize,
						})}
					</div>

					{/* Min Height */}
					<div className="_combineEditors">
						<div className="_simpleLabel">Min Height</div>
						{renderEditor('minHeight', {
							type: SimpleEditorType.PixelSize,
						})}
					</div>

					{/* Max Width */}
					<div className="_combineEditors">
						<div className="_simpleLabel">Max Width</div>
						{renderEditor('maxWidth', {
							type: SimpleEditorType.PixelSize,
						})}
					</div>

					{/* Max Height */}
					<div className="_combineEditors">
						<div className="_simpleLabel">Max Height</div>
						{renderEditor('maxHeight', {
							type: SimpleEditorType.PixelSize,
						})}
					</div>
				</>
			)}
		</>
	);
}


import React from 'react';
import { ComponentProperty } from '../../../../../types/common';
import { StyleEditorsProps, extractValue, valuesChangedOnlyValues } from '../simpleEditors';
import { iconButtonOptions, IconsSimpleEditor } from '../simpleEditors/IconsSimpleEditor';
import { PixelSize } from '../simpleEditors/SizeSliders';

const LABELS: Record<string, string[]> = {
	'1': ['All'],
	'2': ['Top/Bottom', 'Left/Right'],
	'3': ['Top', 'Left/Right', 'Bottom'],
	'4': ['Top', 'Right', 'Bottom', 'Left'],
};

const FOUR_OPTIONS = [
	{
		name: '1',
		description: 'Top Right Bottom Left',
		icon: (
			<g transform="translate(9 10)">
				<rect
					x="1"
					y="0"
					width="12"
					height="12"
					rx="2"
					ry="2"
					className="_lowlight"
					strokeOpacity="0"
				/>
				<rect
					width="12"
					height="2"
					rx="1"
					transform="translate(13 0) rotate(180)"
					className="_highlight"
					strokeOpacity="0"
				/>
				<rect
					width="12"
					height="2"
					rx="1"
					transform="translate(15 0) rotate(90)"
					className="_highlight"
					strokeOpacity="0"
				/>
				<rect
					width="12"
					height="2"
					rx="1"
					transform="translate(13 14) rotate(180)"
					className="_highlight"
					strokeOpacity="0"
				/>
				<rect
					width="12"
					height="2"
					rx="1"
					transform="translate(1 0) rotate(90)"
					className="_highlight"
					strokeOpacity="0"
				/>
			</g>
		),
	},
	{
		name: '2',
		description: LABELS['2'].join(' '),
		icon: (
			<g transform="translate(9 10)">
				<rect
					x="1"
					y="0"
					width="12"
					height="12"
					rx="2"
					ry="2"
					className="_lowlight"
					strokeOpacity="0"
				/>
				<rect
					width="12"
					height="2"
					rx="1"
					transform="translate(13 0) rotate(180)"
					className="_highlight"
					strokeOpacity="0"
				/>
				<rect
					width="12"
					height="2"
					rx="1"
					transform="translate(13 14) rotate(180)"
					className="_highlight"
					strokeOpacity="0"
				/>
				<rect
					width="12"
					height="2"
					rx="1"
					transform="translate(15 0) rotate(90)"
					className="_highlight _color1"
					strokeOpacity="0"
				/>
				<rect
					width="12"
					height="2"
					rx="1"
					transform="translate(1 0) rotate(90)"
					className="_highlight _color1"
					strokeOpacity="0"
				/>
			</g>
		),
	},
	{
		name: '3',
		description: LABELS['3'].join(' '),
		icon: (
			<g transform="translate(9 10)">
				<rect
					x="1"
					y="0"
					width="12"
					height="12"
					rx="2"
					ry="2"
					className="_lowlight"
					strokeOpacity="0"
				/>
				<rect
					width="12"
					height="2"
					rx="1"
					transform="translate(13 0) rotate(180)"
					className="_highlight"
					strokeOpacity="0"
				/>
				<rect
					width="12"
					height="2"
					rx="1"
					transform="translate(13 14) rotate(180)"
					className="_highlight _color2"
					strokeOpacity="0"
				/>
				<rect
					width="12"
					height="2"
					rx="1"
					transform="translate(15 0) rotate(90)"
					className="_highlight _color1"
					strokeOpacity="0"
				/>
				<rect
					width="12"
					height="2"
					rx="1"
					transform="translate(1 0) rotate(90)"
					className="_highlight _color1"
					strokeOpacity="0"
				/>
			</g>
		),
	},
	{
		name: '4',
		description: LABELS['4'].join(' '),
		icon: (
			<g transform="translate(9 10)">
				<rect
					x="1"
					y="0"
					width="12"
					height="12"
					rx="2"
					ry="2"
					className="_lowlight"
					strokeOpacity="0"
				/>
				<rect
					width="12"
					height="2"
					rx="1"
					transform="translate(13 0) rotate(180)"
					className="_highlight"
					strokeOpacity="0"
				/>
				<rect
					width="12"
					height="2"
					rx="1"
					transform="translate(13 14) rotate(180)"
					className="_highlight _color1"
					strokeOpacity="0"
				/>
				<rect
					width="12"
					height="2"
					rx="1"
					transform="translate(15 0) rotate(90)"
					className="_highlight _color2"
					strokeOpacity="0"
				/>
				<rect
					width="12"
					height="2"
					rx="1"
					transform="translate(1 0) rotate(90)"
					className="_highlight _color3"
					strokeOpacity="0"
				/>
			</g>
		),
	},
];

export function BorderImageEditor(props: Readonly<StyleEditorsProps>) {
	const {
		selectedComponent,
		subComponentName,
		iterateProps,
		pseudoState,
		selectorPref,
		selectedComponentsList,
		defPath,
		locationHistory,
		pageExtractor,
		styleProps,
		saveStyle,
		properties,
	} = props;

	const borderImageSource = extractValue({
		subComponentName,
		prop: 'borderImageSource',
		iterateProps,
		pseudoState,
		selectorPref,
		selectedComponent,
	})?.value?.value;

	const borderImageWidth: Array<string> = (
		extractValue({
			subComponentName,
			prop: 'borderImageWidth',
			iterateProps,
			pseudoState,
			selectorPref,
			selectedComponent,
		})?.value?.value ?? ''
	).split(' ');

	const borderImageOutset: Array<string> = (
		extractValue({
			subComponentName,
			prop: 'borderImageOutset',
			iterateProps,
			pseudoState,
			selectorPref,
			selectedComponent,
		})?.value?.value ?? ''
	).split(' ');

	const borderImageRepeat: Array<string> = (
		extractValue({
			subComponentName,
			prop: 'borderImageRepeat',
			iterateProps,
			pseudoState,
			selectorPref,
			selectedComponent,
		})?.value?.value ?? ''
	).split(' ');

	const borderImageSlice: Array<string> = (
		extractValue({
			subComponentName,
			prop: 'borderImageSlice',
			iterateProps,
			pseudoState,
			selectorPref,
			selectedComponent,
		})?.value?.value ?? ''
	).split(' ');

	const onChangeCurry =
		(prop: string) => (value: string | string[] | ComponentProperty<string>) => {
			const newValues: { prop: string; value: string | ComponentProperty<string> }[] = [];

			if (Array.isArray(value)) value = value.join(' ');

			newValues.push({
				prop,
				value: value,
			});

			valuesChangedOnlyValues({
				subComponentName,
				selectedComponent,
				selectedComponentsList,
				propValues: newValues,
				selectorPref,
				defPath,
				locationHistory,
				pageExtractor,
			});
		};

	const onChangeOptionCurry =
		(prop: string, propValue: Array<string>) =>
		(value: string | string[] | ComponentProperty<string>) => {
			if (typeof value !== 'string') return;

			const maxLength = parseInt(value);
			if (isNaN(maxLength)) return;

			const newSlice = propValue.slice();
			newSlice.length = maxLength;
			onChangeCurry(prop)(newSlice.join(' '));
		};

	const onChangeOptionValueCurry =
		(prop: string, propValue: Array<string>, index: number) =>
		(value: string | string[] | ComponentProperty<string>) => {
			if (typeof value !== 'string') return;

			const nv = propValue.slice();
			nv[index] = value;
			onChangeCurry(prop)(nv.join(' '));
		};

	const sliceComps: Array<React.JSX.Element> = borderImageSlice.map((v, i, arr) => (
		<React.Fragment key={LABELS[arr.length][i]}>
			<div className="_simpleLabel">{LABELS[arr.length][i]}</div>
			<div className="_simpleEditor">
				<PixelSize
					key={LABELS[arr.length][i]}
					value={v}
					onChange={onChangeOptionValueCurry('borderImageSlice', arr, i)}
					extraOptions={[
						{
							name: '',
							displayName: 'Units',
							max: 100,
							min: 0,
							step: 1,
						},
						{
							name: 'fill',
							displayName: 'Fill',
						},
					]}
				/>
			</div>
		</React.Fragment>
	));

	const repeatComps: Array<React.JSX.Element> = borderImageRepeat.map((v, i, arr) => (
		<React.Fragment key={LABELS[arr.length][i]}>
			<div className="_simpleLabel">{LABELS[arr.length][i]}</div>
			<div className="_simpleEditor">
				<IconsSimpleEditor
					options={[
						{
							name: 'stretch',
							description: 'Stretch',
							icon: (
								<g transform="translate(9 9)">
									<path
										d="M0.201211 13.8041C0.0613179 13.6641 -0.0226178 13.4402 0.00536074 13.2443L0.369082 9.32579C0.397061 8.93394 0.760782 8.65405 1.1245 8.68204C1.5162 8.71003 1.79599 9.0459 1.76801 9.43775L1.57216 11.425L5.0415 7.95432C5.32129 7.67442 5.76894 7.67442 6.02075 7.95432C6.30054 8.23421 6.30054 8.68204 6.02075 8.93394L2.57939 12.4326L4.56587 12.2367C4.95756 12.2087 5.29331 12.4886 5.32129 12.8804C5.34927 13.2723 5.06948 13.6082 4.67778 13.6361L0.760782 14C0.732803 14 0.704825 14 0.704825 14C0.508975 14 0.341103 13.916 0.201211 13.8041ZM13.2392 0.00536279L9.32222 0.369223C8.93052 0.397213 8.65073 0.733084 8.67871 1.12493C8.70669 1.51678 9.07041 1.79668 9.43414 1.76869L11.4206 1.57276L7.95127 5.07142C7.67148 5.35131 7.67148 5.79914 7.95127 6.05105C8.09116 6.19099 8.25904 6.24697 8.45489 6.24697C8.65073 6.24697 8.81861 6.19099 8.9585 6.05105L12.4278 2.58038L12.232 4.56761C12.204 4.95946 12.4838 5.29534 12.8755 5.32332C12.9035 5.32332 12.9315 5.32332 12.9315 5.32332C13.2952 5.32332 13.6029 5.04343 13.6309 4.67957L13.9946 0.761073C14.0226 0.565148 13.9387 0.341234 13.7988 0.201288C13.6309 0.0613413 13.4351 -0.0226265 13.2392 0.00536279Z"
										strokeOpacity={0}
										strokeLinecap="round"
									/>
									<path
										d="M13.8041 13.8066C13.6641 13.9465 13.4402 14.0304 13.2443 14.0025L9.32579 13.6387C8.93394 13.6108 8.65405 13.247 8.68204 12.8833C8.71003 12.4916 9.0459 12.2118 9.43775 12.2398L11.425 12.4357L7.95432 8.96631C7.67442 8.68653 7.67442 8.23887 7.95432 7.98706C8.23421 7.70728 8.68204 7.70728 8.93394 7.98706L12.4326 11.4284L12.2367 9.44195C12.2087 9.05025 12.4886 8.7145 12.8804 8.68653C13.2723 8.65855 13.6082 8.93833 13.6361 9.33003L14 13.247C14 13.275 14 13.303 14 13.303C14 13.4988 13.916 13.6667 13.8041 13.8066ZM0.00536279 0.768594L0.369223 4.68559C0.397213 5.07729 0.733084 5.35708 1.12493 5.3291C1.51678 5.30112 1.79668 4.9374 1.76869 4.57368L1.57276 2.5872L5.07142 6.05654C5.35131 6.33633 5.79914 6.33633 6.05105 6.05654C6.19099 5.91665 6.24697 5.74878 6.24697 5.55293C6.24697 5.35708 6.19099 5.18921 6.05105 5.04931L2.58038 1.57997L4.56761 1.77582C4.95946 1.8038 5.29534 1.52401 5.32332 1.13231C5.32332 1.10434 5.32332 1.07636 5.32332 1.07636C5.32332 0.712637 5.04343 0.404872 4.67957 0.376894L0.761073 0.0131731C0.565148 -0.0148058 0.341234 0.0691299 0.201288 0.209023C0.0613413 0.376894 -0.0226265 0.572744 0.00536279 0.768594Z"
										strokeOpacity={0}
										strokeLinecap="round"
									/>
								</g>
							),
						},
						{
							name: 'repeat',
							description: 'Repeat',
							icon: (
								<g transform="translate(9 9)">
									<path
										d="M5.95985 1.63718C6.7393 1.45122 7.55465 1.48086 8.31853 1.72294C9.08241 1.96501 9.76602 2.41039 10.2961 3.01134C10.3627 3.08633 10.4433 3.14747 10.5335 3.19128C10.6237 3.23509 10.7217 3.2607 10.8218 3.26665C10.9219 3.27261 11.0222 3.25879 11.1169 3.22599C11.2117 3.19318 11.299 3.14204 11.374 3.07547C11.449 3.0089 11.5102 2.92821 11.554 2.83801C11.5978 2.74781 11.6234 2.64987 11.6293 2.54977C11.6353 2.44968 11.6215 2.34939 11.5887 2.25463C11.5559 2.15987 11.5047 2.07251 11.4382 1.99752C10.7236 1.19179 9.80332 0.595622 8.77589 0.272868C7.74845 -0.0498862 6.65257 -0.0870676 5.60563 0.165306C4.54379 0.430248 3.56996 0.96893 2.78125 1.72763C1.99254 2.48634 1.41651 3.43855 1.1106 4.48932C1.09966 4.52363 1.07737 4.5532 1.04741 4.57317C1.01745 4.59315 0.981583 4.60234 0.945704 4.59926L0.334967 4.51986C0.279215 4.5116 0.222265 4.51994 0.171219 4.54383C0.120174 4.56773 0.0772921 4.60612 0.0479212 4.65422C0.0166698 4.70128 0 4.75652 0 4.81301C0 4.86951 0.0166698 4.92474 0.0479212 4.9718L1.55644 7.62851C1.5817 7.66874 1.61566 7.7028 1.65583 7.72817C1.69599 7.75353 1.74134 7.76957 1.78852 7.77509C1.83545 7.78071 1.88304 7.77536 1.92756 7.75946C1.97207 7.74357 2.01228 7.71756 2.04503 7.68348L4.16429 5.49093C4.20537 5.4517 4.23416 5.40137 4.24718 5.34607C4.26019 5.29078 4.25685 5.23289 4.23758 5.17946C4.21527 5.11739 4.17346 5.06422 4.11842 5.02789C4.06337 4.99156 3.99805 4.97402 3.93221 4.97791L2.78402 4.83134C2.75114 4.81714 2.72493 4.79093 2.71073 4.75805C2.70004 4.73836 2.69444 4.71632 2.69444 4.69392C2.69444 4.67152 2.70004 4.64948 2.71073 4.62979C2.96441 3.90223 3.39365 3.24847 3.9604 2.72646C4.52715 2.20445 5.21393 1.8303 5.95985 1.63718Z"
										strokeOpacity={0}
										strokeLinecap="round"
									/>
									<path
										d="M13.9544 7.23414C13.9842 7.18654 14 7.13151 14 7.07535C14 7.01919 13.9842 6.96416 13.9544 6.91656L12.4276 4.27207C12.4046 4.23187 12.3729 4.19731 12.3349 4.1709C12.2969 4.14449 12.2534 4.12689 12.2077 4.11938C12.1599 4.11373 12.1114 4.11904 12.0659 4.13491C12.0204 4.15078 11.9791 4.1768 11.9451 4.21099L9.83806 6.42186C9.79928 6.46256 9.77248 6.51318 9.76063 6.56814C9.74877 6.6231 9.75232 6.68026 9.77088 6.73333C9.78912 6.78727 9.82237 6.83488 9.86673 6.87058C9.91108 6.90628 9.9647 6.92858 10.0213 6.93488L11.1511 7.06924C11.1769 7.07551 11.2006 7.08838 11.2199 7.10659C11.2391 7.12479 11.2533 7.1477 11.2611 7.17307C11.2718 7.19275 11.2774 7.21479 11.2774 7.23719C11.2774 7.25959 11.2718 7.28164 11.2611 7.30132C11.0051 8.03175 10.5722 8.68738 10.0009 9.20961C9.42968 9.73183 8.73794 10.1044 7.98753 10.2939C7.20712 10.479 6.39112 10.449 5.62644 10.207C4.86175 9.96503 4.17703 9.52015 3.64519 8.91977C3.58155 8.83657 3.50147 8.76735 3.40992 8.71643C3.31838 8.6655 3.21733 8.63397 3.11308 8.62377C3.00882 8.61358 2.90358 8.62496 2.80391 8.65719C2.70424 8.68942 2.61226 8.74183 2.53372 8.81113C2.45517 8.88044 2.39172 8.96517 2.34733 9.06005C2.30294 9.15494 2.27855 9.25794 2.27568 9.36266C2.27281 9.46737 2.29152 9.57156 2.33065 9.66873C2.36977 9.7659 2.42848 9.85398 2.50311 9.92749C3.06036 10.5609 3.74623 11.0684 4.51501 11.4159C5.28379 11.7634 6.11781 11.9431 6.96149 11.9429C7.42445 11.9423 7.8857 11.887 8.33565 11.778C9.40177 11.5125 10.3791 10.9707 11.1693 10.2073C11.9595 9.44397 12.5346 8.4859 12.8368 7.42957C12.8468 7.39507 12.8691 7.36543 12.8995 7.34629C12.9299 7.32715 12.9662 7.31984 13.0017 7.32575L13.6857 7.40514C13.7416 7.40283 13.7959 7.38579 13.8431 7.35577C13.8902 7.32574 13.9287 7.28378 13.9544 7.23414Z"
										strokeOpacity={0}
										strokeLinecap="round"
									/>
								</g>
							),
						},
						{
							name: 'round',
							description: 'Round',
							icon: (
								<g transform="translate(9 9)">
									<rect
										y="11"
										width="13"
										height="2"
										rx="1"
										strokeOpacity={0}
										strokeLinecap="round"
									/>
									<rect
										width="13"
										height="2"
										rx="1"
										strokeOpacity={0}
										strokeLinecap="round"
									/>
									<path
										d="M10.2876 3.51789L8.32967 3.32949C8.13467 3.30653 7.96578 3.44527 7.9428 3.64034C7.91981 3.83541 8.07222 4.00697 8.25348 4.02731L9.24748 4.11726L7.21565 5.51043C7.05201 5.62168 7.01004 5.84162 7.12384 5.99156C7.17943 6.07341 7.25664 6.11663 7.35283 6.13499C7.44901 6.15334 7.53671 6.14158 7.61853 6.08596L8.63313 5.39625L9.64773 4.70653L9.3653 5.66419C9.31483 5.85402 9.42076 6.0452 9.61052 6.09565C9.62426 6.09828 9.638 6.1009 9.638 6.1009C9.81664 6.13499 9.99403 6.02636 10.0419 5.85028L10.5878 3.95985C10.6199 3.86624 10.5996 3.7484 10.544 3.66656C10.4747 3.58209 10.3864 3.5225 10.2876 3.51789Z"
										strokeOpacity={0}
										strokeLinecap="round"
									/>
									<path
										d="M2.07381 8.70072C2.04153 8.79426 2.06154 8.91214 2.11697 8.99409C2.17506 9.0623 2.24953 9.11942 2.34568 9.13796L2.37315 9.14325L4.33068 9.33539C4.52563 9.35873 4.69479 9.22032 4.71815 9.02529C4.7415 8.83026 4.60316 8.66106 4.4082 8.63772L3.41438 8.54587L5.43513 7.15394C5.59634 7.05675 5.63873 6.83689 5.52786 6.67299C5.43073 6.51173 5.21095 6.46936 5.04709 6.58029L3.01526 7.95583L3.29952 6.99872C3.35035 6.80899 3.24478 6.61761 3.05512 6.56679C2.8792 6.51862 2.67413 6.6216 2.62331 6.81133L2.07381 8.70072Z"
										strokeOpacity={0}
										strokeLinecap="round"
									/>
								</g>
							),
						},
						{
							name: 'space',
							description: 'Space',
							icon: (
								<g transform="translate(9 8.5)">
									<rect
										x="2"
										width="6.5"
										height="2"
										rx="1"
										transform="rotate(90 2 0)"
										strokeOpacity={0}
										strokeLinecap="round"
									/>
									<rect
										x="2"
										y="7.5"
										width="6.5"
										height="2"
										rx="1"
										transform="rotate(90 2 7.5)"
										strokeOpacity={0}
										strokeLinecap="round"
									/>
									<rect
										x="3"
										y="12"
										width="6.5"
										height="2"
										rx="1"
										strokeOpacity={0}
										strokeLinecap="round"
									/>
									<rect
										x="3"
										width="6.5"
										height="2"
										rx="1"
										strokeOpacity={0}
										strokeLinecap="round"
									/>
									<rect
										x="13"
										width="6.5"
										height="2"
										rx="1"
										transform="rotate(90 13 0)"
										strokeOpacity={0}
										strokeLinecap="round"
									/>
									<rect
										x="13"
										y="7.5"
										width="6.5"
										height="2"
										rx="1"
										transform="rotate(90 13 7.5)"
										strokeOpacity={0}
										strokeLinecap="round"
									/>
								</g>
							),
						},
					]}
					selected={v}
					onChange={onChangeOptionValueCurry('borderImageRepeat', borderImageRepeat, i)}
					withBackground={true}
				/>
			</div>
		</React.Fragment>
	));

	const widthComps: Array<React.JSX.Element> = borderImageWidth.map((v, i, arr) => (
		<React.Fragment key={LABELS[arr.length][i]}>
			<div className="_simpleLabel">{LABELS[arr.length][i]}</div>
			<div className="_simpleEditor">
				<PixelSize
					key={LABELS[arr.length][i]}
					value={v}
					onChange={onChangeOptionValueCurry('borderImageWidth', arr, i)}
				/>
			</div>
		</React.Fragment>
	));

	const outsetComps: Array<React.JSX.Element> = borderImageOutset.map((v, i, arr) => (
		<React.Fragment key={LABELS[arr.length][i]}>
			<div className="_simpleLabel">{LABELS[arr.length][i]}</div>
			<div className="_simpleEditor">
				<PixelSize
					key={LABELS[arr.length][i]}
					value={v}
					onChange={onChangeOptionValueCurry('borderImageOutset', arr, i)}
				/>
			</div>
		</React.Fragment>
	));

	return (
		<>
			<div className="_combineEditors">
				<div className="_simpleLabel">Border Image</div>
			</div>

			<div className="_combineEditors">
				<div className="_simpleLabel">Source</div>
			</div>

			<div className="_combineEditors">
				<div className="_simpleLabel">Slice</div>
				<IconsSimpleEditor
					options={FOUR_OPTIONS}
					selected={borderImageSlice.length.toString()}
					onChange={onChangeOptionCurry('borderImageSlice', borderImageSlice)}
					withBackground={true}
				/>
			</div>

			{sliceComps}

			<div className="_combineEditors">
				<div className="_simpleLabel">Repeat</div>
				<IconsSimpleEditor
					options={FOUR_OPTIONS.slice(0, 2)}
					selected={borderImageRepeat.length.toString()}
					onChange={onChangeOptionCurry('borderImageRepeat', borderImageRepeat)}
					withBackground={true}
				/>
			</div>

			{repeatComps}

			<div className="_combineEditors">
				<div className="_simpleLabel">Width</div>
				<IconsSimpleEditor
					options={FOUR_OPTIONS}
					selected={borderImageWidth.length.toString()}
					onChange={onChangeOptionCurry('borderImageWidth', borderImageWidth)}
					withBackground={true}
				/>
			</div>

			{widthComps}

			<div className="_combineEditors">
				<div className="_simpleLabel">Outset</div>
				<IconsSimpleEditor
					options={FOUR_OPTIONS}
					selected={borderImageOutset.length.toString()}
					onChange={onChangeOptionCurry('borderImageOutset', borderImageWidth)}
					withBackground={true}
				/>
			</div>

			{outsetComps}
		</>
	);
}

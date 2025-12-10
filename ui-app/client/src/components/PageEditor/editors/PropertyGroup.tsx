import { isNullValue } from '@fincity/kirun-js';
import React, { useEffect } from 'react';
import {
	addListener,
	addListenerAndCallImmediately,
	PageStoreExtractor,
} from '../../../context/StoreContext';
import { LocationHistory } from '../../../types/common';

interface PropertyGroupProps {
	name: string;
	children?: React.ReactNode[] | React.ReactNode;
	displayName: string;
	defaultStateOpen?: boolean;
	personalizationPath: string | undefined;
	onChangePersonalization: (prop: string, value: any) => void;
	pageExtractor: PageStoreExtractor;
	locationHistory: Array<LocationHistory>;
	tabName: string;
	showStar?: boolean;
	hasDetailStyleEditor?: boolean;
	isDetailsStyleEditorOpen?: boolean;
	onDetailsStyleEditorClicked?: (editorGroupName: string) => void;
}

export function PropertyGroup({
	children,
	defaultStateOpen,
	name,
	displayName,
	personalizationPath,
	onChangePersonalization,
	pageExtractor,
	locationHistory,
	tabName,
	showStar = false,
	hasDetailStyleEditor = false,
	isDetailsStyleEditorOpen = false,
	onDetailsStyleEditorClicked,
}: PropertyGroupProps) {
	const [state, setState] = React.useState(defaultStateOpen ?? true);
	const [advancedMode, setAdvancedMode] = React.useState(false);

	useEffect(() => {
		if (!personalizationPath) return;

		return addListenerAndCallImmediately(
			pageExtractor.getPageName(),
			(_, v) => setState(!isNullValue(v) ? v : (defaultStateOpen ?? true)),
			`${personalizationPath}.propertyEditor.${tabName}.${name}`,
		);
	}, [personalizationPath, tabName, name]);

	let child = undefined;
	if (state) {
		if (Array.isArray(children) && (children?.length ?? 0) > 1)
			child = advancedMode ? children![0] : children![1];
		else child = children;
	}

	let advSwitch = undefined;
	if (state && Array.isArray(children) && (children?.length ?? 0) > 1) {
		advSwitch = (
			<span
				tabIndex={0}
				role="button"
				onKeyDown={e => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						e.stopPropagation();
						setAdvancedMode(!advancedMode);
					}
				}}
				className={`_microToggle2 ${advancedMode ? '_on' : '_off'}`}
				title={advancedMode ? 'Switch to Basic' : 'Switch to Advanced'}
				onClick={e => {
					e.preventDefault();
					e.stopPropagation();
					setAdvancedMode(!advancedMode);
				}}
			></span>
		);
	}

	let star = undefined;
	if (showStar)
		star = (
			<svg
				width="8"
				height="8"
				viewBox="0 0 8 8"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				className="_propertyGroupHeaderStar"
			>
				<path d="M7.82059 3.646C7.98663 3.476 8.04265 3.228 7.96663 3C7.89061 2.772 7.70856 2.62 7.4825 2.586L5.55798 2.292C5.49396 2.284 5.43595 2.238 5.40394 2.174L4.54371 0.352C4.44168 0.134 4.23362 0 3.99956 0C3.7655 0 3.55744 0.134 3.45541 0.352L2.59518 2.174C2.56317 2.238 2.50516 2.284 2.43914 2.292L0.516622 2.586C0.290561 2.62 0.106512 2.778 0.032492 3C-0.0415279 3.222 0.0124866 3.476 0.178531 3.646L1.57091 5.064C1.62092 5.116 1.64493 5.192 1.63292 5.268L1.30483 7.27C1.26482 7.514 1.36285 7.75 1.5589 7.89C1.74695 8.022 1.98702 8.036 2.18707 7.926L3.90754 6.98C3.96555 6.948 4.03357 6.948 4.09158 6.98L5.81205 7.926C5.90207 7.976 6.0001 8 6.09813 8C6.21816 8 6.33619 7.962 6.44022 7.89C6.63627 7.75 6.7343 7.514 6.69429 7.27L6.3662 5.268C6.35419 5.192 6.3782 5.116 6.42821 5.064L7.82059 3.646Z" />
			</svg>
		);

	let detailsStyleEditorSwitch = undefined;
	if (hasDetailStyleEditor) {
		detailsStyleEditorSwitch = (
			<div
				className={`_detailsSwitchEditor ${isDetailsStyleEditorOpen ? '_open' : ''}`}
				onClick={e => {
					e.preventDefault();
					e.stopPropagation();
					onDetailsStyleEditorClicked?.(name);
				}}
			>
				<svg
					width="10"
					height="10"
					viewBox="0 0 10 10"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M9.97228 3.25454C10.0386 3.4245 9.98264 3.61399 9.83966 3.7351L8.94239 4.50479C8.96518 4.66693 8.97762 4.83298 8.97762 5.00098C8.97762 5.16898 8.96518 5.33503 8.94239 5.49717L9.83966 6.26685C9.98264 6.38797 10.0386 6.57746 9.97228 6.74741C9.8811 6.97988 9.77127 7.20258 9.64487 7.41747L9.54747 7.5757C9.41071 7.79058 9.25736 7.99375 9.08952 8.18519C8.96725 8.32585 8.76418 8.37273 8.58182 8.31803L7.4276 7.97226C7.14992 8.17347 6.84324 8.34147 6.51583 8.46845L6.2568 9.5839C6.21535 9.76167 6.0703 9.90232 5.87965 9.93163C5.59369 9.97656 5.29943 10 4.99896 10C4.69849 10 4.40424 9.97656 4.11827 9.93163C3.92763 9.90232 3.78257 9.76167 3.74113 9.5839L3.4821 8.46845C3.15469 8.34147 2.84801 8.17347 2.57033 7.97226L1.41818 8.31998C1.23582 8.37468 1.03275 8.32585 0.910485 8.18715C0.742635 7.9957 0.589291 7.79254 0.452525 7.57765L0.355131 7.41942C0.228726 7.20453 0.118899 6.98183 0.0277212 6.74937C-0.0385897 6.57941 0.0173601 6.38992 0.160343 6.2688L1.05761 5.49912C1.03482 5.33503 1.02238 5.16898 1.02238 5.00098C1.02238 4.83298 1.03482 4.66693 1.05761 4.50479L0.160343 3.7351C0.0173601 3.61399 -0.0385897 3.4245 0.0277212 3.25454C0.118899 3.02207 0.228726 2.79938 0.355131 2.58449L0.452525 2.42626C0.589291 2.21137 0.742635 2.0082 0.910485 1.81676C1.03275 1.67611 1.23582 1.62922 1.41818 1.68392L2.5724 2.02969C2.85008 1.82848 3.15677 1.66048 3.48417 1.5335L3.7432 0.41805C3.78465 0.240281 3.9297 0.0996288 4.12034 0.0703262C4.40631 0.0234421 4.70056 0 5.00104 0C5.30151 0 5.59576 0.0234421 5.88173 0.0683727C6.07237 0.0976753 6.21743 0.238328 6.25887 0.416097L6.5179 1.53155C6.84531 1.65853 7.152 1.82653 7.42967 2.02774L8.58389 1.68197C8.76625 1.62727 8.96933 1.67611 9.09159 1.81481C9.25944 2.00625 9.41278 2.20942 9.54955 2.4243L9.64694 2.58254C9.77335 2.79742 9.88317 3.02012 9.97435 3.25259L9.97228 3.25454ZM5.00104 6.56378C5.4407 6.56378 5.86237 6.39913 6.17326 6.10605C6.48415 5.81296 6.65881 5.41546 6.65881 5.00098C6.65881 4.5865 6.48415 4.18899 6.17326 3.89591C5.86237 3.60282 5.4407 3.43817 5.00104 3.43817C4.56137 3.43817 4.13971 3.60282 3.82881 3.89591C3.51792 4.18899 3.34326 4.5865 3.34326 5.00098C3.34326 5.41546 3.51792 5.81296 3.82881 6.10605C4.13971 6.39913 4.56137 6.56378 5.00104 6.56378Z"
						fill="currentColor"
					/>
				</svg>
			</div>
		);
	}

	return (
		<div
			key={`${tabName}_${name}`}
			className={`_propertyGroup ${state ? '_opened' : '_closed'}`}
		>
			<div
				className="_propertyGroupHeader"
				tabIndex={0}
				onKeyDown={e => {
					if (e.key === 'Enter' || e.key === ' ')
						onChangePersonalization(`propertyEditor.${tabName}.${name}`, !state);
				}}
				onClick={() => onChangePersonalization(`propertyEditor.${tabName}.${name}`, !state)}
				onDoubleClick={() =>
					onChangePersonalization(`propertyEditor.${tabName}`, undefined)
				}
			>
				{star}
				{displayName
					.split(/[ _]/)
					.map(e => e.substring(0, 1).toUpperCase() + e.substring(1).toLowerCase())
					.join(' ')}
				{advSwitch}

				<span className="_propertyGroupHeaderIcon">
					{detailsStyleEditorSwitch}
					{state ? '-' : '+'}
				</span>
			</div>
			<div className="_propertyGroupContent">{child}</div>
		</div>
	);
}

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	store,
} from '../../../../context/StoreContext';
import { LocationHistory } from '../../../../types/common';
import PropertyEditor from '../PropertyEditor';
import ClassEditor from '../ClassEditor';
import StylePropertyEditor from '../StylePropertyEditor';
import { allPaths } from '../../../../util/allPaths';
import { LOCAL_STORE_PREFIX, PAGE_STORE_PREFIX, STORE_PREFIX } from '../../../../constants';
import { isNullValue } from '@fincity/kirun-js';
import { PageOperations } from '../../functions/PageOperations';

interface PropertyBarProps {
	theme: string;
	personalizationPath: string | undefined;
	onChangePersonalization: (prop: string, value: any) => void;
	url: string;
	pageExtractor: PageStoreExtractor;
	defPath: string | undefined;
	locationHistory: Array<LocationHistory>;
	selectedComponent?: string;
	selectedComponentsList: string[];
	onShowCodeEditor: (eventName: string) => void;
	slaveStore: any;
	editPageName: string | undefined;
	selectedSubComponent: string;
	onSelectedSubComponentChanged: (key: string) => void;
	storePaths: Set<string>;
	setStyleSelectorPref: (pref: any) => void;
	styleSelectorPref: any;
	previewMode: boolean;
	pageOperations: PageOperations;
	appPath: string | undefined;
	editorType: string | undefined;
}

export default function DnDPropertyBar({
	selectedComponent,
	selectedComponentsList,
	defPath,
	locationHistory,
	pageExtractor,
	personalizationPath,
	onChangePersonalization,
	theme,
	onShowCodeEditor,
	slaveStore,
	storePaths,
	editPageName,
	selectedSubComponent,
	onSelectedSubComponentChanged,
	setStyleSelectorPref,
	styleSelectorPref,
	previewMode,
	pageOperations,
	appPath,
	editorType,
}: PropertyBarProps) {
	const [currentTab, setCurrentTab] = React.useState(1);
	const [isDragging, setIsDragging] = useState<boolean>(false);
	const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
	const [isDragged, setIsDragged] = useState<boolean>(false);

	useEffect(() => {
		if (!personalizationPath) return;

		return addListenerAndCallImmediately(
			(_, v) => setCurrentTab(!isNullValue(v) ? v : 1),
			pageExtractor,
			`${personalizationPath}.currentPropertyTab`,
		);
	}, [personalizationPath]);

	useEffect(() => {
		if (!personalizationPath) return;

		return addListenerAndCallImmediately(
			(_, v) => setIsDragging(v ?? false),
			pageExtractor,
			`${personalizationPath}.propertyTabCurrentState`,
		);
	}, [personalizationPath]);

	useEffect(() => {
		if (!personalizationPath) return;

		return addListenerAndCallImmediately(
			(_, v) => setPosition(v ?? { x: 0, y: 0 }),
			pageExtractor,
			`${personalizationPath}.propertyTabPosition`,
		);
	}, [personalizationPath]);

	const onMouseDown = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			const current = e.currentTarget?.getBoundingClientRect();

			const outerContainer = e.currentTarget.parentElement?.getBoundingClientRect();

			let startX = e.clientX - position.x;
			let startY = e.clientY - position.y;

			const onMouseMove = (e: MouseEvent) => {
				if (isDragging) {
					const newX = e.clientX - startX;
					const newY = e.clientY - startY;

					const maxX = outerContainer?.width! - (current.width ?? 0);
					const maxY = outerContainer?.height! - (current.height ?? 0);

					const constrainedX = Math.max(Math.min(newX, 0), -maxX);
					const constrainedY = Math.max(Math.min(newY, maxY), 0);

					onChangePersonalization('propertyTabPosition', {
						x: constrainedX,
						y: constrainedY,
					});
					setIsDragged(true);
				}
			};

			const onMouseUp = () => {
				document?.removeEventListener('mousemove', onMouseMove as EventListener);
				document?.removeEventListener('mouseup', onMouseUp as EventListener);
				setIsDragged(false);
			};

			const onMouseLeave = () => {
				document?.removeEventListener('mousemove', onMouseMove as EventListener);
				setIsDragged(false);
			};

			document?.addEventListener('mousemove', onMouseMove as EventListener);
			e.currentTarget?.addEventListener('mouseleave', onMouseLeave as EventListener);
			document?.addEventListener('mouseup', onMouseUp as EventListener);

			return () => {
				document?.removeEventListener('mousemove', onMouseMove as EventListener);
				e.currentTarget?.removeEventListener('mouseleave', onMouseLeave as EventListener);
				document?.removeEventListener('mouseup', onMouseUp as EventListener);
			};
		},
		[isDragging, position, onChangePersonalization],
	);

	if (!selectedComponent || previewMode) return <div className="_propBar"></div>;
	let tab = <></>;
	if (currentTab === 1) {
		tab = (
			<PropertyEditor
				theme={theme}
				personalizationPath={personalizationPath}
				onChangePersonalization={onChangePersonalization}
				selectedComponent={selectedComponent}
				selectedComponentsList={selectedComponentsList}
				defPath={defPath}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				storePaths={storePaths}
				onShowCodeEditor={onShowCodeEditor}
				editPageName={editPageName}
				slaveStore={slaveStore}
				pageOperations={pageOperations}
				appPath={appPath}
				editorType={editorType}
			/>
		);
	} else if (currentTab === 2) {
		tab = (
			<StylePropertyEditor
				theme={theme}
				personalizationPath={personalizationPath}
				onChangePersonalization={onChangePersonalization}
				selectedComponent={selectedComponent}
				selectedComponentsList={selectedComponentsList}
				defPath={defPath}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				storePaths={storePaths}
				selectedSubComponent={selectedSubComponent}
				onSelectedSubComponentChanged={onSelectedSubComponentChanged}
				styleSelectorPref={styleSelectorPref}
				setStyleSelectorPref={setStyleSelectorPref}
				editPageName={editPageName}
				slaveStore={slaveStore}
				pageOperations={pageOperations}
				appPath={appPath}
			/>
		);
	} else if (currentTab === 3) {
		tab = (
			<StylePropertyEditor
				theme={theme}
				personalizationPath={personalizationPath}
				onChangePersonalization={onChangePersonalization}
				selectedComponent={selectedComponent}
				selectedComponentsList={selectedComponentsList}
				defPath={defPath}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				storePaths={storePaths}
				selectedSubComponent={selectedSubComponent}
				onSelectedSubComponentChanged={onSelectedSubComponentChanged}
				styleSelectorPref={styleSelectorPref}
				setStyleSelectorPref={setStyleSelectorPref}
				reverseStyleSections={true}
				editPageName={editPageName}
				slaveStore={slaveStore}
				pageOperations={pageOperations}
				appPath={appPath}
			/>
		);
	} else if (currentTab === 4) {
		tab = (
			<ClassEditor
				theme={theme}
				personalizationPath={personalizationPath}
				onChangePersonalization={onChangePersonalization}
				selectedComponent={selectedComponent}
				defPath={defPath}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				storePaths={storePaths}
				onShowCodeEditor={onShowCodeEditor}
				editPageName={editPageName}
				slaveStore={slaveStore}
				pageOperations={pageOperations}
			/>
		);
	}

	const grabIcon = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="36"
			height="36"
			viewBox="0 0 36 36"
			fill="none"
			className="_leftIcon _buckle"
			tabIndex={0}
			onClick={() => onChangePersonalization('propertyTabCurrentState', true)}
		>
			<g filter="url(#filter0_d_2404_3359)">
				<circle cx="18" cy="17" r="16" fill="white" />
				<circle
					cx="18"
					cy="17"
					r="15.8"
					stroke="black"
					strokeOpacity="0.05"
					strokeWidth="0.4"
				/>
			</g>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M25.1978 24.1988C25.0789 24.3177 24.9176 24.3845 24.7494 24.3845C24.5813 24.3845 24.42 24.3177 24.3011 24.1988L10.8014 10.6989C10.7424 10.64 10.6957 10.5701 10.6637 10.4931C10.6318 10.4161 10.6153 10.3336 10.6152 10.2503C10.6152 10.1669 10.6315 10.0844 10.6634 10.0074C10.6952 9.93038 10.7419 9.86039 10.8008 9.80142C10.8597 9.74245 10.9296 9.69566 11.0065 9.66371C11.0835 9.63177 11.166 9.61529 11.2493 9.61523C11.3327 9.61518 11.4152 9.63153 11.4922 9.66337C11.5692 9.69521 11.6392 9.7419 11.6982 9.80079L15.5066 13.6101L17.6825 11.434C18.4626 10.6538 19.5207 10.2155 20.624 10.2155C21.7272 10.2155 22.7853 10.6538 23.5654 11.434C24.3455 12.2141 24.7838 13.2723 24.7838 14.3756C24.7838 15.4789 24.3455 16.537 23.5654 17.3172L21.3901 19.4927L25.1985 23.3019C25.2574 23.3609 25.3042 23.4308 25.3361 23.5078C25.368 23.5848 25.3845 23.6673 25.3845 23.7507C25.3845 23.834 25.368 23.9166 25.3361 23.9936C25.3042 24.0705 25.2574 24.1405 25.1985 24.1994L25.1978 24.1988ZM20.492 18.5965L22.6686 16.4204C23.2109 15.8782 23.5156 15.1427 23.5156 14.3758C23.5157 13.6089 23.2111 12.8734 22.6689 12.3311C22.1267 11.7888 21.3913 11.4841 20.6245 11.484C19.8577 11.484 19.1222 11.7886 18.5799 12.3308L16.4033 14.5075L20.4927 18.5971L20.492 18.5965ZM14.3231 16.5878L13.3312 17.5798C12.7892 18.1221 12.4848 18.8575 12.4848 19.6243C12.4848 20.391 12.7892 21.1264 13.3312 21.6688C14.4126 22.7502 16.4636 22.6258 17.6438 21.4461L18.4099 20.6787C18.529 20.5598 18.6903 20.493 18.8586 20.4931C19.0268 20.4931 19.1881 20.56 19.307 20.679C19.4259 20.798 19.4927 20.9594 19.4927 21.1277C19.4926 21.2959 19.4257 21.4572 19.3067 21.5762L18.54 22.343C16.9659 23.9172 14.1069 24.2381 12.4345 22.5656C11.6545 21.7853 11.2163 20.7272 11.2163 19.624C11.2163 18.5207 11.6545 17.4626 12.4345 16.6823L13.4257 15.691C13.5447 15.572 13.706 15.5051 13.8742 15.5051C14.0425 15.505 14.2038 15.5718 14.3228 15.6907C14.4418 15.8096 14.5087 15.971 14.5088 16.1392C14.5088 16.3074 14.4421 16.4688 14.3231 16.5878Z"
				fill="#C8C8C8"
			/>
			<defs>
				<filter
					id="filter0_d_2404_3359"
					x="0"
					y="0"
					width="36"
					height="36"
					filterUnits="userSpaceOnUse"
					colorInterpolationFilters="sRGB"
				>
					<feFlood floodOpacity="0" result="BackgroundImageFix" />
					<feColorMatrix
						in="SourceAlpha"
						type="matrix"
						values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
						result="hardAlpha"
					/>
					<feOffset dy="1" />
					<feGaussianBlur stdDeviation="1" />
					<feComposite in2="hardAlpha" operator="out" />
					<feColorMatrix
						type="matrix"
						values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"
					/>
					<feBlend
						mode="normal"
						in2="BackgroundImageFix"
						result="effect1_dropShadow_2404_3359"
					/>
					<feBlend
						mode="normal"
						in="SourceGraphic"
						in2="effect1_dropShadow_2404_3359"
						result="shape"
					/>
				</filter>
			</defs>
		</svg>
	);

	const gripIcon = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="9"
			height="9"
			viewBox="0 0 9 9"
			fill="none"
			className="_leftIcon _grip"
			tabIndex={0}
		>
			<circle cx="7.5" cy="1.5" r="1.5" fill="#8E90A4" />
			<circle
				cx="7.5"
				cy="1.5"
				r="1.1"
				stroke="black"
				strokeOpacity="0.15"
				strokeWidth="0.8"
			/>
			<circle cx="1.5" cy="1.5" r="1.5" fill="#8E90A4" />
			<circle
				cx="1.5"
				cy="1.5"
				r="1.1"
				stroke="black"
				strokeOpacity="0.15"
				strokeWidth="0.8"
			/>
			<circle cx="7.5" cy="7.5" r="1.5" fill="#8E90A4" />
			<circle
				cx="7.5"
				cy="7.5"
				r="1.1"
				stroke="black"
				strokeOpacity="0.15"
				strokeWidth="0.8"
			/>
			<circle cx="1.5" cy="7.5" r="1.5" fill="#8E90A4" />
			<circle
				cx="1.5"
				cy="7.5"
				r="1.1"
				stroke="black"
				strokeOpacity="0.15"
				strokeWidth="0.8"
			/>
		</svg>
	);

	return (
		<div
			className={`_propBar _propBarVisible _right ${isDragging ? '_isDrag' : ''} ${
				isDragged ? '_isDragged' : ''
			}`}
			onMouseDown={onMouseDown}
			style={{
				right: isDragging ? -position.x : '',
				top: isDragging ? position.y : '',
			}}
		>
			<div className={`_dragBar ${isDragging ? '_unbuckled' : '_buckled'}`}>
				{isDragging ? gripIcon : grabIcon}
				{isDragging ? (
					<i
						className="_rightIcon fa-sharp fa-solid fa-xmark"
						onClick={() => onChangePersonalization('propertyTabCurrentState', false)}
					/>
				) : undefined}
			</div>
			<div className="_tabBar">
				<svg
					width="26"
					height="20"
					viewBox="0 0 26 20"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className={currentTab === 1 ? 'active' : ''}
					tabIndex={0}
					role="button"
					onClick={() => onChangePersonalization('currentPropertyTab', 1)}
					onKeyDown={e =>
						(e.key === 'Enter' || e.key === ' ') &&
						onChangePersonalization('currentPropertyTab', 1)
					}
				>
					<path d="M9.09233 9.09091C11.6027 9.09091 13.6378 7.05584 13.6378 4.54545C13.6378 2.03507 11.6027 0 9.09233 0C6.58194 0 4.54688 2.03507 4.54688 4.54545C4.54688 7.05584 6.58194 9.09091 9.09233 9.09091Z" />
					<path d="M0.909091 3.63672C0.667985 3.63672 0.436754 3.7325 0.266267 3.90299C0.0957789 4.07347 0 4.3047 0 4.54581C0 4.78692 0.0957789 5.01815 0.266267 5.18863C0.436754 5.35912 0.667985 5.4549 0.909091 5.4549H2.80909C2.69999 4.85375 2.69999 4.23787 2.80909 3.63672H0.909091Z" />
					<path d="M24.5458 3.63672H15.373C15.4821 4.23787 15.4821 4.85375 15.373 5.4549H24.5458C24.7869 5.4549 25.0181 5.35912 25.1886 5.18863C25.3591 5.01815 25.4549 4.78692 25.4549 4.54581C25.4549 4.3047 25.3591 4.07347 25.1886 3.90299C25.0181 3.7325 24.7869 3.63672 24.5458 3.63672Z" />
					<path d="M16.3647 10.9091C13.8543 10.9091 11.8192 12.9442 11.8192 15.4545C11.8192 17.9649 13.8543 20 16.3647 20C18.8751 20 20.9102 17.9649 20.9102 15.4545C20.9102 12.9442 18.8751 10.9091 16.3647 10.9091Z" />
					<path d="M24.546 16.3633C24.7871 16.3633 25.0183 16.2675 25.1888 16.097C25.3593 15.9265 25.4551 15.6953 25.4551 15.4542C25.4551 15.2131 25.3593 14.9819 25.1888 14.8114C25.0183 14.6409 24.7871 14.5451 24.546 14.5451L22.646 14.5451C22.7551 15.1463 22.7551 15.7621 22.646 16.3633L24.546 16.3633Z" />
					<path d="M0.909304 16.3633L10.082 16.3633C9.97293 15.7621 9.97293 15.1462 10.082 14.5451L0.909304 14.5451C0.668197 14.5451 0.436966 14.6409 0.266478 14.8114C0.095991 14.9819 0.000212569 15.2131 0.00021259 15.4542C0.000212611 15.6953 0.0959911 15.9265 0.266479 16.097C0.436966 16.2675 0.668198 16.3633 0.909304 16.3633Z" />
				</svg>

				<svg
					width="19"
					height="20"
					viewBox="0 0 19 20"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className={currentTab === 2 ? 'active' : ''}
					tabIndex={0}
					role="button"
					onClick={() => onChangePersonalization('currentPropertyTab', 2)}
					onKeyDown={e =>
						(e.key === 'Enter' || e.key === ' ') &&
						onChangePersonalization('currentPropertyTab', 2)
					}
				>
					<path d="M16.2051 3H15.9551V2.75C15.9551 1.23 14.7251 0 13.2051 0H3.20508C1.68508 0 0.455078 1.23 0.455078 2.75V4.75C0.455078 6.27 1.68508 7.5 3.20508 7.5H13.2051C14.7251 7.5 15.9551 6.27 15.9551 4.75V4.5H16.2051C16.8951 4.5 17.4551 5.06 17.4551 5.75V7.75C17.4551 8.44 16.8951 9 16.2051 9H10.2051C8.68508 9 7.45508 10.23 7.45508 11.75V12.12C6.30508 12.45 5.45508 13.5 5.45508 14.75V16.75C5.45508 18.27 6.68508 19.5 8.20508 19.5C9.72508 19.5 10.9551 18.27 10.9551 16.75V14.75C10.9551 13.5 10.1051 12.45 8.95508 12.12V11.75C8.95508 11.06 9.51508 10.5 10.2051 10.5H16.2051C17.7251 10.5 18.9551 9.27 18.9551 7.75V5.75C18.9551 4.23 17.7251 3 16.2051 3ZM8.20508 4.5H4.20508C3.79508 4.5 3.45508 4.16 3.45508 3.75C3.45508 3.34 3.79508 3 4.20508 3H8.20508C8.61508 3 8.95508 3.34 8.95508 3.75C8.95508 4.16 8.61508 4.5 8.20508 4.5Z" />
				</svg>
				<svg
					width="18"
					height="19"
					viewBox="0 0 18 19"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className={currentTab === 3 ? 'active' : ''}
					tabIndex={0}
					role="button"
					onClick={() => onChangePersonalization('currentPropertyTab', 3)}
					onKeyDown={e =>
						(e.key === 'Enter' || e.key === ' ') &&
						onChangePersonalization('currentPropertyTab', 3)
					}
				>
					<path d="M17.7219 13.5267C17.9397 13.1336 18.0081 12.6693 17.9136 12.2259C17.8191 11.7826 17.5685 11.3926 17.2116 11.1333L16.8033 10.8367C16.7337 10.7889 16.6776 10.7227 16.6406 10.6448C16.6036 10.5669 16.5871 10.4801 16.5928 10.3933C16.6151 10.15 16.6279 9.90667 16.6279 9.66667C16.6274 9.21955 16.589 8.77336 16.5131 8.33333C16.4945 8.24022 16.5021 8.14349 16.5349 8.05478C16.5677 7.96607 16.6244 7.88917 16.6981 7.83333L17.0553 7.57333C17.4114 7.31419 17.6614 6.9248 17.7559 6.48222C17.8504 6.03963 17.7825 5.5761 17.5656 5.18333L16.9277 4.02C16.7108 3.62807 16.3611 3.33534 15.9478 3.19959C15.5345 3.06383 15.0875 3.0949 14.695 3.28667L14.1368 3.56C14.0598 3.59589 13.975 3.60927 13.8913 3.5987C13.8076 3.58814 13.7282 3.55402 13.6616 3.5C13.1495 3.10845 12.5909 2.788 11.9998 2.54667C11.915 2.51792 11.8398 2.46432 11.7833 2.39223C11.7267 2.32013 11.6912 2.23259 11.6809 2.14L11.6585 1.66667C11.6241 1.21304 11.4273 0.789623 11.1076 0.480759C10.7878 0.171896 10.3684 0.000247015 9.93299 0H8.65717C8.22174 0.000247015 7.80237 0.171896 7.48259 0.480759C7.16282 0.789623 6.9661 1.21304 6.93161 1.66667L6.89653 2.13667C6.88604 2.22958 6.85048 2.31746 6.794 2.39006C6.73753 2.46265 6.66247 2.51697 6.57757 2.54667C5.93431 2.81508 5.33078 3.17759 4.78504 3.62333C4.71694 3.68174 4.63464 3.71922 4.54734 3.73158C4.46004 3.74394 4.37117 3.7307 4.29066 3.69333L4.05782 3.58C3.66534 3.38823 3.21834 3.35716 2.80502 3.49292C2.39169 3.62868 2.04207 3.9214 1.82513 4.31333L1.18721 5.47333C0.970142 5.86661 0.902132 6.33067 0.996623 6.77381C1.09111 7.21695 1.34123 7.60693 1.69754 7.86667L1.88573 8.00333C1.95415 8.05575 2.00675 8.12757 2.03728 8.21029C2.06781 8.29301 2.07499 8.38315 2.05796 8.47C1.92836 9.27658 1.92836 10.1001 2.05796 10.9067C2.07585 11.0045 2.06573 11.1058 2.02885 11.1977C1.99198 11.2896 1.92999 11.3681 1.85064 11.4233C1.4979 11.6489 1.24037 12.0061 1.13021 12.4226C1.02006 12.8391 1.06552 13.2838 1.25738 13.6667L1.97503 14.9667C2.19249 15.358 2.54234 15.65 2.95562 15.7852C3.3689 15.9203 3.81562 15.8887 4.20773 15.6967L4.3066 15.6467C4.38671 15.61 4.47496 15.5971 4.56163 15.6094C4.64829 15.6218 4.73002 15.6589 4.7978 15.7167C5.42974 16.2333 6.13881 16.6376 6.89653 16.9133C6.98673 16.9403 7.06728 16.9946 7.12801 17.0693C7.18875 17.1441 7.22695 17.2359 7.23781 17.3333C7.27444 17.7861 7.4718 18.2082 7.79111 18.5166C8.11042 18.825 8.52858 18.9975 8.96337 19H10.2392C10.6746 18.9998 11.094 18.8281 11.4138 18.5192C11.7335 18.2104 11.9303 17.787 11.9647 17.3333L11.9871 17.0533C11.9952 16.9665 12.0256 16.8835 12.075 16.8132C12.1244 16.7428 12.1909 16.6876 12.2678 16.6533C12.9409 16.3374 13.5646 15.9171 14.1177 15.4067C14.1885 15.34 14.277 15.2973 14.3716 15.2842C14.4661 15.2711 14.5621 15.2883 14.6472 15.3333L14.8417 15.43C15.2342 15.6218 15.6812 15.6528 16.0945 15.5171C16.5079 15.3813 16.8575 15.0886 17.0744 14.6967L17.7219 13.5267ZM9.44818 12.6667C8.81734 12.6667 8.20067 12.4712 7.67615 12.1049C7.15163 11.7386 6.74282 11.218 6.50141 10.6089C6.26 9.99986 6.19683 9.32964 6.3199 8.68303C6.44297 8.03643 6.74675 7.44249 7.19282 6.97631C7.63889 6.51014 8.20721 6.19267 8.82593 6.06405C9.44464 5.93543 10.086 6.00144 10.6688 6.25373C11.2516 6.50603 11.7497 6.93327 12.1002 7.48143C12.4507 8.0296 12.6377 8.67406 12.6377 9.33333C12.6377 10.2174 12.3017 11.0652 11.7035 11.6904C11.1054 12.3155 10.2941 12.6667 9.44818 12.6667Z" />
				</svg>

				<svg
					width="21"
					height="20"
					viewBox="0 0 21 20"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className={currentTab === 4 ? 'active' : ''}
					tabIndex={0}
					role="button"
					onClick={() => onChangePersonalization('currentPropertyTab', 4)}
					onKeyDown={e =>
						(e.key === 'Enter' || e.key === ' ') &&
						onChangePersonalization('currentPropertyTab', 4)
					}
				>
					<path d="M20.9551 14.5V17.5C20.9551 18.8807 19.8358 20 18.4551 20H11.3131C10.4274 20 9.97888 18.9335 10.5984 18.3005L16.4709 12.3005C16.6591 12.1083 16.9166 12 17.1856 12H18.4551C19.8358 12 20.9551 13.1193 20.9551 14.5ZM12.158 14.4512L14.6151 12L17.3251 9.28998C18.3026 8.31244 18.3026 6.72754 17.3251 5.75L15.2051 3.63C14.2275 2.65247 12.6426 2.65247 11.6651 3.63L10.748 4.54712C10.5604 4.73468 10.4551 4.98901 10.4551 5.25421C10.4551 5.25421 10.4551 10.5341 10.4517 13.7464C10.4507 14.6372 11.5273 15.0804 12.158 14.4512ZM8.95508 2.5V16C8.95508 17.08 8.51514 18.07 7.81494 18.79L7.77515 18.83C7.68506 18.92 7.58496 19.01 7.49512 19.08C7.19507 19.34 6.85498 19.54 6.50513 19.68C6.39502 19.73 6.28516 19.77 6.17505 19.81C5.78516 19.94 5.36499 20 4.95508 20C4.68506 20 4.41504 19.97 4.15503 19.92C4.02515 19.89 3.89502 19.86 3.76514 19.82C3.60498 19.77 3.45508 19.72 3.30518 19.65C3.30518 19.64 3.30518 19.64 3.29517 19.65C3.01514 19.51 2.74512 19.35 2.49512 19.16L2.48511 19.15C2.35498 19.05 2.23511 18.95 2.125 18.83C2.01514 18.71 1.90503 18.59 1.79517 18.46C1.60498 18.21 1.44507 17.94 1.30518 17.66C1.31494 17.65 1.31494 17.65 1.30518 17.65C1.30518 17.65 1.30518 17.64 1.29517 17.63C1.23511 17.49 1.18506 17.34 1.13501 17.19C1.09521 17.06 1.06494 16.93 1.03516 16.8C0.985107 16.54 0.955078 16.27 0.955078 16V2.5C0.955078 1 1.95508 0 3.45508 0H6.45508C7.95508 0 8.95508 1 8.95508 2.5ZM6.45508 16C6.45508 15.1729 5.78223 14.5 4.95508 14.5C4.12793 14.5 3.45508 15.1729 3.45508 16C3.45508 16.8271 4.12793 17.5 4.95508 17.5C5.78223 17.5 6.45508 16.8271 6.45508 16Z" />
				</svg>
			</div>
			<div className="_propContainer">{tab}</div>
		</div>
	);
}

import React, { useEffect, useRef, useState } from 'react';
import {
	addListenerAndCallImmediately,
	addListenerAndCallImmediatelyWithChildrenActivity,
	PageStoreExtractor,
} from '../../../../context/StoreContext';
import { StyleResolutionDefinition } from '../../../../util/styleProcessor';
import { IconHelper } from '../../../util/IconHelper';

interface DnDIFrameProps {
	personalizationPath: string | undefined;
	url: string;
	pageExtractor: PageStoreExtractor;
	desktopIframe: React.RefObject<HTMLIFrameElement>;
	tabletIframe: React.RefObject<HTMLIFrameElement>;
	mobileIframe: React.RefObject<HTMLIFrameElement>;
	previewMode: boolean;
	onChangePersonalization: (prop: string, value: any) => void;
}

export default function DnDIFrame({
	url,
	personalizationPath,
	pageExtractor,
	desktopIframe,
	tabletIframe,
	mobileIframe,
	previewMode,
	onChangePersonalization,
}: DnDIFrameProps) {
	const [desktop, setDesktop] = useState<boolean>(true);
	const [tablet, setTablet] = useState<boolean>(true);
	const [mobile, setMobile] = useState<boolean>(true);

	const [desktopHeight, setDesktopHeight] = useState('100%');
	const [tabletHeight, setTabletHeight] = useState('100%');
	const [mobileHeight, setMobileHeight] = useState('100%');

	const [scale, setScale] = useState<number>(1);

	const [mobileWidth, setMobileWidth] = useState<number>(480);
	const [tabletWidth, setTabletWidth] = useState<number>(960);
	const [desktopWidth, setDesktopWidth] = useState<number>(1280);

	useEffect(() => {
		if (!personalizationPath) return;
		return addListenerAndCallImmediatelyWithChildrenActivity(
			(_, v) => {
				setDesktop(v?.devices?.desktop ?? true);
				setTablet(v?.devices?.tablet ?? true);
				setMobile(v?.devices?.mobile ?? true);
				setScale(v?.devices?.scale ?? 1);
			},
			pageExtractor,
			`${personalizationPath}`,
		);
	}, [personalizationPath]);

	useEffect(() => {
		if (!desktopIframe.current) return;
		const handle = setInterval(() => {
			const hgt = desktopIframe.current?.contentWindow?.document.body?.scrollHeight + 'px';
			if (
				(desktopIframe.current?.contentWindow?.document.body?.scrollHeight ?? 0) -
					Number.parseInt(desktopHeight) <
				50
			)
				return;
			setDesktopHeight(hgt);
		}, 100);

		return () => clearInterval(handle);
	}, [desktopIframe.current, desktopHeight]);

	useEffect(() => {
		if (!tabletIframe.current) return;
		const handle = setInterval(() => {
			const hgt = tabletIframe.current?.contentWindow?.document.body?.scrollHeight + 'px';
			if (
				(tabletIframe.current?.contentWindow?.document.body?.scrollHeight ?? 0) -
					Number.parseInt(tabletHeight) <
				50
			)
				return;
			setTabletHeight(hgt);
		}, 100);

		return () => clearInterval(handle);
	}, [tabletIframe.current, tabletHeight]);

	useEffect(() => {
		if (!mobileIframe.current) return;
		const handle = setInterval(() => {
			const hgt = mobileIframe.current?.contentWindow?.document.body?.scrollHeight + 'px';
			if (
				(mobileIframe.current?.contentWindow?.document.body?.scrollHeight ?? 0) -
					Number.parseInt(mobileHeight) <
				50
			)
				return;
			setMobileHeight(hgt);
		}, 100);

		return () => clearInterval(handle);
	}, [mobileIframe.current, mobileHeight]);

	let desktopComponent = <></>;
	let tabletComponent = <></>;
	let mobileComponent = <></>;

	let left = 0;
	if (desktop) {
		desktopComponent = (
			<div
				className="_iframe"
				id="desktop"
				style={{
					minWidth: desktopWidth + 'px',
					maxWidth: desktopWidth + 'px',
					gap: `${20 / scale}px`,
				}}
			>
				<div
					className="_iframeHeader _screenSizes"
					style={{ width: `${scale * 100}%`, transform: `scale(${1 / scale})` }}
				>
					<DesktopIcon />
					DESKTOP
				</div>
				<iframe
					allow="display-capture"
					title="Desktop"
					ref={desktopIframe}
					src={url}
					height={desktopHeight}
					width={desktopWidth}
				/>
			</div>
		);

		left += desktopWidth + 20;
	}

	if (tablet) {
		tabletComponent = (
			<div
				className="_iframe"
				id="tablet"
				style={{
					minWidth: tabletWidth + 'px',
					maxWidth: tabletWidth + 'px',
					gap: `${20 / scale}px`,
				}}
			>
				<div
					className="_iframeHeader _screenSizes"
					style={{ width: `${scale * 100}%`, transform: `scale(${1 / scale})` }}
				>
					<TabletIcon />
					TABLET
				</div>
				<iframe
					allow="display-capture"
					title="Tablet"
					ref={tabletIframe}
					src={url}
					height={tabletHeight}
					width={tabletWidth}
				/>
			</div>
		);

		left += tabletWidth + 20;
	}

	if (mobile) {
		mobileComponent = (
			<div
				className="_iframe"
				id="mobile"
				style={{
					minWidth: mobileWidth + 'px',
					maxWidth: mobileWidth + 'px',
					gap: `${20 / scale}px`,
				}}
			>
				<div
					className="_iframeHeader _screenSizes"
					style={{ width: `${scale * 100}%`, transform: `scale(${1 / scale})` }}
				>
					<MobileIcon />
					MOBILE
				</div>
				<iframe
					allow="display-capture"
					title="Mobile"
					ref={mobileIframe}
					src={url}
					height={mobileHeight}
					width={mobileWidth}
				/>
			</div>
		);

		left += mobileWidth + 20;
	}

	let previewButton = <></>;
	if (previewMode) {
		previewButton = (
			<div
				className="_control"
				onClick={() => onChangePersonalization('preview', !previewMode)}
			>
				<IconHelper viewBox="0 0 20 16">
					<path
						d="M9.99826 1.68831C7.73457 1.68831 5.87362 2.72944 4.44666 4.06954C3.10997 5.32873 2.18644 6.82359 1.71426 7.87879C2.18644 8.93398 3.10997 10.4288 4.44319 11.688C5.87362 13.0281 7.73457 14.0693 9.99826 14.0693C12.262 14.0693 14.1229 13.0281 15.5499 11.688C16.8866 10.4288 17.8101 8.93398 18.2823 7.87879C17.8101 6.82359 16.8866 5.32873 15.5533 4.06954C14.1229 2.72944 12.262 1.68831 9.99826 1.68831ZM3.31134 2.83496C4.94662 1.29437 7.19295 0 9.99826 0C12.8036 0 15.0499 1.29437 16.6852 2.83496C18.31 4.36499 19.3968 6.19048 19.9141 7.44616C20.0286 7.72403 20.0286 8.03355 19.9141 8.31142C19.3968 9.5671 18.31 11.3961 16.6852 12.9226C15.0499 14.4632 12.8036 15.7576 9.99826 15.7576C7.19295 15.7576 4.94662 14.4632 3.31134 12.9226C1.68649 11.3961 0.599774 9.5671 0.08593 8.31142C-0.0286433 8.03355 -0.0286433 7.72403 0.08593 7.44616C0.599774 6.19048 1.68649 4.36147 3.31134 2.83496Z"
						fill="currentColor"
					/>
					<path
						d="M14.6875 8.15436C14.6875 10.6829 12.5898 12.7308 10 12.7308C7.41016 12.7308 5.3125 10.6829 5.3125 8.15436V8.03995C5.61133 8.11432 5.92773 8.15436 6.25 8.15436C8.31836 8.15436 10 6.51256 10 4.4932C10 4.17856 9.95898 3.86965 9.88281 3.57791H10C12.5898 3.57791 14.6875 5.62587 14.6875 8.15436Z"
						fill="currentColor"
					/>
				</IconHelper>
			</div>
		);
	}

	return (
		<div className="_iframeCenter">
			<div className="_scaleControlContainer" style={{ width: left + 'px' }}>
				<div className="_scaleControl">
					<div
						className="_control"
						onClick={() =>
							onChangePersonalization(
								'devices.scale',
								scale === 0 ? scale : scale - 0.1,
							)
						}
					>
						<svg
							width="16"
							height="3"
							viewBox="0 0 16 3"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M1.33333 2.8C0.727785 2.8 0.2 2.24203 0.2 1.5C0.2 0.757973 0.727785 0.2 1.33333 0.2H14.6667C15.2722 0.2 15.8 0.757973 15.8 1.5C15.8 2.24203 15.2722 2.8 14.6667 2.8H1.33333Z"
								fill="#4D7FEE"
								stroke="white"
								strokeWidth="0.4"
							/>
						</svg>
					</div>
					<div
						className="_control _text"
						onClick={() => onChangePersonalization('devices.scale', 1)}
					>
						{Math.round(scale * 100)} %{' '}
					</div>
					<div
						className="_control"
						onClick={() =>
							onChangePersonalization(
								'devices.scale',
								scale === 2 ? scale : scale + 0.1,
							)
						}
					>
						<svg
							width="16"
							height="15"
							viewBox="0 0 16 15"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M6.54545 6.33636H6.74545V6.13636V1.36364C6.74545 0.731795 7.29356 0.2 8 0.2C8.70644 0.2 9.25455 0.731795 9.25455 1.36364V6.13636V6.33636H9.45455H14.5455C15.2519 6.33636 15.8 6.86816 15.8 7.5C15.8 8.13184 15.2519 8.66364 14.5455 8.66364H9.45455H9.25455V8.86364V13.6364C9.25455 14.2682 8.70644 14.8 8 14.8C7.29356 14.8 6.74545 14.2682 6.74545 13.6364V8.86364V8.66364H6.54545H1.45455C0.748102 8.66364 0.2 8.13184 0.2 7.5C0.2 6.86816 0.748102 6.33636 1.45455 6.33636H6.54545Z"
								fill="#4C7FEE"
								stroke="white"
								strokeWidth="0.4"
							/>
						</svg>
					</div>
					<div
						className={`_control _device ${desktop ? '_active' : ''}`}
						onClick={() => onChangePersonalization('devices.desktop', !desktop)}
					>
						<DesktopIcon />
					</div>
					<div
						className={`_control _device ${tablet ? '_active' : ''}`}
						onClick={() => onChangePersonalization('devices.tablet', !tablet)}
					>
						<TabletIcon />
					</div>
					<div
						className={`_control _device ${mobile ? '_active' : ''}`}
						onClick={() => onChangePersonalization('devices.mobile', !mobile)}
					>
						<MobileIcon />
					</div>
					{previewButton}
				</div>
			</div>
			<div
				className="_iframeHolder"
				style={{ width: left + 'px', transform: `scale(${scale})` }}
			>
				{desktopComponent}
				{tabletComponent}
				{mobileComponent}
			</div>
		</div>
	);
}

export function DesktopIcon() {
	return (
		<svg
			width="18"
			height="17"
			viewBox="0 0 18 17"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M15.7302 1H2.26984C1.56853 1 1 1.58107 1 2.29786V12.989C1 13.7058 1.56853 14.2869 2.26984 14.2869H15.7302C16.4315 14.2869 17 13.7058 17 12.989V2.29786C17 1.58107 16.4315 1 15.7302 1Z"
				stroke="#C2C3CE"
			/>
			<path
				d="M14.0476 3H3.95238C3.4264 3 3 3.3936 3 3.87912V11.1209C3 11.6064 3.4264 12 3.95238 12H14.0476C14.5736 12 15 11.6064 15 11.1209V3.87912C15 3.3936 14.5736 3 14.0476 3Z"
				fill="#E8E9ED"
			/>
			<path
				d="M4.64062 16H13.3781"
				stroke="#C2C3CE"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export function TabletIcon() {
	return (
		<svg
			width="18"
			height="13"
			viewBox="0 0 18 13"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M1 2.15104L1 11.099C1 11.7347 1.51534 12.25 2.15104 12.25L15.849 12.25C16.4847 12.25 17 11.7347 17 11.099L17 2.15104C17 1.51534 16.4847 0.999999 15.849 0.999999L2.15104 1C1.51534 1 1 1.51534 1 2.15104Z"
				stroke="#C2C3CE"
			/>
			<path
				opacity="0.2"
				d="M3 4.02604L3 9.22396C3 9.85966 3.51534 10.375 4.15104 10.375L13.849 10.375C14.4847 10.375 15 9.85966 15 9.22396L15 4.02604C15 3.39034 14.4847 2.875 13.849 2.875L4.15104 2.875C3.51534 2.875 3 3.39034 3 4.02604Z"
				fill="#8E90A4"
			/>
			<path
				d="M16.33 6.5474C16.33 5.90399 15.8084 5.3824 15.165 5.3824C14.5216 5.3824 14 5.90399 14 6.5474C14 7.19081 14.5216 7.7124 15.165 7.7124C15.8084 7.7124 16.33 7.19081 16.33 6.5474Z"
				fill="#8E90A4"
			/>
		</svg>
	);
}

export function MobileIcon() {
	return (
		<svg
			width="11"
			height="18"
			viewBox="0 0 11 18"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M2.53752 17.0288L8.36752 17.0288C9.21666 17.0288 9.90503 16.3404 9.90503 15.4913L9.90503 2.53729C9.90503 1.68815 9.21667 0.999786 8.36753 0.999786L2.53752 0.999786C1.68838 0.999786 1.00002 1.68815 1.00002 2.53729L1.00002 15.4913C1.00002 16.3404 1.68838 17.0288 2.53752 17.0288Z"
				stroke="#8E90A4"
				strokeOpacity="0.5"
			/>
			<path
				d="M3.33951 15.2798L7.51097 15.2798C8.11855 15.2798 8.61108 14.7644 8.61108 14.1287L8.61109 3.43083C8.61109 2.79512 8.11855 2.27979 7.51098 2.27979L3.33952 2.27978C2.73194 2.27978 2.23941 2.79512 2.23941 3.43083L2.2394 14.1287C2.2394 14.7644 2.73194 15.2798 3.33951 15.2798Z"
				fill="#E8E9ED"
			/>
			<path
				d="M6.64128 14.7505C6.64128 14.1071 6.11969 13.5855 5.47628 13.5855C4.83287 13.5855 4.31128 14.1071 4.31128 14.7505C4.31128 15.3939 4.83287 15.9155 5.47628 15.9155C6.11969 15.9155 6.64128 15.3939 6.64128 14.7505Z"
				fill="#8E90A4"
			/>
		</svg>
	);
}

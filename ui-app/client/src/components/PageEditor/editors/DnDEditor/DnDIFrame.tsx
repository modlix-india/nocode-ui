import React, { useEffect, useState } from 'react';
import {
	PageStoreExtractor,
	addListener,
	addListenerAndCallImmediatelyWithChildrenActivity,
} from '../../../../context/StoreContext';
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

const DEVICES = {
	desktop: [
		{
			name: 'Desktop',
			width: 1280,
			height: 1024,
		},
		{
			name: 'HD Desktop',
			width: 1366,
			height: 768,
		},
		{
			name: 'WXGA+ Desktop',
			width: 1440,
			height: 900,
		},
		{
			name: 'WXGA Desktop',
			width: 1600,
			height: 900,
		},
		{
			name: 'FHD Desktop',
			width: 1920,
			height: 1080,
		},
		{
			name: 'QHD Desktop',
			width: 2560,
			height: 1440,
		},
		{
			name: '4K Desktop',
			width: 3840,
			height: 2160,
		},
	],

	tablet: [
		{
			name: 'Tablet',
			width: 960,
			height: 768,
		},
		{
			name: 'iPad Mini',
			width: 1024,
			height: 768,
		},
		{
			name: 'iPad Air',
			width: 1180,
			height: 820,
		},
		{
			name: 'iPad Pro',
			width: 1366,
			height: 1024,
		},
		{
			name: 'Surface Pro 7',
			width: 1368,
			height: 912,
		},
		{
			name: 'Samsung Galaxy Fold (open)',
			width: 717,
			height: 512,
		},
		{
			name: 'Samsung Galaxy Ultra (Landscape)',
			width: 915,
			height: 412,
		},
		{
			name: 'Nest Hub',
			width: 1024,
			height: 600,
		},
		{
			name: 'Nest Hub Max',
			width: 1280,
			height: 800,
		},
	],

	mobile: [
		{
			name: 'Mobile',
			width: 480,
			height: 667,
		},
		{
			name: 'iPhone SE',
			width: 375,
			height: 667,
		},
		{
			name: 'iPhone 6/7/8 Plus',
			width: 414,
			height: 736,
		},
		{
			name: 'iPhone XS Max',
			width: 414,
			height: 896,
		},
		{
			name: 'iPhone 15 Pro',
			width: 390,
			height: 844,
		},
		{
			name: 'iPhone 15 Pro Max',
			width: 428,
			height: 926,
		},
		{
			name: 'Samsung Galaxy S20',
			width: 360,
			height: 800,
		},
		{
			name: 'Samsung Galaxy S20+',
			width: 412,
			height: 870,
		},
		{
			name: 'Samsung Galaxy S20 Ultra',
			width: 412,
			height: 908,
		},
		{
			name: 'Google Pixel 8 XL',
			width: 411,
			height: 823,
		},
		{
			name: 'Google Pixel 8',
			width: 411,
			height: 731,
		},
		{
			name: 'Nothing',
			width: 360,
			height: 740,
		},
	],
};

export default function DnDIFrame({
	url,
	personalizationPath,
	pageExtractor,
	desktopIframe,
	tabletIframe,
	mobileIframe,
	previewMode,
	onChangePersonalization,
}: Readonly<DnDIFrameProps>) {
	const [theme, setTheme] = useState('_light');

	useEffect(() => {
		if (!personalizationPath) return;

		return addListener(
			pageExtractor.getPageName(),
			(_, v: string) => setTheme(v ?? '_light'),
			`${personalizationPath}.theme`,
		);
	}, [personalizationPath]);

	const [desktop, setDesktop] = useState<boolean>(true);
	const [tablet, setTablet] = useState<boolean>(true);
	const [mobile, setMobile] = useState<boolean>(true);

	const [scale, setScale] = useState<number>(1);

	const [desktopDevice, setDesktopDevice] = useState(DEVICES.desktop[0]);
	const [tabletDevice, setTabletDevice] = useState(DEVICES.tablet[0]);
	const [mobileDevice, setMobileDevice] = useState(DEVICES.mobile[0]);

	useEffect(() => {
		if (!personalizationPath) return;
		return addListenerAndCallImmediatelyWithChildrenActivity(
			pageExtractor.getPageName(),
			(_, v) => {
				setDesktop(v?.devices?.desktop ?? true);
				setTablet(v?.devices?.tablet ?? true);
				setMobile(v?.devices?.mobile ?? true);
				setScale(v?.devices?.scale ?? 1);
				if (v?.devices?.desktopDevice) {
					setDesktopDevice(
						DEVICES.desktop.find(d => d.name === v.devices.desktopDevice) ??
							DEVICES.desktop[0],
					);
				}
				if (v?.devices?.tabletDevice) {
					setTabletDevice(
						DEVICES.tablet.find(d => d.name === v.devices.tabletDevice) ??
							DEVICES.tablet[0],
					);
				}
				if (v?.devices?.mobileDevice) {
					setMobileDevice(
						DEVICES.mobile.find(d => d.name === v.devices.mobileDevice) ??
							DEVICES.mobile[0],
					);
				}
			},
			`${personalizationPath}`,
		);
	}, [personalizationPath]);

	let desktopComponent = <></>;
	let tabletComponent = <></>;
	let mobileComponent = <></>;

	const [showDevices, setShowDevices] = useState<
		{ left: number; top: number; name: 'desktop' | 'tablet' | 'mobile' } | undefined
	>();

	let left = 0;
	if (desktop) {
		desktopComponent = (
			<div
				className="_iframe"
				style={{
					minWidth: desktopDevice.width + 'px',
					maxWidth: desktopDevice.width + 'px',
					gap: `${40 / scale}px`,
				}}
			>
				<button
					className="_iframeHeader _screenSizes"
					style={{ width: `${scale * 100}%`, transform: `scale(${1 / scale})` }}
					onClick={e =>
						setShowDevices({ left: e.clientX, top: e.clientY, name: 'desktop' })
					}
				>
					{desktopDevice.name} ({desktopDevice.width} x {desktopDevice.height})
				</button>
				<iframe
					id="desktop"
					data-scale-factor={scale}
					allow="display-capture"
					title="Desktop"
					ref={desktopIframe}
					src={url}
					height={desktopDevice.height}
					width={desktopDevice.width}
				/>
			</div>
		);
	}

	if (desktop) {
		left += desktopDevice.width + 20;
	}

	if (tablet) {
		tabletComponent = (
			<div
				className="_iframe"
				style={{
					minWidth: tabletDevice.width + 'px',
					maxWidth: tabletDevice.width + 'px',
					gap: `${40 / scale}px`,
				}}
			>
				<button
					className="_iframeHeader _screenSizes"
					style={{ width: `${scale * 100}%`, transform: `scale(${1 / scale})` }}
					onClick={e =>
						setShowDevices({ left: e.clientX, top: e.clientY, name: 'tablet' })
					}
				>
					{tabletDevice.name} ({tabletDevice.width} x {tabletDevice.height})
				</button>
				<iframe
					id="tablet"
					data-scale-factor={scale}
					allow="display-capture"
					title="Tablet"
					ref={tabletIframe}
					src={url}
					height={tabletDevice.height}
					width={tabletDevice.width}
				/>
			</div>
		);
	}

	if (tablet) {
		left += tabletDevice.width + 20;
	}

	if (mobile) {
		mobileComponent = (
			<div
				className="_iframe"
				style={{
					minWidth: mobileDevice.width + 'px',
					maxWidth: mobileDevice.width + 'px',
					gap: `${40 / scale}px`,
				}}
			>
				<button
					className="_iframeHeader _screenSizes"
					style={{ width: `${scale * 100}%`, transform: `scale(${1 / scale})` }}
					onClick={e =>
						setShowDevices({ left: e.clientX, top: e.clientY, name: 'mobile' })
					}
				>
					{mobileDevice.name} ({mobileDevice.width} x {mobileDevice.height})
				</button>
				<iframe
					id="mobile"
					data-scale-factor={scale}
					allow="display-capture"
					title="Mobile"
					ref={mobileIframe}
					src={url}
					height={mobileDevice.height}
					width={mobileDevice.width}
				/>
			</div>
		);
	}

	let previewButton = <></>;
	if (previewMode) {
		previewButton = (
			<div
				className="_control"
				onKeyDown={() => {}}
				onClick={() => onChangePersonalization('preview', false)}
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

	let deviceMenu = <></>;
	if (showDevices) {
		let devices = DEVICES[showDevices.name];
		deviceMenu = (
			<div
				className={`_popupMenuBackground ${theme}`}
				onClick={() => setShowDevices(undefined)}
			>
				<div
					className="_popupMenuContainer _plain"
					style={{ left: showDevices.left, top: showDevices.top }}
					onClick={e => e.stopPropagation()}
				>
					<div className="_contextMenu">
						{devices.map((d: { name: string; width: number; height: number }) => (
							<button
								key={d.name}
								className="_popupMenuItem"
								onClick={() => {
									onChangePersonalization(
										`devices.${showDevices.name}Device`,
										d.name,
									);
									setShowDevices(undefined);
								}}
							>
								{d.name} ({d.width} x {d.height})
							</button>
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="_iframeCenter" id="iframeContainer">
			<div className="_scaleControlContainer" style={{ width: left + 'px' }}>
				<div className="_scaleControl">
					<button
						className="_control"
						onClick={() =>
							onChangePersonalization(
								'devices.scale',
								scale === 0 ? scale : scale - 0.1,
							)
						}
					>
						<svg
							width="10px"
							height="3"
							viewBox="0 0 16 3"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M1.33333 2.8C0.727785 2.8 0.2 2.24203 0.2 1.5C0.2 0.757973 0.727785 0.2 1.33333 0.2H14.6667C15.2722 0.2 15.8 0.757973 15.8 1.5C15.8 2.24203 15.2722 2.8 14.6667 2.8H1.33333Z"
								fill="currentColor"
							/>
						</svg>
					</button>
					<div
						className="_control _text"
						onKeyDown={() => {}}
						onClick={() => onChangePersonalization('devices.scale', 1)}
					>
						{Math.round(scale * 100)} %{' '}
					</div>
					<button
						className="_control"
						onClick={() =>
							onChangePersonalization(
								'devices.scale',
								scale === 2 ? scale : scale + 0.1,
							)
						}
					>
						<svg width="10" height="10" viewBox="0 0 10 10">
							<path
								d="M5.76923 0.769231C5.76923 0.34375 5.42548 0 5 0C4.57452 0 4.23077 0.34375 4.23077 0.769231V4.23077H0.769231C0.34375 4.23077 0 4.57452 0 5C0 5.42548 0.34375 5.76923 0.769231 5.76923H4.23077V9.23077C4.23077 9.65625 4.57452 10 5 10C5.42548 10 5.76923 9.65625 5.76923 9.23077V5.76923H9.23077C9.65625 5.76923 10 5.42548 10 5C10 4.57452 9.65625 4.23077 9.23077 4.23077H5.76923V0.769231Z"
								fill="currentColor"
							/>
						</svg>
					</button>
					<button
						className={`_control _device ${desktop ? '_active' : ''}`}
						onClick={() => onChangePersonalization('devices.desktop', !desktop)}
					>
						<DesktopIcon isActive={desktop} />
					</button>
					<button
						className={`_control _device ${tablet ? '_active' : ''}`}
						onClick={() => onChangePersonalization('devices.tablet', !tablet)}
					>
						<TabletIcon isActive={tablet} />
					</button>
					<button
						className={`_control _device ${mobile ? '_active' : ''}`}
						onClick={() => onChangePersonalization('devices.mobile', !mobile)}
					>
						<MobileIcon isActive={mobile} />
					</button>
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
				<div className="_dummyDevice" style={{ transform: `scale(${1 / scale})` }} />
			</div>
			{deviceMenu}
		</div>
	);
}

export function DesktopIcon({ isActive }: Readonly<{ isActive: boolean }>) {
	const [isHover, setIsHover] = useState(false);

	return (
		<svg
			width="22"
			height="18"
			fill="none"
			viewBox="0 0 22 18"
			onMouseEnter={() => setIsHover(true)}
			onMouseLeave={() => setIsHover(false)}
		>
			<path
				d="M19.4127 1H2.5873C1.71066 1 1 1.5831 1 2.3024V13.0309C1 13.7502 1.71066 14.3333 2.5873 14.3333H19.4127C20.2893 14.3333 21 13.7502 21 13.0309V2.3024C21 1.5831 20.2893 1 19.4127 1Z"
				stroke="#C2C3CE"
			/>
			<path
				d="M5.55078 16.5557H16.4726"
				stroke="#C2C3CE"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M3.22266 4.58639L3.22266 10.7469C3.22266 11.5003 3.89069 12.1111 4.71475 12.1111L17.2861 12.1111C18.1102 12.1111 18.7782 11.5003 18.7782 10.7469L18.7782 4.58639C18.7782 3.83297 18.1102 3.22219 17.2861 3.2222L4.71475 3.2222C3.89069 3.2222 3.22266 3.83297 3.22266 4.58639Z"
				fill={isActive || isHover ? 'url(#paint0_linear_1540_7211)' : '#8E90A433'}
			/>
			<defs>
				<linearGradient
					id="paint0_linear_1540_7211"
					x1="3.22266"
					y1="3.2222"
					x2="18.2227"
					y2="11.5555"
					gradientUnits="userSpaceOnUse"
				>
					<stop stopColor="#43B2FF" />
					<stop offset="1" stopColor="#52BD94" />
				</linearGradient>
			</defs>
		</svg>
	);
}

export function TabletIcon({ isActive }: Readonly<{ isActive: boolean }>) {
	const [isHover, setIsHover] = useState(false);

	return (
		<svg
			width="22"
			height="16"
			viewBox="0 0 22 16"
			fill="none"
			onMouseEnter={() => setIsHover(true)}
			onMouseLeave={() => setIsHover(false)}
		>
			<path
				d="M0.999999 2.47777L1 13.9665C1 14.7827 1.64417 15.4443 2.4388 15.4443L19.5612 15.4443C20.3558 15.4443 21 14.7827 21 13.9665L21 2.47777C21 1.66156 20.3558 0.999891 19.5612 0.999891L2.4388 0.999892C1.64417 0.999892 0.999999 1.66156 0.999999 2.47777Z"
				stroke="#C2C3CE"
			/>
			<path
				d="M3.22266 4.75689L3.22266 11.6874C3.22266 12.5351 3.89069 13.2222 4.71475 13.2222L17.2861 13.2222C18.1102 13.2222 18.7782 12.535 18.7782 11.6874L18.7782 4.75689C18.7782 3.90929 18.1102 3.22217 17.2861 3.22217L4.71475 3.22217C3.89069 3.22217 3.22266 3.90929 3.22266 4.75689Z"
				fill={isActive || isHover ? 'url(#paint0_linear_1540_7211)' : '#8E90A433'}
			/>
			<defs>
				<linearGradient
					id="paint0_linear_1540_7211"
					x1="3.22266"
					y1="3.2222"
					x2="18.2227"
					y2="11.5555"
					gradientUnits="userSpaceOnUse"
				>
					<stop stopColor="#43B2FF" />
					<stop offset="1" stopColor="#52BD94" />
				</linearGradient>
			</defs>
		</svg>
	);
}

export function MobileIcon({ isActive }: Readonly<{ isActive: boolean }>) {
	const [isHover, setIsHover] = useState(false);
	return (
		<svg
			width="12"
			height="18"
			viewBox="0 0 12 18"
			fill="none"
			onMouseEnter={() => setIsHover(true)}
			onMouseLeave={() => setIsHover(false)}
		>
			<path
				d="M9.27344 1H2.72656C1.77301 1 1 1.69785 1 2.5587V15.6913C1 16.5521 1.77301 17.25 2.72656 17.25H9.27344C10.227 17.25 11 16.5521 11 15.6913V2.5587C11 1.69785 10.227 1 9.27344 1Z"
				stroke="#8E90A4"
				strokeOpacity="0.5"
			/>
			<rect
				x="2.875"
				y="2.875"
				width="6.25"
				height="12.5"
				rx="0.5"
				fill={isActive || isHover ? 'url(#paint0_linear_1540_7211)' : '#8E90A433'}
			/>
			<defs>
				<linearGradient
					id="paint0_linear_1540_7211"
					x1="3.22266"
					y1="3.2222"
					x2="18.2227"
					y2="11.5555"
					gradientUnits="userSpaceOnUse"
				>
					<stop stopColor="#43B2FF" />
					<stop offset="1" stopColor="#52BD94" />
				</linearGradient>
			</defs>
		</svg>
	);
}

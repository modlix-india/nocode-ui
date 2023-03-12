import { TokenValueExtractor } from '@fincity/kirun-js';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
	addListenerWithChildrenActivity,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { LocationHistory, PageDefinition } from '../../types/common';
import { runEvent } from '../util/runEvent';
import { propertiesDefinition } from './pageEditorProperties';

interface TopBarProps {
	theme: string;
	personalizationPath: string | undefined;
	logo: string | undefined;
	pageName: string | undefined;
	onSave: () => void;
	onChangePersonalization: (prop: string, value: any) => void;
	url: string;
	onUrlChange: (url: string) => void;
	onDeletePersonalization: () => void;
	pageExtractor: PageStoreExtractor;
	onPageReload: () => void;
}

export default function TopBar({
	theme,
	personalizationPath,
	logo,
	onChangePersonalization,
	onSave,
	url,
	onUrlChange,
	onDeletePersonalization,
	pageExtractor,
	onPageReload,
}: TopBarProps) {
	const svgLogo = logo ? <img className="_logo" src={logo} /> : undefined;

	const [localUrl, setLocalUrl] = useState(url);
	const [deviceType, setDeviceType] = useState<string | undefined>();

	useEffect(() => setLocalUrl(url), [url]);
	useEffect(
		() =>
			personalizationPath
				? addListenerWithChildrenActivity(
						(_, v) => {
							setDeviceType(v?.deviceType);
						},
						pageExtractor,
						personalizationPath,
				  )
				: undefined,
		[personalizationPath],
	);

	const changeUrl = useCallback(() => {
		if (url === localUrl) return;

		if (localUrl.indexOf(':') !== -1) {
			setLocalUrl(url);
			return;
		}

		onUrlChange(localUrl);
	}, [localUrl]);

	const inputRef = useRef<HTMLInputElement>(null);

	const changeDeviceType = useCallback(
		(device: string) =>
			onChangePersonalization('deviceType', device === deviceType ? undefined : device),
		[onChangePersonalization, deviceType],
	);

	return (
		<div className="_topBarGrid">
			<div className="_topLeftBarGrid">
				{svgLogo}
				<div className="_inputBar">
					<input
						ref={inputRef}
						type="text"
						className="_urlInput"
						value={localUrl}
						onChange={e => setLocalUrl(e.target.value)}
						onBlur={changeUrl}
						onKeyUp={e => {
							if (e.key === 'Enter') changeUrl();
							else if (e.key === 'Escape') {
								setLocalUrl(url);
								setTimeout(() => inputRef.current?.blur(), 100);
							}
						}}
					/>
					<i
						className="fa fa-solid fa-rotate-left"
						title="Reload Page"
						tabIndex={0}
						role="button"
						onClick={onPageReload}
					></i>
				</div>
				<div className="_buttonBar _lightBackground">
					<i
						className={`fa fa-solid fa-display ${
							deviceType === 'WIDE_SCREEN' ? 'active' : ''
						}`}
						onClick={() => changeDeviceType('WIDE_SCREEN')}
						title="Wide Screen"
					></i>
					<i
						className={`fa fa-solid fa-laptop ${
							deviceType === 'DESKTOP_SCREEN' ? 'active' : ''
						}`}
						onClick={() => changeDeviceType('DESKTOP_SCREEN')}
						title="Desktop"
					></i>
					<i
						className={`fa fa-solid fa-tablet-screen-button _rotate-before-270 ${
							deviceType === 'TABLET_LANDSCAPE_SCREEN' ? 'active' : ''
						}`}
						onClick={() => changeDeviceType('TABLET_LANDSCAPE_SCREEN')}
						title="Tablet Landscape"
					></i>
					<i
						className={`fa fa-solid fa-tablet-screen-button ${
							deviceType === 'TABLET_POTRAIT_SCREEN' ? 'active' : ''
						}`}
						onClick={() => changeDeviceType('TABLET_POTRAIT_SCREEN')}
						title="Tablet"
					></i>
					<i
						className={`fa fa-solid fa-mobile-screen-button _rotate-before-270 ${
							deviceType === 'MOBILE_LANDSCAPE_SCREEN' ? 'active' : ''
						}`}
						onClick={() => changeDeviceType('MOBILE_LANDSCAPE_SCREEN')}
						title="Mobile Landscape"
					></i>
					<i
						className={`fa fa-solid fa-mobile-screen-button ${
							deviceType === 'MOBILE_POTRAIT_SCREEN' ? 'active' : ''
						}`}
						onClick={() => changeDeviceType('MOBILE_POTRAIT_SCREEN')}
						title="Mobile"
					></i>
				</div>
			</div>
			<div className="_topRightBarGrid">
				<div className="_buttonBar _lightBackground"></div>
				<div className="_iconMenu" tabIndex={0}>
					<i className="fa fa-solid fa-gear" />
					<div className="_iconMenuBody _bottom">
						<div
							className="_iconMenuOption"
							tabIndex={0}
							onClick={onDeletePersonalization}
						>
							Clear Personalization
						</div>
					</div>
				</div>
				<select
					value={theme}
					onChange={e => onChangePersonalization('theme', e.target.value)}
				>
					{propertiesDefinition
						.find(e => e.name === 'theme')
						?.enumValues?.map(e => (
							<option key={e.name} value={e.name} title={e.description}>
								{e.displayName}
							</option>
						))}
				</select>
				<button onClick={onSave}>Save</button>
			</div>
		</div>
	);
}

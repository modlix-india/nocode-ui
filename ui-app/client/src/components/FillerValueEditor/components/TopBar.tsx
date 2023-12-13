import React, { useEffect, useState } from 'react';
import {
	PageStoreExtractor,
	addListenerAndCallImmediatelyWithChildrenActivity,
} from '../../../context/StoreContext';
import { LocationHistory } from '../../../types/common';
import { getHref } from '../../util/getHref';
import { DesktopIcon, MobileIcon, RedoIcon, TabletIcon, UndoIcon } from './FillerValueEditorIcons';

export default function TopBar({
	logo,
	dashboardPageName,
	settingsPageName,
	onReset,
	onSave,
	onUndo,
	onRedo,
	hasUndo,
	hasRedo,
	onPersonalizationChange,
	pageExtractor,
	personalizationPath,
	url,
}: Readonly<{
	logo: string;
	dashboardPageName: string;
	settingsPageName: string;
	onSave: () => void;
	onUndo: () => void;
	onRedo: () => void;
	onReset: () => void;
	hasUndo: boolean;
	hasRedo: boolean;
	pageExtractor: PageStoreExtractor;
	locationHistory: Array<LocationHistory>;
	onPersonalizationChange: (k: string, v: any) => void;
	personalizationPath?: string;
	url: string;
}>) {
	const [pageMode, setPageMode] = useState<string>('DESKTOP');
	const [showMenu, setShowMenu] = useState<boolean>(false);

	useEffect(() => {
		if (!personalizationPath) return;

		return addListenerAndCallImmediatelyWithChildrenActivity(
			(_, v) => setPageMode(v?.pageMode ?? 'DESKTOP'),
			pageExtractor,
			personalizationPath,
		);
	}, [personalizationPath]);

	const menuBody = !showMenu ? undefined : (
		<div className="_simpleFillerPickerDropdownBody">
			<div
				className="_simpleFillerPickerDropdownOption"
				onClick={() => window.open(getHref(dashboardPageName, window.location), '_blank')}
			>
				Dashboard
			</div>
			<div
				className="_simpleFillerPickerDropdownOption"
				onClick={() => window.open(getHref(settingsPageName, window.location), '_blank')}
			>
				SettingsPage
			</div>
		</div>
	);

	return (
		<div className="_topBar">
			<div
				className="_main_editor_dropdown _simpleFillerPickerSelect"
				onClick={() => setShowMenu(true)}
				onMouseLeave={() => setShowMenu(false)}
			>
				<img className="_logo" src={logo} />
				{menuBody}
			</div>
			<div className="_resoultionBar">
				<div
					className={`_icon ${pageMode == 'DESKTOP' ? '_selected' : ''}`}
					onClick={() => onPersonalizationChange('pageMode', 'DESKTOP')}
				>
					<DesktopIcon />
				</div>
				<div
					className={`_icon ${pageMode == 'TABLET' ? '_selected' : ''}`}
					onClick={() => onPersonalizationChange('pageMode', 'TABLET')}
				>
					<TabletIcon />
				</div>
				<div
					className={`_icon ${pageMode == 'MOBILE' ? '_selected' : ''}`}
					onClick={() => onPersonalizationChange('pageMode', 'MOBILE')}
				>
					<MobileIcon />
				</div>
			</div>
			<div className="_rightButtonBar">
				<div
					className={`_button ${hasUndo ? '' : '_disabled'}`}
					onClick={onUndo}
					onKeyDown={e => {
						if (e.key === ' ' || e.key === 'Enter') onUndo();
					}}
				>
					<UndoIcon />
				</div>
				<div
					className={`_button ${hasRedo ? '' : '_disabled'}`}
					onClick={onRedo}
					onKeyDown={e => {
						if (e.key === ' ' || e.key === 'Enter') onRedo();
					}}
				>
					<RedoIcon />
				</div>
				<div
					className="_saveButton"
					onClick={onSave}
					onKeyDown={e => {
						if (e.key === ' ' || e.key === 'Enter') onSave();
					}}
				>
					Publish
				</div>
				<div
					className="_outlineButton"
					onClick={() => window.open(url, '_blank')}
					onKeyDown={e => {
						if (e.key === ' ' || e.key === 'Enter') window.open(url, '_blank');
					}}
				>
					View Site
				</div>
				<div
					className="_outlineButton"
					onClick={onReset}
					onKeyDown={e => {
						if (e.key === ' ' || e.key === 'Enter') onReset();
					}}
				>
					Reset
				</div>
			</div>
		</div>
	);
}

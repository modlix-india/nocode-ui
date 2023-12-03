import React, { useEffect, useState } from 'react';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	addListenerAndCallImmediatelyWithChildrenActivity,
} from '../../../context/StoreContext';
import { LocationHistory } from '../../../types/common';
import { getHref } from '../../util/getHref';
import { DesktopIcon, MobileIcon, RedoIcon, TabletIcon, UndoIcon } from './FillerValueEditorIcons';

export default function TopBar({
	logo,
	dashboardPageName,
	settingsPageName,
	onSave,
	onUndo,
	onRedo,
	hasUndo,
	hasRedo,
	onPersonalizationChange,
	pageExtractor,
	personalizationPath,
}: {
	logo: string;
	dashboardPageName: string;
	settingsPageName: string;
	onSave: () => void;
	onUndo: () => void;
	onRedo: () => void;
	hasUndo: boolean;
	hasRedo: boolean;
	pageExtractor: PageStoreExtractor;
	locationHistory: Array<LocationHistory>;
	onPersonalizationChange: (k: string, v: any) => void;
	personalizationPath?: string;
}) {
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
				<div className={`_button ${hasUndo ? '' : '_disabled'}`} onClick={onUndo}>
					<UndoIcon />
				</div>
				<div className={`_button ${hasRedo ? '' : '_disabled'}`} onClick={onRedo}>
					<RedoIcon />
				</div>
				<div className="_saveButton">Publish</div>
			</div>
		</div>
	);
}

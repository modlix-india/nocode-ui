import React, { useEffect, useState } from 'react';
import { PageStoreExtractor, addListenerAndCallImmediately } from '../../../context/StoreContext';
import { LocationHistory } from '../../../types/common';
import { getHref } from '../../util/getHref';

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

		return addListenerAndCallImmediately(
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
		</div>
	);
}

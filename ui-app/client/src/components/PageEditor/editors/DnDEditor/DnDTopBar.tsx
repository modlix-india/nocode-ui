import { deepEqual } from '@fincity/kirun-js';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
	addListenerWithChildrenActivity,
	PageStoreExtractor,
	setData,
} from '../../../../context/StoreContext';
import { LocationHistory, PageDefinition } from '../../../../types/common';
import { propertiesDefinition } from '../../pageEditorProperties';
import duplicate from '../../../../util/duplicate';

interface TopBarProps {
	theme: string;
	personalizationPath: string | undefined;
	onSave: () => void;
	onChangePersonalization: (prop: string, value: any) => void;
	url: string;
	onUrlChange: (url: string) => void;
	onDeletePersonalization: () => void;
	pageExtractor: PageStoreExtractor;
	onPageReload: () => void;
	defPath: string | undefined;
	locationHistory: Array<LocationHistory>;
	firstTimeRef: React.MutableRefObject<PageDefinition[]>;
	undoStackRef: React.MutableRefObject<PageDefinition[]>;
	redoStackRef: React.MutableRefObject<PageDefinition[]>;
	latestVersion: React.MutableRefObject<number>;
	previewMode: boolean;
}

export default function DnDTopBar({
	theme,
	personalizationPath,
	onChangePersonalization,
	onSave,
	url,
	onUrlChange,
	onDeletePersonalization,
	pageExtractor,
	onPageReload,
	defPath,
	firstTimeRef,
	undoStackRef,
	redoStackRef,
	latestVersion,
	previewMode,
}: TopBarProps) {
	const [localUrl, setLocalUrl] = useState(url);
	const [deviceType, setDeviceType] = useState<string | undefined>();
	const [changed, setChanged] = useState(Date.now());

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
	useEffect(() => {
		if (!defPath) return;

		return addListenerWithChildrenActivity(
			(_, v) => {
				if (v?.isFromUndoRedoStack) return;
				if (
					deepEqual(
						v,
						undoStackRef.current.length
							? undoStackRef.current[undoStackRef.current.length - 1]
							: firstTimeRef.current[0],
					)
				)
					return;
				if (!firstTimeRef.current.length) {
					firstTimeRef.current.push(duplicate(v));
					return;
				}

				if (latestVersion.current < v.version) latestVersion.current = v.version;

				undoStackRef.current.push(duplicate(v));
				redoStackRef.current.length = 0;
				setChanged(Date.now());
			},
			pageExtractor,
			defPath,
		);
	}, [defPath, pageExtractor]);

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

	if (previewMode) return <div className="_topBarGrid _previewMode"> </div>;

	return (
		<div className="_topBarGrid">
			<div className="_topLeftBarGrid">
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
					<div className="_iconMenu" tabIndex={0}>
						<i
							className="fa fa-solid fa-rotate-left"
							title="Reload Page"
							tabIndex={0}
							role="button"
							onClick={onPageReload}
						></i>
					</div>
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
				<div className="_buttonBar">
					<i
						className={`fa fa-solid fa-left-long ${
							undoStackRef.current.length ? 'active' : ''
						}`}
						onClick={() => {
							if (!undoStackRef.current.length || !defPath) return;
							const x = undoStackRef.current[undoStackRef.current.length - 1];
							undoStackRef.current.splice(undoStackRef.current.length - 1, 1);
							redoStackRef.current.splice(0, 0, x);
							const pg = duplicate(
								undoStackRef.current.length
									? undoStackRef.current[undoStackRef.current.length - 1]
									: firstTimeRef.current[0],
							);
							pg.version = latestVersion.current;
							pg.isFromUndoRedoStack = true;
							setData(defPath, pg, pageExtractor.getPageName());
							setChanged(Date.now());
						}}
						title="Undo"
					/>
					<i
						className={`fa fa-solid fa-right-long ${
							redoStackRef.current.length ? 'active' : ''
						}`}
						onClick={() => {
							if (!redoStackRef.current.length || !defPath) return;
							const x = redoStackRef.current[0];
							undoStackRef.current.push(x);
							redoStackRef.current.splice(0, 1);
							const pg = duplicate(
								undoStackRef.current.length
									? undoStackRef.current[undoStackRef.current.length - 1]
									: firstTimeRef.current[0],
							);
							pg.version = latestVersion.current;
							pg.isFromUndoRedoStack = true;
							setData(defPath, pg, pageExtractor.getPageName());
							setChanged(Date.now());
						}}
						title="Redo"
					/>
				</div>
				<div className="_iconMenu" tabIndex={0}>
					<i className="fa fa-solid fa-gear" />
					<div className="_iconMenuBody _bottom _right">
						<div
							className="_iconMenuOption"
							tabIndex={0}
							onClick={onDeletePersonalization}
						>
							<i className="fa fa-solid fa-broom" />
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

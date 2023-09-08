import { deepEqual, isNullValue } from '@fincity/kirun-js';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
	addListenerWithChildrenActivity,
	getData,
	getDataFromPath,
	PageStoreExtractor,
	setData,
} from '../../../../context/StoreContext';
import { ComponentProperty, LocationHistory, PageDefinition } from '../../../../types/common';
import { propertiesDefinition } from '../../pageEditorProperties';
import { duplicate } from '@fincity/kirun-js';
import Portal from '../../../Portal';
import { StringValueEditor } from '../../../SchemaForm/components/StringValueEditor';
import PropertyValueEditor from '../propertyValueEditors/PropertyValueEditor';
import {
	LOCAL_STORE_PREFIX,
	SCHEMA_BOOL_COMP_PROP,
	SCHEMA_STRING_COMP_PROP,
} from '../../../../constants';
import { ComponentPropertyEditor } from '../../../../types/common';
import { ComponentPropertyDefinition } from '../../../../types/common';
import PageOperations from '../../functions/PageOperations';

interface TopBarProps {
	theme: string;
	personalizationPath: string | undefined;
	onSave: () => void;
	onPublish?: () => void;
	onVersions?: () => void;
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
	editPageName: string | undefined;
	slaveStore: any;
	storePaths: Set<string>;
	selectedSubComponent: string;
	selectedComponent?: string;
	onSelectedSubComponentChanged: (key: string) => void;
	onSelectedComponentChanged: (key: string) => void;
	pageOperations: PageOperations;
}

function removeExcessPages(pid: string) {
	let i = 0,
		key = null;
	const delKeys = new Array<string>();
	const allKeys = new Array<string>();

	while ((key = window.localStorage.key(i++))) {
		if (!key.startsWith('pgdef_')) continue;
		if (key.indexOf(pid) != -1) delKeys.push(key);
		else allKeys.push(key);
	}

	delKeys.forEach(k => window.localStorage.removeItem(k));
	const remKeys = allKeys.sort((a, b) => {
		let anum = parseInt(a.split('_')[2]);
		let bnum = parseInt(b.split('_')[2]);
		return bnum - anum;
	});
	if (remKeys.length > 10) remKeys.slice(10).forEach(k => window.localStorage.removeItem(k));
}

export default function DnDTopBar({
	theme,
	personalizationPath,
	onChangePersonalization,
	onSave,
	onPublish,
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
	editPageName,
	slaveStore,
	storePaths,
	locationHistory,
	selectedComponent,
	selectedSubComponent,
	onSelectedComponentChanged,
	onSelectedSubComponentChanged,
	pageOperations,
	onVersions,
}: TopBarProps) {
	const [localUrl, setLocalUrl] = useState(url);
	const [deviceType, setDeviceType] = useState<string | undefined>();
	const [properties, setProperties] = useState<any>({});
	const [showProperties, setShowProperties] = useState(false);
	const [page, setPage] = useState<PageDefinition>();
	const [changed, setChanged] = useState(Date.now());
	const [permission, setPermission] = useState<string>('');
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

				setProperties(v?.properties ?? {});
				setPage(v as PageDefinition);
				setPermission(v?.permission ?? '');

				if (!firstTimeRef.current.length) {
					firstTimeRef.current.push(duplicate(v));
					return;
				}

				if (latestVersion.current < v.version) latestVersion.current = v.version;

				removeExcessPages(v.id);
				window.localStorage.setItem(`pgdef_${v.id}_${Date.now()}`, JSON.stringify(v));

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

	const updatePageProperties = useCallback(
		(
			propType: 'title' | 'simple' | 'compprop' | 'seo' | 'permission',
			propName: string,
			value: any,
		) => {
			if (!defPath) return;

			const page = duplicate(
				getDataFromPath(defPath, locationHistory, pageExtractor) ?? {},
			) as PageDefinition;
			if (!page.properties) page.properties = {};
			if (propType === 'permission') {
				if (isNullValue(value.value)) delete page.permission;
				else page.permission = value?.value;
			} else if (propType === 'title') {
				if (!page.properties.title) page.properties.title = {};
				if (propName === 'name')
					if (isNullValue(value.value) && isNullValue(value.location?.expression))
						delete page.properties.title.name;
					else page.properties.title.name = value as ComponentProperty<string>;
				else if (propName === 'append')
					if (isNullValue(value.value) && isNullValue(value.location?.expression))
						delete page.properties.title.append;
					else page.properties.title.append = value as ComponentProperty<string>;
			} else if (propType === 'seo') {
				if (!page.properties.seo) page.properties.seo = {};
				if (isNullValue(value.value) && isNullValue(value.location?.expression))
					delete page.properties.seo[propName];
				else page.properties.seo[propName] = value as ComponentProperty<string>;
			} else {
				if (isNullValue(value.value)) delete page.properties[propName];
				else page.properties[propName] = value.value;
			}
			setData(defPath, page, pageExtractor.getPageName());
		},
		[],
	);

	if (previewMode) return <div className="_topBarGrid _previewMode"> </div>;

	const eventEnums = Object.entries(page?.eventFunctions ?? {}).map(([k, v]) => ({
		name: k,
		displayName: v.name,
		description: v.description ?? v.name,
	}));
	let popup = <></>;
	if (showProperties) {
		const seoNames = [
			{
				name: 'description',
				displayName: 'Description',
				schema: SCHEMA_STRING_COMP_PROP,
				editor: ComponentPropertyEditor.LARGE_TEXT,
			},
			{
				name: 'keywords',
				displayName: 'Keywords',
				schema: SCHEMA_STRING_COMP_PROP,
				editor: undefined,
			},
			{
				name: 'robots',
				displayName: 'Robots',
				schema: SCHEMA_STRING_COMP_PROP,
				editor: undefined,
			},
			{
				name: 'charset',
				displayName: 'Charset',
				schema: SCHEMA_STRING_COMP_PROP,
				editor: undefined,
			},
			{
				name: 'author',
				displayName: 'Author',
				schema: SCHEMA_STRING_COMP_PROP,
				editor: undefined,
			},
			{
				name: 'applicationName',
				displayName: 'Application Name',
				schema: SCHEMA_STRING_COMP_PROP,
				editor: undefined,
			},
			{
				name: 'generator',
				displayName: 'Generator',
				schema: SCHEMA_STRING_COMP_PROP,
				editor: undefined,
			},
		].map((propDef: ComponentPropertyDefinition) => (
			<div className="_eachProp" key={propDef.name}>
				<div className="_propLabel">{propDef.displayName}</div>
				<PropertyValueEditor
					propDef={propDef}
					value={properties?.seo?.[propDef.name]}
					onChange={v => updatePageProperties('seo', propDef.name, v)}
					storePaths={storePaths}
					slaveStore={slaveStore}
					editPageName={editPageName}
					pageOperations={pageOperations}
				/>
			</div>
		));
		popup = (
			<Portal>
				<div className={`_popupBackground`} onClick={() => setShowProperties(false)}>
					<div
						className="_popupContainer _pageProperties"
						onClick={e => e.stopPropagation()}
					>
						<div className="_popupHeader">Page Properties</div>
						<div className="_popupContent _propertyContent">
							<div className="_pagePropertiesGrid _pageSimplePropGrid">
								<div className="_eachProp">
									<div className="_propLabel">Page Title</div>
									<PropertyValueEditor
										propDef={{
											name: 'title',
											displayName: 'Page Title',
											schema: SCHEMA_STRING_COMP_PROP,
										}}
										value={properties?.title?.name}
										onChange={v => updatePageProperties('title', 'name', v)}
										storePaths={storePaths}
										slaveStore={slaveStore}
										editPageName={editPageName}
										pageOperations={pageOperations}
									/>
								</div>
								<div className="_eachProp">
									<div className="_propLabel">Append/Prepend Title</div>
									<PropertyValueEditor
										propDef={{
											name: 'append',
											displayName: 'Append Title',
											defaultValue: 'true',
											schema: SCHEMA_STRING_COMP_PROP,
											enumValues: [
												{
													name: 'true',
													displayName: 'Append',
													description:
														'Appends the title after the application title',
												},
												{
													name: 'prepend',
													displayName: 'Prepend',
													description:
														'Prepends the title before the application title',
												},
												{
													name: 'false',
													displayName: 'Full',
													description: 'Shows the title only',
												},
											],
										}}
										value={properties?.title?.append}
										onChange={v => updatePageProperties('title', 'append', v)}
										storePaths={storePaths}
										slaveStore={slaveStore}
										editPageName={editPageName}
										pageOperations={pageOperations}
									/>
								</div>
								<div className="_eachProp">
									<div className="_propLabel">Wrap Shell</div>
									<PropertyValueEditor
										propDef={{
											name: 'wrapShell',
											displayName: 'Wrap Shell',
											schema: SCHEMA_BOOL_COMP_PROP,
										}}
										value={{ value: properties?.wrapShell }}
										onlyValue={true}
										onChange={v =>
											updatePageProperties('simple', 'wrapShell', v)
										}
										storePaths={storePaths}
										slaveStore={slaveStore}
										editPageName={editPageName}
										pageOperations={pageOperations}
									/>
								</div>
								{eventEnums.length ? (
									<div className="_eachProp">
										<div className="_propLabel">On Load Function</div>
										<PropertyValueEditor
											propDef={{
												name: 'onLoadEvent',
												displayName: 'On Load Event Function',
												schema: SCHEMA_STRING_COMP_PROP,
												enumValues: eventEnums,
											}}
											value={{ value: properties?.onLoadEvent }}
											onlyValue={true}
											onChange={v =>
												updatePageProperties('simple', 'onLoadEvent', v)
											}
											storePaths={storePaths}
											slaveStore={slaveStore}
											editPageName={editPageName}
											pageOperations={pageOperations}
										/>
									</div>
								) : (
									<></>
								)}
								<div className="_eachProp">
									<div className="_propLabel">Load Strategy</div>
									<PropertyValueEditor
										propDef={{
											name: 'loadStrategy',
											displayName: 'Load Strategy',
											schema: SCHEMA_STRING_COMP_PROP,
											defaultValue: 'default',
											enumValues: [
												{
													name: 'default',
													displayName: 'No Force Call',
													description:
														"Don't call on load function on page loading.",
												},
												{
													name: 'reload',
													displayName: 'Force Call',
													description:
														'Force call on load function on page loading',
												},
											],
										}}
										value={{ value: properties?.loadStrategy }}
										onlyValue={true}
										onChange={v =>
											updatePageProperties('simple', 'loadStrategy', v)
										}
										storePaths={storePaths}
										slaveStore={slaveStore}
										editPageName={editPageName}
										pageOperations={pageOperations}
									/>
								</div>
								<div className="_eachProp">
									<div className="_propLabel">Permission Expression</div>
									<PropertyValueEditor
										propDef={{
											name: 'permission',
											displayName: 'Permission Expression',
											schema: SCHEMA_STRING_COMP_PROP,
										}}
										value={{ value: permission }}
										onlyValue={true}
										onChange={v =>
											updatePageProperties('permission', 'permission', v)
										}
										storePaths={storePaths}
										slaveStore={slaveStore}
										editPageName={editPageName}
										pageOperations={pageOperations}
									/>
								</div>
							</div>
							<div className="_pagePropertiesGrid">{seoNames}</div>
						</div>
						<div className="_right">
							<button onClick={() => setShowProperties(false)}>Close</button>
						</div>
					</div>
				</div>
			</Portal>
		);
	}

	return (
		<div className="_topBarGrid">
			<div className="_topLeftBarGrid">
				<div className="_inputBar">
					<div className="_urlInput _peInput">
						<i className="fa fa-solid fa-globe" title="Current Address."></i>
						<input
							ref={inputRef}
							type="text"
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
					</div>
				</div>
				<div className="_topLeftCenterBarGrid">
					<ScreenSizeButtons
						deviceType={deviceType}
						changeDeviceType={changeDeviceType}
					/>
				</div>
			</div>
			<div className="_topRightBarGrid">
				<div className="_buttonBar">
					<i
						className="fa fa-solid fa-rotate-left"
						title="Reload Page"
						tabIndex={0}
						role="button"
						onClick={onPageReload}
					></i>
				</div>
				<i className="fa fa-solid fa-grip-lines-vertical _separator" />
				<div className="_buttonBar">
					<i
						className={`fa fa-solid fa-arrow-turn-up _rotate-270 ${
							undoStackRef.current.length ? '_hasData' : '_hasNoData'
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
							) as PageDefinition;
							pg.version = latestVersion.current;
							pg.isFromUndoRedoStack = true;

							if (selectedComponent && !pg.componentDefinition[selectedComponent]) {
								onSelectedComponentChanged('');
								onSelectedSubComponentChanged('');
							}

							setData(defPath, pg, pageExtractor.getPageName());
							setChanged(Date.now());
						}}
						title="Undo"
					/>
					<i
						className={`fa fa-solid fa-arrow-turn-down _rotate-270 ${
							redoStackRef.current.length ? '_hasData' : '_hasNoData'
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
							) as PageDefinition;
							pg.version = latestVersion.current;
							pg.isFromUndoRedoStack = true;
							if (selectedComponent && !pg.componentDefinition[selectedComponent]) {
								onSelectedComponentChanged('');
								onSelectedSubComponentChanged('');
							}
							setData(defPath, pg, pageExtractor.getPageName());
							setChanged(Date.now());
						}}
						title="Redo"
					/>
				</div>
				<i className="fa fa-solid fa-grip-lines-vertical _separator" />
				<div className="_buttonBar">
					<i
						onClick={() =>
							onChangePersonalization(
								'theme',
								theme === '_light' ? '_dark' : '_light',
							)
						}
						className={`fa fa-solid fa-circle-half-stroke ${
							theme === '_light' ? '_rotate-180' : ''
						}`}
					/>
				</div>
				<div className="_iconMenu _personalize" tabIndex={0}>
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
						<div
							className="_iconMenuOption"
							tabIndex={0}
							onClick={() => setShowProperties(true)}
						>
							<i className="fa fa-solid fa-wrench" />
							Page Properties
						</div>
					</div>
				</div>
				<i className="fa fa-solid fa-grip-lines-vertical _separator" />
				<div className="_buttonBar">
					<i onClick={onSave} title="Save" className="fa fa-solid fa-floppy-disk" />
					{onPublish && (
						<i
							onClick={onPublish}
							title="Publish"
							className="fa fa-solid fa-square-arrow-up-right"
						/>
					)}
					{onVersions && (
						<i
							onClick={onVersions}
							title="Versions"
							className="fa fa-solid  fa-clock-rotate-left"
						/>
					)}
				</div>
			</div>
			{popup}
		</div>
	);
}

function ScreenSizeButtons({
	deviceType,
	changeDeviceType,
}: {
	deviceType: string | undefined;
	changeDeviceType: (device: string) => void;
}) {
	const ACTVICE_BG = 'rgba(150, 161, 180, 1)';
	const INACTIVE_BG = 'rgba(150, 161, 180, 0.2)';

	const ACTIVE_STROKE = 'rgba(142, 144, 164, 1)';
	const INACTIVE_STROKE = 'rgba(142, 144, 164, 0.5)';

	return (
		<div className="_buttonBar _screenSizes">
			<svg
				width="22"
				height="22"
				viewBox="0 0 22 22"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				className={deviceType === 'WIDE_SCREEN' ? 'active' : ''}
				onClick={() => changeDeviceType('WIDE_SCREEN')}
				style={{ width: '37px' }}
			>
				<path
					d="M19.2074 1H2.5696C1.70273 1 1 1.70273 1 2.5696V15.4992C1 16.3661 1.70273 17.0688 2.5696 17.0688H19.2074C20.0742 17.0688 20.777 16.3661 20.777 15.4992V2.5696C20.777 1.70273 20.0742 1 19.2074 1Z"
					fill={deviceType === 'WIDE_SCREEN' ? ACTVICE_BG : INACTIVE_BG}
					stroke={deviceType === 'WIDE_SCREEN' ? ACTIVE_STROKE : INACTIVE_STROKE}
					strokeWidth="1.53"
				/>
				<path
					d="M5.5 20.3501H16.3"
					stroke={deviceType === 'WIDE_SCREEN' ? ACTIVE_STROKE : INACTIVE_STROKE}
					strokeWidth="1.53"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="21.054"
				height="14.604"
				viewBox="0 0 21.054 14.604"
				className={`fa fa-solid fa-laptop ${
					deviceType === 'DESKTOP_SCREEN' ? 'active' : ''
				}`}
				onClick={() => changeDeviceType('DESKTOP_SCREEN')}
				style={{ width: '37px' }}
			>
				<g id="Group_59" data-name="Group 59" transform="translate(-1341.261 -237.23)">
					<path
						id="Path_112"
						data-name="Path 112"
						d="M15.813,1H2.277A1.277,1.277,0,0,0,1,2.277V12.8a1.277,1.277,0,0,0,1.277,1.277H15.813A1.277,1.277,0,0,0,17.09,12.8V2.277A1.277,1.277,0,0,0,15.813,1Z"
						transform="translate(1342.743 236.995)"
						fill={deviceType === 'DESKTOP_SCREEN' ? ACTVICE_BG : INACTIVE_BG}
						stroke={deviceType === 'DESKTOP_SCREEN' ? ACTIVE_STROKE : INACTIVE_STROKE}
						strokeWidth="1.53"
					/>
					<path
						id="Path_113"
						data-name="Path 113"
						d="M5.5,20.35H25.024"
						transform="translate(1336.526 230.719)"
						fill="none"
						stroke={deviceType === 'DESKTOP_SCREEN' ? ACTIVE_STROKE : INACTIVE_STROKE}
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="1.53"
					/>
				</g>
			</svg>

			<svg
				className={deviceType === 'TABLET_LANDSCAPE_SCREEN' ? 'active' : ''}
				onClick={() => changeDeviceType('TABLET_LANDSCAPE_SCREEN')}
				width="25.53"
				style={{ width: '37px' }}
				height="18.405"
				viewBox="0 0 25.53 18.405"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<g
					id="Group_57"
					data-name="Group 57"
					transform="translate(24.765 0.765) rotate(90)"
				>
					<path
						id="Path_106"
						data-name="Path 106"
						d="M15.148,24H1.727A1.727,1.727,0,0,1,0,22.273V1.727A1.727,1.727,0,0,1,1.727,0H15.148a1.727,1.727,0,0,1,1.727,1.727V22.273A1.727,1.727,0,0,1,15.148,24Z"
						transform="translate(0 0)"
						fill="none"
						stroke={
							deviceType === 'TABLET_LANDSCAPE_SCREEN'
								? ACTIVE_STROKE
								: INACTIVE_STROKE
						}
						strokeWidth="1.53"
					/>
					<path
						id="Path_107"
						data-name="Path 107"
						d="M9.523,18h-7.8A1.727,1.727,0,0,1,0,16.273V1.727A1.727,1.727,0,0,1,1.727,0h7.8A1.727,1.727,0,0,1,11.25,1.727V16.273A1.727,1.727,0,0,1,9.523,18Z"
						transform="translate(2.813 3)"
						fill={deviceType === 'TABLET_LANDSCAPE_SCREEN' ? ACTVICE_BG : INACTIVE_BG}
					/>
					<path
						id="Path_108"
						data-name="Path 108"
						d="M1,0A1,1,0,1,1,0,1,1,1,0,0,1,1,0Z"
						transform="translate(7.907 2.282)"
						fill={deviceType === 'TABLET_LANDSCAPE_SCREEN' ? ACTVICE_BG : INACTIVE_BG}
					/>
				</g>
			</svg>
			<svg
				className={deviceType === 'TABLET_POTRAIT_SCREEN' ? 'active' : ''}
				onClick={() => changeDeviceType('TABLET_POTRAIT_SCREEN')}
				width="19"
				height="26"
				viewBox="0 0 19 26"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M16.1484 1H2.72656C1.77301 1 1 1.77301 1 2.72656V23.2734C1 24.227 1.77301 25 2.72656 25H16.1484C17.102 25 17.875 24.227 17.875 23.2734V2.72656C17.875 1.77301 17.102 1 16.1484 1Z"
					stroke={
						deviceType === 'TABLET_POTRAIT_SCREEN' ? ACTIVE_STROKE : INACTIVE_STROKE
					}
					strokeWidth="1.53"
				/>
				<path
					d="M13.3359 4H5.53906C4.58551 4 3.8125 4.77301 3.8125 5.72656V20.2734C3.8125 21.227 4.58551 22 5.53906 22H13.3359C14.2895 22 15.0625 21.227 15.0625 20.2734V5.72656C15.0625 4.77301 14.2895 4 13.3359 4Z"
					fill={deviceType === 'TABLET_POTRAIT_SCREEN' ? ACTVICE_BG : INACTIVE_BG}
				/>
				<path
					d="M9.90723 22.7178C10.4595 22.7178 10.9072 22.2701 10.9072 21.7178C10.9072 21.1655 10.4595 20.7178 9.90723 20.7178C9.35494 20.7178 8.90723 21.1655 8.90723 21.7178C8.90723 22.2701 9.35494 22.7178 9.90723 22.7178Z"
					fill={deviceType === 'TABLET_POTRAIT_SCREEN' ? ACTVICE_BG : INACTIVE_BG}
				/>
			</svg>
			<svg
				width="21"
				height="12"
				viewBox="0 0 21 12"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				className={deviceType === 'MOBILE_LANDSCAPE_SCREEN' ? 'active' : ''}
				onClick={() => changeDeviceType('MOBILE_LANDSCAPE_SCREEN')}
				style={{ width: '36px' }}
			>
				<path
					d="M1.28223 2.72656L1.28223 9.27344C1.28223 10.227 2.05523 11 3.00879 11L17.5557 11C18.5092 11 19.2822 10.227 19.2822 9.27344V2.72656C19.2822 1.77301 18.5092 1 17.5557 1L3.00879 1C2.05523 1 1.28223 1.77301 1.28223 2.72656Z"
					stroke={
						deviceType === 'MOBILE_LANDSCAPE_SCREEN' ? ACTIVE_STROKE : INACTIVE_STROKE
					}
					strokeWidth="1.53"
				/>
				<path
					d="M1 2.4375L1 10.4375C1 10.9898 1.44772 11.4375 2 11.4375L16 11.4375C16.5523 11.4375 17 10.9898 17 10.4375V2.4375C17 1.88521 16.5523 1.4375 16 1.4375L2 1.4375C1.44772 1.4375 1 1.88521 1 2.4375Z"
					fill={deviceType === 'MOBILE_LANDSCAPE_SCREEN' ? ACTVICE_BG : INACTIVE_BG}
				/>
				<path
					d="M2 4.4375L2 7.9375C2 8.21364 2.22386 8.4375 2.5 8.4375H3.5C3.77614 8.4375 4 8.21364 4 7.9375V4.4375C4 4.16136 3.77614 3.9375 3.5 3.9375H2.5C2.22386 3.9375 2 4.16136 2 4.4375Z"
					fill="white"
				/>
			</svg>
			<svg
				width="13"
				height="21"
				viewBox="0 0 13 21"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				className={deviceType === 'MOBILE_POTRAIT_SCREEN' ? 'active' : ''}
				onClick={() => changeDeviceType('MOBILE_POTRAIT_SCREEN')}
				style={{ width: '28px' }}
			>
				<path
					d="M9.71094 1.28223H3.16406C2.21051 1.28223 1.4375 2.05523 1.4375 3.00879V17.5557C1.4375 18.5092 2.21051 19.2822 3.16406 19.2822H9.71094C10.6645 19.2822 11.4375 18.5092 11.4375 17.5557V3.00879C11.4375 2.05523 10.6645 1.28223 9.71094 1.28223Z"
					strokeWidth="1.53"
					stroke={
						deviceType === 'MOBILE_POTRAIT_SCREEN' ? ACTIVE_STROKE : INACTIVE_STROKE
					}
				/>
				<path
					d="M10 1H2C1.44772 1 1 1.44772 1 2V16C1 16.5523 1.44772 17 2 17H10C10.5523 17 11 16.5523 11 16V2C11 1.44772 10.5523 1 10 1Z"
					fill={deviceType === 'MOBILE_POTRAIT_SCREEN' ? ACTVICE_BG : INACTIVE_BG}
				/>
				<path
					d="M8 2H4.5C4.22386 2 4 2.22386 4 2.5V3.5C4 3.77614 4.22386 4 4.5 4H8C8.27614 4 8.5 3.77614 8.5 3.5V2.5C8.5 2.22386 8.27614 2 8 2Z"
					fill="white"
				/>
			</svg>
		</div>
	);
}

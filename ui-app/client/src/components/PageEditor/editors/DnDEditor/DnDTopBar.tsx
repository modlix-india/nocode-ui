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
import { SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../../../constants';
import { ComponentPropertyEditor } from '../../../../types/common';
import { ComponentPropertyDefinition } from '../../../../types/common';
import PageOperations from '../../functions/PageOperations';

interface TopBarProps {
	theme: string;
	personalizationPath: string | undefined;
	onSave: () => void;
	onPublish?: () => void;
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
					<div className="_buttonBar _screenSizes">
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

					<i
						className={`fa fa-solid fa-arrow-turn-up fa-rotate-270 ${
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
						className={`fa fa-solid fa-arrow-turn-down fa-rotate-270 ${
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
					<i
						onClick={() =>
							onChangePersonalization(
								'theme',
								theme === '_light' ? '_dark' : '_light',
							)
						}
						className={`fa fa-solid fa-circle-half-stroke ${
							theme === '_light' ? 'fa-rotate-180' : ''
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
				<button onClick={onSave}>Save</button>

				{onPublish && <button onClick={onPublish}>Publish</button>}
			</div>
			{popup}
		</div>
	);
}

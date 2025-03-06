import { isNullValue } from '@fincity/kirun-js';
import React, { useEffect, useState } from 'react';
import { FileBrowser, imageURLForFile } from '../../commonComponents/FileBrowser';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	getPathFromLocation,
	setData,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { IconHelper } from '../util/IconHelper';
import useDefinition from '../util/useDefinition';
import TextStyle from './FileSelectorStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './fileSelectorProperties';
import { styleDefaults } from './fileSelectorStyleProperties';
import { validate } from '../../util/validationProcessor';
import { flattenUUID } from '../util/uuid';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { runEvent } from '../util/runEvent';
import { select } from 'd3';
import getSrcUrl from '../util/getSrcUrl';

function FileSelector(props: Readonly<ComponentProps>) {
	const {
		pageDefinition: { translations },
		definition,
		definition: { bindingPath },
		locationHistory,
		context,
		pageDefinition,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		properties: {
			colorScheme,
			onSelect,
			restrictNavigationToTopLevel,
			startLocation,
			fileUploadSizeLimit,
			restrictUploadType,
			restrictSelectionType,
			fileCategory,
			selectionType,
			hideUploadFile,
			hideDelete,
			hideCreateFolder,
			hideEdit,
			resourceType,
			uploadImage,
			removeImage,
			readOnly,
			designType,
			validation,
			cropToWidth,
			cropToHeight,
			cropToCircle,
			cropToMaxWidth,
			cropToMaxHeight,
			cropToMinWidth,
			cropToMinHeight,
			cropToAspectRatio,
			editOnUpload,
			clientCode,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	const [hover, setHover] = useState(false);
	const [isDirty, setIsDirty] = React.useState(false);
	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ hover },
		stylePropertiesWithPseudoStates,
	);

	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	const [selectedFile, setSelectedFile] = useState('');
	const [showBrowser, setShowBrowser] = useState(false);
	const [showFullScreen, setShowFullScreen] = useState(false);

	const [validationMessages, setValidationMessages] = React.useState<Array<string>>([]);

	const [recentlySelected, setRecentlySelected] = useState<{
		file: string;
		type: string;
		directory: boolean;
	}>();

	useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediately(
			(_, value) => setSelectedFile(isNullValue(value) ? '' : value),
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath]);

	const onChangeSelection = async (file: string, type: string, directory: boolean) => {
		if (!bindingPathPath) return;
		setData(bindingPathPath, selectedFile === file ? undefined : file, context.pageName, true);
		setShowBrowser(false);
		setRecentlySelected({ file, type, directory });
		setIsDirty(true);
		if (!onSelect || !pageDefinition.eventFunctions[onSelect]) return;
		await runEvent(
			pageDefinition.eventFunctions[onSelect],
			onSelect,
			props.context.pageName,
			props.locationHistory,
			props.pageDefinition,
		);
	};

	const handleRemoveFile = () => {
		setSelectedFile('');
		setIsDirty(true);
		if (bindingPathPath) {
			setData(bindingPathPath, undefined, context.pageName, true);
		}
		if (!onSelect || !pageDefinition.eventFunctions[onSelect]) return;
		runEvent(
			pageDefinition.eventFunctions[onSelect],
			onSelect,
			props.context.pageName,
			props.locationHistory,
			props.pageDefinition,
		);
	};

	let content;
	if (designType === 'button') {
		if (selectedFile) {
			let directory = recentlySelected?.directory ?? false;
			let type =
				recentlySelected?.type ??
				(selectedFile ? selectedFile.split('.').pop()?.toLowerCase() : '') ??
				'';
			content = (
				<>
					<img
						key={selectedFile}
						ref={async e => {
							if (!e || e.src) return;
							const dataURL = await imageURLForFile(selectedFile, directory, type);
							e.src = dataURL;
						}}
						alt="Selected file"
						style={resolvedStyles.image ?? {}}
						onClick={e => e.currentTarget == e.target && setShowBrowser(true)}
					/>
					<RemoveImage image={removeImage} onClick={handleRemoveFile} />
				</>
			);
		} else
			content = (
				<>
					<UploadImage
						image={uploadImage}
						onClick={() => {
							setShowBrowser(true);
							setIsDirty(true);
						}}
					/>
				</>
			);
		if (showBrowser)
			content = (
				<>
					{content}
					<div
						className="_popupBackground"
						onClick={e => {
							if (e.target === e.currentTarget) setShowBrowser(false);
						}}
					>
						<div className={`_popupContainer ${showFullScreen ? '_fullScreen' : ''}`}>
							<div
								className="_fullScreenButton"
								onClick={() => setShowFullScreen(!showFullScreen)}
							>
								{showFullScreen ? <ToSmallScreen /> : <ToFullScreen />}
							</div>
							<FileBrowser
								selectedFile={selectedFile}
								restrictNavigationToTopLevel={restrictNavigationToTopLevel}
								startLocation={startLocation}
								fileUploadSizeLimit={fileUploadSizeLimit}
								restrictUploadType={restrictUploadType}
								restrictSelectionType={restrictSelectionType}
								fileCategory={fileCategory}
								selectionType={selectionType}
								hideUploadFile={hideUploadFile}
								hideDelete={hideDelete}
								hideCreateFolder={hideCreateFolder}
								hideEdit={hideEdit}
								resourceType={resourceType}
								onChange={onChangeSelection}
								cropToWidth={cropToWidth}
								cropToHeight={cropToHeight}
								cropToCircle={cropToCircle}
								cropToMaxWidth={cropToMaxWidth}
								cropToMaxHeight={cropToMaxHeight}
								cropToMinWidth={cropToMinWidth}
								cropToMinHeight={cropToMinHeight}
								cropToAspectRatio={cropToAspectRatio}
								editOnUpload={editOnUpload}
								clientCode={clientCode}
							/>
						</div>
					</div>
				</>
			);
	} else {
		content = (
			<FileBrowser
				selectedFile={selectedFile}
				restrictNavigationToTopLevel={restrictNavigationToTopLevel}
				startLocation={startLocation}
				fileUploadSizeLimit={fileUploadSizeLimit}
				restrictUploadType={restrictUploadType}
				restrictSelectionType={restrictSelectionType}
				fileCategory={fileCategory}
				selectionType={selectionType}
				hideUploadFile={hideUploadFile}
				hideDelete={hideDelete}
				hideCreateFolder={hideCreateFolder}
				hideEdit={hideEdit}
				resourceType={resourceType}
				onChange={onChangeSelection}
				cropToWidth={cropToWidth}
				cropToHeight={cropToHeight}
				cropToCircle={cropToCircle}
				cropToMaxWidth={cropToMaxWidth}
				cropToMaxHeight={cropToMaxHeight}
				cropToMinWidth={cropToMinWidth}
				cropToMinHeight={cropToMinHeight}
				cropToAspectRatio={cropToAspectRatio}
				editOnUpload={editOnUpload}
				clientCode={clientCode}
			/>
		);
	}

	useEffect(() => {
		if (!validation) return;
		const msgs = validate(
			props.definition,
			props.pageDefinition,
			validation,
			selectedFile,
			locationHistory,
			pageExtractor,
		);

		setValidationMessages(msgs);

		setData(
			`Store.validations.${context.pageName}.${flattenUUID(definition.key)}`,
			msgs.length ? msgs : undefined,
			context.pageName,
			true,
		);
		return () =>
			setData(
				`Store.validations.${context.pageName}.${flattenUUID(definition.key)}`,
				undefined,
				context.pageName,
				true,
			);
	}, [selectedFile, validation]);

	const hasErrorMessages =
		validationMessages?.length && (isDirty || context.showValidationMessages) && !readOnly;

	let validationsOrSupportText = undefined;
	if (hasErrorMessages) {
		validationsOrSupportText = (
			<div className="_validationMessages" style={resolvedStyles.errorTextContainer ?? {}}>
				<SubHelperComponent definition={definition} subComponentName="errorTextContainer" />
				{validationMessages.map(msg => (
					<div
						className={`_eachValidationMessage`}
						style={resolvedStyles.errorText ?? {}}
						key={msg}
					>
						<SubHelperComponent definition={definition} subComponentName="errorText" />
						{msg}
					</div>
				))}
			</div>
		);
	}

	return (
		<div
			className={`comp compFileSelector ${selectedFile ? '_withImage' : ''} ${colorScheme}`}
			style={resolvedStyles.comp ?? {}}
		>
			<HelperComponent context={props.context} definition={definition} />
			{content}
			{validationsOrSupportText}
		</div>
	);
}

function UploadImage({ image, onClick }: { image: string; onClick: () => void }) {
	if (image) {
		return (
			<img
				className="_imageButton"
				src={getSrcUrl(image)}
				alt="Upload"
				onClick={e => (e.target === e.currentTarget ? onClick() : undefined)}
			/>
		);
	}
	return (
		<svg
			className="_imageButton"
			xmlns="http://www.w3.org/2000/svg"
			width="47.2"
			height="47.2"
			viewBox="0 0 47.2 47.2"
			onClick={onClick}
		>
			<g id="Group_113" data-name="Group 113" transform="translate(-0.4 -0.4)">
				<path
					id="Path_288"
					data-name="Path 288"
					d="M36.278,30.861l.683.683V29.71a1.885,1.885,0,1,1,3.77,0V41.141A6.457,6.457,0,0,1,34.276,47.6H6.855A6.457,6.457,0,0,1,.4,41.141V13.706A6.457,6.457,0,0,1,6.855,7.247h16a1.886,1.886,0,0,1,0,3.773h-16A2.686,2.686,0,0,0,4.17,13.706V27.475l.683-.683,3.378-3.38a6.11,6.11,0,0,1,8.422,0l5.664,5.666.283.283.283-.283,1.6-1.6h0a5.973,5.973,0,0,1,8.415,0h0ZM4.287,32.7l-.117.117v8.327a2.686,2.686,0,0,0,2.685,2.686H31.723l-.683-.683-9.826-9.831-7.244-7.247h0l-.007-.007a2.2,2.2,0,0,0-3.043,0h0l-.007.007Zm32.674,8.448v-4.26l-.116-.117-6.6-6.651h0a2.159,2.159,0,0,0-3.083,0h0l-1.6,1.6L25.279,32l.281.283L35.867,42.635l.325.327.278-.368A2.436,2.436,0,0,0,36.961,41.144ZM47.041,7.793h0a1.887,1.887,0,0,1,0,2.679l0,0a1.885,1.885,0,0,1-2.677,0h0L41.416,7.5l-.684-.69V20.565a1.885,1.885,0,1,1-3.77,0V6.813l-.684.69-2.947,2.971h0a1.895,1.895,0,0,1-2.678-2.682L37.5.938a1.884,1.884,0,0,1,.619-.393h0l.007,0a1.884,1.884,0,0,1,1.432,0h0l.007,0a1.886,1.886,0,0,1,.619.393Z"
					fill="currentColor"
				/>
				<path
					id="Path_289"
					data-name="Path 289"
					d="M31.5,20,11.5.974A2.612,2.612,0,0,0,7.97.908l-6.117,5.4a4,4,0,0,0-1.354,3v7.844A3.851,3.851,0,0,0,4.351,21H30.5A1,1,0,0,0,31.5,20Z"
					transform="translate(0 23.745)"
					opacity="0.2"
					fill="currentColor"
				/>
				<path
					id="Path_290"
					data-name="Path 290"
					d="M4,0,.5,3,0,3.5,1,5,13.5,17,15,15l1-2.5-.5-5L7,0Z"
					transform="translate(22.5 29.745)"
					opacity="0.2"
					fill="currentColor"
				/>
			</g>
		</svg>
	);
}

function RemoveImage({ image, onClick }: { image: string; onClick: () => void }) {
	if (image) {
		return (
			<img
				className="_imageButton"
				src={getSrcUrl(image)}
				alt="Remove"
				onClick={e => (e.target === e.currentTarget ? onClick() : undefined)}
			/>
		);
	}
	return (
		<svg
			className="_imageButton"
			xmlns="http://www.w3.org/2000/svg"
			width="47.2"
			height="47.2"
			viewBox="0 0 47.2 47.2"
			onClick={onClick}
		>
			<g transform="translate(-656 -671.8)">
				<g transform="translate(655.6 671.4)">
					<path
						fill="currentColor"
						d="M36.278,30.861l.683.683V29.71a1.885,1.885,0,0,1,3.77,0V41.141A6.457,6.457,0,0,1,34.276,47.6H6.855A6.457,6.457,0,0,1,.4,41.141V13.706A6.457,6.457,0,0,1,6.855,7.247h16a1.887,1.887,0,0,1,0,3.773h-16A2.686,2.686,0,0,0,4.17,13.706V27.475l.683-.683,3.378-3.38a6.11,6.11,0,0,1,8.422,0l5.664,5.666.283.283.283-.283,1.6-1.6h0a5.973,5.973,0,0,1,8.415,0h0ZM4.287,32.7l-.117.117v8.327A2.686,2.686,0,0,0,6.855,43.83H31.723l-.683-.683-9.826-9.831L13.97,26.069h0l-.007-.007a2.2,2.2,0,0,0-3.043,0h0l-.007.007Zm32.674,8.448v-4.26l-.116-.117-6.6-6.651h0a2.159,2.159,0,0,0-3.083,0h0l-1.6,1.6-.283.28.281.283L35.867,42.635l.325.327.278-.368a2.436,2.436,0,0,0,.491-1.45Z"
					/>
					<path
						fill="currentColor"
						d="M31.5,20,11.5.974A2.612,2.612,0,0,0,7.97.908l-6.117,5.4a4,4,0,0,0-1.354,3v7.844A3.851,3.851,0,0,0,4.351,21H30.5A1,1,0,0,0,31.5,20Z"
						transform="translate(0 23.745)"
						opacity="0.2"
					/>
					<path
						fill="currentColor"
						d="M4,0,.5,3,0,3.5,1,5,13.5,17,15,15l1-2.5-.5-5L7,0Z"
						transform="translate(22.5 29.745)"
						opacity="0.2"
					/>
					<path
						fill="currentColor"
						d="M36.278,30.861l.683.683V29.71a1.885,1.885,0,0,1,3.77,0V41.141A6.457,6.457,0,0,1,34.276,47.6H6.855A6.457,6.457,0,0,1,.4,41.141V13.706A6.457,6.457,0,0,1,6.855,7.247h16a1.887,1.887,0,0,1,0,3.773h-16A2.686,2.686,0,0,0,4.17,13.706V27.475l.683-.683,3.378-3.38a6.11,6.11,0,0,1,8.422,0l5.664,5.666.283.283.283-.283,1.6-1.6h0a5.973,5.973,0,0,1,8.415,0h0ZM4.287,32.7l-.117.117v8.327A2.686,2.686,0,0,0,6.855,43.83H31.723l-.683-.683-9.826-9.831L13.97,26.069h0l-.007-.007a2.2,2.2,0,0,0-3.043,0h0l-.007.007Zm32.674,8.448v-4.26l-.116-.117-6.6-6.651h0a2.159,2.159,0,0,0-3.083,0h0l-1.6,1.6-.283.28.281.283L35.867,42.635l.325.327.278-.368a2.436,2.436,0,0,0,.491-1.45ZM46.774,14.2h0a1.887,1.887,0,0,1,0,2.679h0a1.885,1.885,0,0,1-2.677,0h0s-2.78-2.76-2.948-2.972c-2.147-2.525-2.161-2.57-5.138,0L33.064,16.88h0A1.9,1.9,0,0,1,30.386,14.2l6.847-6.854a1.884,1.884,0,0,1,.619-.393h.007a1.884,1.884,0,0,1,1.432,0H39.3a1.886,1.886,0,0,1,.619.393Z"
					/>
				</g>
				<g transform="translate(733.296 682.364) rotate(180)">
					<path
						fill="currentColor"
						d="M47.041,7.469h0a1.749,1.749,0,0,1,0,2.561h0a1.946,1.946,0,0,1-2.677,0h0s-2.78-2.639-2.948-2.842c-2.147-2.414-2.161-2.458-5.138,0l-2.947,2.841h0a1.957,1.957,0,0,1-2.68,0,1.756,1.756,0,0,1,0-2.562L37.5.915a1.9,1.9,0,0,1,.619-.376h.007a1.964,1.964,0,0,1,1.432,0h.007a1.9,1.9,0,0,1,.619.376Z"
					/>
					<path
						fill="currentColor"
						d="M47.041,7.469h0a1.749,1.749,0,0,1,0,2.561h0a1.946,1.946,0,0,1-2.677,0h0s-2.78-2.639-2.948-2.842c-2.147-2.414-2.161-2.458-5.138,0l-2.947,2.841h0a1.957,1.957,0,0,1-2.68,0,1.756,1.756,0,0,1,0-2.562L37.5.915a1.9,1.9,0,0,1,.619-.376h.007a1.964,1.964,0,0,1,1.432,0h.007a1.9,1.9,0,0,1,.619.376Z"
					/>
				</g>
			</g>
		</svg>
	);
}

function ToFullScreen() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="50.892"
			height="44.667"
			viewBox="0 0 50.892 44.667"
		>
			<g
				id="Group_113"
				data-name="Group 113"
				transform="matrix(0.602, 0.799, -0.799, 0.602, 256.993, -869.183)"
			>
				<path
					id="Path_289"
					data-name="Path 289"
					d="M47.041,7.793h0a1.887,1.887,0,0,1,0,2.679l0,0a1.885,1.885,0,0,1-2.677,0h0L41.416,7.5l-.684-.69V20.565a1.885,1.885,0,1,1-3.77,0V6.813l-.684.69-2.947,2.971h0a1.895,1.895,0,0,1-2.678-2.682L37.5.938a1.884,1.884,0,0,1,.619-.393h0l.007,0a1.884,1.884,0,0,1,1.432,0h0l.007,0a1.886,1.886,0,0,1,.619.393Z"
					transform="translate(533.8 696.524)"
					stroke="#fff"
					strokeWidth="0.8"
					fill="currentColor"
				/>
				<path
					id="Path_290"
					data-name="Path 290"
					d="M47.041,7.793h0a1.887,1.887,0,0,1,0,2.679l0,0a1.885,1.885,0,0,1-2.677,0h0L41.416,7.5l-.684-.69V20.565a1.885,1.885,0,1,1-3.77,0V6.813l-.684.69-2.947,2.971h0a1.895,1.895,0,0,1-2.678-2.682L37.5.938a1.884,1.884,0,0,1,.619-.393h0l.007,0a1.884,1.884,0,0,1,1.432,0h0l.007,0a1.886,1.886,0,0,1,.619.393Z"
					transform="translate(611.497 746.376) rotate(180)"
					stroke="#fff"
					strokeWidth="0.8"
					fill="currentColor"
				/>
			</g>
		</svg>
	);
}

function ToSmallScreen() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="50.828"
			height="44.619"
			viewBox="0 0 50.828 44.619"
		>
			<g
				id="Group_114"
				data-name="Group 114"
				transform="matrix(0.602, 0.799, -0.799, 0.602, 256.961, -869.208)"
			>
				<path
					id="Path_289"
					data-name="Path 289"
					d="M47.041,7.793h0a1.887,1.887,0,0,1,0,2.679l0,0a1.885,1.885,0,0,1-2.677,0h0L41.416,7.5l-.684-.69V20.565a1.885,1.885,0,1,1-3.77,0V6.813l-.684.69-2.947,2.971h0a1.895,1.895,0,0,1-2.678-2.682L37.5.938a1.884,1.884,0,0,1,.619-.393h0l.007,0a1.884,1.884,0,0,1,1.432,0h0l.007,0a1.886,1.886,0,0,1,.619.393Z"
					transform="translate(533.8 723.524)"
					stroke="#fff"
					strokeWidth="0.8"
					fill="currentColor"
				/>
				<path
					id="Path_290"
					data-name="Path 290"
					d="M47.041,7.793h0a1.887,1.887,0,0,1,0,2.679l0,0a1.885,1.885,0,0,1-2.677,0h0L41.416,7.5l-.684-.69V20.565a1.885,1.885,0,1,1-3.77,0V6.813l-.684.69-2.947,2.971h0a1.895,1.895,0,0,1-2.678-2.682L37.5.938a1.884,1.884,0,0,1,.619-.393h0l.007,0a1.884,1.884,0,0,1,1.432,0h0l.007,0a1.886,1.886,0,0,1,.619.393Z"
					transform="translate(611.497 719.376) rotate(180)"
					stroke="#fff"
					strokeWidth="0.8"
					fill="currentColor"
				/>
			</g>
		</svg>
	);
}

const component: Component = {
	order: 21,
	name: 'FileSelector',
	displayName: 'File Selector',
	description: 'File Selector',
	component: FileSelector,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: TextStyle,
	styleDefaults: styleDefaults,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: ['hover'],
	defaultTemplate: {
		key: '',
		type: 'FileSelector',
		name: 'File Selector',
		properties: {},
	},
	bindingPaths: {
		bindingPath: { name: 'Selected File URL Binding' },
	},
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<path d="M15.5 2H2L1.5 23.5L5.5 27H19L22 23.5V8.5L15.5 2Z" fill="#5CCEFE" />
					<path
						d="M18.0371 27C21.3241 27 24 24.3506 24 21.0968V10.1701C24 9.09012 23.5739 8.07482 22.804 7.31123L16.6149 1.18407C15.8436 0.420477 14.8181 0 13.7272 0H5.96286C2.67594 0 0 2.64937 0 5.90324V21.0962C0 24.3503 2.67612 26.9995 5.96286 26.9995C6.56657 26.9995 7.05376 26.5171 7.05376 25.9195C7.05376 25.3218 6.56657 24.8395 5.96286 24.8395C3.87622 24.8395 2.1818 23.1576 2.1818 21.0962V5.90324C2.1818 3.83747 3.88066 2.15999 5.96286 2.15999H13.4544V5.46185C13.4544 7.90871 15.4658 9.8999 17.9373 9.8999H21.7882C21.8024 9.9899 21.8138 10.0799 21.8138 10.1699V21.0965C21.8138 23.1623 20.1149 24.8398 18.0327 24.8398C17.429 24.8398 16.9418 25.3221 16.9418 25.9198C16.9418 26.5175 17.4335 27 18.0371 27ZM17.9377 7.74013C16.6692 7.74013 15.6366 6.71781 15.6366 5.46203V3.27393L20.1537 7.74006L17.9377 7.74013Z"
						fill="#5CCEFE"
					/>
					<path
						d="M17.9377 7.74013C16.6692 7.74013 15.6366 6.71781 15.6366 5.46203V3.27393L20.1537 7.74006L17.9377 7.74013Z"
						fill="white"
					/>
					<path
						className="_FileSelectorArrow"
						d="M17.6316 17.9337C18.1228 17.5096 18.1228 16.8224 17.6316 16.3997L12.8914 12.3065C12.4182 11.8978 11.5832 11.8978 11.1149 12.3065L6.3684 16.3997C5.8772 16.8239 5.8772 17.511 6.3684 17.9337C6.85961 18.3579 7.65533 18.3579 8.1449 17.9337L10.745 15.6942V20.9142C10.745 21.5151 11.3065 22 12.0024 22C12.6983 22 13.2599 21.5151 13.2599 20.9142V15.6942L15.855 17.9351C16.1022 18.1486 16.4215 18.2533 16.7441 18.2533C17.065 18.2533 17.3893 18.1486 17.6316 17.9337Z"
						fill="white"
					/>
				</IconHelper>
			),
		},
		{
			name: 'image',
			displayName: 'Image',
			description: 'Image',
			icon: 'fa fa-solid fa-box',
		},
		{
			name: 'errorText',
			displayName: 'Error Text',
			description: 'Error Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'errorTextContainer',
			displayName: 'Error Text Container',
			description: 'Error Text Container',
			icon: 'fa-solid fa-box',
		},
	],
};

export default component;

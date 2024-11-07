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

function FileSelector(props: ComponentProps) {
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
				src={image}
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
				src={image}
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
					<rect x="0.5" y="0.5" width="29" height="29" fill="#F9F9F9" stroke="#F9F9F9" />
					<path
						d="M14.6324 19.7117L14.8235 19.5206L16.949 17.6987H18.6744L23.8713 22.2843L24.1711 25.2824L23.5741 26.7749L22.788 27.823L15.1543 20.4946L14.6324 19.7117Z"
						fill="url(#paint0_linear_3214_9473)"
						stroke="#F9F9F9"
						strokeWidth="0.4"
					/>
					<path
						d="M8.29893 15.754L20.7302 27.5788C20.6932 27.7759 20.5203 27.925 20.3125 27.925H3.96924C3.29887 27.925 2.66484 27.6203 2.24607 27.0968C1.93304 26.7055 1.7625 26.2193 1.7625 25.7183V21.4926C1.7625 20.4023 2.23081 19.3645 3.04834 18.6432L6.36383 15.7178C6.71733 15.4058 7.20168 15.2878 7.65905 15.4022C7.89915 15.4622 8.11961 15.5834 8.29893 15.754Z"
						fill="url(#paint1_linear_3214_9473)"
						stroke="#F9F9F9"
						strokeWidth="0.4"
					/>
					<path
						d="M22.7094 19.2531L23.0508 19.5947V19.1117V18.5687C23.0508 18.2428 23.1803 17.9302 23.4106 17.6997C23.6409 17.4693 23.9533 17.3398 24.279 17.3398C24.6047 17.3398 24.9171 17.4693 25.1474 17.6997C25.3778 17.9302 25.5072 18.2428 25.5072 18.5687V25.7133C25.5072 26.7972 25.0768 27.8367 24.3108 28.6031C23.5448 29.3695 22.5059 29.8 21.4227 29.8H4.28453C3.20128 29.8 2.16237 29.3695 1.39637 28.6031C0.630358 27.8367 0.2 26.7972 0.2 25.7133V8.56634C0.2 7.48244 0.630358 6.44295 1.39637 5.67655C2.16237 4.91015 3.20128 4.47961 4.28453 4.47961H14.2818C14.6075 4.47961 14.9199 4.60906 15.1502 4.83951C15.3805 5.06997 15.5099 5.38256 15.5099 5.70852C15.5099 6.03448 15.3805 6.34707 15.1502 6.57752C14.9199 6.80798 14.6075 6.93743 14.2818 6.93743H4.28453C3.85268 6.93743 3.43853 7.10907 3.1332 7.41456C2.82787 7.72005 2.65635 8.13436 2.65635 8.56634V16.5682V17.0513L2.99781 16.7096L5.10975 14.5966C5.82913 13.9123 6.7838 13.5307 7.77642 13.5307C8.76905 13.5307 9.72372 13.9123 10.4431 14.5966L13.9832 18.1385L14.1247 18.2801L14.2661 18.1385L15.2653 17.1389C15.2653 17.1388 15.2653 17.1388 15.2653 17.1388C15.9742 16.4352 16.9323 16.0404 17.9308 16.0404C18.9292 16.0404 19.8871 16.4351 20.596 17.1386C20.5961 17.1387 20.5961 17.1388 20.5962 17.1389L22.7094 19.2531ZM2.7149 20.4707L2.65635 20.5292V20.6121V25.7133C2.65635 26.1452 2.82787 26.5596 3.1332 26.865C3.43853 27.1705 3.85268 27.3422 4.28453 27.3422H19.2233H19.7059L19.3647 27.0008L13.2236 20.8565L8.69624 16.3268L8.69628 16.3268L8.69279 16.3235C8.44579 16.088 8.11766 15.9566 7.77642 15.9566C7.43519 15.9566 7.10706 16.088 6.86006 16.3235L6.86002 16.3234L6.85661 16.3268L2.7149 20.4707ZM23.0508 25.7148V25.7133V23.1555V23.0731L22.9928 23.0146L18.8663 18.8575C18.8661 18.8573 18.866 18.8571 18.8658 18.857C18.7449 18.7336 18.6006 18.6356 18.4414 18.5687C18.282 18.5017 18.1108 18.4671 17.9379 18.4671C17.765 18.4671 17.5938 18.5017 17.4344 18.5687C17.2753 18.6356 17.1311 18.7335 17.0102 18.8567C17.01 18.857 17.0098 18.8572 17.0095 18.8575L16.0112 19.8562L15.8702 19.9973L16.0109 20.1387L22.452 26.6117L22.6145 26.775L22.7533 26.5912C22.9441 26.3386 23.0484 26.0313 23.0508 25.7148ZM29.4361 4.83538L29.4367 4.83595C29.5518 4.95019 29.6432 5.08611 29.7055 5.23587C29.7679 5.38563 29.8 5.54627 29.8 5.70852C29.8 5.87076 29.7679 6.0314 29.7055 6.18116C29.6432 6.33092 29.5518 6.46684 29.4367 6.58107L29.4355 6.58224C29.3213 6.69742 29.1855 6.78883 29.0358 6.85121C28.8862 6.9136 28.7257 6.94571 28.5635 6.94571C28.4014 6.94571 28.2409 6.9136 28.0912 6.85121C27.9416 6.78883 27.8058 6.69742 27.6916 6.58224L27.6915 6.58221L25.8492 4.72462L25.5072 4.37979V4.86546V12.8531C25.5072 13.179 25.3778 13.4916 25.1474 13.7221C24.9171 13.9525 24.6047 14.082 24.279 14.082C23.9533 14.082 23.6409 13.9525 23.4106 13.7221C23.1803 13.4916 23.0508 13.179 23.0508 12.8531V4.86546V4.37979L22.7088 4.72462L20.867 6.58166C20.867 6.58169 20.867 6.58172 20.8669 6.58175C20.6355 6.81324 20.3217 6.94327 19.9945 6.94327C19.6672 6.94327 19.3534 6.81321 19.1219 6.58166C18.8905 6.3501 18.7605 6.03603 18.7605 5.70852C18.7605 5.54635 18.7924 5.38578 18.8544 5.23596C18.9164 5.08615 19.0073 4.95003 19.1219 4.83538L23.4049 0.550209C23.5214 0.439043 23.6586 0.35187 23.8086 0.293649L23.8087 0.293686L23.8123 0.292171C24.1113 0.169276 24.4467 0.169276 24.7457 0.292171L24.7457 0.292208L24.7494 0.293649C24.8995 0.351874 25.0367 0.439055 25.1531 0.550231L29.4361 4.83538Z"
						fill="url(#paint2_linear_3214_9473)"
						stroke="#F9F9F9"
						strokeWidth="0.4"
					/>
					<defs>
						<linearGradient
							id="paint0_linear_3214_9473"
							x1="19.375"
							y1="17.4987"
							x2="19.375"
							y2="28.1237"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" stopOpacity="0.933333" />
							<stop offset="1" stopColor="#EDEAEA" />
						</linearGradient>
						<linearGradient
							id="paint1_linear_3214_9473"
							x1="11.25"
							y1="15"
							x2="11.25"
							y2="28.125"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#EEEEEE" stopOpacity="0.933333" />
							<stop offset="1" stopColor="#EDEAEA" />
						</linearGradient>
						<linearGradient
							id="paint2_linear_3214_9473"
							x1="15"
							y1="0"
							x2="15"
							y2="30"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#68D2FF" />
							<stop offset="1" stopColor="#007BB0" />
						</linearGradient>
					</defs>
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

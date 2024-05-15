import { isNullValue } from '@fincity/kirun-js';
import React, { useEffect, useState } from 'react';
import { FileBrowser } from '../../commonComponents/FileBrowser';
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
			readOnly,
			designType,
			validation,
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

	useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediately(
			(_, value) => setSelectedFile(isNullValue(value) ? '' : value),
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath]);

	const onChangeSelection = async (file: string) => {
		if (!bindingPathPath) return;
		setData(bindingPathPath, selectedFile === file ? undefined : file, context.pageName, true);
		setShowBrowser(false);
		if (!onSelect || !pageDefinition.eventFunctions[onSelect]) return;
		await runEvent(
			pageDefinition.eventFunctions[onSelect],
			onSelect,
			props.context.pageName,
			props.locationHistory,
			props.pageDefinition,
		);
	};

	let content;

	if (designType === 'button') {
		if (selectedFile)
			content = (
				<>
					<img
						src={selectedFile}
						alt="Selected file"
						style={resolvedStyles.image ?? {}}
					/>
					<UploadImage image={uploadImage} onClick={() => setShowBrowser(true)} />
				</>
			);
		else
			content = (
				<>
					<UploadImage image={uploadImage} onClick={() => setShowBrowser(true)} />
				</>
			);
		if (showBrowser)
			content = (
				<>
					{content}
					<div
						className="_popupBackground"
						onClick={e =>
							e.target === e.currentTarget ? setShowBrowser(false) : undefined
						}
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
		validationMessages?.length &&
		(selectedFile.trim() == '' || isDirty || context.showValidationMessages) &&
		!readOnly;

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
		return <img className="_imageButton" src={image} alt="Upload" onClick={onClick} />;
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
				<IconHelper viewBox="0 0 24 24">
					<g id="Group_112" data-name="Group 112" transform="translate(-0.4 -0.4)">
						<path
							id="Path_287"
							data-name="Path 287"
							d="M15.789,8.589,5.924.559A1.363,1.363,0,0,0,5.349.288,1.45,1.45,0,0,0,4.184.531L1.168,2.809A1.6,1.6,0,0,0,.5,4.075V7.386A1.486,1.486,0,0,0,.916,8.4a2.034,2.034,0,0,0,1.483.61H15.3A.462.462,0,0,0,15.789,8.589Z"
							transform="translate(0.922 13.784)"
							opacity="0.4"
							fill="currentColor"
						/>
						<path
							id="Path_288"
							data-name="Path 288"
							d="M11.123,6.168,5.924.559A1.363,1.363,0,0,0,5.349.288,1.45,1.45,0,0,0,4.184.531V4.075c-.424.321,0-.484,0,0L.571,6.237A1.486,1.486,0,0,0,.987,7.252a2.034,2.034,0,0,0,1.483.61L10.63,6.591A.462.462,0,0,0,11.123,6.168Z"
							transform="translate(8.566 14.667)"
							opacity="0.4"
							fill="currentColor"
						/>
						<path
							id="Path_286"
							data-name="Path 286"
							d="M18.095,15.423l.337.337v-.9a.93.93,0,1,1,1.859,0v5.638a3.185,3.185,0,0,1-3.184,3.185H3.584A3.185,3.185,0,0,1,.4,20.493V6.962A3.184,3.184,0,0,1,3.584,3.777h7.889a.93.93,0,0,1,0,1.861H3.584A1.324,1.324,0,0,0,2.259,6.962v6.791l.337-.337,1.666-1.667a3.013,3.013,0,0,1,4.153,0l2.793,2.795.14.14.14-.14.788-.789h0a2.946,2.946,0,0,1,4.15,0h0Zm-15.778.9-.058.058v4.107a1.325,1.325,0,0,0,1.324,1.325H15.848l-.337-.337-4.846-4.848L7.093,13.058h0l0,0a1.087,1.087,0,0,0-1.5,0h0l0,0Zm16.114,4.166h0v-2.1l-.057-.058-3.256-3.28h0a1.065,1.065,0,0,0-1.52,0h0l-.787.788-.139.139.139.139,5.083,5.108.16.161.137-.181A1.2,1.2,0,0,0,18.431,20.494ZM23.4,4.046h0a.931.931,0,0,1,0,1.321h0a.929.929,0,0,1-1.32,0h0L20.628,3.9l-.337-.34v6.782a.93.93,0,1,1-1.859,0V3.563l-.337.34L16.641,5.368h0A.935.935,0,0,1,15.32,4.046L18.7.665A.929.929,0,0,1,19,.471h0a.929.929,0,0,1,.706,0h0a.93.93,0,0,1,.305.194Z"
							transform="translate(0)"
							fill="currentColor"
						/>
					</g>
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

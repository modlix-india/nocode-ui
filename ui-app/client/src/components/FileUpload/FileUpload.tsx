import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import {
	Component,
	ComponentDefinition,
	ComponentPropertyDefinition,
	ComponentProps,
} from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './fileUploadProperties';
import FileUploadStyles from './FileUploadStyles';
import { validate } from '../../util/validationProcessor';
import { flattenUUID } from '../util/uuid';
import { isNullValue } from '@fincity/kirun-js';
import { returnFileSize } from '../util/getFileSize';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { MESSAGE_TYPE, addMessage } from '../../App/Messages/Messages';
import { ToArray } from '../../util/csvUtil';
import { styleDefaults } from './fileUploadStyleProperties';
import { IconHelper } from '../util/IconHelper';
import binaryToBase64Encode from '../../util/binaryToBase64Encode';

const icon1 = (computedStyles: any, def: ComponentDefinition) => (
	<div className="_uploadIcon _upload_icon_1" style={computedStyles.icon ?? {}}>
		<SubHelperComponent definition={def} subComponentName="icon" />
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
			<path
				id="Path_150"
				data-name="Path 150"
				d="M8.223.883a1.016,1.016,0,0,0-1.449,0l-4.1,4.149a1.049,1.049,0,0,0,0,1.468,1.016,1.016,0,0,0,1.449,0L6.476,4.121v6.83a1.024,1.024,0,1,0,2.048,0V4.121L10.872,6.5a1.016,1.016,0,0,0,1.449,0,1.049,1.049,0,0,0,0-1.468L8.226.883ZM2.381,11.988a1.024,1.024,0,1,0-2.048,0v2.074A3.093,3.093,0,0,0,3.4,17.175H11.6a3.093,3.093,0,0,0,3.071-3.112V11.988a1.024,1.024,0,1,0-2.048,0v2.074A1.029,1.029,0,0,1,11.6,15.1H3.4a1.029,1.029,0,0,1-1.024-1.037Z"
				transform="translate(8.667 7.421)"
				fill="currentColor"
			/>
		</svg>
	</div>
);

const icon2 = (computedStyles: any, def: ComponentDefinition) => (
	<div className="_uploadIcon _upload_icon_2" style={computedStyles.icon ?? {}}>
		<SubHelperComponent definition={def} subComponentName="icon" />
		<svg viewBox="0 0 54 70" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M51.114 18.769H36.295C35.209 18.769 34.32 17.88 34.32 16.794V1.975C34.32 0.889001 33.431 0 32.345 0H1.975C0.889 0 0 0.889001 0 1.975V67.409C0 68.495 0.889 69.384 1.975 69.384H51.115C52.201 69.384 53.089 68.495 53.089 67.409V20.744C53.088 19.658 52.2 18.769 51.114 18.769ZM36.69 3.16C36.69 2.074 37.318 1.813 38.086 2.581L50.509 15.005C51.277 15.773 51.017 16.401 49.931 16.401H38.664C37.578 16.401 36.689 15.512 36.689 14.426L36.69 3.16Z"
				fill="currentColor"
			/>
			<path
				d="M38.2399 35.5288C38.2433 35.4296 38.2474 35.3308 38.2474 35.2309C38.2474 30.685 34.5624 27 30.0166 27C27.3044 27 24.8992 28.3125 23.4003 30.3359C22.7296 30.074 22.0007 29.9286 21.2379 29.9286C18.2683 29.9286 15.8079 32.1061 15.3645 34.9513C13.3478 36.0568 12 38.0625 12 40.3546C12 43.8397 15.1172 46.665 18.9631 46.665H33.7546C37.6004 46.665 40.718 43.8397 40.718 40.3546C40.7176 38.4184 39.7542 36.6869 38.2399 35.5288ZM22.3403 35.6314L25.2611 32.7114C25.3182 32.6543 25.3805 32.6021 25.4471 32.5589L25.4809 32.5386C25.5372 32.5051 25.591 32.4751 25.6485 32.4525L25.7037 32.4341C25.7702 32.412 25.8175 32.3962 25.8675 32.3872C25.8901 32.383 25.9122 32.3804 25.9348 32.3789L25.9724 32.3751C26.0298 32.368 26.0595 32.3646 26.0907 32.3646C26.1196 32.3646 26.1475 32.368 26.1753 32.3718L26.2267 32.377C26.256 32.3793 26.2854 32.3823 26.3139 32.3875C26.3616 32.3966 26.4041 32.4108 26.4473 32.4259C26.4928 32.439 26.5142 32.445 26.5349 32.4537C26.5799 32.4713 26.6232 32.4969 26.6675 32.5217C26.7047 32.542 26.7201 32.5499 26.7351 32.5596C26.8024 32.6043 26.8644 32.6551 26.9185 32.7107L29.8411 35.6325C30.0617 35.8531 30.183 36.1458 30.183 36.4584C30.183 36.7696 30.0617 37.0623 29.8411 37.2836C29.4011 37.7247 28.6312 37.7247 28.1904 37.2836L27.2578 36.3506V43.3144C27.2578 43.9577 26.734 44.4819 26.0903 44.4819C25.4471 44.4819 24.9229 43.9573 24.9229 43.3144V36.3498L23.991 37.2828C23.5499 37.7243 22.7807 37.7243 22.3403 37.2825C22.1194 37.0615 21.9984 36.7681 21.9984 36.4562C21.9984 36.1451 22.1194 35.8516 22.3403 35.6314Z"
				fillOpacity="0.5"
				fill="white"
			/>
		</svg>
	</div>
);

function FileUpload(props: ComponentProps) {
	const [fileValue, setFileValue] = useState<any>();
	const inputRef = useRef<any>();
	const [hover, setHover] = useState<boolean>(false);
	const [validationMessages, setValidationMessages] = useState<Array<string>>([]);
	const {
		definition: { bindingPath, bindingPath2, bindingPath3, bindingPath4, bindingPath5 },
		definition,
		pageDefinition: {},
		locationHistory,
		context,
	} = props;

	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
	let {
		key,
		properties: {
			uploadViewType,
			uploadIcon,
			options,
			subText,
			mainText,
			isMultiple,
			readOnly,
			maxFileSize,
			onSelectEvent,
			validation,
			uploadType,
			colorScheme,
			buttonText,
			hideSelectedFileName,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const computedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ disabled: readOnly, hover },
		stylePropertiesWithPseudoStates,
	);
	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	const bindingPath2Path = bindingPath2
		? getPathFromLocation(bindingPath2, locationHistory, pageExtractor)
		: undefined;

	const bindingPath3Path = bindingPath3
		? getPathFromLocation(bindingPath3, locationHistory, pageExtractor)
		: undefined;

	const bindingPath4Path = bindingPath4
		? getPathFromLocation(bindingPath4, locationHistory, pageExtractor)
		: undefined;

	const bindingPath5Path = bindingPath5
		? getPathFromLocation(bindingPath5, locationHistory, pageExtractor)
		: undefined;

	const uploadImmediatelyEvent = onSelectEvent
		? props.pageDefinition.eventFunctions?.[onSelectEvent]
		: undefined;
	useEffect(() => {
		const msgs = validation?.length
			? validate(
					props.definition,
					props.pageDefinition,
					validation,
					fileValue,
					locationHistory,
					pageExtractor,
				)
			: [];
		if (msgs.length) {
			setValidationMessages(msgs);
			setData(
				`Store.validations.${context.pageName}.${flattenUUID(definition.key)}`,
				msgs.length ? msgs : undefined,
				context.pageName,
				true,
			);
		}
		if (!msgs.length && fileValue && uploadImmediatelyEvent) {
			(async () =>
				await runEvent(
					uploadImmediatelyEvent,
					key,
					props.context.pageName,
					props.locationHistory,
					props.pageDefinition,
				))();
		}

		return () =>
			setData(
				`Store.validations.${context.pageName}.${flattenUUID(definition.key)}`,
				undefined,
				context.pageName,
				true,
			);
	}, [fileValue, validation]);

	useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediately(
			(_, value) => {
				if (isNullValue(value)) {
					setFileValue(value);
					return;
				}
				isMultiple && !Array.isArray(value) ? setFileValue([value]) : setFileValue(value);
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath]);

	const filesToBase64 = async (files: any, withMetadata: boolean) => {
		let stringFiles = [];
		if (isMultiple) {
			if (!files.length) return;
			for (let i = 0; i < files.length; i++) {
				let str = await binaryToBase64Encode(files[i], withMetadata);
				stringFiles.push(str);
			}
		} else {
			stringFiles[0] = await binaryToBase64Encode(files[0], withMetadata);
		}

		return isMultiple ? [...stringFiles] : stringFiles[0];
	};

	const setFiles = async (files: FileList | null) => {
		if (!files?.length) return;

		if (uploadType === 'FILE_OBJECT') {
			setData(bindingPathPath!, isMultiple ? Array.from(files) : files[0], context?.pageName);
			return;
		}

		if (uploadType.startsWith('BINARY_TO_BASE_64')) {
			const fileObjects = await filesToBase64(files, uploadType != 'BINARY_TO_BASE_64');
			setData(bindingPathPath!, fileObjects, context?.pageName);
			return;
		}

		let fReader = new FileReader();
		fReader.onload = () => {
			let fileContent: any = fReader.result;

			try {
				switch (uploadType) {
					case 'JSON_OBJECT':
						fileContent = JSON.parse(fileContent);
						break;
					case 'JSON_LIST_CSV':
						fileContent = ToArray(fileContent, false, ',');
						break;
					case 'JSON_LIST_CSV_OBJECTS':
						fileContent = ToArray(fileContent, true, ',');
						break;
					case 'JSON_LIST_TSV':
						fileContent = ToArray(fileContent, false, '\t');
						break;
					case 'JSON_LIST_TSV_OBJECTS':
						fileContent = ToArray(fileContent, true, '\t');
						break;
				}
			} catch (error: any) {
				addMessage(
					MESSAGE_TYPE.ERROR,
					'Invalid JSON file : ' + error.message,
					true,
					props.context.pageName,
				);
				return;
			}

			setData(bindingPathPath!, fileContent, context?.pageName);
		};
		fReader.readAsText(files[0]);
	};

	const setOtherBindingPaths = (files: FileList | null) => {
		if (isMultiple || !files?.length) return;
		if (bindingPath2Path) {
			setData(bindingPath2Path, files[0].name, context?.pageName);
		}
		const fileName = files[0].name.split('.');
		if (bindingPath3Path) {
			setData(bindingPath3Path, fileName[0], context?.pageName);
		}
		if (bindingPath4Path && fileName.length > 1) {
			setData(bindingPath4Path, files[0].name.split('.')[1], context?.pageName);
		}
		if (bindingPath5Path) {
			setData(bindingPath5Path, returnFileSize(files[0].size), context?.pageName);
		}
	};

	const onChangeFile = (event: ChangeEvent<HTMLInputElement>) => {
		setOtherBindingPaths(event.target.files);
		if (!event.target.files?.length || !bindingPathPath) return;
		setFiles(event.target.files);
	};

	const handleDelete = (event: any, content: any) => {
		event.stopPropagation();
		let deleted: any;
		if (isMultiple) {
			deleted = fileValue.slice();
			deleted.splice(fileValue.indexOf(content), 1);
		}
		setData(bindingPathPath!, deleted, context?.pageName);
	};

	const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		setFiles(event.dataTransfer.files);
	};

	const preventDefault = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.stopPropagation();
	};

	const validationMessagesComp =
		validationMessages?.length && (fileValue || context.showValidationMessages) ? (
			<div className="_validationMessages" key="validationMessage">
				<SubHelperComponent
					definition={props.definition}
					subComponentName="validationMessagesContainer"
				/>
				{validationMessages.map(msg => (
					<div className="_eachvalidationMessage" key={msg}>
						<SubHelperComponent
							definition={props.definition}
							subComponentName="validationMessage"
						/>
						{msg}
					</div>
				))}
			</div>
		) : undefined;

	let uploadIconComp = null;

	if (uploadIcon)
		uploadIconComp = (
			<i className={`_uploadIcon ${uploadIcon}`} style={computedStyles?.icon}>
				<SubHelperComponent definition={props.definition} subComponentName="icon" />
			</i>
		);
	else if (uploadViewType === '_only_icon_design1')
		uploadIconComp = icon1(computedStyles, props.definition);
	else if (uploadViewType === '_only_icon_design2')
		uploadIconComp = icon2(computedStyles, props.definition);

	const inputContainer = (
		<input
			type="file"
			ref={inputRef}
			onChange={onChangeFile}
			className="_hidden"
			accept={options}
			multiple={isMultiple}
			disabled={readOnly}
			max={maxFileSize}
			onClick={e => (e.currentTarget.value = '')}
		/>
	);

	let fileArray = [];

	if (fileValue) {
		fileArray = isMultiple ? fileValue : [fileValue];
	}

	const fileContainer = fileArray.map((each: any, index: any) => (
		<div
			className="_selectedDetails"
			key={`st_${each?.name ?? index}`}
			style={computedStyles?.selectedFiles ?? {}}
		>
			<SubHelperComponent definition={props.definition} subComponentName="_selectedFiles" />
			<span>{each?.name}</span>
			<span>{`(${returnFileSize(each?.size)})`}</span>
			{uploadImmediatelyEvent ? null : (
				<i
					className="fa fa-solid fa-close closeIcon"
					style={computedStyles?.closeIcon ?? {}}
					onClick={e => handleDelete(e, each)}
					onKeyUp={e => e.key === 'Enter' && handleDelete(e, each)}
				>
					<SubHelperComponent
						definition={props.definition}
						subComponentName="closeIcon"
					/>
				</i>
			)}
		</div>
	));

	let fileText = undefined;

	if (!hideSelectedFileName) {
		fileText = (
			<label className="_fileUploadText">
				{!uploadViewType?.startsWith('_inline') ? uploadIconComp : null}
				{uploadViewType !== '_only_icon_design2'
					? [
							fileContainer ? (
								fileContainer
							) : (
								<span className="_mainText" key="_mainText">
									{mainText}
								</span>
							),
							<span className="_subtext" key="_subText">
								{subText}
							</span>,
						]
					: null}
				{uploadViewType?.startsWith('_only_icon') ? inputContainer : null}
			</label>
		);
	} else if (uploadViewType?.startsWith('_only_icon')) {
		fileText = (
			<label className="_fileUploadText">
				{!uploadViewType?.startsWith('_inline') ? uploadIconComp : null}
				{inputContainer}
			</label>
		);
	}

	return [
		<div
			key={'fileUpload'}
			className={`comp compFileUpload ${
				hideSelectedFileName ? '_onlyButton' : ''
			} ${uploadViewType} ${colorScheme}`}
			style={computedStyles?.comp ?? {}}
			onMouseEnter={stylePropertiesWithPseudoStates?.hover ? () => setHover(true) : undefined}
			onMouseLeave={
				stylePropertiesWithPseudoStates?.hover ? () => setHover(false) : undefined
			}
			onDragEnter={preventDefault}
			onDragOver={preventDefault}
			onDrop={handleDrop}
		>
			<HelperComponent context={props.context} definition={definition} />

			{fileText}
			{!uploadViewType?.startsWith('_only_icon') ? (
				<label className="_fileUploadButton" style={computedStyles?.uploadButton}>
					{uploadViewType?.startsWith('_inline') ? uploadIconComp : null}
					{uploadViewType !== '_inline_icon_design1' ? buttonText : ''}
					{inputContainer}
				</label>
			) : null}
		</div>,
		validationMessagesComp,
	];
}

const component: Component = {
	order: 25,
	name: 'FileUpload',
	displayName: 'File Upload',
	description: 'FileUpload Component',
	component: FileUpload,
	styleComponent: FileUploadStyles,
	styleDefaults: styleDefaults,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: ['hover', 'disabled'],
	bindingPaths: {
		bindingPath: { name: 'File binding' },
		bindingPath2: { name: 'File full name binding' },
		bindingPath3: { name: 'File name binding' },
		bindingPath4: { name: 'File extension binding' },
		bindingPath5: { name: 'File size binding' },
	},
	defaultTemplate: {
		key: '',
		name: 'FileUpload',
		type: 'FileUpload',
		properties: {},
	},
	sections: [{ name: 'File Upload', pageName: 'fileupload' }],
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			icon: (
				<IconHelper viewBox="0 0 24 30">
					<path
						className="_fileUploadBG"
						d="M14.2958 6.09627V0H2.11268C0.947746 0 0 0.947747 0 2.11268V27.8873C0 29.0523 0.947746 30 2.11268 30H21.0963C22.2612 30 23.2089 29.0523 23.2089 27.8873V8.91317H17.1127C15.5594 8.91317 14.2958 7.64951 14.2958 6.09627Z"
						fill="#43B2FF"
					/>
					<path
						className="_fileUploadRC"
						d="M15.707 6.08405C15.707 6.86067 16.3389 7.4925 17.1155 7.4925H22.1675L15.707 1.0625V6.08405Z"
						fill="#43B2FF"
					/>
					<path
						className="_fileUploadAT"
						d="M5.88372 19.0316C5.54285 19.0316 5.35818 18.6325 5.57882 18.3727L10.724 12.3136C10.8827 12.1268 11.1705 12.1253 11.3311 12.3104L16.5866 18.3695C16.8112 18.6285 16.6273 19.0316 16.2844 19.0316L5.88372 19.0316Z"
						fill="white"
					/>
					<path
						className="_fileUploadAB"
						d="M13.5039 23.2891C13.5039 23.8413 13.0562 24.2891 12.5039 24.2891L9.38435 24.2891C8.83207 24.2891 8.38435 23.8413 8.38435 23.2891L8.38435 18.4381L13.5039 18.4381L13.5039 23.2891Z"
						fill="white"
					/>
				</IconHelper>
			),
			mainComponent: true,
		},
		{
			name: 'uploadButton',
			displayName: 'Upload Button',
			description: 'Uplaod Button',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'selectedFiles',
			displayName: 'Selected Files',
			description: 'Selected Files',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'icon',
			displayName: 'Icon',
			description: 'Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'closeIcon',
			displayName: 'Close Icon',
			description: 'Close Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'validationMessagesContainer',
			displayName: 'Validation Messages Container',
			description: 'Validation Messages Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'validationMessage',
			displayName: 'Validation Message',
			description: 'Validation Message',
			icon: 'fa-solid fa-box',
		},
	],
};

export default component;

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponent';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './fileUploadProperties';
import FileUploadStyles from './FileUploadStyles';
import { validate } from '../../util/validationProcessor';
import { flattenUUID } from '../util/uuid';
import { isNullValue } from '@fincity/kirun-js';
import { returnFileSize } from '../util/getFileSize';
import { SubHelperComponent } from '../SubHelperComponent';
import { MESSAGE_TYPE, addMessage } from '../../App/Messages/Messages';
import { ToArray } from '../../util/csvUtil';
import { styleDefaults } from './fileUploadStyleProperties';
import { IconHelper } from '../util/IconHelper';

const icon1 = (
	<div className="_uploadIcon _upload_icon_1">
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

const icon2 = (
	<div className="_uploadIcon _upload_icon_2">
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
		definition: { bindingPath },
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
	const uploadImmediatelyEvent = onSelectEvent
		? props.pageDefinition.eventFunctions[onSelectEvent]
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

	const setFiles = (files: any) => {
		if (uploadType === 'FILE_OBJECT') {
			setData(bindingPathPath!, isMultiple ? [...files] : files[0], context?.pageName);
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

	const onChangeFile = (event: any) => {
		if (!event.target.value?.length || !bindingPathPath) return;
		const files = event.target.files;
		setFiles(files);
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
		const file = event.dataTransfer.files || null;
		setFiles(file);
	};

	const preventDefault = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		event.stopPropagation();
	};

	const validationMessagesComp =
		validationMessages?.length && (fileValue || context.showValidationMessages) ? (
			<div className="_validationMessages">
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

	const uploadIconComp = uploadIcon ? (
		<i className={`_uploadIcon ${uploadIcon}`} style={computedStyles?.icon}>
			<SubHelperComponent definition={props.definition} subComponentName="icon" />
		</i>
	) : uploadViewType === '_only_icon_design1' ? (
		icon1
	) : uploadViewType === '_only_icon_design2' ? (
		icon2
	) : null;

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

	const fileContainer = !!fileValue
		? (isMultiple ? fileValue : [fileValue])?.map((each: any, index: any) => (
				<div
					className="_selectedDetails"
					key={index}
					style={computedStyles?.selectedFiles ?? {}}
				>
					<SubHelperComponent
						definition={props.definition}
						subComponentName="_selectedFiles"
					/>
					<span>{each?.name}</span>
					<span>{`(${returnFileSize(each?.size)})`}</span>
					{uploadImmediatelyEvent ? null : (
						<i
							className="fa fa-solid fa-close closeIcon"
							style={computedStyles?.closeIcon ?? {}}
							onClick={e => handleDelete(e, each)}
						>
							<SubHelperComponent
								definition={props.definition}
								subComponentName="closeIcon"
							/>
						</i>
					)}
				</div>
		  ))
		: null;

	return [
		<div
			className={`comp compFileUpload ${uploadViewType} ${colorScheme}`}
			style={computedStyles?.comp ?? {}}
			onMouseEnter={stylePropertiesWithPseudoStates?.hover ? () => setHover(true) : undefined}
			onMouseLeave={
				stylePropertiesWithPseudoStates?.hover ? () => setHover(false) : undefined
			}
			onDragEnter={preventDefault}
			onDragOver={preventDefault}
			onDrop={handleDrop}
		>
			<HelperComponent definition={definition} />

			<label className="_fileUploadText">
				{!uploadViewType?.startsWith('_inline') ? uploadIconComp : null}
				{uploadViewType !== '_only_icon_design2'
					? [
							fileContainer ? (
								fileContainer
							) : (
								<span className="_mainText">{mainText}</span>
							),
							<span className="_subtext">{subText}</span>,
					  ]
					: null}
				{uploadViewType?.startsWith('_only_icon') ? inputContainer : null}
			</label>
			{!uploadViewType?.startsWith('_only_icon') ? (
				<label className="_fileUploadButton">
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
	name: 'FileUpload',
	displayName: 'FileUpload',
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
				<IconHelper viewBox="0 0 24 24">
					<path
						d="M14.2308 5.22685V0.59668H4.97764C4.09287 0.59668 3.37305 1.3165 3.37305 2.20128V21.7774C3.37305 22.6621 4.09287 23.382 4.97764 23.382H19.3959C20.2806 23.382 21.0005 22.6621 21.0005 21.7774V7.36631H16.3703C15.1906 7.36631 14.2308 6.40655 14.2308 5.22685Z"
						fill="currentColor"
						fill-opacity="0.2"
					/>
					<path
						d="M15.3027 5.227C15.3027 5.81685 15.7826 6.29673 16.3725 6.29673H20.2095L15.3027 1.41309V5.227Z"
						fill="currentColor"
						fill-opacity="0.2"
					/>
					<path
						d="M8.643 15.2027C8.30213 15.2027 8.11746 14.8036 8.3381 14.5438L12.0388 10.1858C12.1975 9.99894 12.4853 9.99743 12.6459 10.1826L16.4259 14.5406C16.6506 14.7996 16.4666 15.2027 16.1238 15.2027L8.643 15.2027Z"
						fill="currentColor"
					/>
					<path
						d="M14.2227 18.1958C14.2227 18.7481 13.7749 19.1958 13.2227 19.1958L11.3343 19.1958C10.782 19.1958 10.3343 18.7481 10.3343 18.1958L10.3343 14.752L14.2227 14.752L14.2227 18.1958Z"
						fill="currentColor"
					/>
				</IconHelper>
			),
			mainComponent: true,
		},
		{
			name: 'mainText',
			displayName: 'Main Text',
			description: 'Main Text',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'label',
			displayName: 'Label',
			description: 'Label',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'buttonStyles',
			displayName: 'Button Styles',
			description: 'Button Styles',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'selectedFiles',
			displayName: 'Selected Files',
			description: 'Selected Files',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'selectedFileContainer',
			displayName: 'Selected File Container',
			description: 'Selected File Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'icon',
			displayName: 'Icon',
			description: 'Icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'uploadContainer',
			displayName: 'Upload Container',
			description: 'Upload Container',
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

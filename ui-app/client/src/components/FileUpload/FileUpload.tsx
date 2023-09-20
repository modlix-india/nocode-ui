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

	const uploadIconComp = (
		<i className={`_uploadIcon ${uploadIcon}`} style={computedStyles?.icon}>
			<SubHelperComponent definition={props.definition} subComponentName="icon" />
		</i>
	);

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
	icon: 'fa-solid fa-upload',
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
};

export default component;
